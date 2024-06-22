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
            '@typescript-eslint/no-misused-promises': [
                'error',
                {
                    checksVoidReturn: {
                        arguments: false,
                        attributes: false
                    }
                }
            ],
            '@typescript-eslint/explicit-function-return-type': 'error',
            '@typescript-eslint/no-unnecessary-condition': 'error',
            '@typescript-eslint/strict-boolean-expressions': [
                'error',
                {
                    allowNullableString: true,
                    allowNullableBoolean: true,
                    allowNullableObject: true
                }
            ],

            '@typescript-eslint/return-await': ['error', 'in-try-catch'],
            '@typescript-eslint/prefer-optional-chain': 'error',
            '@typescript-eslint/await-thenable': 'error',
            '@typescript-eslint/switch-exhaustiveness-check': 'error',
            '@typescript-eslint/explicit-member-accessibility': 'error',
            '@typescript-eslint/prefer-readonly': 'error',
            '@typescript-eslint/require-array-sort-compare': ['warn', { ignoreStringArrays: true }],
            '@typescript-eslint/no-confusing-void-expression': [
                'error',
                { ignoreArrowShorthand: true, ignoreVoidOperator: true }
            ],
            '@typescript-eslint/no-duplicate-enum-values': 'error'
        }
    }),
    eslintPluginPrettierRecommended
]
