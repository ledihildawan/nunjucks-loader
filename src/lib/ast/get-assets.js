import nunjucks from 'nunjucks';

import {StaticExtension} from '../../public/static-extension/StaticExtension';
import {ERROR_MODULE_NOT_FOUND} from '../constants';
import {ImportWrapper} from '../import-wrapper/ImportWrapper';
import {getFirstExistedPath} from '../utils/get-first-existed-path';
import {getPossiblePaths} from '../utils/get-possible-paths';
import {isUniqueAsset} from '../utils/is-unique-asset';

import {getAddNodeValue} from './get-add-node-value';
import {getNodesValues} from './get-nodes-values';
import {isExtension} from './is-extension';


function getNodeValue(node) {
    if (!isExtension(node, StaticExtension)) {
        return;
    }

    const [asset] = node.args.children;

    if (asset instanceof nunjucks.nodes.Add) {
        return getAddNodeValue(asset);
    }

    const value = new ImportWrapper()

    if (asset instanceof nunjucks.nodes.Symbol) {
        value.addSymbol(asset.value);
    }

    if (asset instanceof nunjucks.nodes.Literal) {
        value.addLiteral(asset.value);
    }

    return value;
}

async function filterPaths([path, paths]) {
    const firstPath = Array.isArray(paths) ? paths[0] : paths;
    if (firstPath && firstPath.isDynamic()) {
        return [path, firstPath];
    }

    try {
        const importPath = await getFirstExistedPath(paths);
        return [path, importPath];
    } catch (error) {
        if (error.code !== ERROR_MODULE_NOT_FOUND) {
            throw new Error(`Asset "${path}" not found`);
        }

        throw error;
    }
}

/**
 * @param {nunjucks.nodes.Root} nodes
 * @param {string}            templateContext
 * @param {Object}            [webpackAlias]
 * @returns {Promise<[ImportWrapper, ImportWrapper][]>}
 */
export function getAssets(nodes, templateContext, webpackAlias = {}) {
    const assets = getNodesValues(
        nodes,
        nunjucks.nodes.CallExtensionAsync,
        getNodeValue
    ).filter(isUniqueAsset);
    const possiblePaths = getPossiblePaths(assets, templateContext, webpackAlias);
    const resolvedAssets = possiblePaths.map(filterPaths);

    return Promise.all(resolvedAssets);
}
