import { CONSTANT, FACTORY, ProviderConfig, SINGLETON } from "../../providers";
import { ADIProvider } from "../../types/provider";
import { Runner } from "../runner";
import { AsyncLocalStorage } from "node:async_hooks";

const NOT_PROVIDED: unique symbol = Symbol("NOT_PROVIDED");

type ADIProviderInternal<
    Dependencies extends Record<string | symbol, unknown>,
    Configuration extends Record<string | symbol | number, unknown>,
    Provided extends keyof Dependencies = never,
> = ADIProvider<Dependencies, Configuration, Provided> & {
    providers: {
        [K in Provided]: ProviderConfig<Dependencies[K], Configuration>;
    } & {
        [K in Exclude<keyof Dependencies, Provided>]: typeof NOT_PROVIDED;
    };
};

export function ProviderBuilder<
    Dependencies extends Record<string | symbol, unknown>,
    Configuration extends Record<string | symbol | number, unknown> = Record<
        never,
        unknown
    >,
>(
    storage: AsyncLocalStorage<Dependencies>,
    dependencies: Array<keyof Dependencies>,
): ADIProvider<Dependencies, Configuration> {
    const initialProviders = dependencies.reduce(
        (prov, dependency) => ({
            ...prov,
            [dependency]: NOT_PROVIDED,
        }),
        {} as Record<keyof Dependencies, typeof NOT_PROVIDED>,
    );
    const provider: ADIProviderInternal<Dependencies, Configuration> = {
        providers: initialProviders,
        // @ts-expect-error -- only usable once all dependencies have been provided
        create(
            this: ADIProviderInternal<
                Dependencies,
                Configuration,
                keyof Dependencies
            >,
        ) {
            if (
                dependencies.some((dep) => this.providers[dep] === NOT_PROVIDED)
            ) {
                throw new Error(
                    "Cannot create a runner without providing all dependencies",
                );
            }
            return new Runner<Dependencies, Configuration>(
                storage,
                this.providers,
            );
        },

        constant<NewProvider extends keyof Dependencies>(
            this: ADIProviderInternal<
                Dependencies,
                Configuration,
                keyof Dependencies
            >,
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
            this: ADIProviderInternal<
                Dependencies,
                Configuration,
                keyof Dependencies
            >,
            dependency: NewProvider,
            factory: (config: Configuration) => Dependencies[NewProvider],
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
            this: ADIProviderInternal<
                Dependencies,
                Configuration,
                keyof Dependencies
            >,
            dependency: NewProvider,
            factory: (config: Configuration) => Dependencies[NewProvider],
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
    };

    return provider;
}
