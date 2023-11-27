import { describe, expect, it, vi } from "vitest";
import { createContainer, type } from "./main";

describe("Create Container", () => {
    it("should return an ADIContainer", () => {
        const container = createContainer({});
        expect(container).toHaveProperty("use", expect.any(Function));
        expect(container).toHaveProperty("provider", expect.any(Function));
    });

    it("should throw an error if container.use is used outside of a Runner", () => {
        const container = createContainer({ a: type<string>() });
        expect(() => container.use("a")).toThrow();
    });

    it("should create a runner if configured properly", () => {
        const container = createContainer({
            a: type<string>(),
            b: type<number>(),
        });

        const runner = container
            .provider()
            .constant("a", "hello")
            .constant("b", 1)
            .create();

        runner.run(() => {
            expect(container.use("a")).toBe("hello");
            expect(container.use("b")).toBe(1);
        });
    });

    it("should create one singleton per run", () => {
        const factory = vi.fn(() => "test");
        const container = createContainer({
            a: type<string>(),
        });

        const runner = container.provider().singleton("a", factory).create();

        runner.run(() => {
            console.log(container.use("a"));
            console.log(container.use("a"));
        });
        expect(factory).toHaveBeenCalledTimes(1);

        runner.run(() => {
            console.log(container.use("a"));
            console.log(container.use("a"));
        });
        expect(factory).toHaveBeenCalledTimes(2);
    });
});
