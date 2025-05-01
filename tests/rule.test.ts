import { RuleTester } from '@typescript-eslint/rule-tester';
import { rule } from 'src/rule';
import { messageIds, ruleName } from 'src/extra';
import * as test from 'node:test';



RuleTester.afterAll = test.after;
RuleTester.describe = test.describe;
RuleTester.it = test.it;
RuleTester.itOnly = test.it.only;

const ruleTester = new RuleTester();

const longName = 'some_' + 'q'.repeat(80);

const padded = (text: string) => ' '.repeat(4) + text;

ruleTester.run(ruleName, rule, {
    valid: [
        'import { some1 as some3, some2 } from \'module\';',

        'import defaultImport from \'module\';',

        `import ${longName} from \'module\';`,

        'import defaultImport, { some1, some2 } from \'module\';',

        'import * as namespace from \'module\';',

        `import * as ${longName} from \'module\';`,

        'export { some1, some2 } from \'module\';',

        'export * as namespace from \'module\';',

        `export * as ${longName} from \'module\';`,

        'export * from \'module\';',

        'export function myFunction() {}',

        'export default 42;',

        {
            code: [
                'import {',
                padded(`${longName},`),
                '} from \'module\';',
            ].join('\n'),
        },

        {
            code: [
                'export {',
                padded(`${longName},`),
                '} from \'some\';',
            ].join('\n'),
        },
    ],
    invalid: [
        {
            code: `import { some1 as some3, ${longName} } from 'module';`,

            output: [
                'import {',
                padded('some1 as some3,'),
                `${padded(longName)},`,
                '} from \'module\';',
            ].join('\n'),

            errors: [{
                messageId: messageIds.longOneLiner,
            }],
        },

        {
            code: `export { some1 as some3, ${longName} } from 'module';`,

            output: [
                'export {',
                padded('some1 as some3,'),
                `${padded(longName)},`,
                '} from \'module\';',
            ].join('\n'),

            errors: [{
                messageId: messageIds.longOneLiner,
            }],
        },

        {
            code: `import defaultImport, { ${longName} } from \'module\';`,

            output: [
                'import defaultImport, {',
                `${padded(longName)},`,
                '} from \'module\';',
            ].join('\n'),

            errors: [{
                messageId: messageIds.longOneLiner,
            }],
        },

        {
            code: [
                'import {',
                padded('some1,'),
                '} from \'some\';',
            ].join('\n'),

            output: 'import { some1 } from \'some\';',

            errors: [{
                messageId: messageIds.shortMultiline,
            }],
        },

        {
            code: [
                'export {',
                padded('some1,'),
                '} from \'some\';',
            ].join('\n'),

            output: 'export { some1 } from \'some\';',

            errors: [{
                messageId: messageIds.shortMultiline,
            }],
        },
    ],
});