
const babel = require("@babel/core");

function relayPlugin(_snowpackConfig, _pluginOptions) {
    return {
        name: "@snowpack/plugin-relay",
        async transform(options) {
            const {
                id, _srcPath, fileExt, contents, _isDev, _isHmrEnabled, 
                _isSSR, isPackage
            } = options;
            switch (fileExt) {
                case ".js": case ".mjs":
                    break;
                default:
                    return;
            }
            const transformOptions = {
                filename: id,
                ast: true,
                plugins: [
                    ["babel-plugin-relay", { eagerESModules: true }],
                    ["babel-plugin-transform-commonjs"],
                    ["@babel/plugin-proposal-class-properties"],
                    ["@babel/plugin-transform-runtime"]
                ],
            };
            if (isPackage)
                return;
            const transformResult = 
                await babel.transformAsync(contents, transformOptions);
            const transformAstOptions = {
                plugins: [
                    function relayPluginTransformAst() {
                        return {
                            visitor: {
                                ImportDeclaration(path) {
                                    const sources = [
                                        "relay-runtime",
                                        "react-relay",
                                        "react-relay/hooks"
                                    ]
                                    if (sources.includes(path.node.source.value)) {
                                        const filter = function (specifier) {
                                            return !specifier.imported ||
                                                specifier.imported.name !== "graphql";
                                        }
                                        path.node.specifiers = 
                                            path.node.specifiers.filter(filter);
                                        if (!(path.node.specifiers.length > 0))
                                            path.remove();
                                    }
                                },
                                ExportDefaultDeclaration(path) {
                                    const declaration = path.node.declaration;
                                    if (declaration.object && 
                                        declaration.object.name === "module" &&
                                        declaration.property &&
                                        declaration.property.name === "exports")
                                        path.remove();
                                }
                            },
                        };
                    },
                ],
            }
            const transformAstResult = 
                await babel.transformFromAstAsync(transformResult.ast, undefined, transformAstOptions);
            return transformAstResult.code;
        }
    };
}

module.exports = relayPlugin;