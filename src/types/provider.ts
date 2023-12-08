import { ADIRunner } from "./runner";
import { NotNeverProps } from "./util";

export type Factory<Dependency> = () => Dependency;

export type ADIProvider<
    Dependencies extends Record<string | symbol, unknown>,
    Provided extends keyof Dependencies = never,
    Deferred extends Provided = never,
> = NotNeverProps<{
    /**
     * A singleton provider will be created lazily on first use and then cached for subsequent uses
     * @param dependency Name of the dependency
     * @param factory A function or constructor that creates the dependency
     */
    singleton: <Dependency extends Exclude<keyof Dependencies, Provided>>(
        this: ADIProvider<Dependencies, Provided, Deferred>,
        dependency: Dependency,
        factory: Factory<Dependencies[Dependency]>,
    ) => ADIProvider<Dependencies, Provided | Dependency, Deferred>;
    /**
     * A factory provider will be created lazily on each use
     * @param dependency Name of the dependency
     * @param factory A function or constructor that creates the dependency
     */
    factory: <Dependency extends Exclude<keyof Dependencies, Provided>>(
        this: ADIProvider<Dependencies, Provided, Deferred>,
        dependency: Dependency,
        factory: Factory<Dependencies[Dependency]>,
    ) => ADIProvider<Dependencies, Provided | Dependency, Deferred>;
    /**
     * A constant provider will always return the same value
     * @param dependency Name of the dependency
     * @param value The value to return
     */
    constant: <Dependency extends Exclude<keyof Dependencies, Provided>>(
        this: ADIProvider<Dependencies, Provided, Deferred>,
        dependency: Dependency,
        value: Dependencies[Dependency],
    ) => ADIProvider<Dependencies, Provided | Dependency, Deferred>;
    /**
     * Defer the creation of a dependency until the runner is executed.
     * Warning: Your singleton factories should not depend on deferred dependencies,
     * because they will be created on first use in the first run that uses them.
     * A later run with different values for the deferred dependencies will not update the singleton.
     * @param dependency Name of the dependency
     */
    defer: <Dependency extends Exclude<keyof Dependencies, Provided>>(
        this: ADIProvider<Dependencies, Provided, Deferred>,
        dependency: Dependency,
    ) => ADIProvider<
        Dependencies,
        Provided | Dependency,
        Deferred | Dependency
    >;
    /**
     * Create a runner that will run a program with the dependencies provided by this provider
     * Can only be invoked once all dependencies have been provided
     */
    create: [keyof Dependencies] extends [Provided]
        ? (
              this: ADIProvider<Dependencies, Provided, Deferred>,
          ) => ADIRunner<Pick<Dependencies, Deferred>>
        : never;
}>;
