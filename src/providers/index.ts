import { Factory } from "../types/provider";
import { GenericRecord } from "../types/util";

export const SINGLETON: unique symbol = Symbol("singleton");
export const FACTORY: unique symbol = Symbol("factory");
export const CONSTANT: unique symbol = Symbol("constant");

export type ConstantProviderConfig<T> = {
    type: typeof CONSTANT;
    value: T;
};
export type SingletonProviderConfig<
    T,
    C extends Record<string | number | symbol, unknown>,
> = {
    type: typeof SINGLETON;
    factory: Factory<T, C>;
};
export type FactoryProviderConfig<
    T,
    C extends Record<string | number | symbol, unknown>,
> = {
    type: typeof FACTORY;
    factory: Factory<T, C>;
};
export type ProviderConfig<
    T,
    C extends Record<string | number | symbol, unknown>,
> =
    | ConstantProviderConfig<T>
    | SingletonProviderConfig<T, C>
    | FactoryProviderConfig<T, C>;

export abstract class Provider<T> {
    public abstract get value(): T;

    public static from<T, C extends GenericRecord>(
        providerConfig: ProviderConfig<T, C>,
        config: C,
    ) {
        switch (providerConfig.type) {
            case CONSTANT:
                return new ConstantProvider(providerConfig.value);
            case SINGLETON:
                return new SingletonProvider(
                    this.getFactoryFunction(providerConfig.factory, config),
                );
            case FACTORY:
                return new FactoryProvider(
                    this.getFactoryFunction(providerConfig.factory, config),
                );
            default:
                throw new Error(`Unknown provider type: ${providerConfig}`);
        }
    }

    private static getFactoryFunction<T, C extends GenericRecord>(
        factory: Factory<T, C>,
        config: C,
    ) {
        return () => {
            return factory(config);
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
