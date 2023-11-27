import { Provider } from "../../providers";

export function RuntimeContainer<
    Dependencies extends Record<string | symbol, unknown>,
>(providers: { [K in keyof Dependencies]: Provider<Dependencies[K]> }) {
    const container = {} as Dependencies;
    Object.entries(providers).forEach(([key, provider]) => {
        Object.defineProperty(container, key, {
            get() {
                return provider.value;
            },
        });
    });
    return Object.freeze(container);
}
