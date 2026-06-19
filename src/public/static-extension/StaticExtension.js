import path from 'path';

import {getModule} from '../utils/get-module';
import {getRegexMatches} from '../utils/get-regex-matches';

import {ASSETS_KEY, WEBPACK_ALIAS_KEY} from './contants';

function resolveAlias(assetPath, aliasMap) {
    if (typeof assetPath !== 'string') {
        return assetPath;
    }
    for (const [aliasName, aliasPath] of Object.entries(aliasMap)) {
        if (assetPath.startsWith(aliasName + '/') || assetPath === aliasName) {
            const aliasValue = Array.isArray(aliasPath) ? aliasPath[0] : aliasPath;
            const remainingPath = assetPath.slice(aliasName.length);
            const normalizedRemaining = remainingPath.startsWith('/') ? remainingPath.slice(1) : remainingPath;
            return path.resolve(aliasValue, normalizedRemaining);
        }
    }
    return assetPath;
}

export class StaticExtension {
    constructor() {
        this.tags = ['static'];
    }

    parse(parser, nodes) {
        const token = parser.nextToken();
        const assetPath = parser.parseExpression();
        const args = new nodes.NodeList();
        args.addChild(assetPath);

        if (parser.skipSymbol('as')) {
            const alias = parser.parsePrimary();
            args.addChild(new nodes.Literal(alias.lineno, alias.colno, alias.value));
        }

        parser.advanceAfterBlockEnd(token.value);

        return new nodes.CallExtensionAsync(this, 'run', args);
    }

    run(...args) {
        const callback = args.pop();
        const [context, url, exportVar] = args;
        const assets = context.lookup(ASSETS_KEY) || {};
        const aliasMap = context.lookup(WEBPACK_ALIAS_KEY) || {};
        const resolvedUrl = resolveAlias(url, aliasMap);
        let asset;

        for (const assetUUID in assets) {
            if (!Object.prototype.hasOwnProperty.call(assets, assetUUID)) {
                continue;
            }

            const assetMeta = assets[assetUUID];
            if (typeof assetMeta.path !== 'string') {
                if (assetMeta.path.test(url) || assetMeta.path.test(resolvedUrl)) {
                    asset = assetMeta;
                }
            } else if (resolveAlias(assetMeta.path, aliasMap) === resolvedUrl) {
                asset = assetMeta;
            }

            if (asset) {
                break;
            }
        }

        if (!asset) {
            return callback(new Error(
                `StaticExtension: cannot find module ${JSON.stringify(url)}`
            ));
        }

        const assetModule = getModule(asset.module);

        if (typeof assetModule === 'function') {
            const matches = getRegexMatches(url, asset.path);

            Promise.resolve(assetModule(...matches)).then(function(assetModule) {
                const resolvedAsset = getModule(assetModule);
                if (exportVar) {
                    context.setVariable(exportVar, resolvedAsset);

                    return callback(null, '');
                }

                callback(null, resolvedAsset);
            }, function(error) {
                callback(error);
            });

            return;
        }

        if (exportVar) {
            context.setVariable(exportVar, assetModule);

            return callback(null, '');
        }

        callback(null, assetModule);
    }
}
