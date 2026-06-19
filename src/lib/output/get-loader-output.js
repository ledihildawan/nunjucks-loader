import {ASSETS_KEY, WEBPACK_ALIAS_KEY} from '../../public/static-extension/contants';
import {TEMPLATE_DEPENDENCIES} from '../constants';

import {getModuleOutput} from './get-module-output';


export function getLoaderOutput({
    templateImport,
    imports,
    defaultExport,
    precompiled,
    envOptions,
    webpackAlias = {}
}) {
    return `
        ${imports}
        ${precompiled}

        function nunjucksTemplate(ctx = {}) {
            const templateContext = {
                ${ASSETS_KEY}: ${TEMPLATE_DEPENDENCIES}.assets,
                ${WEBPACK_ALIAS_KEY}: ${JSON.stringify(webpackAlias)},
                ...ctx
            };

            var nunjucks = (${getModuleOutput('runtime')})(
                ${envOptions},
                ${TEMPLATE_DEPENDENCIES}
            );

            if (nunjucks.isAsync()) {
                return nunjucks.renderAsync(
                    ${templateImport},
                    templateContext
                );
            }
        
            return nunjucks.render(
                ${templateImport},
                templateContext
            );
        };

        nunjucksTemplate.__nunjucks_precompiled_template__ = ${TEMPLATE_DEPENDENCIES}.templates[${templateImport}];
        nunjucksTemplate.${TEMPLATE_DEPENDENCIES} = ${TEMPLATE_DEPENDENCIES};

        ${defaultExport} nunjucksTemplate;
    `;
}
