import { describe, it, expect } from "vitest";
import { RuntimeContainer } from "./index";
import {
    ConstantProvider,
    FactoryProvider,
    SingletonProvider,
} from "../../providers";

const singletonValue: unique symbol = Symbol("singletonValue");
const factoryValue: unique symbol = Symbol("factoryValue");
const constantValue: unique symbol = Symbol("constantValue");

describe("Runtime Container", () => {
    it("should construct", () => {
        const container = RuntimeContainer({});
        expect(container).toBeDefined();
    });

    it("should return a singleton value", () => {
        const container = RuntimeContainer({
            a: new SingletonProvider(() => singletonValue),
        });

        const value = container.a;

        expect(value).toBe(singletonValue);
    });

    it("should return a factory value", () => {
        const container = RuntimeContainer({
            a: new FactoryProvider(() => factoryValue),
        });

        const value = container.a;

        expect(value).toBe(factoryValue);
    });

    it("should return a constant value", () => {
        const container = RuntimeContainer({
            a: new ConstantProvider(constantValue),
        });

        const value = container.a;

        expect(value).toBe(constantValue);
    });

    it("should not allow assignment to values", () => {
        const container = RuntimeContainer({
            a: new ConstantProvider(constantValue),
        });

        expect(
            () => ((container as Record<string, unknown>).a = constantValue),
        ).toThrow();
    });

    it("should not allow adding values", () => {
        const container = RuntimeContainer({
            a: new ConstantProvider(constantValue),
        });

        expect(
            () => ((container as Record<string, unknown>).b = constantValue),
        ).toThrow();
    });
});
