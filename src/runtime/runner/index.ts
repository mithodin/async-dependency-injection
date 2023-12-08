import { ADIRunner } from "../../types/runner";
import { AsyncLocalStorage } from "node:async_hooks";
import { Provider, ProviderConfig } from "../../providers";
import { RuntimeContainer } from "../container";
import { mapObject } from "../../utils/objectMapper";

export class Runner<
    Dependencies extends Record<string | symbol, unknown>,
    ConfigurationKeys extends keyof Dependencies = never,
> implements ADIRunner<Pick<Dependencies, ConfigurationKeys>>
{
    readonly #providers: Omit<
        { [K in keyof Dependencies]: Provider<Dependencies[K]> },
        ConfigurationKeys
    >;

    constructor(
        private readonly storage: AsyncLocalStorage<Dependencies>,
        providerConfig: Omit<
            { [K in keyof Dependencies]: ProviderConfig<Dependencies[K]> },
            ConfigurationKeys
        >,
    ) {
        this.#providers = mapObject<
            typeof providerConfig,
            { [K in keyof Dependencies]: Provider<Dependencies[K]> }
        >(providerConfig, (provider) => Provider.from(provider));
    }

    readonly run = ((
        program: () => unknown,
        config: Pick<Dependencies, ConfigurationKeys>,
    ) => {
        const container = RuntimeContainer(this.#providers, config);
        return this.storage.run(container, program);
    }) as ADIRunner<Pick<Dependencies, ConfigurationKeys>>["run"];
}
