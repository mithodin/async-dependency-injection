import { describe, expect, it, vi } from "vitest";
import {
    CONSTANT,
    ConstantProvider,
    FACTORY,
    FactoryProvider,
    Provider,
    SINGLETON,
    SingletonProvider,
} from "./index";

describe("Common Providers", () => {
    it("should create a constant provider", () => {
        const provider = Provider.from({
            type: CONSTANT,
            value: "test",
        });

        expect(provider).toBeInstanceOf(ConstantProvider);
        expect(provider.value).toBe("test");
    });

    it("should create a singleton provider", () => {
        const provider = Provider.from({
            type: SINGLETON,
            factory: () => "test",
        });

        expect(provider).toBeInstanceOf(SingletonProvider);
        expect(provider.value).toBe("test");
    });

    it("should create a factory provider", () => {
        let count = 1;
        const provider = Provider.from({
            type: FACTORY,
            factory: () => count++,
        });

        expect(provider).toBeInstanceOf(FactoryProvider);
        expect(provider.value).toBe(1);
        expect(provider.value).toBe(2);
    });
});

const value: unique symbol = Symbol("value");
type Value = typeof value;

describe("Constant Provider", () => {
    it("should return the provided value", () => {
        const provider: Provider<Value> = new ConstantProvider(value);

        const providedValue = provider.value;

        expect(providedValue).toBe(value);
    });
});

describe("Singleton Provider", () => {
    it("should return the value returned by the factor function", () => {
        const provider: Provider<Value> = new SingletonProvider(() => value);

        const providedValue = provider.value;
        expect(providedValue).toBe(value);
    });

    it("should only invoke the factory function once", () => {
        const factory = vi.fn<[], Value>(() => value);
        const provider: Provider<Value> = new SingletonProvider(factory);

        let val = provider.value;
        void val;
        val = provider.value;
        void val;

        expect(factory).toHaveBeenCalledOnce();
    });
});

describe("Factory Provider", () => {
    it("should return the value returned by the factor function", () => {
        const provider: Provider<Value> = new FactoryProvider(() => value);

        const providedValue = provider.value;
        expect(providedValue).toBe(value);
    });

    it("should only invoke the factory every time the value is read", () => {
        const factory = vi.fn<[], Value>(() => value);
        const provider: Provider<Value> = new FactoryProvider(factory);

        let val = provider.value;
        void val;
        val = provider.value;
        void val;

        expect(factory).toHaveBeenCalledTimes(2);
    });
});
