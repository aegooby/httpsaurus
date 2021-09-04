pub use redis::AsyncCommands;

#[derive(Clone, Debug)]
struct FTCreateParametersPrefix {
    count: i32,
    name: String,
}
#[derive(Clone, Debug)]
struct FTCreateParametersStopwords {
    num: i32,
    stopword: String,
}
#[derive(Clone, Debug)]
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
impl FTCreateParameters {
    pub fn build() -> FTCreateParameters {
        FTCreateParameters {
            filter: None,
            payload_field: None,
            max_text_fields: None,
            no_offsets: None,
            temporary: None,
            nohl: None,
            no_fields: None,
            no_freqs: None,
            skip_initial_scan: None,
            prefix: None,
            language: None,
            language_field: None,
            score: None,
            score_field: None,
            stopwords: None,
        }
    }
    pub fn filter(&self, value: String) -> FTCreateParameters {
        FTCreateParameters {
            filter: Some(value),
            payload_field: self.payload_field.clone(),
            max_text_fields: self.max_text_fields,
            no_offsets: self.no_offsets.clone(),
            temporary: self.temporary,
            nohl: self.nohl.clone(),
            no_fields: self.no_fields.clone(),
            no_freqs: self.no_freqs.clone(),
            skip_initial_scan: self.skip_initial_scan,
            prefix: self.prefix.clone(),
            language: self.language.clone(),
            language_field: self.language_field.clone(),
            score: self.score.clone(),
            score_field: self.score_field.clone(),
            stopwords: self.stopwords.clone(),
        }
    }
    pub fn payload_field(&self, value: String) -> FTCreateParameters {
        FTCreateParameters {
            filter: self.filter.clone(),
            payload_field: Some(value),
            max_text_fields: self.max_text_fields,
            no_offsets: self.no_offsets.clone(),
            temporary: self.temporary,
            nohl: self.nohl.clone(),
            no_fields: self.no_fields.clone(),
            no_freqs: self.no_freqs.clone(),
            skip_initial_scan: self.skip_initial_scan,
            prefix: self.prefix.clone(),
            language: self.language.clone(),
            language_field: self.language_field.clone(),
            score: self.score.clone(),
            score_field: self.score_field.clone(),
            stopwords: self.stopwords.clone(),
        }
    }
    pub fn max_text_fields(&self, value: i32) -> FTCreateParameters {
        FTCreateParameters {
            filter: self.filter.clone(),
            payload_field: self.payload_field.clone(),
            max_text_fields: Some(value),
            no_offsets: self.no_offsets.clone(),
            temporary: self.temporary,
            nohl: self.nohl.clone(),
            no_fields: self.no_fields.clone(),
            no_freqs: self.no_freqs.clone(),
            skip_initial_scan: self.skip_initial_scan,
            prefix: self.prefix.clone(),
            language: self.language.clone(),
            language_field: self.language_field.clone(),
            score: self.score.clone(),
            score_field: self.score_field.clone(),
            stopwords: self.stopwords.clone(),
        }
    }
    pub fn no_offsets(&self, value: String) -> FTCreateParameters {
        FTCreateParameters {
            filter: self.filter.clone(),
            payload_field: self.payload_field.clone(),
            max_text_fields: self.max_text_fields,
            no_offsets: Some(value),
            temporary: self.temporary,
            nohl: self.nohl.clone(),
            no_fields: self.no_fields.clone(),
            no_freqs: self.no_freqs.clone(),
            skip_initial_scan: self.skip_initial_scan,
            prefix: self.prefix.clone(),
            language: self.language.clone(),
            language_field: self.language_field.clone(),
            score: self.score.clone(),
            score_field: self.score_field.clone(),
            stopwords: self.stopwords.clone(),
        }
    }
    pub fn temporary(&self, value: i32) -> FTCreateParameters {
        FTCreateParameters {
            filter: self.filter.clone(),
            payload_field: self.payload_field.clone(),
            max_text_fields: self.max_text_fields,
            no_offsets: self.no_offsets.clone(),
            temporary: Some(value),
            nohl: self.nohl.clone(),
            no_fields: self.no_fields.clone(),
            no_freqs: self.no_freqs.clone(),
            skip_initial_scan: self.skip_initial_scan,
            prefix: self.prefix.clone(),
            language: self.language.clone(),
            language_field: self.language_field.clone(),
            score: self.score.clone(),
            score_field: self.score_field.clone(),
            stopwords: self.stopwords.clone(),
        }
    }
    pub fn nohl(&self, value: String) -> FTCreateParameters {
        FTCreateParameters {
            filter: self.filter.clone(),
            payload_field: self.payload_field.clone(),
            max_text_fields: self.max_text_fields,
            no_offsets: self.no_offsets.clone(),
            temporary: self.temporary,
            nohl: Some(value),
            no_fields: self.no_fields.clone(),
            no_freqs: self.no_freqs.clone(),
            skip_initial_scan: self.skip_initial_scan,
            prefix: self.prefix.clone(),
            language: self.language.clone(),
            language_field: self.language_field.clone(),
            score: self.score.clone(),
            score_field: self.score_field.clone(),
            stopwords: self.stopwords.clone(),
        }
    }
    pub fn no_fields(&self, value: String) -> FTCreateParameters {
        FTCreateParameters {
            filter: self.filter.clone(),
            payload_field: self.payload_field.clone(),
            max_text_fields: self.max_text_fields,
            no_offsets: self.no_offsets.clone(),
            temporary: self.temporary,
            nohl: self.nohl.clone(),
            no_fields: Some(value),
            no_freqs: self.no_freqs.clone(),
            skip_initial_scan: self.skip_initial_scan,
            prefix: self.prefix.clone(),
            language: self.language.clone(),
            language_field: self.language_field.clone(),
            score: self.score.clone(),
            score_field: self.score_field.clone(),
            stopwords: self.stopwords.clone(),
        }
    }
    pub fn no_freqs(&self, value: String) -> FTCreateParameters {
        FTCreateParameters {
            filter: self.filter.clone(),
            payload_field: self.payload_field.clone(),
            max_text_fields: self.max_text_fields,
            no_offsets: self.no_offsets.clone(),
            temporary: self.temporary,
            nohl: self.nohl.clone(),
            no_fields: self.no_fields.clone(),
            no_freqs: Some(value),
            skip_initial_scan: self.skip_initial_scan,
            prefix: self.prefix.clone(),
            language: self.language.clone(),
            language_field: self.language_field.clone(),
            score: self.score.clone(),
            score_field: self.score_field.clone(),
            stopwords: self.stopwords.clone(),
        }
    }
    pub fn skip_initial_scan(&self, value: bool) -> FTCreateParameters {
        FTCreateParameters {
            filter: self.filter.clone(),
            payload_field: self.payload_field.clone(),
            max_text_fields: self.max_text_fields,
            no_offsets: self.no_offsets.clone(),
            temporary: self.temporary,
            nohl: self.nohl.clone(),
            no_fields: self.no_fields.clone(),
            no_freqs: self.no_freqs.clone(),
            skip_initial_scan: Some(value),
            prefix: self.prefix.clone(),
            language: self.language.clone(),
            language_field: self.language_field.clone(),
            score: self.score.clone(),
            score_field: self.score_field.clone(),
            stopwords: self.stopwords.clone(),
        }
    }
    pub fn prefix(
        &self,
        value: Vec<FTCreateParametersPrefix>,
    ) -> FTCreateParameters {
        FTCreateParameters {
            filter: self.filter.clone(),
            payload_field: self.payload_field.clone(),
            max_text_fields: self.max_text_fields,
            no_offsets: self.no_offsets.clone(),
            temporary: self.temporary,
            nohl: self.nohl.clone(),
            no_fields: self.no_fields.clone(),
            no_freqs: self.no_freqs.clone(),
            skip_initial_scan: self.skip_initial_scan,
            prefix: Some(value),
            language: self.language.clone(),
            language_field: self.language_field.clone(),
            score: self.score.clone(),
            score_field: self.score_field.clone(),
            stopwords: self.stopwords.clone(),
        }
    }
    pub fn language(&self, value: String) -> FTCreateParameters {
        FTCreateParameters {
            filter: self.filter.clone(),
            payload_field: self.payload_field.clone(),
            max_text_fields: self.max_text_fields,
            no_offsets: self.no_offsets.clone(),
            temporary: self.temporary,
            nohl: self.nohl.clone(),
            no_fields: self.no_fields.clone(),
            no_freqs: self.no_freqs.clone(),
            skip_initial_scan: self.skip_initial_scan,
            prefix: self.prefix.clone(),
            language: Some(value),
            language_field: self.language_field.clone(),
            score: self.score.clone(),
            score_field: self.score_field.clone(),
            stopwords: self.stopwords.clone(),
        }
    }
    pub fn language_field(&self, value: String) -> FTCreateParameters {
        FTCreateParameters {
            filter: self.filter.clone(),
            payload_field: self.payload_field.clone(),
            max_text_fields: self.max_text_fields,
            no_offsets: self.no_offsets.clone(),
            temporary: self.temporary,
            nohl: self.nohl.clone(),
            no_fields: self.no_fields.clone(),
            no_freqs: self.no_freqs.clone(),
            skip_initial_scan: self.skip_initial_scan,
            prefix: self.prefix.clone(),
            language: self.language.clone(),
            language_field: Some(value),
            score: self.score.clone(),
            score_field: self.score_field.clone(),
            stopwords: self.stopwords.clone(),
        }
    }
    pub fn score(&self, value: String) -> FTCreateParameters {
        FTCreateParameters {
            filter: self.filter.clone(),
            payload_field: self.payload_field.clone(),
            max_text_fields: self.max_text_fields,
            no_offsets: self.no_offsets.clone(),
            temporary: self.temporary,
            nohl: self.nohl.clone(),
            no_fields: self.no_fields.clone(),
            no_freqs: self.no_freqs.clone(),
            skip_initial_scan: self.skip_initial_scan,
            prefix: self.prefix.clone(),
            language: self.language.clone(),
            language_field: self.language_field.clone(),
            score: Some(value),
            score_field: self.score_field.clone(),
            stopwords: self.stopwords.clone(),
        }
    }
    pub fn score_field(&self, value: String) -> FTCreateParameters {
        FTCreateParameters {
            filter: self.filter.clone(),
            payload_field: self.payload_field.clone(),
            max_text_fields: self.max_text_fields,
            no_offsets: self.no_offsets.clone(),
            temporary: self.temporary,
            nohl: self.nohl.clone(),
            no_fields: self.no_fields.clone(),
            no_freqs: self.no_freqs.clone(),
            skip_initial_scan: self.skip_initial_scan,
            prefix: self.prefix.clone(),
            language: self.language.clone(),
            language_field: self.language_field.clone(),
            score: self.score.clone(),
            score_field: Some(value),
            stopwords: self.stopwords.clone(),
        }
    }
    pub fn stopwords(
        &self,
        value: FTCreateParametersStopwords,
    ) -> FTCreateParameters {
        FTCreateParameters {
            filter: self.filter.clone(),
            payload_field: self.payload_field.clone(),
            max_text_fields: self.max_text_fields,
            no_offsets: self.no_offsets.clone(),
            temporary: self.temporary,
            nohl: self.nohl.clone(),
            no_fields: self.no_fields.clone(),
            no_freqs: self.no_freqs.clone(),
            skip_initial_scan: self.skip_initial_scan,
            prefix: self.prefix.clone(),
            language: self.language.clone(),
            language_field: self.language_field.clone(),
            score: self.score.clone(),
            score_field: self.score_field.clone(),
            stopwords: Some(value),
        }
    }
}
struct FTFieldOptions {
    sortable: Option<bool>,
    noindex: Option<bool>,
    nostem: Option<bool>,
    phonetic: Option<String>,
    weight: Option<i32>,
    seperator: Option<String>,
}
pub struct FTSchemaField {
    sortable: Option<bool>,
    noindex: Option<bool>,
    nostem: Option<bool>,
    phonetic: Option<String>,
    weight: Option<i32>,
    seperator: Option<String>,
    name: String,
    field_type: String,
    field_as: Option<String>,
}
impl FTSchemaField {
    pub fn build() -> FTSchemaField {
        FTSchemaField {
            sortable: None,
            noindex: None,
            nostem: None,
            phonetic: None,
            weight: None,
            seperator: None,
            name: String::default(),
            field_type: String::default(),
            field_as: None,
        }
    }
    pub fn sortable(&self, value: bool) -> FTSchemaField {
        FTSchemaField {
            sortable: Some(value),
            noindex: self.noindex,
            nostem: self.nostem,
            phonetic: self.phonetic.clone(),
            weight: self.weight,
            seperator: self.seperator.clone(),
            name: self.name.clone(),
            field_type: self.field_type.clone(),
            field_as: self.field_as.clone(),
        }
    }
    pub fn noindex(&self, value: bool) -> FTSchemaField {
        FTSchemaField {
            sortable: self.sortable,
            noindex: Some(value),
            nostem: self.nostem,
            phonetic: self.phonetic.clone(),
            weight: self.weight,
            seperator: self.seperator.clone(),
            name: self.name.clone(),
            field_type: self.field_type.clone(),
            field_as: self.field_as.clone(),
        }
    }
    pub fn nostem(&self, value: bool) -> FTSchemaField {
        FTSchemaField {
            sortable: self.sortable,
            noindex: self.noindex,
            nostem: Some(value),
            phonetic: self.phonetic.clone(),
            weight: self.weight,
            seperator: self.seperator.clone(),
            name: self.name.clone(),
            field_type: self.field_type.clone(),
            field_as: self.field_as.clone(),
        }
    }
    pub fn phonetic(&self, value: String) -> FTSchemaField {
        FTSchemaField {
            sortable: self.sortable,
            noindex: self.noindex,
            nostem: self.nostem,
            phonetic: Some(value),
            weight: self.weight,
            seperator: self.seperator.clone(),
            name: self.name.clone(),
            field_type: self.field_type.clone(),
            field_as: self.field_as.clone(),
        }
    }
    pub fn weight(&self, value: i32) -> FTSchemaField {
        FTSchemaField {
            sortable: self.sortable,
            noindex: self.noindex,
            nostem: self.nostem,
            phonetic: self.phonetic.clone(),
            weight: Some(value),
            seperator: self.seperator.clone(),
            name: self.name.clone(),
            field_type: self.field_type.clone(),
            field_as: self.field_as.clone(),
        }
    }
    pub fn seperator(&self, value: String) -> FTSchemaField {
        FTSchemaField {
            sortable: self.sortable,
            noindex: self.noindex,
            nostem: self.nostem,
            phonetic: self.phonetic.clone(),
            weight: self.weight,
            seperator: Some(value),
            name: self.name.clone(),
            field_type: self.field_type.clone(),
            field_as: self.field_as.clone(),
        }
    }
    pub fn name(&self, value: String) -> FTSchemaField {
        FTSchemaField {
            sortable: self.sortable,
            noindex: self.noindex,
            nostem: self.nostem,
            phonetic: self.phonetic.clone(),
            weight: self.weight,
            seperator: self.seperator.clone(),
            name: value,
            field_type: self.field_type.clone(),
            field_as: self.field_as.clone(),
        }
    }
    pub fn field_type(&self, value: String) -> FTSchemaField {
        FTSchemaField {
            sortable: self.sortable,
            noindex: self.noindex,
            nostem: self.nostem,
            phonetic: self.phonetic.clone(),
            weight: self.weight,
            seperator: self.seperator.clone(),
            name: self.name.clone(),
            field_type: value,
            field_as: self.field_as.clone(),
        }
    }
    pub fn field_as(&self, value: String) -> FTSchemaField {
        FTSchemaField {
            sortable: self.sortable,
            noindex: self.noindex,
            nostem: self.nostem,
            phonetic: self.phonetic.clone(),
            weight: self.weight,
            seperator: self.seperator.clone(),
            name: self.name.clone(),
            field_type: self.field_type.clone(),
            field_as: Some(value),
        }
    }
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
struct FTAggregateParametersLoad {
    nargs: String,
    properties: Vec<String>,
}
struct FTAggregateParametersApply {
    expression: String,
    as_type: String,
}
struct FTAggregateParametersGroupBy {
    nargs: String,
    properties: Vec<String>,
}
struct FTAggregateParametersReduce {
    function: String,
    nargs: String,
    args: Vec<String>,
    as_type: Option<String>,
}
struct FTAggregateParametersSortByProperties {
    property: String,
    sort: String,
}
struct FTAggregateParametersSortBy {
    nargs: String,
    properties: Vec<FTAggregateParametersSortByProperties>,
    max: i32,
}
struct FTAggregateParametersExpressions {
    expression: String,
    as_type: String,
}
struct FTAggregateParametersLimit {
    offset: String,
    number_of_results: i32,
}
struct FTAggregateParameters {
    load: Option<FTAggregateParametersLoad>,
    apply: Option<Vec<FTAggregateParametersApply>>,
    group_by: Option<FTAggregateParametersGroupBy>,
    reduce: Option<Vec<FTAggregateParametersReduce>>,
    sort_by: Option<FTAggregateParametersSortBy>,
    expressions: Option<Vec<FTAggregateParametersExpressions>>,
    limit: Option<FTAggregateParametersLimit>,
    filter: Option<String>,
}

pub struct Search {
    connection: redis::aio::MultiplexedConnection,
}
impl Search {
    fn new(connection: redis::aio::MultiplexedConnection) -> Search {
        Search { connection }
    }
    pub async fn create(
        &mut self,
        index: String,
        index_type: String,
        schema_fields: Vec<FTSchemaField>,
        parameters: Option<FTCreateParameters>,
    ) -> Result<String, redis::RedisError> {
        let mut cmd = redis::cmd("FT.CREATE");
        cmd.arg(index).arg("ON").arg(index_type);
        if let Some(parameters) = parameters {
            if let Some(prefixes) = parameters.prefix {
                cmd.arg("PREFIX");
                for prefix in prefixes {
                    cmd.arg(prefix.count.to_string()).arg(prefix.name);
                }
            }
            if let Some(filter) = parameters.filter {
                cmd.arg("FILTER").arg(filter);
            }
            if let Some(language) = parameters.language {
                cmd.arg("LANGUAGE").arg(language);
            }
            if let Some(language_field) = parameters.language_field {
                cmd.arg("LANGUAGE_FIELD").arg(language_field);
            }
            if let Some(score) = parameters.score {
                cmd.arg("SCORE").arg(score);
            }
            if let Some(score_field) = parameters.score_field {
                cmd.arg("SCORE_FIELD").arg(score_field);
            }
            if let Some(payload_field) = parameters.payload_field {
                cmd.arg("PAYLOAD_FIELD").arg(payload_field);
            }
            if let Some(max_text_fields) = parameters.max_text_fields {
                cmd.arg("MAXTEXTFIELDS").arg(max_text_fields.to_string());
            }
            if let Some(_) = parameters.no_offsets {
                cmd.arg("NOOFFSETS");
            }
            if let Some(_) = parameters.temporary {
                cmd.arg("TEMPORARY");
            }
            if let Some(_) = parameters.nohl {
                cmd.arg("NOHL");
            }
            if let Some(_) = parameters.no_fields {
                cmd.arg("NOFIELDS");
            }
            if let Some(_) = parameters.no_freqs {
                cmd.arg("NOFREQS");
            }
            if let Some(stopwords) = parameters.stopwords {
                cmd.arg("STOPWORDS")
                    .arg(stopwords.num.to_string())
                    .arg(stopwords.stopword);
            }
            if let Some(skip_initial_scan) = parameters.skip_initial_scan {
                if (skip_initial_scan) {
                    cmd.arg("SKIPINITIALSCAN");
                }
            }
        }
        cmd.arg("SCHEMA");
        for field in schema_fields {
            cmd.arg(field.name);
            if let Some(field_as) = field.field_as {
                cmd.arg("AS").arg(field_as);
            }
            cmd.arg(field.field_type);
            if let Some(nostem) = field.nostem {
                if nostem {
                    cmd.arg("NOSTEM");
                }
            }
            if let Some(weight) = field.weight {
                cmd.arg("WEIGHT").arg(weight.to_string());
            }
            if let Some(phonetic) = field.phonetic {
                cmd.arg("PHONETIC").arg(phonetic);
            }
            if let Some(separator) = field.seperator {
                cmd.arg("SEPARATOR").arg(separator);
            }
            if let Some(sortable) = field.sortable {
                if sortable {
                    cmd.arg("SORTABLE");
                }
            }
            if let Some(noindex) = field.noindex {
                if noindex {
                    cmd.arg("NOINDEX");
                }
            }
        }
        cmd.query_async(&mut self.connection).await
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
        Ok(Search::new(
            self.main()
                .await
                .expect("Failed use Redis conenction")
                .clone(),
        ))
    }
}
