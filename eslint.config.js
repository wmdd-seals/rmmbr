import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default [
    {
        ignores: ['**/*.js']
    },
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.config({
        plugins: { '@typescript-eslint': tseslint.plugin },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: true
            }
        },
        rules: {
            '@typescript-eslint/explicit-function-return-type': 'error'
        }
    }),
    eslintPluginPrettierRecommended
]
