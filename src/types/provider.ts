import { ADIRunner } from "./runner";
import { NotNeverProps } from "./util";

export interface ConstructorFactory<
    Dependency,
    Configuration extends Record<string | symbol | number, unknown> = Record<
        never,
        unknown
    >,
> {
    new (config: Configuration): Dependency;
}
export type Factory<
    Dependency,
    Configuration extends Record<string | symbol | number, unknown> = Record<
        never,
        unknown
    >,
> =
    | ((config: Configuration) => Dependency)
    | ConstructorFactory<Dependency, Configuration>;

export type ADIProvider<
    Dependencies extends Record<string | symbol, unknown>,
    Configuration extends Record<string | symbol | number, unknown>,
    Provided extends keyof Dependencies = never,
> = NotNeverProps<{
    /**
     * A singleton provider will be created lazily on first use and then cached for subsequent uses
     * @param dependency Name of the dependency
     * @param factory A function or constructor that creates the dependency
     */
    singleton: <Dependency extends Exclude<keyof Dependencies, Provided>>(
        this: ADIProvider<Dependencies, Configuration, Provided>,
        dependency: Dependency,
        factory: Factory<Dependencies[Dependency], Configuration>,
    ) => ADIProvider<Dependencies, Configuration, Provided | Dependency>;
    /**
     * A factory provider will be created lazily on each use
     * @param dependency Name of the dependency
     * @param factory A function or constructor that creates the dependency
     */
    factory: <Dependency extends Exclude<keyof Dependencies, Provided>>(
        this: ADIProvider<Dependencies, Configuration, Provided>,
        dependency: Dependency,
        factory: Factory<Dependencies[Dependency], Configuration>,
    ) => ADIProvider<Dependencies, Configuration, Provided | Dependency>;
    /**
     * A constant provider will always return the same value
     * @param dependency Name of the dependency
     * @param value The value to return
     */
    constant: <Dependency extends Exclude<keyof Dependencies, Provided>>(
        this: ADIProvider<Dependencies, Configuration, Provided>,
        dependency: Dependency,
        value: Dependencies[Dependency],
    ) => ADIProvider<Dependencies, Configuration, Provided | Dependency>;
    /**
     * Create a runner that will run a program with the dependencies provided by this provider
     * Can only be invoked once all dependencies have been provided
     */
    create: [keyof Dependencies] extends [Provided]
        ? (
              this: ADIProvider<Dependencies, Configuration, Provided>,
          ) => ADIRunner<Configuration>
        : never;
}>;
