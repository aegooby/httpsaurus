
function relayPlugin(snowpackConfig)
{
    return {
        name: "@snowpack/plugin-relay",
        transform(options)
        {
            const 
            {
                id, 
                srcPath, 
                fileExt, 
                contents, 
                isDev, 
                isHmrEnabled, 
                isSSR, 
                isPackage
            } = options;
            switch (fileExt)
            {
                case ".js": case ".mjs":
                    break;
                default:
                    return;
            }
            let fileContents = null;
            switch (typeof contents)
            {
                case "string":
                    fileContents = contents;
                    break;
                default:
                    fileContents = contents.toString();
                    break;
            }
            const newContents = fileContents.replaceAll(/(require)\(('|")(.*)\.ts('|")\)/g, "require(\"$3.js\")");

            return newContents;
        }
    };
}

module.exports = relayPlugin;