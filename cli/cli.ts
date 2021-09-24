import { std, yargs } from "../deps.ts";
import type { Arguments } from "../deps.ts";

import { Console } from "./console.ts";

Deno.env.set("DENO_DIR", ".cache/");
const [args, command] = [Deno.args, "turtle"];

enum Result
{
    SUCCESS = 0,
    FAILURE = 1,
}

/** Command handler type for CLI tools. */
export type Command = (args: Arguments) => undefined | number | Promise<undefined | number>;

/**
 * Class containing CLI functions.
 */
export class CLI
{
    public static all(): Command
    {
        return (_args: Arguments) =>
        {
            Console.error(`usage: ${command} <command> [options]`);
            Console.log(`Try \`${command} <command> --help\` for more information`);
            Console.log(`commands:`);
            Console.print(`  clean\t\t${std.colors.italic(std.colors.black("(cleans temporary directories)"))}`);
            Console.print(`  install\t\t${std.colors.italic(std.colors.black("(installs Yarn)"))}`);
            Console.print(`  upgrade\t\t${std.colors.italic(std.colors.black("(upgrades Deno)"))}`);
            Console.print(`  cache\t\t${std.colors.italic(std.colors.black("(caches packages)"))}`);
            Console.print(`  bundle\t\t${std.colors.italic(std.colors.black("(bundles JavaScript)"))}`);
            Console.print(`  codegen\t\t${std.colors.italic(std.colors.black("(generates GraphQL types)"))}`);
            Console.print(`  localhost\t\t${std.colors.italic(std.colors.black("(runs server on localhost)"))}`);
            Console.print(`  deploy\t\t${std.colors.italic(std.colors.black("(runs live deployment)"))}`);
            Console.print(`  test\t\t${std.colors.italic(std.colors.black("(runs automated tests)"))}`);
            Console.print(`  docker\t\t${std.colors.italic(std.colors.black("(manages Docker)"))}`);
            Console.print(`  sync\t\t${std.colors.italic(std.colors.black("(sync files to server)"))}`);
            Console.print(`  help\t\t${std.colors.italic(std.colors.black("(prints help)"))}`);
            return undefined;
        };
    }
    public static clean(): Command
    {
        return async (args: Arguments) =>
        {
            if (args.help)
            {
                Console.log(`usage: ${command} clean [--cache] [--dist] [--node] [--redis]`);
                return;
            }
            if (!args.cache && !args.dist && !args.node && !args.redis)
                args.all = true;

            const files: Array<{ path: string; directory: boolean; }> = [];
            if (args.all || args.cache)
                files.push({ path: ".cache/", directory: true });
            if (args.all || args.dist)
                files.push({ path: "dist/", directory: true });
            if (args.all || args.node)
                files.push({ path: "node_modules/", directory: true });
            if (args.all || args.redis)
            {
                files.push({ path: "dump.rdb", directory: false });
                files.push({ path: "appendonly.aof", directory: false });
            }

            for (const file of files)
            {
                if (await std.fs.exists(file.path))
                    await Deno.remove(file.path, { recursive: true });
                if (file.directory)
                    await std.fs.ensureDir(file.path);
            }

            Console.success("Done");
            return undefined;
        };
    }
    public static install(): Command
    {
        return async (args: Arguments) =>
        {
            if (args.help)
            {
                Console.log(`usage: ${command} install`);
                return;
            }
            const npmRunOptions: Deno.RunOptions =
            {
                cmd: ["npm", "install", "--global", "yarn", "n"],
                stdout: "null"
            };
            Console.log("Installing Yarn");
            const npmProcess = Deno.run(npmRunOptions);
            const npmStatus = await npmProcess.status();
            npmProcess.close();
            if (!npmStatus.success)
                return npmStatus.code;

            Console.log("Installing latest Node version");
            const nProcess = Deno.run({ cmd: ["n", "latest"], stdout: "null" });
            const nStatus = await nProcess.status();
            nProcess.close();
            Console.success("Done");
            return nStatus.code;
        };
    }
    public static upgrade(): Command
    {
        return async (args: Arguments) =>
        {
            if (args.help)
            {
                Console.log(`usage: ${command} upgrade`);
                return;
            }
            Console.log("Upgrading Deno");
            const process = Deno.run({ cmd: ["deno", "upgrade"], stdout: "null" });
            const status = await process.status();
            process.close();
            Console.success("Done");
            return status.code;
        };
    }
    public static cache(): Command
    {
        return async (args: Arguments) =>
        {
            if (args.help)
            {
                Console.log(`usage: ${command} cache [--reload] [--remote]`);
                return;
            }

            if (args.remote)
            {
                Console.log("Fetching remote cache");
                const remoteCache = "https://dl.dropboxusercontent.com/s/gtjdehk8eqoqtl3/.cache.zip";
                const response = await fetch(remoteCache);
                if (!response.body)
                {
                    Console.error("Unable to fetch remote cache");
                    return;
                }
                const body = await response.arrayBuffer();
                const binary = new Uint8Array(body);
                await Deno.writeFile(".cache.zip", binary);

                Console.log("Unzipping remote cache");
                const runOptions: Deno.RunOptions =
                {
                    cmd: ["unzip", "-oq", ".cache"],
                    stdout: "null"
                };
                const process = Deno.run(runOptions);
                const status = await process.status();
                process.close();
                if (!status.success)
                {
                    Console.error("Failed to unzip cache");
                    if (await std.fs.exists(".cache.zip"))
                        await Deno.remove(".cache.zip");
                    return status.code;
                }
                if (await std.fs.exists(".cache.zip"))
                    await Deno.remove(".cache.zip");
            }

            const flags = args.reload ? ["--reload"] : [];
            const denoRunOptions: Deno.RunOptions =
            {
                cmd:
                    [
                        "deno", "cache", "--unstable", ...flags,
                        "--import-map", "import-map.json", "deps.ts"
                    ],
                env: { DENO_DIR: ".cache/" },
                stdout: "null"
            };
            const yarnRunOptions: Deno.RunOptions =
            {
                cmd: ["yarn", "install"],
                stdout: "null"
            };

            Console.log("Caching dependencies");
            const denoProcess = Deno.run(denoRunOptions);
            const yarnProcess = Deno.run(yarnRunOptions);

            const [denoStatus, yarnStatus] =
                await Promise.all([denoProcess.status(), yarnProcess.status()]);
            denoProcess.close();
            yarnProcess.close();

            if (!denoStatus.success)
                return denoStatus.code;
            if (!yarnStatus.success)
                return yarnStatus.code;
            Console.success("Done");
            return undefined;
        };
    }
    public static bundle(): Command
    {
        return (_args: Arguments) =>
        {
            Console.log(`commands:`);
            Console.print(`  bundle:relay\t${std.colors.italic(std.colors.black("(runs Relay compiler)"))}`);
            Console.print(`  bundle:snowpack\t${std.colors.italic(std.colors.black("(runs Snowpack build)"))}`);
            return undefined;
        };
    }
    public static bundleRelay(): Command
    {
        return async (args: Arguments) =>
        {
            if (args.help)
            {
                Console.log(`usage: ${command} bundle:relay`);
                return;
            }

            const options: string[] = [];
            const config = JSON.parse(await Deno.readTextFile("config/relay.config.json"));
            for (const [key, value] of Object.entries(config))
            {
                options.push(`--${key}`);
                switch (typeof value)
                {
                    case "boolean":
                        break;
                    case "string":
                        options.push(value);
                        break;
                    default:
                        options.push(JSON.stringify(value));
                        break;
                }
            }

            const relayRunOptions: Deno.RunOptions =
            {
                cmd: ["yarn", "run", "relay-compiler", ...options]
            };
            Console.log("Running Relay compiler");
            const relayProcess = Deno.run(relayRunOptions);
            const relayStatus = await relayProcess.status();
            relayProcess.close();
            if (!relayStatus.success)
                return relayStatus.code;

            const files =
                std.fs.expandGlob("components/**/__generated__/**/*.ts");
            Console.log("Adding Deno lint ignore directives");
            for await (const file of files)
            {
                const text = await Deno.readTextFile(file.path);
                const updated = "// deno-lint-ignore-file \n" + text;
                await Deno.writeTextFile(file.path, updated);
            }
            Console.success("Done");
            return undefined;
        };
    }
    public static bundleSnowpack(): Command
    {
        return async (args: Arguments) =>
        {
            if (args.help)
            {
                Console.log(`usage: ${command} bundle:snowpack --url <endpoint> [--watch] [--nocheck]`);
                return;
            }
            if (!args.url)
            {
                Console.error(`usage: ${command} bundle:snowpack --url <endpoint> [--watch] [--nocheck]`);
                return;
            }
            const watch = args.watch ? ["--watch"] : [];

            if (!args.nocheck)
            {
                Console.log("Running type checker");
                const tsconfig = JSON.parse(await Deno.readTextFile("config/deno.tsconfig.json"));
                const emitOptions: Deno.EmitOptions =
                {
                    check: true,
                    compilerOptions: tsconfig.compilerOptions,
                    importMapPath: std.path.resolve("import-map.json"),
                };
                const emitResult = await Deno.emit("client/bundle.tsx", emitOptions);

                const diagnosticsFilter = function (diagnostic: Deno.Diagnostic) 
                {
                    return diagnostic.fileName?.startsWith("file://");
                };
                const diagnostics = emitResult.diagnostics.filter(diagnosticsFilter);
                if (diagnostics.length > 0)
                {
                    Console.error("Type check failed");
                    console.error(Deno.formatDiagnostics(diagnostics));
                    return Result.FAILURE;
                }
                Console.success("Type check succeeded");
            }

            const snowpackRunOptions: Deno.RunOptions =
            {
                cmd:
                    [
                        "yarn", "run", "snowpack", "--config",
                        "config/snowpack.config.js", "build", ...watch
                    ],
                env:
                {
                    SNOWPACK_PUBLIC_GRAPHQL_ENDPOINT:
                        new URL("/graphql", args.url).href,
                    SNOWPACK_PUBLIC_REFRESH_ENDPOINT:
                        new URL("/jwt/refresh", args.url).href
                }
            };
            if (!args.watch)
                Console.log("Running Snowpack build");
            const snowpackProcess = Deno.run(snowpackRunOptions);
            const snowpackStatus = await snowpackProcess.status();
            snowpackProcess.close();
            if (!snowpackStatus.success && !args.watch)
            {
                const error =
                    (new TextDecoder()).decode(await snowpackProcess.stderrOutput());
                Console.error(error);
            }
            if (!args.watch)
                Console.success("Done");
            return undefined;
        };
    }
    public static codegen(): Command
    {
        return async (args: Arguments) =>
        {
            if (args.help)
            {
                Console.log(`usage: ${command} codegen [--watch]`);
                return;
            }
            const watchArgs = args.watch ? ["--watch"] : [];
            const runOptions: Deno.RunOptions =
            {
                cmd:
                    [
                        "yarn", "run", "graphql-codegen", "--config",
                        "config/codegen.config.js", ...watchArgs
                    ]
            };
            Console.log("Running GraphQL codegen");
            const process = Deno.run(runOptions);
            const status = await process.status();
            process.close();
            Console.log("Replacing \"graphql\" import");
            const text = await Deno.readTextFile("graphql/types.ts");
            const regex =
                /import\s*{\s*GraphQLResolveInfo\s*}\s*from\s*('|")graphql('|");/g;
            const replacement =
                [
                    "import { graphql } from \"../deps.ts\";",
                    "type GraphQLResolveInfo = graphql.GraphQLResolveInfo;"
                ].join("\n");
            await Deno.writeTextFile("graphql/types.ts",
                text.replaceAll(regex, replacement));
            Console.success("Done");
            return status.code;
        };
    }
    public static localhost(): Command
    {
        return (_args: Arguments) =>
        {
            Console.log(`commands:`);
            Console.print(`  localhost:snowpack\t\t\t${std.colors.italic(std.colors.black("(runs Snowpack dev server)"))}`);
            Console.print(`  localhost:deno [--devtools]\t${std.colors.italic(std.colors.black("(runs Deno live server)"))}`);
            return undefined;
        };
    }
    public static localhostSnowpack(): Command
    {
        return async (args: Arguments) =>
        {
            if (args.help)
            {
                Console.log(`usage: ${command} localhost:snowpack`);
                return;
            }
            const runOptions: Deno.RunOptions =
            {
                cmd:
                    [
                        "yarn", "run", "snowpack", "--config",
                        "config/snowpack.config.js", "dev"
                    ],
                stdout: "null"
            };
            Console.log("Running Snowpack dev server");
            const process = Deno.run(runOptions);
            const status = await process.status();
            process.close();
            if (!status.success)
                return status.code;
            Console.success("Done");
            return undefined;
        };
    }
    public static localhostDeno(): Command
    {
        return async (args: Arguments) =>
        {
            if (args.help)
            {
                Console.log(`usage: ${command} localhost:deno [--devtools]`);
                return;
            }
            const bundle = CLI.bundleSnowpack();
            if (await bundle({ _: [], url: "http://localhost:3080/" }))
                return;

            const ready = async function (): Promise<void>
            {
                while (true)
                {
                    try
                    {
                        await std.async.delay(750);
                        await fetch("http://localhost:3080/");
                        break;
                    }
                    catch { undefined; }
                }
                await bundle({ _: [], url: "http://localhost:3080/", watch: true });
            };
            ready();

            const promises = [];
            if (args.devtools)
            {
                Console.log("Opening devtools");
                const reactRunOptions: Deno.RunOptions =
                    { cmd: ["yarn", "run", "react-devtools"], stdout: "null" };
                const reactProcess = Deno.run(reactRunOptions);
                const reactStatus = reactProcess.status();
                promises.push(reactStatus);

                const relayRunOptions: Deno.RunOptions =
                    { cmd: ["yarn", "run", "relay-devtools"], stdout: "null" };
                const relayProcess = Deno.run(relayRunOptions);
                const relayStatus = relayProcess.status();
                promises.push(relayStatus);
            }
            const serverRunOptions: Deno.RunOptions =
            {
                cmd: ["cargo", "run"],
            };
            Console.log("Starting server");
            const serverProcess = Deno.run(serverRunOptions);
            const serverStatus = serverProcess.status();
            promises.push(serverStatus);
            await Promise.race(promises);
            Console.success("Done");
            return undefined;
        };
    }
    public static deploy(): Command
    {
        return (_args: Arguments) =>
        {
            Console.log(`commands:`);
            Console.print(`  deploy:server --domain <domain>\t${std.colors.italic(std.colors.black("(runs webserver)"))}`);
            return undefined;
        };
    }
    public static deployServer(): Command
    {
        return async (args: Arguments) =>
        {
            if (args.help)
            {
                Console.log(`usage: ${command} deploy:server --domain <domain>`);
                return;
            }
            if (!args.domain)
            {
                Console.error(`usage: ${command} deploy:server --domain <domain>`);
                return;
            }
            const serverRunOptions: Deno.RunOptions =
            {
                cmd: ["cargo", "run", "--release"],
            };
            Console.log("Starting server");
            const serverProcess = Deno.run(serverRunOptions);
            const serverStatus = await serverProcess.status();
            serverProcess.close();
            if (!serverStatus.success)
                return serverStatus.code;
            Console.success("Done");
            return undefined;
        };
    }
    public static test(): Command
    {
        return async (args: Arguments) =>
        {
            if (args.help)
            {
                Console.log(`usage: ${command} test`);
                return;
            }
            const testFiles = [] as string[];
            for await (const file of std.fs.expandGlob("**/__test__/**/*.ts"))
                testFiles.push(file.path);
            for await (const file of std.fs.expandGlob("**/__test__/**/*.tsx"))
                testFiles.push(file.path);

            const runOptions: Deno.RunOptions =
            {
                cmd:
                    [
                        "deno", "test", "--unstable", "--allow-all",
                        "--import-map", "import-map.json", ...testFiles
                    ],
                env: { DENO_DIR: ".cache/" }
            };
            const process = Deno.run(runOptions);
            const status = await process.status();
            process.close();
            return status.code;
        };
    }
    public static docker(): Command
    {
        return (_args: Arguments) =>
        {
            Console.log(`commands:`);
            Console.print(`  docker:prune\t\t\t\t\t${std.colors.italic(std.colors.black("(prunes unused resources)"))}`);
            Console.print(`  docker:image --target <target> --tag <tag>\t${std.colors.italic(std.colors.black("(builds Docker image)"))}`);
            Console.print(`  docker:container --tag <tag>\t\t\t${std.colors.italic(std.colors.black("(runs Docker container)"))}`);
            return undefined;
        };
    }
    public static dockerPrune(): Command
    {
        return async (args: Arguments) =>
        {
            if (args.help)
            {
                Console.log(`usage: ${command} prune`);
                return;
            }
            Console.log("Pruning Docker");
            const containerProcess =
                Deno.run({ cmd: ["docker", "container", "prune", "--force"] });
            const containerStatus = await containerProcess.status();
            containerProcess.close();
            if (!containerStatus.success)
                return containerStatus.code;

            const imageProcess =
                Deno.run({ cmd: ["docker", "image", "prune", "--force"] });
            const imageStatus = await imageProcess.status();
            imageProcess.close();
            if (!imageStatus.success)
                return imageStatus.code;

            Console.success("Done");
            return undefined;
        };
    }
    public static dockerImage(): Command
    {
        return async (args: Arguments) =>
        {
            if (args.help)
            {
                Console.log(`usage: ${command} image --target <value> --tag <name> [--prune]`);
                return;
            }
            if (!args.target || !args.tag)
            {
                Console.error(`usage: ${command} image --target <value> --tag <name> [--prune]`);
                return;
            }

            const prune = CLI.dockerPrune();
            if (args.prune)
                await prune(args);

            const imageRunOptions: Deno.RunOptions =
                { cmd: ["docker", "build", "--target", args.target, "--tag", args.tag, "."] };
            Console.log("Building Docker image");
            const imageProcess = Deno.run(imageRunOptions);
            const imageStatus = await imageProcess.status();
            imageProcess.close();
            if (!imageStatus.success)
                return imageStatus.code;
            Console.success("Done");
            return undefined;
        };
    }
    public static dockerContainer(): Command
    {
        return async (args: Arguments) =>
        {
            if (args.help)
            {
                Console.log(`usage: ${command} container --tag <name> [--prune]`);
                return;
            }
            if (!args.tag)
            {
                Console.error(`usage: ${command} container --tag <name> [--prune]`);
                return;
            }

            const prune = CLI.dockerPrune();
            if (args.prune)
                await prune(args);

            const containerRunOptions: Deno.RunOptions =
            {
                cmd:
                    [
                        "docker", "run", "--init", "-itd", "--memory", "512m",
                        "--memory-swap", "-1", "-p", "80:3080", "-p", "5080:5080",
                        "-p", "6080:6080", "-p", "8080:8080", "-p", "9080:9080", "-p",
                        "8000:8000", `${args.tag}:latest`
                    ]
            };
            Console.log("Running Docker container");
            const containerProcess = Deno.run(containerRunOptions);
            const containerStatus = await containerProcess.status();
            containerProcess.close();
            if (!containerStatus.success)
                return containerStatus.code;

            Console.success("Done");
            return undefined;
        };
    }
    public static sync(): Command
    {
        return async (args: Arguments) =>
        {
            if (args.help)
            {
                Console.log(`usage: ${command} sync [--key <path>]`);
                return;
            }
            const file = await Deno.readFile("config/rsync.json");
            const decoder = new TextDecoder();
            const string = decoder.decode(file);
            const json = JSON.parse(string);

            const keyArgs = args.key ? ["-e", "ssh", "-i", `${args.key}`] : [];
            const flatMap = function (value: string) { return ["--exclude", value]; };
            const exclude = (json.exclude as string[]).flatMap(flatMap);

            const runOptions: Deno.RunOptions =
            {
                cmd:
                    [
                        "rsync", "--progress", "--archive", "--relative", ...keyArgs,
                        ...exclude, `${json.src}`,
                        `${args.user ?? json.user}@${args.host ?? json.host}:${json.dest}`
                    ],
                env: { DENO_DIR: ".cache/" }
            };
            Console.success("Running RSync");
            const process = Deno.run(runOptions);
            const status = await process.status();
            Console.success("Done");
            return status.code;
        };
    }
    public static help(): Command
    {
        return (_args: Arguments) =>
        {
            Console.log(`usage: ${command} <command> [options]`);
            Console.log(`Try \`${command} <command> --help\` for more information`);
            Console.log(`commands:`);
            Console.print(`  clean\t\t${std.colors.italic(std.colors.black("(cleans temporary directories)"))}`);
            Console.print(`  install\t\t${std.colors.italic(std.colors.black("(installs Yarn)"))}`);
            Console.print(`  upgrade\t\t${std.colors.italic(std.colors.black("(upgrades Deno)"))}`);
            Console.print(`  cache\t\t${std.colors.italic(std.colors.black("(caches packages)"))}`);
            Console.print(`  bundle\t\t${std.colors.italic(std.colors.black("(bundles JavaScript)"))}`);
            Console.print(`  codegen\t\t${std.colors.italic(std.colors.black("(generates GraphQL types)"))}`);
            Console.print(`  localhost\t\t${std.colors.italic(std.colors.black("(runs server on localhost)"))}`);
            Console.print(`  deploy\t\t${std.colors.italic(std.colors.black("(runs live deployment)"))}`);
            Console.print(`  test\t\t${std.colors.italic(std.colors.black("(runs automated tests)"))}`);
            Console.print(`  docker\t\t${std.colors.italic(std.colors.black("(manages Docker)"))}`);
            Console.print(`  sync\t\t${std.colors.italic(std.colors.black("(sync files to server)"))}`);
            Console.print(`  help\t\t${std.colors.italic(std.colors.black("(prints help)"))}`);
            return undefined;
        };
    }
}

if (import.meta.main)
{
    yargs.default(args)
        .help(false)
        .command("*", "", {}, CLI.all())
        .command("clean", "", {}, CLI.clean())
        .command("install", "", {}, CLI.install())
        .command("upgrade", "", {}, CLI.upgrade())
        .command("cache", "", {}, CLI.cache())
        .command("bundle", "", {}, CLI.bundle())
        .command("bundle:relay", "", {}, CLI.bundleRelay())
        .command("bundle:snowpack", "", {}, CLI.bundleSnowpack())
        .command("codegen", "", {}, CLI.codegen())
        .command("localhost", "", {}, CLI.localhost())
        .command("localhost:help", "", {}, CLI.localhost())
        .command("localhost:snowpack", "", {}, CLI.localhostSnowpack())
        .command("localhost:deno", "", {}, CLI.localhostDeno())
        .command("deploy", "", {}, CLI.deploy())
        .command("deploy:help", "", {}, CLI.deploy())
        .command("deploy:server", "", {}, CLI.deployServer())
        .command("test", "", {}, CLI.test())
        .command("docker", "", {}, CLI.docker())
        .command("docker:help", "", {}, CLI.docker())
        .command("docker:prune", "", {}, CLI.dockerPrune())
        .command("docker:image", "", {}, CLI.dockerImage())
        .command("docker:container", "", {}, CLI.dockerContainer())
        .command("sync", "", {}, CLI.sync())
        .command("help", "", {}, CLI.help())
        .parse();
}
