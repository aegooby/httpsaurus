module.exports = {
    plugin: (schema, _documents, _config, _info) => {
        const typeMap = schema.getTypeMap();

        const lines = ["\n/** REDIS TYPES PLUGIN */"];
        const redisPayloads = ["export type RedisPayload = {"];
        const redisPrefixes = ["export const redisPrefix = {"];
        const redisIndices = ["export const redisIndex = {"];

        for (const typeName of Object.keys(typeMap))
        {
            const type = typeMap[typeName];
            const astNode = type.astNode;

            if (astNode && astNode.directives) {
                const secret = astNode.directives.find(directive => directive.name.value === "secret");
                if (secret && secret.arguments)
                {
                    const name = secret.arguments.find(argument => argument.name.value === "name");
                    if (!name)
                        throw new Error("\"@secret\" directive must have argument \"name\"");
                    const type = secret.arguments.find(argument => argument.name.value === "type");
                    if (!type)
                        throw new Error("\"@secret\" directive must have argument \"type\"");

                    const typeFields = `${name.value.value}: ${type.value.value};`;
                    lines.push(`interface ${typeName}RedisPayload extends ${typeName} { ${typeFields} }`)
                    redisPayloads.push(`  ${typeName}: ${typeName}RedisPayload;`);
                }
                const index = astNode.directives.find(directive => directive.name.value === "index");
                if (index && index.arguments)
                {
                    const prefix = index.arguments.find(argument => argument.name.value === "prefix");
                    if (!prefix)
                        throw new Error("\"@index\" directive must have argument \"prefix\"");
                    const prefixName = `${prefix.value.value}*:`;
                    redisPrefixes.push(`  ${typeName}: "${prefixName}",`);
                    const name = index.arguments.find(argument => argument.name.value === "name");
                    if (!name)
                        throw new Error("\"@index\" directive must have argument \"name\"");
                    redisIndices.push(`  ${typeName}: {`);
                    redisIndices.push(`    name: "${name.value.value}",`);
                    redisIndices.push(`    schemaFields: [`);
                    if (astNode.fields)
                    {
                        for (const field of astNode.fields)
                        {
                            const tag = field.directives.find(directive => directive.name.value === "tag");
                            if (!tag)
                                continue;
                            const fieldName = field.name.value;
                            redisIndices.push(`      { name: "$.${fieldName}", type: "TAG", as: "${fieldName}" }`);
                        }
                    }
                    redisIndices.push(`    ],`);
                    redisIndices.push(`    parameters: { prefix: [{ count: 1, name: "${prefixName}" }] },`);
                    redisIndices.push(`  },`);
                }
            }
        }
        redisPayloads.push("};");
        redisPrefixes.push("};");
        redisIndices.push("};");

        lines.push(redisPrefixes.join("\n"));
        lines.push(redisPayloads.join("\n"));
        lines.push(redisIndices.join("\n"));
        return lines.join("\n\n");
    },
  };