
const config = {
    mount: {
        "../public": "/",
        "../client": "/scripts",
        "../components": "/scripts",
    },
    plugins: [
        "@snowpack/plugin-react-refresh",
        "../config/snowpack-plugins/relay.plugin.js",
    ],
    routes: [{ match: "routes", src: ".*", dest: "/index.html" }],
    /** @todo Add ESBuild optimizer once stable. */
    /* optimize: {              */
    /*     entrypoints: "auto", */
    /*     bundle: true,        */
    /*     sourcemap: true,     */
    /*     splitting: true,     */
    /*     treeshake: true,     */
    /*     minify: true,        */
    /*     target: "es2020"     */
    /* },                       */
    packageOptions: {
        polyfillNode: true,
        /** @todo Restore when react-router-dom is fixed. */
        /* "source": "remote",      */
        /* "cache": "../.cache/"    */
    },
    devOptions: {
        output: "dashboard",
        hmrErrorOverlay: true,
        port: 3443
    },
    buildOptions: {
        out: "../dist/",
        sourcemap: true
    }
};

module.exports = config;
