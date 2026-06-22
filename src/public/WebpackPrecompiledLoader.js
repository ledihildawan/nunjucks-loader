export function WebpackPrecompiledLoader(precompiled = {}, aliasMap = {}, context = '') {
    this.precompiled = precompiled;
    this.aliasMap = aliasMap;
    this.context = context;
}

WebpackPrecompiledLoader.prototype.resolve = function resolve(from, to) {
    for (const [aliasName, aliasPath] of Object.entries(this.aliasMap)) {
        if (to.startsWith(aliasName + '/') || to === aliasName) {
            const aliasValue = Array.isArray(aliasPath) ? aliasPath[0] : aliasPath;
            const remainingPath = to.slice(aliasName.length);
            const pathModule = require('path');
            return pathModule.resolve(aliasValue, remainingPath);
        }
    }
    const pathModule = require('path');
    return pathModule.resolve(pathModule.dirname(from), to);
};

function normalizeTemplateKey(pathStr) {
    return pathStr.replace(/\\/g, '/');
}

WebpackPrecompiledLoader.prototype.getSource = function getSource(name) {
    if (name in this.precompiled) {
        return {
            src: { type: 'code', obj: this.precompiled[name] },
            path: name
        };
    }

    const normalizedName = normalizeTemplateKey(name);
    if (normalizedName in this.precompiled) {
        return {
            src: { type: 'code', obj: this.precompiled[normalizedName] },
            path: normalizedName
        };
    }

    for (const [aliasName, aliasPath] of Object.entries(this.aliasMap)) {
        if (name.startsWith(aliasName + '/') || name === aliasName) {
            const aliasValue = Array.isArray(aliasPath) ? aliasPath[0] : aliasPath;
            const remainingPath = name.slice(aliasName.length);
            const pathModule = require('path');
            const absPath = pathModule.resolve(aliasValue, remainingPath);
            const normalizedAbs = normalizeTemplateKey(absPath);

            const foundKey = Object.keys(this.precompiled).find(k =>
                normalizeTemplateKey(k) === normalizedAbs
            );

            if (foundKey) {
                return {
                    src: { type: 'code', obj: this.precompiled[foundKey] },
                    path: foundKey
                };
            }

            const foundBySuffix = Object.keys(this.precompiled).find(k =>
                normalizeTemplateKey(k).endsWith(remainingPath) ||
                normalizeTemplateKey(k).endsWith('/' + remainingPath.replace(/^\//, ''))
            );

            if (foundBySuffix) {
                return {
                    src: { type: 'code', obj: this.precompiled[foundBySuffix] },
                    path: foundBySuffix
                };
            }
        }
    }

    const foundByEnding = Object.keys(this.precompiled).find(k =>
        normalizeTemplateKey(k) === normalizedName ||
        normalizeTemplateKey(k).endsWith('/' + normalizedName)
    );

    if (foundByEnding) {
        return {
            src: { type: 'code', obj: this.precompiled[foundByEnding] },
            path: foundByEnding
        };
    }

    if (name.startsWith('./') || name.startsWith('../')) {
        const pathModule = require('path');
        const contextPath = this.context || '.';
        const resolvedPath = pathModule.resolve(contextPath, name);
        const normalizedResolved = normalizeTemplateKey(resolvedPath);

        if (normalizedResolved in this.precompiled) {
            return {
                src: { type: 'code', obj: this.precompiled[normalizedResolved] },
                path: normalizedResolved
            };
        }

        const foundByResolvedEnding = Object.keys(this.precompiled).find(k =>
            normalizeTemplateKey(k).endsWith(name.replace(/^\.\//, '/')) ||
            normalizeTemplateKey(k).endsWith('/' + name.replace(/^\.\//, ''))
        );

        if (foundByResolvedEnding) {
            return {
                src: { type: 'code', obj: this.precompiled[foundByResolvedEnding] },
                path: foundByResolvedEnding
            };
        }
    }

    return null;
};
