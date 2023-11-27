import { ADIProvider } from "./provider";

export type ADIContainer<
    Dependencies extends Record<string | symbol, unknown>,
> = {
    /**
     * Obtain a dependency from the container
     * @param dependency Name of the dependency
     */
    use: <Dependency extends keyof Dependencies>(
        dependency: Dependency,
    ) => Dependencies[Dependency];
    /**
     * Start configuring a provider for this container.
     * If your provider factories require runtime configuration, specify the shape of the configuration object as a generic parameter
     */
    provider: <
        Configuration extends Record<
            string | symbol | number,
            unknown
        > = Record<never, unknown>,
    >() => ADIProvider<Dependencies, Configuration>;
};
