import { describe, expect, it } from "vitest";
import { ProviderBuilder } from "./index";
import { AsyncLocalStorage } from "node:async_hooks";
import { Runner } from "../runner";

type TestDependencies = {
    a: string;
    b: number;
};

type TestConfiguration = {
    count: number;
};

describe("Provider Builder", () => {
    it("should return an object", () => {
        const storage = new AsyncLocalStorage<TestDependencies>();
        const builder = ProviderBuilder<TestDependencies, TestConfiguration>(
            storage,
            ["a", "b"],
        );
        expect(builder).toBeDefined();
    });

    it("should return a runner immediately if called with no dependencies", () => {
        const storage = new AsyncLocalStorage<TestDependencies>();
        const builder = ProviderBuilder<Record<never, unknown>>(storage, []);
        const runner = builder.create();
        expect(runner).toBeInstanceOf(Runner);
    });

    it("should throw an error if the user tries to create a runner without specifying any providers", () => {
        const storage = new AsyncLocalStorage<TestDependencies>();
        const builder = ProviderBuilder<TestDependencies>(storage, ["a", "b"]);
        expect(() => (builder as any).create()).toThrow();
    });

    it("should create a runner once all dependencies have a provider", () => {
        const storage = new AsyncLocalStorage<TestDependencies>();
        const builder = ProviderBuilder<TestDependencies>(storage, ["a", "b"]);

        const runner = builder.constant("a", "a").constant("b", 1).create();
        expect(runner).toBeInstanceOf(Runner);
    });

    it("should create a runner with factory providers", () => {
        const storage = new AsyncLocalStorage<TestDependencies>();
        const builder = ProviderBuilder<TestDependencies>(storage, ["a", "b"]);

        const runner = builder
            .factory("a", () => "a")
            .constant("b", 1)
            .create();
        expect(runner).toBeInstanceOf(Runner);
    });

    it("should create a runner with singleton providers", () => {
        const storage = new AsyncLocalStorage<TestDependencies>();
        const builder = ProviderBuilder<TestDependencies>(storage, ["a", "b"]);

        const runner = builder
            .singleton("a", () => "a")
            .constant("b", 1)
            .create();
        expect(runner).toBeInstanceOf(Runner);
    });
});
