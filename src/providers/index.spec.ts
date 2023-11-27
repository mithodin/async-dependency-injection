import { describe, it, expect, vi } from "vitest";
import {
    CONSTANT,
    Provider,
    Constant,
    SINGLETON,
    Singleton,
    FACTORY,
    Factory,
} from "./index";

describe("Common Providers", () => {
    it("should create a constant provider", () => {
        const provider = Provider.from(
            {
                type: CONSTANT,
                value: "test",
            },
            {},
        );

        expect(provider).toBeInstanceOf(Constant);
        expect(provider.value).toBe("test");
    });

    it("should create a singleton provider", () => {
        const provider = Provider.from(
            {
                type: SINGLETON,
                factory: (config: { text: string }) => config.text,
            },
            { text: "test" },
        );

        expect(provider).toBeInstanceOf(Singleton);
        expect(provider.value).toBe("test");
    });

    it("should create a factory provider", () => {
        const provider = Provider.from(
            {
                type: FACTORY,
                factory: (config: { count: number }) =>
                    Array(config.count).fill("a").join(""),
            },
            { count: 3 },
        );

        expect(provider).toBeInstanceOf(Factory);
        expect(provider.value).toBe("aaa");
    });
});

const value: unique symbol = Symbol("value");
type Value = typeof value;

describe("Constant Provider", () => {
    it("should return the provided value", () => {
        const provider: Provider<Value> = new Constant(value);

        const providedValue = provider.value;

        expect(providedValue).toBe(value);
    });
});

describe("Singleton Provider", () => {
    it("should return the value returned by the factor function", () => {
        const provider: Provider<Value> = new Singleton(() => value);

        const providedValue = provider.value;
        expect(providedValue).toBe(value);
    });

    it("should only invoke the factory function once", () => {
        const factory = vi.fn<[], Value>(() => value);
        const provider: Provider<Value> = new Singleton(factory);

        let val = provider.value;
        void val;
        val = provider.value;
        void val;

        expect(factory).toHaveBeenCalledOnce();
    });
});

describe("Factory Provider", () => {
    it("should return the value returned by the factor function", () => {
        const provider: Provider<Value> = new Factory(() => value);

        const providedValue = provider.value;
        expect(providedValue).toBe(value);
    });

    it("should only invoke the factory every time the value is read", () => {
        const factory = vi.fn<[], Value>(() => value);
        const provider: Provider<Value> = new Factory(factory);

        let val = provider.value;
        void val;
        val = provider.value;
        void val;

        expect(factory).toHaveBeenCalledTimes(2);
    });
});
