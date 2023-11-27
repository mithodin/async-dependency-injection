module.exports = {
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier",
    ],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    root: true,
    overrides: [
        {
            files: ["*.spec.ts"],
            rules: {
                "@typescript-eslint/no-explicit-any": "off",
            },
        },
    ],
};
