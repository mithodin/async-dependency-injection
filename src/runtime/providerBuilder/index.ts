import { CONSTANT, FACTORY, ProviderConfig, SINGLETON } from "../../providers";
import { ADIProvider } from "../../types/provider";
import { Runner } from "../runner";
import { AsyncLocalStorage } from "node:async_hooks";

const NOT_PROVIDED: unique symbol = Symbol("NOT_PROVIDED");

type ADIProviderInternal<
    Dependencies extends Record<string | symbol, unknown>,
    Provided extends keyof Dependencies = never,
> = ADIProvider<Dependencies, Provided> & {
    providers: {
        [K in Provided]: ProviderConfig<Dependencies[K]>;
    } & {
        [K in Exclude<keyof Dependencies, Provided>]: typeof NOT_PROVIDED;
    };
};

export function ProviderBuilder<
    Dependencies extends Record<string | symbol, unknown>,
>(
    storage: AsyncLocalStorage<Dependencies>,
    dependencies: Array<keyof Dependencies>,
): ADIProvider<Dependencies> {
    const initialProviders = dependencies.reduce(
        (prov, dependency) => ({
            ...prov,
            [dependency]: NOT_PROVIDED,
        }),
        {} as Record<keyof Dependencies, typeof NOT_PROVIDED>,
    );
    const provider: ADIProviderInternal<Dependencies> = {
        providers: initialProviders,
        // @ts-expect-error -- only usable once all dependencies have been provided
        create(this: ADIProviderInternal<Dependencies, keyof Dependencies>) {
            if (
                dependencies.some((dep) => this.providers[dep] === NOT_PROVIDED)
            ) {
                throw new Error(
                    "Cannot create a runner without providing all dependencies",
                );
            }
            return new Runner<Dependencies>(storage, this.providers);
        },

        constant<NewProvider extends keyof Dependencies>(
            this: ADIProviderInternal<Dependencies, keyof Dependencies>,
            dependency: NewProvider,
            value: Dependencies[NewProvider],
        ) {
            return {
                ...this,
                providers: {
                    ...this.providers,
                    [dependency]: {
                        type: CONSTANT,
                        value,
                    },
                },
            };
        },

        factory<NewProvider extends keyof Dependencies>(
            this: ADIProviderInternal<Dependencies, keyof Dependencies>,
            dependency: NewProvider,
            factory: () => Dependencies[NewProvider],
        ) {
            return {
                ...this,
                providers: {
                    ...this.providers,
                    [dependency]: {
                        type: FACTORY,
                        factory,
                    },
                },
            };
        },

        singleton<NewProvider extends keyof Dependencies>(
            this: ADIProviderInternal<Dependencies, keyof Dependencies>,
            dependency: NewProvider,
            factory: () => Dependencies[NewProvider],
        ) {
            return {
                ...this,
                providers: {
                    ...this.providers,
                    [dependency]: {
                        type: SINGLETON,
                        factory,
                    },
                },
            };
        },

        defer<NewProvider extends keyof Dependencies>(
            this: ADIProviderInternal<Dependencies, keyof Dependencies>,
            dependency: NewProvider,
        ) {
            const newProviders = {
                ...this.providers,
            };
            delete newProviders[dependency];
            return {
                ...this,
                providers: newProviders,
            };
        },
    };

    return provider;
}
