export function mapObject<
    Obj extends Record<string | number | symbol, unknown>,
    Mapped extends { [K in keyof Obj]: unknown },
>(
    object: Obj,
    mapper: <K extends keyof Obj>(value: Obj[K], key: K) => Mapped[K],
): Mapped {
    return Object.fromEntries(
        Object.entries(object).map(([key, value]) => [
            key,
            mapper(value as Obj[string], key),
        ]),
    ) as Mapped;
}
