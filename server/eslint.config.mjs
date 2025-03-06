import globals from 'globals';
import pluginJs from '@eslint/js';
import tsEslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';

/** @type {import('eslint').Linter.Config[]} */
export default [
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	// js
	pluginJs.configs.recommended,
	{
		rules: {
			'no-unused-vars': 'off',
			'no-undef': 'off'
		}
	},
	// ts
	...tsEslint.configs.recommended,
	{
		rules: {
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-explicit-any': 'warn'
		}
	},
	// prettier
	prettier,
	{
		rules: {
			'prettier/prettier': [
				'error',
				{
					printWidth: 120,
					useTabs: true,
					singleQuote: true,
					bracketSameLine: false,
					trailingComma: 'none'
				}
			]
		}
	}
];
