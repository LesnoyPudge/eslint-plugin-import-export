import { ESLintUtils, TSESLint } from '@typescript-eslint/utils';
import fs from 'node:fs';
import path from 'node:path';
import * as v from 'valibot';



export const pkg = v.parse(v.object({
    name: v.string(),
    version: v.string(),
}), JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'),
));

export const createRule = ESLintUtils.RuleCreator(() => {
    return 'https://github.com/LesnoyPudge/eslint-plugin-import-export';
});

export const pluginName = pkg.name;

export const pluginVersion = pkg.version;

export const ruleName = 'import-export';

export const messageIds = {
    shortMultiline: 'shortMultiline',
    longOneLiner: 'longOneLiner',
} as const;

export type MessageIds = typeof messageIds;

export const defaultOptions = [] as const;

type Options = typeof defaultOptions;

export type RuleVisitors = (
    context: Readonly<TSESLint.RuleContext<keyof MessageIds, Options>>,
    optionsWithDefault: Readonly<Options>
) => TSESLint.RuleListener;