import path from 'path';

import {getAssets} from '../ast/get-assets';
import {getTemplatesImports} from '../ast/get-templates-imports';
import {getUsedExtensions} from '../ast/get-used-extensions';
import {getUsedFilters} from '../ast/get-used-filters';
import {getUsedGlobals} from '../ast/get-used-globals';


/**
 * @param {Object} loaderContext
 * @param {nunjucks.nodes.Root} nodes
 * @param {InstancesList} extensions
 * @param {InstancesList} filters
 * @param {InstancesList} globals
 * @param {Object} loaderOptions
 * @returns {Promise<Object>}
 */
export async function getUsedDependencies(
    loaderContext,
    nodes,
    extensions,
    filters,
    globals,
    loaderOptions
) {
    const {
        webpackAlias = {}
    } = loaderOptions;

    const resourcePath = loaderContext.resourcePath;
    const templateContext = path.dirname(resourcePath);

    const [templates, assets] = await Promise.all([
        getTemplatesImports(loaderContext, nodes, templateContext, webpackAlias),
        getAssets(nodes, templateContext, webpackAlias)
    ]);

    return {
        templates,
        globals: getUsedGlobals(nodes, globals),
        extensions: getUsedExtensions(nodes, extensions),
        filters: getUsedFilters(nodes, filters),
        assets
    };
}
