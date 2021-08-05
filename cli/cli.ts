
import { std, opener, yargs } from "../deps.ts";
import type { Arguments } from "../deps.ts";

import { Console, version } from "../server/server.tsx";
export { version } from "../server/server.tsx";

Deno.env.set("DENO_DIR", ".cache/");
const [args, command] = [Deno.args, "turtle"];

export function all(_args: Arguments)
{
    Console.error(`usage: ${command} <command> [options]`);
    Console.log(`Try \`${command} <command> --help\` for more information`);
    Console.log(`commands:`);
    Console.print(`  clean\t\t${std.colors.italic(std.colors.black("(cleans temporary directories)"))}`);
    Console.print(`  install\t\t${std.colors.italic(std.colors.black("(installs Yarn)"))}`);
    Console.print(`  upgrade\t\t${std.colors.italic(std.colors.black("(upgrades Deno)"))}`);
    Console.print(`  pkg\t\t${std.colors.italic(std.colors.black("(manages packages)"))}`);
    Console.print(`  cache\t\t${std.colors.italic(std.colors.black("(caches packages)"))}`);
    Console.print(`  bundle\t\t${std.colors.italic(std.colors.black("(bundles JavaScript)"))}`);
    Console.print(`  codegen\t\t${std.colors.italic(std.colors.black("(generates GraphQL types)"))}`);
    Console.print(`  localhost\t\t${std.colors.italic(std.colors.black("(runs server on localhost)"))}`);
    Console.print(`  deploy\t\t${std.colors.italic(std.colors.black("(runs live deployment)"))}`);
    Console.print(`  test\t\t${std.colors.italic(std.colors.black("(runs automated tests)"))}`);
    Console.print(`  docker\t\t${std.colors.italic(std.colors.black("(manages Docker)"))}`);
    Console.print(`  sync\t\t${std.colors.italic(std.colors.black("(sync files to server)"))}`);
    Console.print(`  help\t\t${std.colors.italic(std.colors.black("(prints help)"))}`);
    Deno.exit();
}
export async function clean(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} clean [--cache] [--dist] [--node]`);
        Deno.exit();
    }
    if (!args.cache && !args.dist && !args.node)
        args.all = true;

    const directories: Array<string> = [];
    if (args.all || args.cache)
        directories.push(".cache/");
    if (args.all || args.dist)
        directories.push("dist/");
    if (args.all || args.node)
        directories.push("node_modules/");

    for (const directory of directories)
        if (await std.fs.exists(directory))
            await Deno.remove(directory, { recursive: true });

    for (const directory of directories)
        await std.fs.ensureDir(directory);

    Deno.exit();
}
export async function install(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} install`);
        Deno.exit();
    }
    const npmProcess = Deno.run({ cmd: ["npm", "install", "--global", "yarn", "n"] });
    const npmStatus = await npmProcess.status();
    npmProcess.close();
    if (!npmStatus.success)
        Deno.exit(npmStatus.code);

    const nProcess = Deno.run({ cmd: ["n", "latest"] });
    const nStatus = await nProcess.status();
    nProcess.close();
    Deno.exit(nStatus.code);
}
export async function upgrade(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} upgrade`);
        Deno.exit();
    }
    const process = Deno.run({ cmd: ["deno", "upgrade"] });
    const status = await process.status();
    process.close();
    Deno.exit(status.code);
}
export function pkg(_args: Arguments)
{
    Console.log(`commands:`);
    Console.print(`  pkg:add --host <host> <packages...>\t${std.colors.italic(std.colors.black("(adds new packages)"))}`);
    Console.print(`  pkg:remove <packages...>\t\t\t${std.colors.italic(std.colors.black("(removes existing packages)"))}`);
    Console.print(`  pkg:update [packages...]\t\t\t${std.colors.italic(std.colors.black("(updates pacakges)"))}`);
    Deno.exit();
}
export async function pkgAdd(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} pkg-add --host <host> <packages...>`);
        Deno.exit();
    }
    if (!args.host)
    {
        Console.error(`usage: ${command} pkg-add --host <host> <packages...>`);
        Deno.exit();
    }
    const importMap = JSON.parse(await Deno.readTextFile("import-map.json"));
    for (const arg of args._.slice(1) as string[])
    {
        const errorStr = `Package "${arg}" not found, may need to be added manually`;
        switch (args.host)
        {
            case "std":
                {
                    const url = `https://deno.land/std/${arg}/mod.ts`;
                    if ((await fetch(url)).ok)
                        importMap.imports[arg] = url;
                    else
                        Console.error(errorStr);
                    break;
                }
            case "deno.land":
                {
                    const url = `https://deno.land/x/${arg}/mod.ts`;
                    if ((await fetch(url)).ok)
                        importMap.imports[arg] = url;
                    else
                        Console.error(errorStr);
                    break;
                }
            case "cdn.skypack.dev":
                {
                    const url = `https://cdn.skypack.dev/${arg}?dts`;
                    if ((await fetch(url)).ok)
                        importMap.imports[arg] = url;
                    else
                        Console.error(errorStr);
                    break;
                }
            case "esm.sh":
                {
                    const url = `https://esm.sh/${arg}`;
                    if ((await fetch(url)).ok)
                        importMap.imports[arg] = url;
                    else
                        Console.error(errorStr);
                    break;
                }
        }
    }
    await Deno.writeTextFile("import-map.json", JSON.stringify(importMap, undefined, 4));
    Deno.exit();
}
export async function pkgRemove(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} pkg-remove <packages...>`);
        Deno.exit();
    }
    const importMap = JSON.parse(await Deno.readTextFile("import-map.json"));
    for (const arg of args._ as string[])
    {
        if (importMap.imports[arg])
            importMap.imports[arg] = undefined;
    }
    await Deno.writeTextFile("import-map.json", JSON.stringify(importMap, undefined, 4));
    Deno.exit();
}
export async function pkgUpdate(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} pkg-update [packages...]`);
        Deno.exit();
    }
    const importMap = JSON.parse(await Deno.readTextFile("import-map.json"));
    const keys = (args._.length > 1 ? args._ : Object.keys(importMap.imports)) as string[];
    for (const key of keys)
    {
        if (!importMap.imports[key])
            continue;
        try
        {
            const url = new URL(importMap.imports[key]);
            switch (url.host)
            {
                case "deno.land":
                    {
                        const at = url.pathname.indexOf("@");
                        if (at > 0)
                        {
                            const slash = url.pathname.indexOf("/", at);
                            url.pathname = `${url.pathname.slice(0, at)}${url.pathname.slice(slash, undefined)}`;
                        }
                        const response = await fetch(url);
                        if (response.headers.has("location"))
                            url.pathname = response.headers.get("location") as string;
                        else
                            url.pathname = (new URL(response.url)).pathname;
                        importMap.imports[key] = url.href;
                        break;
                    }
                default:
                    break;
            }
        }
        catch { undefined; }
    }
    await Deno.writeTextFile("import-map.json", JSON.stringify(importMap, undefined, 4));
    Deno.exit();
}
export async function cache(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} cache [--reload] [--remote]`);
        Deno.exit();
    }

    if (args.remote)
    {
        const remoteCache = "https://dl.dropboxusercontent.com/s/g7sy2qc69xdj3db/.cache.zip";
        const response = await fetch(remoteCache);
        if (!response.body)
        {
            Console.error("Unable to fetch remote cache");
            Deno.exit();
        }
        const body = await response.arrayBuffer();
        const binary = new Uint8Array(body);
        await Deno.writeFile(".cache.zip", binary);

        const runOptions: Deno.RunOptions =
            { cmd: ["unzip", "-oq", ".cache"] };
        const process = Deno.run(runOptions);
        const status = await process.status();
        process.close();
        if (!status.success)
        {
            Console.error("Failed to unzip cache");
            if (await std.fs.exists(".cache.zip"))
                await Deno.remove(".cache.zip");
            Deno.exit(status.code);
        }
        if (await std.fs.exists(".cache.zip"))
            await Deno.remove(".cache.zip");
    }

    const importMap = JSON.parse(await Deno.readTextFile("import-map.json"));
    const packages: string[] = Object.values(importMap.imports);

    const flags = args.reload ? ["--reload"] : [];
    switch (typeof args.reload)
    {
        case "string":
            {
                const reloadNames = args.reload.split(",");
                const map = function (value: string) 
                {
                    try { return (new URL(value)).href; }
                    catch { return importMap.imports[value]; }
                };
                const urlReloads = reloadNames.map(map);
                const filteredReloads = urlReloads.filter(function (value: unknown) { return value !== undefined; });
                const reloads = filteredReloads.join(",");
                if (!filteredReloads.length)
                    flags.pop();
                else
                    flags[0] += "=" + reloads;
                break;
            }
        default:
            break;
    }
    const denoRunOptions: Deno.RunOptions =
    {
        cmd: ["deno", "cache", "--unstable", ...flags, "--import-map", "import-map.json", ...packages],
        env: { DENO_DIR: ".cache/" }
    };
    const yarnRunOptions: Deno.RunOptions = { cmd: ["yarn", "install"] };

    const denoProcess = Deno.run(denoRunOptions);
    const yarnProcess = Deno.run(yarnRunOptions);

    const [denoStatus, yarnStatus] =
        await Promise.all([denoProcess.status(), yarnProcess.status()]);
    denoProcess.close();
    yarnProcess.close();

    if (!denoStatus.success)
        Deno.exit(denoStatus.code);
    if (!yarnStatus.success)
        Deno.exit(yarnStatus.code);
    Deno.exit();
}
export function bundle(_args: Arguments)
{
    Console.log(`commands:`);
    Console.print(`  bundle:relay\t${std.colors.italic(std.colors.black("(runs Relay compiler)"))}`);
    Console.print(`  bundle:snowpack\t${std.colors.italic(std.colors.black("(runs Snowpack build)"))}`);
    Deno.exit();
}
export async function bundleRelay(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} bundle:relay`);
        Deno.exit();
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
        cmd: ["yarn", "run", "relay-compiler", ...options],
    };
    const relayProcess = Deno.run(relayRunOptions);
    const relayStatus = await relayProcess.status();
    relayProcess.close();
    Deno.exit(relayStatus.code);
}
export async function bundleSnowpack(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} bundle:snowpack --url <endpoint> [--watch]`);
        Deno.exit();
    }
    if (!args.url)
    {
        Console.error(`usage: ${command} bundle:snowpack --url <endpoint> [--watch]`);
        Deno.exit();
    }
    const snowpackRunOptions: Deno.RunOptions =
    {
        cmd:
            [
                "yarn", "run", "snowpack", "--config",
                "config/snowpack.config.js", "build"
            ],
        env:
        {
            SNOWPACK_PUBLIC_GRAPHQL_ENDPOINT: new URL("/graphql", args.url).href,
            SNOWPACK_PUBLIC_REFRESH_ENDPOINT: new URL("/jwt/refresh", args.url).href
        }
    };
    if (!args.watch)
    {
        const snowpackProcess = Deno.run(snowpackRunOptions);
        await snowpackProcess.status();
        snowpackProcess.close();
        Deno.exit();
    }
    const watcher = Deno.watchFs(["components", "client"], { recursive: true });
    let lastPaths: Set<string> = new Set();
    let newPath: boolean = false as const;
    const resetLastPaths = async function ()
    {
        await std.async.delay(5000);
        lastPaths = new Set();
    };
    for await (const change of watcher)
    {
        switch (change.kind)
        {
            case "access":
                break;
            default:
                {
                    for (const path of change.paths)
                        if (!lastPaths.has(path))
                            newPath = true;
                    lastPaths = new Set(change.paths);

                    if (newPath)
                    {
                        const snowpackProcess = Deno.run(snowpackRunOptions);
                        await snowpackProcess.status();
                        snowpackProcess.close();
                        newPath = false;
                        resetLastPaths();
                    }
                    break;
                }
        }

    }
    Deno.exit();
}
export async function codegen(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} codegen [--watch]`);
        Deno.exit();
    }
    const watchArgs = args.watch ? ["--watch"] : [];
    const runOptions: Deno.RunOptions =
    {
        cmd:
            [
                "yarn", "run", "graphql-codegen", "--config",
                "config/codegen.json", ...watchArgs
            ],
    };
    const process = Deno.run(runOptions);
    const status = await process.status();
    process.close();
    Deno.exit(status.code);
}
export function localhost(_args: Arguments)
{
    Console.log(`commands:`);
    Console.print(`  localhost:snowpack\t\t\t${std.colors.italic(std.colors.black("(runs Snowpack dev server)"))}`);
    Console.print(`  localhost:deno [--devtools]\t${std.colors.italic(std.colors.black("(runs Deno live server)"))}`);
    Deno.exit();
}
export async function localhostSnowpack(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} localhost:snowpack`);
        Deno.exit();
    }
    const runOptions: Deno.RunOptions =
    {
        cmd:
            [
                "yarn", "run", "snowpack", "--config",
                "config/snowpack.config.js", "dev", "--secure"
            ]
    };
    const process = Deno.run(runOptions);
    const status = await process.status();
    process.close();
    Deno.exit(status.code);
}
export async function localhostDeno(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} localhost:deno [--devtools]`);
        Deno.exit();
    }
    await bundleSnowpack({ _: [], url: "https://localhost:3443/" });

    const ready = async function (): Promise<void>
    {
        while (true)
        {
            try
            {
                await std.async.delay(750);
                const init = { headers: { "x-http-only": "" } };
                await fetch("http://localhost:3080/", init);
                return;
            }
            catch { undefined; }
        }
    };
    const onReady = async function () 
    {
        await opener.open("https://localhost:3443/");
        await bundleSnowpack({ _: [], url: "https://localhost:3443/", watch: true });
    };
    ready().then(onReady);

    const devtools = args.devtools ? ["--devtools"] : [];
    const promises = [];
    if (args.devtools)
    {
        const reactRunOptions: Deno.RunOptions =
            { cmd: ["yarn", "run", "react-devtools"], };
        const reactProcess = Deno.run(reactRunOptions);
        const reactStatus = reactProcess.status();
        promises.push(reactStatus);

        const relayRunOptions: Deno.RunOptions =
            { cmd: ["yarn", "run", "relay-devtools"], };
        const relayProcess = Deno.run(relayRunOptions);
        const relayStatus = relayProcess.status();
        promises.push(relayStatus);
    }
    const serverRunOptions: Deno.RunOptions =
    {
        cmd:
            [
                "deno", "run", "--unstable", "--watch", "--allow-all",
                "--import-map", "import-map.json", "server/daemon.tsx",
                "--hostname", "localhost", "--tls", "cert/localhost/",
                ...devtools
            ],
        env: { DENO_DIR: ".cache/" }
    };
    const serverProcess = Deno.run(serverRunOptions);
    const serverStatus = serverProcess.status();
    promises.push(serverStatus);
    await Promise.race(promises);
    Deno.exit();
}
export function deploy(_args: Arguments)
{
    Console.log(`commands:`);
    Console.print(`  deploy:server --domain <domain>\t${std.colors.italic(std.colors.black("(runs webserver)"))}`);
    Console.print(`  deploy:dgraph\t\t\t${std.colors.italic(std.colors.black("(runs DGraph Zero and Alpha node)"))}`);
    Deno.exit();
}
export async function deployServer(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} deploy:server --domain <domain>`);
        Deno.exit();
    }
    if (!args.domain)
    {
        Console.error(`usage: ${command} deploy:server --domain <domain>`);
        Deno.exit();
    }
    const serverRunOptions: Deno.RunOptions =
    {
        cmd:
            [
                "deno", "run", "--unstable", "--allow-all",
                "--import-map", "import-map.json",
                "server/daemon.tsx", "--hostname", "0.0.0.0",
                "--domain", args.domain
            ],
        env: { DENO_DIR: ".cache/" }
    };
    const serverProcess = Deno.run(serverRunOptions);
    const serverStatus = await serverProcess.status();
    serverProcess.close();
    Deno.exit(serverStatus.code);
}
export async function deployDgraph(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} deploy:dgraph`);
        Deno.exit();
    }
    const zero = async function (): Promise<void>
    {
        const zeroRunOptions: Deno.RunOptions = { cmd: ["dgraph", "zero"] };
        const zeroProcess = Deno.run(zeroRunOptions);
        await zeroProcess.status();
        zeroProcess.close();
    };
    const alpha = async function (): Promise<void>
    {
        const alphaRunOptions: Deno.RunOptions =
        {
            cmd:
                [
                    "dgraph", "alpha", "--cache", "size-mb=2048", "--limit",
                    "mutations=strict", "--zero", "localhost:5080",
                    "--security", "whitelist=0.0.0.0/0"
                ]
        };
        const alphaProcess = Deno.run(alphaRunOptions);
        await alphaProcess.status();
        alphaProcess.close();
    };

    await Promise.race([zero(), alpha()]);
    Deno.exit();
}
export async function test(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} test`);
        Deno.exit();
    }
    const runOptions: Deno.RunOptions =
    {
        cmd:
            [
                "deno", "test", "--unstable", "--allow-all",
                "--import-map", "import-map.json", "tests/"
            ],
        env: { DENO_DIR: ".cache/" }
    };
    const process = Deno.run(runOptions);
    const status = await process.status();
    process.close();
    Deno.exit(status.code);
}
export function docker(_args: Arguments)
{
    Console.log(`commands:`);
    Console.print(`  docker:prune\t\t\t\t\t${std.colors.italic(std.colors.black("(prunes unused resources)"))}`);
    Console.print(`  docker:image --target <target> --tag <tag>\t${std.colors.italic(std.colors.black("(builds Docker image)"))}`);
    Console.print(`  docker:container --tag <tag>\t\t\t${std.colors.italic(std.colors.black("(runs Docker container)"))}`);
    Deno.exit();
}
export async function dockerPrune(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} prune`);
        Deno.exit();
    }
    const containerProcess =
        Deno.run({ cmd: ["docker", "container", "prune", "--force"] });
    const containerStatus = await containerProcess.status();
    containerProcess.close();
    if (!containerStatus.success)
        Deno.exit(containerStatus.code);

    const imageProcess =
        Deno.run({ cmd: ["docker", "image", "prune", "--force"] });
    const imageStatus = await imageProcess.status();
    imageProcess.close();
    if (!imageStatus.success)
        Deno.exit(imageStatus.code);

    Deno.exit();
}
export async function dockerImage(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} image --target <value> --tag <name> [--prune]`);
        Deno.exit();
    }
    if (!args.target || !args.tag)
    {
        Console.error(`usage: ${command} image --target <value> --tag <name> [--prune]`);
        Deno.exit();
    }

    if (args.prune)
        await dockerPrune(args);

    const imageRunOptions: Deno.RunOptions =
        { cmd: ["docker", "build", "--target", args.target, "--tag", args.tag, "."] };
    const imageProcess = Deno.run(imageRunOptions);
    const imageStatus = await imageProcess.status();
    imageProcess.close();
    if (!imageStatus.success)
        Deno.exit(imageStatus.code);

    Deno.exit();
}
export async function dockerContainer(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} container --tag <name> [--prune]`);
        Deno.exit();
    }
    if (!args.tag)
    {
        Console.error(`usage: ${command} container --tag <name> [--prune]`);
        Deno.exit();
    }

    if (args.prune)
        await dockerPrune(args);

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
    const containerProcess = Deno.run(containerRunOptions);
    const containerStatus = await containerProcess.status();
    containerProcess.close();
    if (!containerStatus.success)
        Deno.exit(containerStatus.code);

    Deno.exit();
}
export async function sync(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} sync [--key <path>]`);
        Deno.exit();
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
    const process = Deno.run(runOptions);
    const status = await process.status();
    Deno.exit(status.code);
}
export function help(_: Arguments)
{
    Console.log(`usage: ${command} <command> [options]`);
    Console.log(`Try \`${command} <command> --help\` for more information`);
    Console.log(`commands:`);
    Console.print(`  clean\t\t${std.colors.italic(std.colors.black("(cleans temporary directories)"))}`);
    Console.print(`  install\t\t${std.colors.italic(std.colors.black("(installs Yarn)"))}`);
    Console.print(`  upgrade\t\t${std.colors.italic(std.colors.black("(upgrades Deno)"))}`);
    Console.print(`  pkg\t\t${std.colors.italic(std.colors.black("(manages packages)"))}`);
    Console.print(`  cache\t\t${std.colors.italic(std.colors.black("(caches packages)"))}`);
    Console.print(`  bundle\t\t${std.colors.italic(std.colors.black("(bundles JavaScript)"))}`);
    Console.print(`  codegen\t\t${std.colors.italic(std.colors.black("(generates GraphQL types)"))}`);
    Console.print(`  localhost\t\t${std.colors.italic(std.colors.black("(runs server on localhost)"))}`);
    Console.print(`  deploy\t\t${std.colors.italic(std.colors.black("(runs live deployment)"))}`);
    Console.print(`  test\t\t${std.colors.italic(std.colors.black("(runs automated tests)"))}`);
    Console.print(`  docker\t\t${std.colors.italic(std.colors.black("(manages Docker)"))}`);
    Console.print(`  sync\t\t${std.colors.italic(std.colors.black("(sync files to server)"))}`);
    Console.print(`  help\t\t${std.colors.italic(std.colors.black("(prints help)"))}`);
    Deno.exit();
}

if (import.meta.main)
{
    yargs.default(args)
        .help(false)
        .command("*", "", {}, all)
        .command("version", "", {}, function (_args: Arguments)
        {
            Console.log(`${std.colors.bold("https")}${std.colors.reset("aurus")} ${version.string()}`);
            Deno.exit();
        })
        .command("clean", "", {}, clean)
        .command("install", "", {}, install)
        .command("upgrade", "", {}, upgrade)
        .command("pkg", "", {}, pkg)
        .command("pkg:help", "", {}, pkg)
        .command("pkg:add", "", {}, pkgAdd)
        .command("pkg:remove", "", {}, pkgRemove)
        .command("pkg:update", "", {}, pkgUpdate)
        .command("cache", "", {}, cache)
        .command("bundle", "", {}, bundle)
        .command("bundle:relay", "", {}, bundleRelay)
        .command("bundle:snowpack", "", {}, bundleSnowpack)
        .command("codegen", "", {}, codegen)
        .command("localhost", "", {}, localhost)
        .command("localhost:help", "", {}, localhost)
        .command("localhost:snowpack", "", {}, localhostSnowpack)
        .command("localhost:deno", "", {}, localhostDeno)
        .command("deploy", "", {}, deploy)
        .command("deploy:help", "", {}, deploy)
        .command("deploy:server", "", {}, deployServer)
        .command("deploy:dgraph", "", {}, deployDgraph)
        .command("test", "", {}, test)
        .command("docker", "", {}, docker)
        .command("docker:help", "", {}, docker)
        .command("docker:prune", "", {}, dockerPrune)
        .command("docker:image", "", {}, dockerImage)
        .command("docker:container", "", {}, dockerContainer)
        .command("sync", "", {}, sync)
        .command("help", "", {}, help)
        .parse();
}
