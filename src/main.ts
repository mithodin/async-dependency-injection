import { AsyncLocalStorage } from "node:async_hooks";
import { ADIContainer } from "./types/container";
import { ADIProvider } from "./types/provider";
import { ProviderBuilder } from "./runtime/providerBuilder";
export * from "./types/public";

type Unwrap<T extends () => TypeSpecifier<unknown>> =
    ReturnType<T> extends TypeSpecifier<infer U> ? U : never;
type TypeSpecifier<T> = {
    __tag: typeof TYPE_TAG;
    __type: T;
};
const TYPE_TAG: unique symbol = Symbol("TYPE_TAG");
export function type<T>() {
    return undefined as unknown as TypeSpecifier<T>;
}

class Container<Dependencies extends Record<string | symbol, unknown>>
    implements ADIContainer<Dependencies>
{
    private readonly storage = new AsyncLocalStorage<Dependencies>();
    constructor(private readonly dependencies: Array<keyof Dependencies>) {}

    provider(): ADIProvider<Dependencies> {
        return ProviderBuilder(this.storage, this.dependencies);
    }

    use<Dependency extends keyof Dependencies>(
        dependency: Dependency,
    ): Dependencies[Dependency] {
        const store = this.storage.getStore();
        if (!store || !store[dependency]) {
            throw new Error(
                `Cannot use dependency ${dependency.toString()} outside of a runner`,
            );
        }
        return store[dependency];
    }
}

export function createContainer<
    Dependencies extends Record<string | symbol, () => TypeSpecifier<unknown>>,
>(dependencies: Dependencies) {
    return new Container<{
        [K in keyof Dependencies]: Unwrap<Dependencies[K]>;
    }>(Object.keys(dependencies) as Array<keyof Dependencies>);
}
