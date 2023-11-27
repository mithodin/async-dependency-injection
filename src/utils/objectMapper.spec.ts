import { describe, expect, it } from "vitest";
import { mapObject } from "./objectMapper";

describe("Object Mapper", () => {
    it("should return an empty object", () => {
        const result = mapObject({}, () => undefined as never);
        expect(result).toEqual({});
    });

    it("should apply the identity function", () => {
        const result = mapObject({ a: 1 }, (value) => value);
        expect(result).toEqual({ a: 1 });
    });

    it("should add two to every property", () => {
        const result = mapObject({ a: 1, b: 2 }, (value) => value + 2);
        expect(result).toEqual({ a: 3, b: 4 });
    });

    it("should let the mapper decide the action based on the key", () => {
        const result = mapObject({ a: 1, b: 2 }, (value, key) =>
            key === "a" ? value + 2 : value,
        );
        expect(result).toEqual({ a: 3, b: 2 });
    });
});
