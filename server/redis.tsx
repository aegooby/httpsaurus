
import { std, redis } from "../deps.ts";

import { Console } from "./console.tsx";

interface RedisModuleAttributes
{
    redisMain: redis.Redis;
}

abstract class RedisModule
{
    protected redisMain: redis.Redis = {} as redis.Redis;
    constructor(attributes: RedisModuleAttributes)
    {
        this.redisMain = attributes.redisMain;
    }
    async sendCommand(command: string, args: redis.RedisValue[])
    {
        return (await this.redisMain.executor.exec(command, ...args)).value();
    }
    handleResponse(response: unknown): unknown
    {
        const obj: Record<string, unknown> = {};
        if (typeof response === "string" || typeof response === "number" ||
            (Array.isArray(response) && response.length % 2 === 1 && response.length > 1 && !this.isOnlyTwoDimensionalArray(response)) ||
            (Array.isArray(response) && response.length === 0)
        ) return response;
        else if (Array.isArray(response) && response.length === 1)
            return this.handleResponse(response[0]);
        else if (Array.isArray(response) && response.length > 1 && this.isOnlyTwoDimensionalArray(response))
            return this.handleResponse(this.reduceArrayDimension(response));
        //If is an array/obj we will build it
        const array = response as unknown[];
        for (let i = 0; i < array.length; i += 2)
        {
            if (array[i + 1] && array[i + 1] !== "")
            {
                if (Array.isArray(array[i + 1]) && this.isOnlyTwoDimensionalArray(array[i + 1] as unknown[]))
                {
                    obj[array[i] as string] = this.reduceArrayDimension(array[i + 1] as unknown[][]);
                    continue;
                }
                const value = (Array.isArray(array[i + 1]) ? this.handleResponse(array[i + 1]) : array[i + 1]);
                obj[array[i] as string] = value;
            }
        }
        return obj;
    }

    private isOnlyTwoDimensionalArray(array: unknown[]): boolean
    {
        return array.filter(item => Array.isArray(item)).length === array.length;
    }

    private reduceArrayDimension(array: unknown[][]): unknown[]
    {
        let newArray: unknown[] = [];
        array.forEach(function (singleArr) { newArray = newArray.concat(singleArr); });
        return newArray;
    }
}

export interface JSONGetParameters
{
    [index: string]: string | boolean | undefined,
    indent?: string;
    newline?: string;
    space?: string;
    noescape?: boolean;
}
class RedisJSON extends RedisModule
{
    private constructor(attributes: RedisModuleAttributes)
    {
        super(attributes);
    }
    public static async create(attributes: RedisModuleAttributes): Promise<RedisJSON>
    {
        const instance = new RedisJSON(attributes);
        return await Promise.resolve(instance);
    }

    async del(key: string, path?: string): Promise<number>
    {
        const parameters = [key];
        if (path) parameters.push(path);
        return await this.sendCommand("JSON.DEL", parameters) as number;
    }

    async set(key: string, path: string, json: string, condition?: "NX" | "XX"): Promise<"OK">
    {
        const args = [key, path, json];
        if (condition) args.push(condition);
        return await this.sendCommand("JSON.SET", args) as "OK";
    }

    async get(key: string, path?: string, parameters?: JSONGetParameters): Promise<string>
    {
        const args = [key];
        for (const parameter in parameters)
        {
            const name = parameter.toUpperCase();
            const value = parameters[parameter];

            if (!value) continue;

            args.push(name);
            switch (typeof value)
            {
                case "boolean":
                    break;
                default:
                    args.push(value);
                    break;
            }
        }
        if (path) args.push(path);
        return await this.sendCommand("JSON.GET", args) as string;
    }

    async mget(keys: string[], path?: string): Promise<string[]>
    {
        const args = keys;
        if (path) args.push(path);
        return await this.sendCommand("JSON.MGET", args) as string[];
    }

    async type(key: string, path?: string): Promise<string>
    {
        const args = [key];
        if (path) args.push(path);
        return await this.sendCommand("JSON.TYPE", args) as string;
    }

    async numincrby(key: string, number: number, path?: string): Promise<string>
    {
        const args = [key];
        if (path) args.push(path);
        args.push(number.toString());
        return await this.sendCommand("JSON.NUMINCRBY", args) as string;
    }

    async nummultby(key: string, number: number, path?: string): Promise<string>
    {
        const args = [key];
        if (path) args.push(path);
        args.push(number.toString());
        return await this.sendCommand("JSON.NUMMULTBY", args) as string;
    }

    async strappend(key: string, string: string, path?: string): Promise<string>
    {
        const args = [key];
        if (path) args.push(path);
        return await this.sendCommand("JSON.STRAPPEND", args.concat(string)) as string;
    }

    async strlen(key: string, path?: string): Promise<number | null>
    {
        const args = [key];
        if (path) args.push(path);
        return await this.sendCommand("JSON.STRLEN", args) as number | null;
    }

    async arrappend(key: string, items: string[], path?: string): Promise<number>
    {
        const args = [key];
        if (path) args.push(path);
        return await this.sendCommand("JSON.ARRAPPEND", args.concat(items)) as number;
    }

    async arrindex(key: string, scalar: string, path?: string): Promise<number>
    {
        const args = [key];
        if (path) args.push(path);
        args.push(scalar);
        return await this.sendCommand("JSON.ARRINDEX", args) as number;
    }

    async arrinsert(key: string, index: number, json: string, path?: string): Promise<number>
    {
        const args = [key];
        if (path) args.push(path);
        args.push(index.toString());
        args.push(json);
        return await this.sendCommand("JSON.ARRINSERT", args) as number;
    }

    async arrlen(key: string, path?: string): Promise<number>
    {
        const args = [key];
        if (path) args.push(path);
        return await this.sendCommand("JSON.ARRLEN", args) as number;
    }

    async arrpop(key: string, index: number, path?: string): Promise<string>
    {
        const args = [key];
        if (path) args.push(path);
        args.push(index.toString());
        return await this.sendCommand("JSON.ARRPOP", args) as string;
    }

    async arrtrim(key: string, start: number, end: number, path?: string): Promise<string>
    {
        const args = [key];
        if (path) args.push(path);
        args.push(start.toString());
        args.push(end.toString());
        return await this.sendCommand("JSON.ARRTRIM", args) as string;
    }

    async objkeys(key: string, path?: string): Promise<string[]>
    {
        const args = [key];
        if (path) args.push(path);
        return await this.sendCommand("JSON.OBJKEYS", args) as string[];
    }

    async objlen(key: string, path?: string): Promise<number>
    {
        const args = [key];
        if (path) args.push(path);
        return await this.sendCommand("JSON.OBJLEN", args) as number;
    }

    async debug(subcommand: "MEMORY" | "HELP", key?: string, path?: string): Promise<string[] | number>
    {
        const args: string[] = [subcommand];
        if (subcommand === "MEMORY")
        {
            if (key) args.push(key);
            if (path) args.push(path);
        }
        return await this.sendCommand("JSON.DEBUG", args) as string[] | number;
    }

    async forget(key: string, path?: string): Promise<number>
    {
        const parameters = [key];
        if (path) parameters.push(path);
        return await this.sendCommand("JSON.FORGET", parameters) as number;
    }

    async resp(key: string, path?: string): Promise<string[]>
    {
        const parameters = [key];
        if (path) parameters.push(path);
        return await this.sendCommand("JSON.RESP", parameters) as string[];
    }
}

export interface FTCreateParameters 
{
    filter?: string;
    payloadField?: string;
    maxTextFields?: number;
    noOffsets?: string;
    temporary?: number;
    nohl?: string;
    noFields?: string;
    noFreqs?: string;
    skipInitialScan?: boolean;
    prefix?:
    {
        count: number;
        name: string;
    }[];
    language?: string;
    languageField?: string;
    score?: string;
    scoreField?: string;
    stopwords?:
    {
        num: number;
        stopword: string;
    };
}

export interface FTFieldOptions 
{
    sortable?: boolean;
    noindex?: boolean;
    nostem?: boolean;
    phonetic?: string;
    weight?: number;
    seperator?: string;
}

export interface FTSchemaField extends FTFieldOptions
{
    name: string;
    type: FTFieldType;
    as?: string;
}

export interface FTSearchParameters 
{
    noContent?: boolean;
    verbatim?: boolean;
    noStopWords?: boolean;
    withScores?: boolean;
    withPayloads?: boolean;
    withSortKeys?: boolean;
    filter?:
    {
        field: string;
        min: number;
        max: number;
    };
    geoFilter?:
    {
        field: string;
        lon: number;
        lat: number;
        radius: number;
        measurement: "m" | "km" | "mi" | "ft";
    };
    inKeys?:
    {
        num: number;
        field: string;
    };
    inFields?:
    {
        num: number;
        field: string;
    };
    return?:
    {
        num: number;
        fields?:
        {
            name: string;
            as?: string;
        }[];
    };
    summarize?:
    {
        fields?:
        {
            num: number;
            field: string;
        }[];
        frags?: number;
        len?: number;
        seperator?: string;
    };
    highlight?:
    {
        fields?:
        {
            num: number;
            field: string;
        }[];
        tags?:
        {
            open: string;
            close: string;
        }[];
    };
    slop?: number;
    inOrder?: boolean;
    language?: string;
    expander?: string;
    scorer?: string;
    explainScore?: boolean;
    payload?: string;
    sortBy?:
    {
        field: string;
        sort: FTSort;
    };
    limit?:
    {
        first: number;
        num: number;
    };
}

export interface FTAggregateParameters 
{
    load?:
    {
        nargs: string;
        properties: string[];
    };
    apply?: FTExpression[];
    groupby?:
    {
        nargs: string;
        properties: string[];
    };
    reduce?: FTReduce[],
    sortby?: {
        nargs: string,
        properties: FTSortByProperty[],
        max: number;
    },
    expressions?: FTExpression[],
    limit?: {
        offset: string,
        numberOfResults: number;
    },
    filter?: string;
}

export interface FTExpression 
{
    expression: string;
    as: string;
}

export interface FTReduce 
{
    function: string;
    nargs: string;
    args: string[];
    as?: string;
}

export interface FTSortByProperty 
{
    property: string;
    sort: FTSort;
}

export type FTSort = "ASC" | "DESC";

export interface FTSugAddParameters 
{
    incr: number;
    payload: string;
}

export interface FTSugGetParameters 
{
    fuzzy: string;
    max: number;
    withScores: boolean;
    withPayloads: boolean;
}

export interface FTSpellCheck 
{
    terms?:
    {
        type: "INCLUDE" | "EXCLUDE";
        dict?: string;
    }[];
    distance?: string;
}

export type FTFieldType = "TEXT" | "NUMERIC" | "TAG" | string;

export type FTIndexType = "HASH" | "JSON";

export interface FTConfig  
{
    EXTLOAD?: string | null;
    SAFEMODE?: string;
    CONCURRENT_WRITE_MODE?: string;
    NOGC?: string;
    MINPREFIX?: string;
    FORKGC_SLEEP_BEFORE_EXIT?: string;
    MAXDOCTABLESIZE?: string;
    MAXSEARCHRESULTS?: string;
    MAXAGGREGATERESULTS?: string;
    MAXEXPANSIONS?: string;
    MAXPREFIXEXPANSIONS?: string;
    TIMEOUT?: string;
    INDEX_THREADS?: string;
    SEARCH_THREADS?: string;
    FRISOINI?: string | null;
    ON_TIMEOUT?: string;
    GCSCANSIZE?: string;
    MIN_PHONETIC_TERM_LEN?: string;
    GC_POLICY?: string;
    FORK_GC_RUN_INTERVAL?: string;
    FORK_GC_CLEAN_THRESHOLD?: string;
    FORK_GC_RETRY_INTERVAL?: string;
    _MAX_RESULTS_TO_UNSORTED_MODE?: string;
    CURSOR_MAX_IDLE?: string;
    NO_MEM_POOLS?: string;
    PARTIAL_INDEXED_DOCS?: string;
    UPGRADE_INDEX?: string;
}

export interface FTInfo 
{
    "index_name"?: string;
    "index_options"?: string[];
    "index_definition"?:
    {
        "key_type"?: string;
        "prefixes"?: string;
        "language_field"?: string;
        "default_score"?: string;
        "score_field"?: string;
        "payload_field"?: string;
    };
    "fields"?: string[];
    "num_docs"?: string;
    "max_doc_id"?: string;
    "num_terms"?: string;
    "num_records"?: string;
    "inverted_sz_mb"?: string;
    "total_inverted_index_blocks"?: string;
    "offset_vectors_sz_mb"?: string;
    "doc_table_size_mb"?: string;
    "sortable_values_size_mb"?: string;
    "key_table_size_mb"?: string;
    "records_per_doc_avg"?: string;
    "bytes_per_record_avg"?: string;
    "offsets_per_term_avg"?: string;
    "offset_bits_per_record_avg"?: string;
    "hash_indexing_failures"?: string;
    "indexing"?: string;
    "percent_indexed"?: string;
    "gc_stats"?:
    {
        "bytes_collected"?: string;
        "total_ms_run"?: string;
        "total_cycles"?: string;
        "average_cycle_time_ms"?: string;
        "last_run_time_ms"?: string;
        "gc_numeric_trees_missed"?: string;
        "gc_blocks_denied"?: string;
    };
    "cursor_stats"?:
    {
        "global_idle"?: number;
        "global_total"?: number;
        "index_capacity"?: number;
        "index_total"?: number;
    };
}

class RedisSearch extends RedisModule
{
    private constructor(attributes: RedisModuleAttributes)
    {
        super(attributes);
    }
    public static async create(attributes: RedisModuleAttributes): Promise<RedisSearch>
    {
        const instance = new RedisSearch(attributes);
        return await Promise.resolve(instance);
    }

    async create(index: string, indexType: FTIndexType, schemaFields: FTSchemaField[], parameters?: FTCreateParameters): Promise<"OK" | string>
    {
        let args: string[] = [index, "ON", indexType];
        if (parameters)
        {
            if (parameters.prefix)
            {
                args.push("PREFIX");
                for (const prefix of parameters.prefix)
                    args = args.concat([prefix.count.toString(), prefix.name]);
            }
            if (parameters.filter)
                args = args.concat(["FILTER", parameters.filter]);
            if (parameters.language)
                args = args.concat(["LANGUAGE", parameters.language]);
            if (parameters.languageField)
                args = args.concat(["LANGUAGE_FIELD", parameters.languageField]);
            if (parameters.score)
                args = args.concat(["SCORE", parameters.score]);
            if (parameters.scoreField)
                args = args.concat(["SCORE_FIELD", parameters.scoreField]);
            if (parameters.payloadField)
                args = args.concat(["PAYLOAD_FIELD", parameters.payloadField]);
            if (parameters.maxTextFields)
                args = args.concat(["MAXTEXTFIELDS", parameters.maxTextFields.toString()]);
            if (parameters.noOffsets)
                args.push("NOOFFSETS");
            if (parameters.temporary)
                args.push("TEMPORARY");
            if (parameters.nohl)
                args.push("NOHL");
            if (parameters.noFields)
                args.push("NOFIELDS");
            if (parameters.noFreqs)
                args.push("NOFREQS");
            if (parameters.stopwords)
                args = args.concat(["STOPWORDS", parameters.stopwords.num.toString(), parameters.stopwords.stopword]);
            if (parameters.skipInitialScan)
                args.push("SKIPINITIALSCAN");
        }
        args.push("SCHEMA");
        for (const field of schemaFields)
        {
            args.push(field.name);
            if (field.as)
                args = args.concat(["AS", field.as]);
            args.push(field.type);
            if (field.nostem) args.push("NOSTEM");
            if (field.weight) args = args.concat(["WEIGHT", field.weight.toString()]);
            if (field.phonetic) args = args.concat(["PHONETIC", field.phonetic]);
            if (field.seperator) args = args.concat(["SEPERATOR", field.seperator]);
            if (field.sortable) args.push("SORTABLE");
            if (field.noindex) args.push("NOINDEX");
        }
        const response = await this.sendCommand("FT.CREATE", args);
        return this.handleResponse(response) as string;
    }

    async search(index: string, query: string, parameters?: FTSearchParameters): Promise<[number, ...Array<string | string[]>] | number>
    {
        let args: string[] = [index, query];
        if (parameters)
        {
            if (parameters.noContent === true)
                args.push("NOCONTENT");
            if (parameters.verbatim === true)
                args.push("VERBARIM");
            if (parameters.noStopWords === true)
                args.push("NOSTOPWORDS");
            if (parameters.withScores === true)
                args.push("WITHSCORES");
            if (parameters.withPayloads === true)
                args.push("WITHPAYLOADS");
            if (parameters.withSortKeys === true)
                args.push("WITHSORTKEYS");
            if (parameters.filter)
                args = args.concat(["FILTER", parameters.filter.field, parameters.filter.min.toString(), parameters.filter.max.toString()]);
            if (parameters.geoFilter)
                args = args.concat([
                    "GEOFILTER",
                    parameters.geoFilter.field,
                    parameters.geoFilter.lon.toString(),
                    parameters.geoFilter.lat.toString(),
                    parameters.geoFilter.radius.toString(),
                    parameters.geoFilter.measurement
                ]);
            if (parameters.inKeys)
                args = args.concat(["INKEYS", parameters.inKeys.num.toString(), parameters.inKeys.field]);
            if (parameters.inFields)
                args = args.concat(["INFIELDS", parameters.inFields.num.toString(), parameters.inFields.field]);
            if (parameters.return)
            {
                args.push("RETURN");
                if (parameters.return.num)
                    args.push(parameters.return.num.toString());
                if (parameters.return.fields)
                    parameters.return.fields.forEach(field =>
                    {
                        args.push(field.name);
                        if (field.as)
                            args = args.concat(["AS", field.as]);
                    });
            }
            if (parameters.summarize)
            {
                args.push("SUMMARIZE");
                if (parameters.summarize.fields)
                {
                    args.push("FIELDS");
                    for (const field of parameters.summarize.fields)
                    {
                        args = args.concat([field.num.toString(), field.field]);
                    }
                }
                if (parameters.summarize.frags)
                    args = args.concat(["FRAGS", parameters.summarize.frags.toString()]);
                if (parameters.summarize.len)
                    args = args.concat(["LEN", parameters.summarize.len.toString()]);
                if (parameters.summarize.seperator)
                    args = args.concat(["SEPARATOR", parameters.summarize.seperator]);
            }
            if (parameters.highlight)
            {
                args.push("HIGHLIGHT");
                if (parameters.highlight.fields)
                {
                    args.push("FIELDS");
                    for (const field of parameters.highlight.fields)
                    {
                        args = args.concat([field.num.toString(), field.field]);
                    }
                }
                if (parameters.highlight.tags)
                {
                    args.push("TAGS");
                    for (const tag of parameters.highlight.tags)
                    {
                        args = args.concat([tag.open, tag.close]);
                    }
                }
            }
            if (parameters.slop)
                args = args.concat(["SLOP", parameters.slop.toString()]);
            if (parameters.inOrder)
                args.push("INORDER");
            if (parameters.language)
                args = args.concat(["LANGUAGE", parameters.language]);
            if (parameters.expander)
                args = args.concat(["EXPANDER", parameters.expander]);
            if (parameters.scorer)
                args = args.concat(["SCORER", parameters.scorer]);
            if (parameters.explainScore)
                args.push("EXPLAINSCORE");
            if (parameters.payload)
                args = args.concat(["PAYLOAD", parameters.payload]);
            if (parameters.sortBy)
                args = args.concat(["SORTBY", parameters.sortBy.field, parameters.sortBy.sort]);
            if (parameters.limit)
                args = args.concat(["LIMIT", parameters.limit.first.toString(), parameters.limit.num.toString()]);
        }
        const response = await this.sendCommand("FT.SEARCH", args);
        return this.handleResponse(response) as [number, ...Array<string | string[]>] | number;
    }

    async aggregate(index: string, query: string, parameters?: FTAggregateParameters): Promise<[number, ...Array<string[]>]>
    {
        let args: string[] = [index, query];
        if (parameters)
        {
            if (parameters.load)
            {
                args.push("LOAD");
                if (parameters.load.nargs)
                    args.push(parameters.load.nargs);
                if (parameters.load.properties)
                    parameters.load.properties.forEach(property =>
                    {
                        args.push(property);
                    });
            }
            if (parameters.apply)
            {
                parameters.apply.forEach(apply =>
                {
                    args.push("APPLY");
                    args.push(apply.expression);
                    if (apply.as)
                        args = args.concat(["AS", apply.as]);
                });
            }
            if (parameters.groupby)
            {
                args.push("GROUPBY");
                if (parameters.groupby.nargs)
                    args.push(parameters.groupby.nargs);
                if (parameters.groupby.properties)
                {
                    parameters.groupby.properties.forEach((property) =>
                    {
                        args.push(property);
                    });
                }
            }
            if (parameters.reduce)
            {
                parameters.reduce.forEach(reduce =>
                {
                    args.push("REDUCE");
                    if (reduce.function)
                        args.push(reduce.function);
                    if (reduce.nargs)
                        args.push(reduce.nargs);
                    if (reduce.args)
                        reduce.args.forEach(arg =>
                        {
                            args.push(arg);
                        });
                    if (reduce.as)
                        args = args.concat(["AS", reduce.as]);
                });
            }
            if (parameters.sortby)
            {
                args.push("SORTBY");
                if (parameters.sortby.nargs)
                    args.push(parameters.sortby.nargs);
                if (parameters.sortby.properties)
                    parameters.sortby.properties.forEach(property =>
                    {
                        args.push(property.property);
                        args.push(property.sort);
                    });
                if (parameters.sortby.max)
                    args = args.concat(["MAX", parameters.sortby.max.toString()]);
            }
            if (parameters.expressions)
            {
                parameters.expressions.forEach(expression =>
                {
                    args.push("APPLY");
                    args.push(expression.expression);
                    if (expression.as)
                        args = args.concat(["AS", expression.as]);
                });
            }
            if (parameters.limit)
            {
                args.push("LIMIT");
                if (parameters.limit.offset)
                    args.push(parameters.limit.offset);
                if (parameters.limit.numberOfResults)
                    args.push(parameters.limit.numberOfResults.toString());
            }
        }
        const response = await this.sendCommand("FT.AGGREGATE", args);
        return this.handleResponse(response) as [number, ...string[][]];
    }

    async explain(index: string, query: string): Promise<string>
    {
        const response = await this.sendCommand("FT.EXPLAIN", [index, query]);
        return this.handleResponse(response) as string;
    }

    async explainCLI(index: string, query: string): Promise<string[]>
    {
        const response = await this.sendCommand("FT.EXPLAINCLI", [index, query]) as string[][];
        return this.handleResponse(response.join("")) as string[];
    }

    async alter(index: string, field: string, fieldType: FTFieldType, options?: FTFieldOptions): Promise<"OK" | string>
    {
        let args = [index, "SCHEMA", "ADD", field, fieldType];
        if (options)
        {
            if (options.sortable) args.push("SORTABLE");
            if (options.noindex) args.push("NOINDEX");
            if (options.nostem) args.push("NOSTEM");
            if (options.phonetic) args = args.concat(["PHONETIC", options.phonetic]);
            if (options.seperator) args = args.concat(["SEPERATOR", options.seperator]);
            if (options.weight) args = args.concat(["WEIGHT", options.weight.toString()]);
        }
        const response = await this.sendCommand("FT.ALTER", args);
        return this.handleResponse(response) as "OK" | string;
    }

    async dropindex(index: string, deleteHash = false): Promise<"OK" | string>
    {
        const args = [index];
        if (deleteHash === true) args.push("DD");
        const response = await this.sendCommand("FT.DROPINDEX", args);
        return this.handleResponse(response) as "OK" | string;
    }

    async aliasadd(name: string, index: string): Promise<"OK" | string>
    {
        const response = await this.sendCommand("FT.ALIASADD", [name, index]);
        return this.handleResponse(response) as "OK" | string;
    }

    async aliasupdate(name: string, index: string): Promise<"OK" | string>
    {
        const response = await this.sendCommand("FT.ALIASUPDATE", [name, index]);
        return this.handleResponse(response) as "OK" | string;
    }

    async aliasdel(name: string): Promise<"OK" | string>
    {
        const response = await this.sendCommand("FT.ALIASDEL", [name]);
        return this.handleResponse(response) as "OK" | string;
    }

    async tagvals(index: string, field: string): Promise<string[]>
    {
        const response = await this.sendCommand("FT.TAGVALS", [index, field]);
        return this.handleResponse(response) as string[];
    }

    async sugadd(key: string, suggestion: string, score: number, options?: FTSugAddParameters): Promise<number>
    {
        let args = [key, suggestion, score];
        if (options && options.incr)
            args.push("INCR");
        if (options && options.payload)
            args = args.concat(["PAYLOAD", options.payload]);
        const response = await this.sendCommand("FT.SUGADD", args);
        return this.handleResponse(response) as number;
    }

    async sugget(key: string, prefix: string, options?: FTSugGetParameters): Promise<string>
    {
        let args = [key, prefix];
        if (options && options.fuzzy)
            args.push("FUZZY");
        if (options && options.max)
            args = args.concat(["MAX", options.max.toString()]);
        if (options && options.withScores)
            args.push("WITHSCORES");
        if (options && options.withPayloads)
            args.push("WITHPAYLOADS");
        const response = await this.sendCommand("FT.SUGGET", args);
        return this.handleResponse(response) as string;
    }

    async sugdel(key: string, suggestion: string): Promise<number>
    {
        const response = await this.sendCommand("FT.SUGDEL", [key, suggestion]);
        return this.handleResponse(response) as number;
    }

    async suglen(key: string): Promise<number>
    {
        const response = await this.sendCommand("FT.SUGLEN", [key]);
        return this.handleResponse(response) as number;
    }

    async synupdate(index: string, groupId: number, terms: string[], skipInitialScan = false): Promise<"OK">
    {
        const args = [index, groupId].concat(terms);
        if (skipInitialScan === true)
            args.push("SKIPINITIALSCAN");
        const response = await this.sendCommand("FT.SYNUPDATE", args);
        return this.handleResponse(response) as "OK";
    }

    async syndump(index: string): Promise<{ [key: string]: string | number; }>
    {
        const response = await this.sendCommand("FT.SYNDUMP", [index]);
        return this.handleResponse(response) as { [key: string]: string | number; };
    }

    async spellcheck(index: string, query: string, options?: FTSpellCheck): Promise<string[]>
    {
        let args = [index, query];
        if (options && options.distance)
            args = args.concat(["DISTANCE", options.distance]);
        if (options && options.terms)
        {
            args.push("TERMS");
            for (const term of options.terms)
                args = args.concat(term.dict ? [term.type, term.dict] : [term.type]);
        }
        const response = await this.sendCommand("FT.SPELLCHECK", args);
        return this.handleResponse(response) as string[];
    }

    async dictadd(dict: string, terms: string[]): Promise<number>
    {
        const response = await this.sendCommand("FT.DICTADD", [dict].concat(terms));
        return this.handleResponse(response) as number;
    }

    async dictdel(dict: string, terms: string[]): Promise<number>
    {
        const response = await this.sendCommand("FT.DICTDEL", [dict].concat(terms));
        return this.handleResponse(response) as number;
    }

    async dictdump(dict: string): Promise<string>
    {
        const response = await this.sendCommand("FT.DICTDUMP", [dict]);
        return this.handleResponse(response) as string;
    }

    async info(index: string): Promise<FTInfo>
    {
        const response = await this.sendCommand("FT.INFO", [index]);
        return this.handleResponse(response) as FTInfo;
    }

    async config(command: "GET" | "SET" | "HELP", option: string, value?: string): Promise<FTConfig>
    {
        const args = [command, option];
        if (command === "SET" && value) args.push(value);
        const response = await this.sendCommand("FT.CONFIG", args);
        return this.handleResponse(response) as FTConfig;
    }
}

export interface RedisAttributes
{
    url?: string;
    retries: number;
    failable?: boolean;
}

export class Redis
{
    public json: RedisJSON = {} as RedisJSON;
    public search: RedisSearch = {} as RedisSearch;
    public main: redis.Redis = {} as redis.Redis;

    private static default: string = "redis://localhost:6379/" as const;

    private constructor() { }
    public static async create(attributes: RedisAttributes): Promise<Redis>
    {
        if (!attributes.url && !Deno.env.get("REDIS_URL"))
            Console.warn("No URL provided, and REDIS_URL is not set, using default");
        const url = attributes.url ?? Deno.env.get("REDIS_URL") ?? Redis.default;
        const options: redis.RedisConnectOptions = redis.parseURL(url);
        const instance = new Redis();

        for (let i = 0; i < attributes.retries; ++i)
        {
            try 
            {
                instance.main = await redis.connect(options);
                if (instance.main.isConnected)
                    break;
            }
            catch (error: unknown)
            {
                if (!(error instanceof Deno.errors.ConnectionRefused))
                    throw new Error("Failed to connect to Redis");
            }
            await std.async.delay(500);
        }

        if (!instance.main.isConnected && !attributes.failable)
            throw new Error("Failed to connect to Redis");

        instance.json = await RedisJSON.create({ redisMain: instance.main });
        instance.search = await RedisSearch.create({ redisMain: instance.main });

        return instance;
    }
}