import { invariant, never } from '@lesnoypudge/utils';
import { RuleVisitors, messageIds } from './extra';
import * as t from '@babel/types';
import { generate } from '@babel/generator';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';



const tt = AST_NODE_TYPES;

const padded = (text: string) => {
    return ' '.repeat(4) + text;
};

const getImportAst = (node: TSESTree.ImportDeclaration) => {
    const ast = t.importDeclaration(
        node.specifiers.map((clause) => {
            switch (clause.type) {
                case (tt.ImportSpecifier): {
                    const original = (
                        clause.imported.type === tt.Identifier
                            ? clause.imported.name
                            : clause.imported.value
                    );

                    return t.importSpecifier(
                        t.identifier(original),
                        t.identifier(clause.local.name),
                    );
                }

                case (tt.ImportDefaultSpecifier): {
                    return t.importDefaultSpecifier(
                        t.identifier(clause.local.name),
                    );
                }

                default: {
                    never('unhandled import specifier');
                }
            }
        }),
        t.stringLiteral(node.source.value),
    );

    return ast;
};

const getExportAst = (node: TSESTree.ExportNamedDeclaration) => {
    invariant(node.source?.value);

    const ast = t.exportNamedDeclaration(
        null,
        node.specifiers.map((clause) => {
            const local = (
                clause.local.type === tt.Literal
                    ? clause.local.value
                    : clause.local.name
            );

            const exported = (
                clause.exported.type === tt.Literal
                    ? clause.exported.value
                    : clause.exported.name
            );

            return t.exportSpecifier(
                t.identifier(local),
                t.identifier(exported),
            );
        }),
        t.stringLiteral(node.source.value),
    );

    return ast;
};

const getOneLinerImport = (node: TSESTree.ImportDeclaration) => {
    return generate(getImportAst(node)).code.replaceAll('"', '\'');
};

const getOneLinerExport = (node: TSESTree.ExportNamedDeclaration) => {
    return generate(getExportAst(node)).code.replaceAll('"', '\'');
};

const getMultilineImport = (node: TSESTree.ImportDeclaration) => {
    const ast = getImportAst(node);

    const first = ast.specifiers[0];
    invariant(first);

    const withDefault = t.isImportDefaultSpecifier(first);

    const defaultName = withDefault ? first.local.name + ', ' : '';

    const rest = withDefault ? ast.specifiers.slice(1) : ast.specifiers;

    return [
        `import ${defaultName}{`,
        ...rest.map((clause) => {
            invariant(t.isImportSpecifier(clause));

            const imported = (
                t.isStringLiteral(clause.imported)
                    ? clause.imported.value
                    : clause.imported.name
            );

            const local = clause.local.name;

            if (imported !== local) {
                return padded(`${local} as ${imported},`);
            }

            return `${padded(imported)},`;
        }),
        `} from '${ast.source.value}';`,
    ].join('\n');
};

const getMultilineExport = (node: TSESTree.ExportNamedDeclaration) => {
    const ast = getExportAst(node);

    const source = (
        ast.source
            ? ` from '${ast.source.value}'`
            : ''
    );

    return [
        `export {`,
        ...ast.specifiers.map((clause) => {
            invariant(t.isExportSpecifier(clause));

            const exported = (
                t.isStringLiteral(clause.exported)
                    ? clause.exported.value
                    : clause.exported.name
            );

            const local = clause.local.name;

            if (exported !== local) {
                return padded(`${local} as ${exported},`);
            }

            return `${padded(exported)},`;
        }),
        `}${source};`,
    ].join('\n');
};

export const ruleVisitors: RuleVisitors = (context) => {
    const getIsMultiline = (node: TSESTree.Node) => {
        return context.sourceCode.getText(node).split('\n').length > 1;
    };

    const getIsExceeds = (length: number) => {
        return length > 80;
    };

    const getConditions = ({
        isExceeds,
        node,
    }: { node: TSESTree.Node; isExceeds: boolean }) => {
        const isMultiline = getIsMultiline(node);
        const isOneLiner = !isMultiline;

        const shouldTransformToOneLiner = (
            isMultiline && !isExceeds
        );

        const shouldTransformToMultiline = (
            isOneLiner && isExceeds
        );

        const shouldBail = (
            !shouldTransformToMultiline
            && !shouldTransformToOneLiner
        );

        return {
            shouldTransformToMultiline,
            shouldTransformToOneLiner,
            shouldBail,
        };
    };

    return {
        [tt.ImportDeclaration]: (node) => {
            const withSpecifiers = node.specifiers.some((clause) => {
                return clause.type === tt.ImportSpecifier;
            });

            // filter out everything that does not
            // contain named specifiers ({some1, some2})
            if (!withSpecifiers) return;

            const isExceeds = getIsExceeds(
                getOneLinerImport(node).length,
            );

            const {
                shouldBail,
                shouldTransformToMultiline,
                shouldTransformToOneLiner,
            } = getConditions({ isExceeds, node });

            if (shouldBail) return;

            if (shouldTransformToMultiline) {
                return context.report({
                    messageId: messageIds.longOneLiner,
                    node,
                    fix: (fixer) => {
                        return fixer.replaceText(
                            node,
                            getMultilineImport(node),
                        );
                    },
                });
            }

            if (shouldTransformToOneLiner) {
                return context.report({
                    messageId: messageIds.shortMultiline,
                    node,
                    fix: (fixer) => {
                        return fixer.replaceText(
                            node,
                            getOneLinerImport(node),
                        );
                    },
                });
            }

            never();
        },

        [tt.ExportNamedDeclaration]: (node) => {
            // filter out exports that does not
            // include specifiers ({ some1, some2 })
            if (node.declaration !== null) return;

            const isExceeds = getIsExceeds(
                getOneLinerExport(node).length,
            );

            const {
                shouldBail,
                shouldTransformToMultiline,
                shouldTransformToOneLiner,
            } = getConditions({ isExceeds, node });

            if (shouldBail) return;

            if (shouldTransformToMultiline) {
                return context.report({
                    messageId: messageIds.longOneLiner,
                    node,
                    fix: (fixer) => {
                        return fixer.replaceText(
                            node,
                            getMultilineExport(node),
                        );
                    },
                });
            }

            if (shouldTransformToOneLiner) {
                return context.report({
                    messageId: messageIds.shortMultiline,
                    node,
                    fix: (fixer) => {
                        return fixer.replaceText(
                            node,
                            getOneLinerExport(node),
                        );
                    },
                });
            }

            never();
        },
    };
};