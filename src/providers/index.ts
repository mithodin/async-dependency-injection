import { Factory } from "../types/provider";

export const SINGLETON: unique symbol = Symbol("singleton");
export const FACTORY: unique symbol = Symbol("factory");
export const CONSTANT: unique symbol = Symbol("constant");

export type ConstantProviderConfig<T> = {
    type: typeof CONSTANT;
    value: T;
};
export type SingletonProviderConfig<T> = {
    type: typeof SINGLETON;
    factory: Factory<T>;
};
export type FactoryProviderConfig<T> = {
    type: typeof FACTORY;
    factory: Factory<T>;
};
export type ProviderConfig<T> =
    | ConstantProviderConfig<T>
    | SingletonProviderConfig<T>
    | FactoryProviderConfig<T>;

export abstract class Provider<T> {
    public abstract get value(): T;

    public static from<T>(providerConfig: ProviderConfig<T>) {
        switch (providerConfig.type) {
            case CONSTANT:
                return new ConstantProvider(providerConfig.value);
            case SINGLETON:
                return new SingletonProvider(
                    this.getFactoryFunction(providerConfig.factory),
                );
            case FACTORY:
                return new FactoryProvider(
                    this.getFactoryFunction(providerConfig.factory),
                );
            default:
                throw new Error(`Unknown provider type: ${providerConfig}`);
        }
    }

    private static getFactoryFunction<T>(factory: Factory<T>) {
        return () => {
            return factory();
        };
    }
}

export class ConstantProvider<T> extends Provider<T> {
    readonly #value: T;

    constructor(value: T) {
        super();
        this.#value = value;
    }

    get value(): T {
        return this.#value;
    }
}

export class SingletonProvider<T> extends Provider<T> {
    #value: T | undefined = undefined;

    constructor(private readonly factory: () => T) {
        super();
    }

    get value(): T {
        if (this.#value === undefined) {
            this.#value = this.factory();
        }
        return this.#value;
    }
}

export class FactoryProvider<T> extends Provider<T> {
    constructor(private readonly factory: () => T) {
        super();
    }

    get value(): T {
        return this.factory();
    }
}
