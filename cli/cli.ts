
import * as fs from "@std/fs";
import * as colors from "@std/colors";
import * as async from "@std/async";
import * as yargs from "@yargs/yargs";
import { Arguments } from "@yargs/types";
import * as opener from "opener";

import { Console, version } from "../server/server.tsx";
export { version } from "../server/server.tsx";

Deno.env.set("DENO_DIR", ".cache/");
const [args, command] = [Deno.args, "turtle"];

export function all(_: Arguments)
{
    Console.error(`usage: ${command} <command> [options]`);
    Console.log(`Try \`${command} <command> --help\` for more information`);
    Console.log(`commands:`);
    Console.print(`  clean\t\t${colors.italic(colors.black("(cleans temporary directories)"))}`);
    Console.print(`  install\t\t${colors.italic(colors.black("(installs Yarn)"))}`);
    Console.print(`  upgrade\t\t${colors.italic(colors.black("(upgrades Deno)"))}`);
    Console.print(`  pkg\t\t${colors.italic(colors.black("(manages packages)"))}`);
    Console.print(`  cache\t\t${colors.italic(colors.black("(caches packages)"))}`);
    Console.print(`  bundle\t\t${colors.italic(colors.black("(bundles JavaScript)"))}`);
    Console.print(`  codegen\t\t${colors.italic(colors.black("(generates GraphQL types)"))}`);
    Console.print(`  localhost\t\t${colors.italic(colors.black("(runs server on localhost)"))}`);
    Console.print(`  deploy\t\t${colors.italic(colors.black("(runs live deployment)"))}`);
    Console.print(`  test\t\t${colors.italic(colors.black("(runs automated tests)"))}`);
    Console.print(`  docker\t\t${colors.italic(colors.black("(manages Docker)"))}`);
    Console.print(`  sync\t\t${colors.italic(colors.black("(sync files to server)"))}`);
    Console.print(`  help\t\t${colors.italic(colors.black("(prints help)"))}`);
    return;
}
export async function clean(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} clean [--cache] [--dist] [--node]`);
        return;
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
        await Deno.remove(directory, { recursive: true });

    for (const directory of directories)
        await fs.ensureDir(directory);
}
export async function install(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} install`);
        return;
    }
    const npmProcess = Deno.run({ cmd: ["npm", "install", "--global", "yarn"] });
    const npmStatus = await npmProcess.status();
    npmProcess.close();
    return npmStatus.code;
}
export async function upgrade(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} upgrade`);
        return;
    }
    const process = Deno.run({ cmd: ["deno", "upgrade"] });
    const status = await process.status();
    process.close();
    return status.code;
}
export function pkg(_args: Arguments)
{
    Console.log(`commands:`);
    Console.print(`  pkg:add --host <host> <packages...>\t${colors.italic(colors.black("(adds new packages)"))}`);
    Console.print(`  pkg:remove <packages...>\t\t\t${colors.italic(colors.black("(removes existing packages)"))}`);
    Console.print(`  pkg:update [packages...]\t\t\t${colors.italic(colors.black("(updates pacakges)"))}`);
    return;
}
export async function pkgAdd(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} pkg-add --host <host> <packages...>`);
        return;
    }
    if (!args.host)
    {
        Console.error(`usage: ${command} pkg-add --host <host> <packages...>`);
        return;
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
}
export async function pkgRemove(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} pkg-remove <packages...>`);
        return;
    }
    const importMap = JSON.parse(await Deno.readTextFile("import-map.json"));
    for (const arg of args._ as string[])
    {
        if (importMap.imports[arg])
            importMap.imports[arg] = undefined;
    }
    await Deno.writeTextFile("import-map.json", JSON.stringify(importMap, undefined, 4));
}
export async function pkgUpdate(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} pkg-update [packages...]`);
        return;
    }
    const importMap = JSON.parse(await Deno.readTextFile("import-map.json"));
    const keys = (args._.length ? args._ : Object.keys(importMap.imports)) as string[];
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
}
export async function cache(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} cache [--reload] [--remote]`);
        return;
    }

    if (args.remote)
    {
        const remoteCache = "https://dl.dropboxusercontent.com/s/g7sy2qc69xdj3db/.cache.zip";
        const response = await fetch(remoteCache);
        if (!response.body)
        {
            Console.error("Unable to fetch remote cache");
            return;
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
            await Deno.remove(".cache.zip");
            return status.code;
        }
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
        return denoStatus.code;
    if (!yarnStatus.success)
        return yarnStatus.code;
}
export async function bundle(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} bundle --graphql <endpoint>`);
        return;
    }
    if (!args.graphql)
    {
        Console.error(`usage: ${command} bundle --graphql <endpoint>`);
        return;
    }
    const snowpackRunOptions: Deno.RunOptions =
    {
        cmd:
            [
                "yarn", "run", "snowpack", "--config",
                "config/snowpack.config.js", "build"
            ],
        env: { SNOWPACK_PUBLIC_GRAPHQL_ENDPOINT: args.graphql }
    };
    const snowpackProcess = Deno.run(snowpackRunOptions);
    const snowpackStatus = await snowpackProcess.status();
    snowpackProcess.close();
    if (!snowpackStatus.success)
        return snowpackStatus.code;
}
export async function codegen(args: Arguments)
{
    if (args.help)
    {
        Console.error(`usage: ${command} codegen [--watch]`);
        return;
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
    return status.code;
}
export function localhost(_args: Arguments)
{
    Console.log(`commands:`);
    Console.print(`  localhost:snowpack\t${colors.italic(colors.black("(runs Snowpack dev server)"))}`);
    Console.print(`  localhost:deno\t${colors.italic(colors.black("(runs Deno live server)"))}`);
    return;
}
export async function localhostSnowpack(_args: Arguments)
{
    const runOptions: Deno.RunOptions =
    {
        cmd:
            [
                "yarn", "run", "snowpack", "--config",
                "config/base.snowpack.js", "dev", "--secure"
            ]
    };
    const process = Deno.run(runOptions);
    await process.status();
    process.close();
    return;
}
export async function localhostDeno(_args: Arguments)
{
    await bundle({ _: [], graphql: "https://localhost:3443/graphql" });

    const ready = async function (): Promise<void>
    {
        while (true)
        {
            try
            {
                await async.delay(750);
                const init = { headers: { "x-http-only": "" } };
                await fetch("http://localhost:3080/", init);
                return;
            }
            catch { undefined; }
        }
    };
    ready().then(async function () { await opener.open("https://localhost:3443/"); });

    const serverRunOptions: Deno.RunOptions =
    {
        cmd:
            [
                "deno", "run", "--unstable", "--watch", "--allow-all",
                "--import-map", "import-map.json", "server/daemon.tsx",
                "--hostname", "localhost", "--tls", "cert/localhost/"
            ],
        env: { DENO_DIR: ".cache/" }
    };
    const serverProcess = Deno.run(serverRunOptions);
    const serverStatus = await serverProcess.status();
    serverProcess.close();
    return serverStatus.code;
}
export function deploy(_args: Arguments)
{
    Console.log(`commands:`);
    Console.print(`  deploy:server --domain <domain>\t${colors.italic(colors.black("(runs webserver)"))}`);
    Console.print(`  deploy:dgraph\t\t\t${colors.italic(colors.black("(runs DGraph Zero and Alpha node)"))}`);
    return;
}
export async function deployServer(args: Arguments)
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
        cmd:
            [
                "deno", "run", "--unstable", "--allow-all",
                "--import-map", "import-map.json",
                "server/daemon.tsx", "--hostname", "0.0.0.0",
                "--domain", args.domain, "--dgraph"
            ],
        env: { DENO_DIR: ".cache/" }
    };
    const serverProcess = Deno.run(serverRunOptions);
    try { await serverProcess.status(); }
    catch { undefined; }
    serverProcess.close();
}
export async function deployDgraph(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} deploy:dgraph`);
        return;
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
}
export async function test(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} test`);
        return;
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
    return status.code;
}
export function docker(_args: Arguments)
{
    Console.log(`commands:`);
    Console.print(`  docker:prune\t\t\t\t\t${colors.italic(colors.black("(prunes unused resources)"))}`);
    Console.print(`  docker:image --target <target> --tag <tag>\t${colors.italic(colors.black("(builds Docker image)"))}`);
    Console.print(`  docker:container --tag <tag>\t\t\t${colors.italic(colors.black("(runs Docker container)"))}`);
    return;
}
export async function dockerPrune(args: Arguments)
{
    if (args.help)
    {
        Console.log(`usage: ${command} prune`);
        return;
    }
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
}
export async function dockerImage(args: Arguments)
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

    if (args.prune)
        await dockerPrune(args);

    const imageRunOptions: Deno.RunOptions =
        { cmd: ["docker", "build", "--target", args.target, "--tag", args.tag, "."] };
    const imageProcess = Deno.run(imageRunOptions);
    const imageStatus = await imageProcess.status();
    imageProcess.close();
    if (!imageStatus.success)
        return imageStatus.code;
}
export async function dockerContainer(args: Arguments)
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
        return containerStatus.code;
}
export async function sync(args: Arguments)
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
    const process = Deno.run(runOptions);
    const status = await process.status();
    return status.code;
}
export function help(_: Arguments)
{
    Console.log(`usage: ${command} <command> [options]`);
    Console.log(`Try \`${command} <command> --help\` for more information`);
    Console.log(`commands:`);
    Console.print(`  clean\t\t${colors.italic(colors.black("(cleans temporary directories)"))}`);
    Console.print(`  install\t\t${colors.italic(colors.black("(installs Yarn)"))}`);
    Console.print(`  upgrade\t\t${colors.italic(colors.black("(upgrades Deno)"))}`);
    Console.print(`  pkg\t\t${colors.italic(colors.black("(manages packages)"))}`);
    Console.print(`  cache\t\t${colors.italic(colors.black("(caches packages)"))}`);
    Console.print(`  bundle\t\t${colors.italic(colors.black("(bundles JavaScript)"))}`);
    Console.print(`  codegen\t\t${colors.italic(colors.black("(generates GraphQL types)"))}`);
    Console.print(`  localhost\t\t${colors.italic(colors.black("(runs server on localhost)"))}`);
    Console.print(`  deploy\t\t${colors.italic(colors.black("(runs live deployment)"))}`);
    Console.print(`  test\t\t${colors.italic(colors.black("(runs automated tests)"))}`);
    Console.print(`  docker\t\t${colors.italic(colors.black("(manages Docker)"))}`);
    Console.print(`  sync\t\t${colors.italic(colors.black("(sync files to server)"))}`);
    Console.print(`  help\t\t${colors.italic(colors.black("(prints help)"))}`);
    return;
}

if (import.meta.main)
{
    yargs.default(args)
        .help(false)
        .command("*", "", {}, all)
        .command("version", "", {}, function (_: Arguments)
        {
            Console.log(`${colors.bold("https")}${colors.reset("aurus")} ${version.string()}`);
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
