import { Provider } from "../../providers";

export function RuntimeContainer<
    Dependencies extends Record<string | symbol, unknown>,
>(providers: {
    [K in keyof Dependencies]: Provider<Dependencies[K]>;
}): Readonly<Dependencies>;
export function RuntimeContainer<
    Dependencies extends Record<string | symbol, unknown>,
    ConfigurationKeys extends keyof Dependencies = never,
>(
    providers: {
        [K in Exclude<keyof Dependencies, ConfigurationKeys>]: Provider<
            Dependencies[K]
        >;
    },
    configuration: { [K in ConfigurationKeys]: Dependencies[K] },
): Readonly<Dependencies>;
export function RuntimeContainer<
    Dependencies extends Record<string | symbol, unknown>,
    ConfigurationKeys extends keyof Dependencies = never,
>(
    providers: {
        [K in Exclude<keyof Dependencies, ConfigurationKeys>]: Provider<
            Dependencies[K]
        >;
    },
    configuration?: { [K in ConfigurationKeys]: Dependencies[K] },
): Readonly<Dependencies> {
    const container = {} as Dependencies;
    Object.entries(providers).forEach(([key, provider]) => {
        Object.defineProperty(container, key, {
            get() {
                return (provider as Provider<unknown>).value;
            },
        });
    });
    Object.assign(container, configuration);
    return Object.freeze(container);
}
