import { ESLintUtils } from '@typescript-eslint/utils';
import {
    createRule,
    defaultOptions,
    messageIds,
    MessageIds,
    ruleName,
} from './extra';
import { ruleVisitors } from './ruleVisitors';
import { toOneLine } from '@lesnoypudge/utils';



const ruleMeta: ESLintUtils.NamedCreateRuleMeta<keyof MessageIds> = {
    docs: {
        description: toOneLine(`
            Import/Export declarations should be formatted as one line,
            unless line length exceeds specified character amount.    
        `),
    },
    messages: {
        [messageIds.longOneLiner]: 'Import/Export exceeds specified length.',
        [messageIds.shortMultiline]: toOneLine(`
            Import/Export is shorter then specified length.
        `),
    },
    type: 'layout',
    schema: [],
    fixable: 'whitespace',
};

export const rule = createRule({
    create: ruleVisitors,
    name: ruleName,
    meta: ruleMeta,
    defaultOptions,
});