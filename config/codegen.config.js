
const config = {
    schema: "graphql/schema.gql",
    generates: {
        "graphql/types.ts": {
            plugins: {
                "typescript": {},
                "typescript-operations": {},
                "typescript-resolvers": {},
                "add": {
                    placement: "prepend",
                    content: "// deno-lint-ignore-file"
                },
                "config/codegen-plugins/redis.plugin.js": {}
            }
        }
    },
    overwrite: true
}

module.exports = config;
