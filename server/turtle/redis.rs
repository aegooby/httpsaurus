use std::fs::OpenOptions;

pub use redis::AsyncCommands;

struct FTCreateParametersPrefix {
    count: i32,
    name: String,
}
struct FTCreateParametersStopwords {
    num: i32,
    stopword: String,
}
pub struct FTCreateParameters {
    filter: Option<String>,
    payload_field: Option<String>,
    max_text_fields: Option<i32>,
    no_offsets: Option<String>,
    temporary: Option<i32>,
    nohl: Option<String>,
    no_fields: Option<String>,
    no_freqs: Option<String>,
    skip_initial_scan: Option<bool>,
    prefix: Option<Vec<FTCreateParametersPrefix>>,
    language: Option<String>,
    language_field: Option<String>,
    score: Option<String>,
    score_field: Option<String>,
    stopwords: Option<FTCreateParametersStopwords>,
}
struct FTFieldOptions {
    sortable: Option<bool>,
    noindex: Option<bool>,
    nostem: Option<bool>,
    phonetic: Option<String>,
    weight: Option<i32>,
    seperator: Option<String>,
}
struct FTSchemaField {
    sortable: Option<bool>,
    noindex: Option<bool>,
    nostem: Option<bool>,
    phonetic: Option<String>,
    weight: Option<i32>,
    seperator: Option<String>,
    name: String,
    field_type: String,
    field_as: String,
}

struct FTSearchParametersFilter {
    field: String,
    min: i32,
    max: i32,
}
struct FTSearchParametersGeoFilter {
    field: String,
    lon: i32,
    lat: i32,
    radius: i32,
    measurement: String,
}
struct FTSearchParametersInKeys {
    num: i32,
    field: String,
}
struct FTSearchParametersInFields {
    num: i32,
    field: String,
}
struct FTSearchParametersReturnParamFields {
    name: String,
    as_type: String,
}
struct FTSearchParametersReturnParam {
    num: i32,
    fields: Option<Vec<FTSearchParametersReturnParamFields>>,
}
struct FTSearchParametersSummarizeFields {
    num: i32,
    field: String,
}
struct FTSearchParametersSummarize {
    fields: Option<Vec<FTSearchParametersSummarizeFields>>,
    frags: i32,
    len: i32,
    seperator: String,
}
struct FTSearchParametersHighlightFields {
    num: i32,
    field: String,
}
struct FTSearchParametersHighlightTags {
    open: String,
    close: String,
}
struct FTSearchParametersHighlight {
    fields: Option<Vec<FTSearchParametersHighlightFields>>,
    tags: Option<Vec<FTSearchParametersHighlightTags>>,
}
struct FTSearchParametersSortBy {
    field: String,
    sort: String,
}
struct FTSearchParametersLimit {
    first: i32,
    num: i32,
}
struct FTSearchParameters {
    no_content: Option<bool>,
    verbatim: Option<bool>,
    no_stop_words: Option<bool>,
    with_scores: Option<bool>,
    with_payloads: Option<bool>,
    with_sort_keys: Option<bool>,
    filter: Option<FTSearchParametersFilter>,
    geo_filter: Option<FTSearchParametersGeoFilter>,
    in_keys: Option<FTSearchParametersInKeys>,
    in_fields: Option<FTSearchParametersInFields>,
    return_param: Option<FTSearchParametersReturnParam>,
    summarize: Option<FTSearchParametersHighlight>,
    highlight: Option<FTSearchParametersHighlight>,
    slop: i32,
    in_order: bool,
    language: String,
    expander: String,
    scorer: String,
    explain_score: bool,
    payload: String,
    sort_by: Option<FTSearchParametersSortBy>,
    limit: Option<FTSearchParametersLimit>,
}

pub struct Search {
    connection: redis::aio::MultiplexedConnection,
}
impl Search {
    fn new(connection: redis::aio::MultiplexedConnection) -> Search {
        Search { connection }
    }
}

pub struct Redis {
    client: redis::Client,
}
impl Redis {
    pub fn new() -> Redis {
        let client = redis::Client::open("redis://0.0.0.0:6379/")
            .expect("Failed to connect to Redis");
        Redis { client }
    }
    pub async fn main(
        &mut self,
    ) -> Result<redis::aio::MultiplexedConnection, redis::RedisError> {
        Ok(self.client.get_multiplexed_tokio_connection().await?)
    }
    pub async fn search(&mut self) -> Result<Search, redis::RedisError> {
        Ok(Search::new(self.main().await.unwrap().clone()))
    }
}
