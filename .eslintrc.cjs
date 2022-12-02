/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
    root: true,
    'extends': [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/eslint-config-typescript',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
    },
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        "padded-blocks": process.env.NODE_ENV === "production" ? "warn" : "off",

        // DEV TEM
        "vue/no-unused-vars": process.env.NODE_ENV === "production" ? "warn" : "off",
        "vue/no-unused-components": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-unused-vars": process.env.NODE_ENV === "production" ? "warn" : "off",

        indent: [2, 4],
        quotes: 0,
        eqeqeq: ["error", "always", { null: "ignore" }],
        "eol-last": 0,
        "no-trailing-spaces": ["error", { skipBlankLines: true }],
        "vue/multi-word-component-names": "off",
        "no-dupe-keys": 2,
        "no-dupe-args": 2,
        "no-spaced-func": 2,
        "space-before-function-paren": [0, "always"],
        "comma-dangle": ["error", "always-multiline"],
        "comma-style": [2, "last"],
        "arrow-spacing": [2, { before: true, after: true }],
        "spaced-comment": ["error", "always", { exceptions: ["-", "+"] }],
        "no-multiple-empty-lines": [2, { max: 2 }],
    },
}
