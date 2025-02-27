import globals from 'globals';
import pluginJs from '@eslint/js';
import tsEslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import prettier from 'eslint-plugin-prettier/recommended';
import vueConfigTypescript from '@vue/eslint-config-typescript';
import vueConfigPrettier from '@vue/eslint-config-prettier';

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
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn'
		}
	},
	// vue
	...pluginVue.configs['flat/recommended'],
	{
		files: ['*.vue', '**/*.vue'],
		languageOptions: {
			parserOptions: {
				parser: tsEslint.parser
			}
		}
	},
	{
		rules: {
			...vueConfigTypescript.rules,
			...vueConfigPrettier.rules,
			'prettier/prettier': [
				'warn',
				{
					singleQuote: true,
					printWidth: 120,
					useTabs: true,
					bracketSameLine: false,
					trailingComma: 'none'
				}
			],
			'vue/multi-word-component-names': 'off',
			'vue/attribute-hyphenation': ['error', 'always'],
			'vue/no-v-html': 'off',
			'vue/v-on-event-hyphenation': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-require-imports': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'no-mixed-spaces-and-tabs': 0,
			indent: ['error', 'tab'],
			'linebreak-style': ['error', 'unix'],
			quotes: ['error', 'single'],
			semi: ['error', 'always'],
			'vue/component-name-in-template-casing': [
				'error',
				'PascalCase',
				{
					registeredComponentsOnly: false,
					ignores: []
				}
			],
			'vue/component-tags-order': [
				'error',
				{
					order: ['script', 'template', 'style']
				}
			],
			'vue/html-self-closing': [
				'error',
				{
					html: {
						void: 'any',
						normal: 'always',
						component: 'always'
					},
					svg: 'always',
					math: 'always'
				}
			],
			'vue/html-quotes': ['error', 'double', { avoidEscape: false }],
			'vue/multiline-html-element-content-newline': [
				'error',
				{
					ignoreWhenEmpty: true,
					ignores: ['pre', 'textarea'],
					allowEmptyLines: false
				}
			],
			'vue/prop-name-casing': ['error', 'camelCase'],
			'vue/v-bind-style': ['error', 'shorthand']
		}
	},
	{
		ignores: ['node_modules', '.nuxt', '.output', 'dist']
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
