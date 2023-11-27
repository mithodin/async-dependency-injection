import { ADIRunner } from "../../types/runner";
import { AsyncLocalStorage } from "node:async_hooks";
import { Provider, ProviderConfig } from "../../providers";
import { RuntimeContainer } from "../container";
import { mapObject } from "../../utils/objectMapper";

export class Runner<
    Dependencies extends Record<string | symbol, unknown>,
    C extends Record<string | number | symbol, unknown>,
> implements ADIRunner<C>
{
    constructor(
        private readonly storage: AsyncLocalStorage<Dependencies>,
        private readonly providers: {
            [K in keyof Dependencies]: ProviderConfig<Dependencies[K], C>;
        },
    ) {}

    readonly run = ((program: () => unknown, config: C) => {
        const providers = mapObject<
            typeof this.providers,
            { [K in keyof Dependencies]: Provider<Dependencies[K]> }
        >(this.providers, (provider) => Provider.from(provider, config));
        const container = RuntimeContainer<Dependencies>(providers);
        return this.storage.run(container, program);
    }) as ADIRunner<C>["run"];
}
