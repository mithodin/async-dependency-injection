export const SINGLETON: unique symbol = Symbol("singleton");
export const FACTORY: unique symbol = Symbol("factory");
export const CONSTANT: unique symbol = Symbol("constant");

export type ConstantProviderConfig<T> = {
    type: typeof CONSTANT;
    value: T;
};
export type SingletonProviderConfig<T, C> = {
    type: typeof SINGLETON;
    factory: (config: C) => T;
};
export type FactoryProviderConfig<T, C> = {
    type: typeof FACTORY;
    factory: (config: C) => T;
};
export type ProviderConfig<T, C> =
    | ConstantProviderConfig<T>
    | SingletonProviderConfig<T, C>
    | FactoryProviderConfig<T, C>;

export abstract class Provider<T> {
    public abstract get value(): T;

    public static from<T, C>(providerConfig: ProviderConfig<T, C>, config: C) {
        switch (providerConfig.type) {
            case CONSTANT:
                return new Constant(providerConfig.value);
            case SINGLETON:
                return new Singleton(() => providerConfig.factory(config));
            case FACTORY:
                return new Factory(() => providerConfig.factory(config));
            default:
                throw new Error(`Unknown provider type: ${providerConfig}`);
        }
    }
}

export class Constant<T> extends Provider<T> {
    readonly #value: T;

    constructor(value: T) {
        super();
        this.#value = value;
    }

    get value(): T {
        return this.#value;
    }
}

export class Singleton<T> extends Provider<T> {
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

export class Factory<T> extends Provider<T> {
    constructor(private readonly factory: () => T) {
        super();
    }

    get value(): T {
        return this.factory();
    }
}
