type RunWithConfiguration<
    Configuration extends Record<string | symbol | number, unknown>,
> = <T>(program: () => T, config: Configuration) => T;
type Run = <T>(program: () => T) => T;
export type ADIRunner<
    Configuration extends Record<string | symbol | number, unknown>,
> = {
    /**
     * Run a program with the dependencies provided by this runner
     */
    run: Record<never, unknown> extends Configuration
        ? Run
        : RunWithConfiguration<Configuration>;
};
