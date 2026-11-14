import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["**/dist/**", "**/node_modules/**", "**/.next/**", "**/coverage/**"] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    // A module talks to other modules only through their public entry point.
    // See docs/architecture.md, "Module boundaries".
    files: ["packages/*/src/**/*.ts", "apps/*/src/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@areopagus/*/src/*", "@areopagus/*/dist/*"],
              message: "Import a module through its package entry point, not its internals.",
            },
          ],
        },
      ],
    },
  },
);
