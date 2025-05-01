import { TSESLint } from '@typescript-eslint/utils';
import { pluginName, pluginVersion, ruleName } from './extra';
import { rule } from './rule';
import parser from '@typescript-eslint/parser';



const plugin = {
    meta: {
        name: pluginName,
        version: pluginVersion,
    },
    rules: {
        [ruleName]: rule,
    },
    configs: {} as typeof configs,
    processors: {},
} satisfies TSESLint.FlatConfig.Plugin;

const recommendedFlatConfig = {
    languageOptions: {
        ecmaVersion: 'latest',
        parser,
    },
    plugins: {} as TSESLint.FlatConfig.Plugins,
    rules: {
        '@lesnoypudge/eslint-plugin-import-export/import-export': 'warn',
    },
} satisfies TSESLint.FlatConfig.Config;

Object.assign(recommendedFlatConfig.plugins, {
    '@lesnoypudge/eslint-plugin-import-export': plugin,
});

const configs = {
    recommended: recommendedFlatConfig,
} satisfies TSESLint.FlatConfig.SharedConfigs;

Object.assign(plugin.configs, configs);

export default plugin;