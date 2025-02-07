import pluginVue from 'eslint-plugin-vue';
import {
	defineConfigWithVueTs,
	vueTsConfigs,
	configureVueProject,
} from '@vue/eslint-config-typescript';

configureVueProject({
	scriptLangs: ['ts', 'js', 'tsx', 'jsx'],
	rootDir: import.meta.dirname,
});

export default defineConfigWithVueTs(
	pluginVue.configs['flat/essential'],
	vueTsConfigs.recommended,
	{
		rules: {
			// Enforce Unix line endings
			'linebreak-style': ['error', 'unix'],

			// Enforce single quotes
			'quotes': ['error', 'single'],

			// Enforce semicolons
			'semi': ['error', 'always'],

			// Enforce indentation with tabs
			'indent': ['error', 'tab', { SwitchCase: 1 }],

			// Allow mixed spaces and tabs (disable warning)
			'no-mixed-spaces-and-tabs': 0,

			// Vue-specific rules
			'vue/attribute-hyphenation': ['error', 'always'],
			'vue/component-name-in-template-casing': ['error', 'PascalCase', {
				registeredComponentsOnly: false,
				ignores: [],
			}],
			'vue/component-tags-order': ['error', { order: ['script', 'template', 'style'] }],
			'vue/html-self-closing': ['error', {
				html: { void: 'any', normal: 'always', component: 'always' },
				svg: 'always',
				math: 'always',
			}],
			'vue/html-quotes': ['error', 'double', { avoidEscape: false }],
			'vue/multiline-html-element-content-newline': ['error', {
				ignoreWhenEmpty: true,
				ignores: ['pre', 'textarea'],
				allowEmptyLines: false,
			}],
			'vue/multi-word-component-names': 'off',
			'vue/prop-name-casing': ['error', 'camelCase'],
			'vue/v-bind-style': ['error', 'shorthand'],
		},
	}
);