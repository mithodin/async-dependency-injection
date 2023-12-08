import { AsyncLocalStorage } from "node:async_hooks";
import { describe, expect, it, vi } from "vitest";
import { Runner } from "./index";
import { CONSTANT, FACTORY, SINGLETON } from "../../providers";

describe("Runner", () => {
    it("should construct", () => {
        const runner = new Runner(new AsyncLocalStorage<any>(), {});
        expect(runner).toBeDefined();
    });

    it("should return the return value of the provided function", () => {
        const program = vi.fn(() => "test");
        const runner = new Runner(new AsyncLocalStorage<any>(), {});
        const result = runner.run(program);
        expect(result).toBe("test");
        expect(program).toHaveBeenCalled();
    });

    it("should provide dependencies via an AsyncLocalStorage", () => {
        const storage = new AsyncLocalStorage<{ a: string; b: string }>();
        const runner = new Runner(storage, {
            a: {
                type: CONSTANT,
                value: "hello",
            },
            b: {
                type: SINGLETON,
                factory: () => "world",
            },
        });
        const result = runner.run(() => {
            const { a, b } = storage.getStore()!;
            return `${a} ${b}`;
        });
        expect(result).toBe("hello world");
    });

    it("should instantiate a singleton exactly once (even with multiple runs)", () => {
        const storage = new AsyncLocalStorage<{ a: string }>();
        const factory = vi.fn(() => "hello");
        const runner = new Runner(storage, {
            a: {
                type: SINGLETON,
                factory,
            },
        });
        runner.run(() => {
            storage.getStore()!.a;
            storage.getStore()!.a;
        });

        expect(factory).toHaveBeenCalledOnce();

        runner.run(() => {
            storage.getStore()!.a;
            storage.getStore()!.a;
        });
        expect(factory).toHaveBeenCalledOnce();
    });

    it("should merge the provided configuration with the dependencies", () => {
        const storage = new AsyncLocalStorage<{ a: string; b: string }>();
        const runner = new Runner<{ a: string; b: string }, "b">(storage, {
            a: {
                type: FACTORY,
                factory: () => storage.getStore()!.b,
            },
        });

        const result = runner.run(() => storage.getStore()!.a, { b: "hello" });
        expect(result).toBe("hello");
    });
});
