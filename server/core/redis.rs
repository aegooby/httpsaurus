use crate::core::error;
pub use redis::AsyncCommands;

pub struct JSONGetParameters {
    indent: Option<String>,
    newline: Option<String>,
    space: Option<String>,
    noescape: Option<bool>,
    paths: Option<Vec<String>>,
}
pub struct JSON {
    connection: redis::aio::MultiplexedConnection,
}
#[allow(dead_code)]
impl JSON {
    fn new(connection: redis::aio::MultiplexedConnection) -> Self {
        Self { connection }
    }
    pub async fn del(&mut self, key: String, path: Option<String>) -> Result<i32, error::Error> {
        let mut cmd = redis::cmd("JSON.DEL");
        cmd.arg(key);
        if let Some(path) = path {
            cmd.arg(path);
        }
        Ok(cmd.query_async(&mut self.connection).await?)
    }
    pub async fn set(
        &mut self,
        key: String,
        path: String,
        json: String,
        condition: Option<String>,
    ) -> Result<String, error::Error> {
        let mut cmd = redis::cmd("JSON.SET");
        cmd.arg(key).arg(path).arg(json);
        if let Some(condition) = condition {
            cmd.arg(condition);
        }
        Ok(cmd.query_async(&mut self.connection).await?)
    }
    pub async fn get(
        &mut self,
        key: String,
        path: Option<String>,
        parameters: Option<JSONGetParameters>,
    ) -> Result<String, error::Error> {
        let mut cmd = redis::cmd("JSON.GET");
        cmd.arg(key);
        if let Some(parameters) = parameters {
            if let Some(indent) = parameters.indent {
                cmd.arg("INDENT").arg(indent);
            }
            if let Some(newline) = parameters.newline {
                cmd.arg("NEWLINE").arg(newline);
            }
            if let Some(space) = parameters.space {
                cmd.arg("SPACE").arg(space);
            }
            if let Some(noescape) = parameters.noescape {
                if noescape {
                    cmd.arg("NOESCAPE");
                }
            }
            if let Some(paths) = parameters.paths {
                for path in paths {
                    cmd.arg(path);
                }
            }
        }
        if let Some(path) = path {
            cmd.arg(path);
        }

        Ok(cmd.query_async(&mut self.connection).await?)
    }
    pub async fn mget(
        &mut self,
        keys: Vec<String>,
        path: Option<String>,
    ) -> Result<Vec<String>, error::Error> {
        let mut cmd = redis::cmd("JSON.MGET");
        for key in keys {
            cmd.arg(key);
        }
        if let Some(path) = path {
            cmd.arg(path);
        }
        Ok(cmd.query_async(&mut self.connection).await?)
    }
}

#[derive(Clone, Debug)]
pub struct FTCreateParametersPrefix {
    pub count: i32,
    pub name: String,
}
#[derive(Clone, Debug)]
pub struct FTCreateParametersStopwords {
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
#[allow(dead_code)]
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
    pub fn prefix(&self, value: &[FTCreateParametersPrefix]) -> FTCreateParameters {
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
            prefix: Some(value.to_vec()),
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
    pub fn stopwords(&self, value: FTCreateParametersStopwords) -> FTCreateParameters {
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
#[derive(Clone, Debug)]
pub struct FTFieldOptions {
    sortable: Option<bool>,
    noindex: Option<bool>,
    nostem: Option<bool>,
    phonetic: Option<String>,
    weight: Option<i32>,
    separator: Option<String>,
}
#[allow(dead_code)]
impl FTFieldOptions {
    pub fn build() -> FTFieldOptions {
        FTFieldOptions {
            sortable: None,
            noindex: None,
            nostem: None,
            phonetic: None,
            weight: None,
            separator: None,
        }
    }
    pub fn sortable(&self, value: bool) -> FTFieldOptions {
        FTFieldOptions {
            sortable: Some(value),
            noindex: self.noindex,
            nostem: self.nostem,
            phonetic: self.phonetic.clone(),
            weight: self.weight,
            separator: self.separator.clone(),
        }
    }
    pub fn noindex(&self, value: bool) -> FTFieldOptions {
        FTFieldOptions {
            sortable: self.sortable,
            noindex: Some(value),
            nostem: self.nostem,
            phonetic: self.phonetic.clone(),
            weight: self.weight,
            separator: self.separator.clone(),
        }
    }
    pub fn nostem(&self, value: bool) -> FTFieldOptions {
        FTFieldOptions {
            sortable: self.sortable,
            noindex: self.noindex,
            nostem: Some(value),
            phonetic: self.phonetic.clone(),
            weight: self.weight,
            separator: self.separator.clone(),
        }
    }
    pub fn phonetic(&self, value: String) -> FTFieldOptions {
        FTFieldOptions {
            sortable: self.sortable,
            noindex: self.noindex,
            nostem: self.nostem,
            phonetic: Some(value),
            weight: self.weight,
            separator: self.separator.clone(),
        }
    }
    pub fn weight(&self, value: i32) -> FTFieldOptions {
        FTFieldOptions {
            sortable: self.sortable,
            noindex: self.noindex,
            nostem: self.nostem,
            phonetic: self.phonetic.clone(),
            weight: Some(value),
            separator: self.separator.clone(),
        }
    }
    pub fn separator(&self, value: String) -> FTFieldOptions {
        FTFieldOptions {
            sortable: self.sortable,
            noindex: self.noindex,
            nostem: self.nostem,
            phonetic: self.phonetic.clone(),
            weight: self.weight,
            separator: Some(value),
        }
    }
}
#[allow(dead_code)]
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
#[allow(dead_code)]
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
#[derive(Clone, Debug)]
pub struct FTSearchParametersFilter {
    field: String,
    min: i32,
    max: i32,
}
#[derive(Clone, Debug)]
pub struct FTSearchParametersGeoFilter {
    field: String,
    lon: i32,
    lat: i32,
    radius: i32,
    measurement: String,
}
#[derive(Clone, Debug)]
pub struct FTSearchParametersInKeys {
    num: i32,
    field: String,
}
#[derive(Clone, Debug)]
pub struct FTSearchParametersInFields {
    num: i32,
    field: String,
}
#[derive(Clone, Debug)]
pub struct FTSearchParametersReturnParamFields {
    name: String,
    as_type: String,
}
#[derive(Clone, Debug)]
pub struct FTSearchParametersReturnParam {
    num: i32,
    fields: Option<Vec<FTSearchParametersReturnParamFields>>,
}
#[derive(Clone, Debug)]
pub struct FTSearchParametersSummarizeFields {
    num: i32,
    field: String,
}
#[derive(Clone, Debug)]
pub struct FTSearchParametersSummarize {
    fields: Option<Vec<FTSearchParametersSummarizeFields>>,
    frags: i32,
    len: i32,
    seperator: String,
}
#[derive(Clone, Debug)]
pub struct FTSearchParametersHighlightFields {
    num: i32,
    field: String,
}
#[derive(Clone, Debug)]
pub struct FTSearchParametersHighlightTags {
    open: String,
    close: String,
}
#[derive(Clone, Debug)]
pub struct FTSearchParametersHighlight {
    fields: Option<Vec<FTSearchParametersHighlightFields>>,
    tags: Option<Vec<FTSearchParametersHighlightTags>>,
}
#[derive(Clone, Debug)]
pub struct FTSearchParametersSortBy {
    field: String,
    sort: String,
}
#[derive(Clone, Debug)]
pub struct FTSearchParametersLimit {
    first: i32,
    num: i32,
}
#[derive(Clone, Debug)]
pub struct FTSearchParameters {
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
    summarize: Option<FTSearchParametersSummarize>,
    highlight: Option<FTSearchParametersHighlight>,
    slop: Option<i32>,
    in_order: Option<bool>,
    language: Option<String>,
    expander: Option<String>,
    scorer: Option<String>,
    explain_score: Option<bool>,
    payload: Option<String>,
    sort_by: Option<FTSearchParametersSortBy>,
    limit: Option<FTSearchParametersLimit>,
}
#[allow(dead_code)]
impl FTSearchParameters {
    pub fn build() -> FTSearchParameters {
        FTSearchParameters {
            no_content: None,
            verbatim: None,
            no_stop_words: None,
            with_scores: None,
            with_payloads: None,
            with_sort_keys: None,
            filter: None,
            geo_filter: None,
            in_keys: None,
            in_fields: None,
            return_param: None,
            summarize: None,
            highlight: None,
            slop: None,
            in_order: None,
            language: None,
            expander: None,
            scorer: None,
            explain_score: None,
            payload: None,
            sort_by: None,
            limit: None,
        }
    }
    pub fn no_content(&self, value: bool) -> FTSearchParameters {
        FTSearchParameters {
            no_content: Some(value),
            verbatim: self.verbatim,
            no_stop_words: self.no_stop_words,
            with_scores: self.with_scores,
            with_payloads: self.with_payloads,
            with_sort_keys: self.with_sort_keys,
            filter: self.filter.clone(),
            geo_filter: self.geo_filter.clone(),
            in_keys: self.in_keys.clone(),
            in_fields: self.in_fields.clone(),
            return_param: self.return_param.clone(),
            summarize: self.summarize.clone(),
            highlight: self.highlight.clone(),
            slop: self.slop,
            in_order: self.in_order,
            language: self.language.clone(),
            expander: self.expander.clone(),
            scorer: self.scorer.clone(),
            explain_score: self.explain_score,
            payload: self.payload.clone(),
            sort_by: self.sort_by.clone(),
            limit: self.limit.clone(),
        }
    }
    pub fn verbatim(&self, value: bool) -> FTSearchParameters {
        FTSearchParameters {
            no_content: self.no_content,
            verbatim: Some(value),
            no_stop_words: self.no_stop_words,
            with_scores: self.with_scores,
            with_payloads: self.with_payloads,
            with_sort_keys: self.with_sort_keys,
            filter: self.filter.clone(),
            geo_filter: self.geo_filter.clone(),
            in_keys: self.in_keys.clone(),
            in_fields: self.in_fields.clone(),
            return_param: self.return_param.clone(),
            summarize: self.summarize.clone(),
            highlight: self.highlight.clone(),
            slop: self.slop,
            in_order: self.in_order,
            language: self.language.clone(),
            expander: self.expander.clone(),
            scorer: self.scorer.clone(),
            explain_score: self.explain_score,
            payload: self.payload.clone(),
            sort_by: self.sort_by.clone(),
            limit: self.limit.clone(),
        }
    }
    pub fn no_stop_words(&self, value: bool) -> FTSearchParameters {
        FTSearchParameters {
            no_content: self.no_content,
            verbatim: self.verbatim,
            no_stop_words: Some(value),
            with_scores: self.with_scores,
            with_payloads: self.with_payloads,
            with_sort_keys: self.with_sort_keys,
            filter: self.filter.clone(),
            geo_filter: self.geo_filter.clone(),
            in_keys: self.in_keys.clone(),
            in_fields: self.in_fields.clone(),
            return_param: self.return_param.clone(),
            summarize: self.summarize.clone(),
            highlight: self.highlight.clone(),
            slop: self.slop,
            in_order: self.in_order,
            language: self.language.clone(),
            expander: self.expander.clone(),
            scorer: self.scorer.clone(),
            explain_score: self.explain_score,
            payload: self.payload.clone(),
            sort_by: self.sort_by.clone(),
            limit: self.limit.clone(),
        }
    }
    pub fn with_scores(&self, value: bool) -> FTSearchParameters {
        FTSearchParameters {
            no_content: self.no_content,
            verbatim: self.verbatim,
            no_stop_words: self.no_stop_words,
            with_scores: Some(value),
            with_payloads: self.with_payloads,
            with_sort_keys: self.with_sort_keys,
            filter: self.filter.clone(),
            geo_filter: self.geo_filter.clone(),
            in_keys: self.in_keys.clone(),
            in_fields: self.in_fields.clone(),
            return_param: self.return_param.clone(),
            summarize: self.summarize.clone(),
            highlight: self.highlight.clone(),
            slop: self.slop,
            in_order: self.in_order,
            language: self.language.clone(),
            expander: self.expander.clone(),
            scorer: self.scorer.clone(),
            explain_score: self.explain_score,
            payload: self.payload.clone(),
            sort_by: self.sort_by.clone(),
            limit: self.limit.clone(),
        }
    }
    pub fn with_payloads(&self, value: bool) -> FTSearchParameters {
        FTSearchParameters {
            no_content: self.no_content,
            verbatim: self.verbatim,
            no_stop_words: self.no_stop_words,
            with_scores: self.with_scores,
            with_payloads: Some(value),
            with_sort_keys: self.with_sort_keys,
            filter: self.filter.clone(),
            geo_filter: self.geo_filter.clone(),
            in_keys: self.in_keys.clone(),
            in_fields: self.in_fields.clone(),
            return_param: self.return_param.clone(),
            summarize: self.summarize.clone(),
            highlight: self.highlight.clone(),
            slop: self.slop,
            in_order: self.in_order,
            language: self.language.clone(),
            expander: self.expander.clone(),
            scorer: self.scorer.clone(),
            explain_score: self.explain_score,
            payload: self.payload.clone(),
            sort_by: self.sort_by.clone(),
            limit: self.limit.clone(),
        }
    }
    pub fn with_sort_keys(&self, value: bool) -> FTSearchParameters {
        FTSearchParameters {
            no_content: self.no_content,
            verbatim: self.verbatim,
            no_stop_words: self.no_stop_words,
            with_scores: self.with_scores,
            with_payloads: self.with_payloads,
            with_sort_keys: Some(value),
            filter: self.filter.clone(),
            geo_filter: self.geo_filter.clone(),
            in_keys: self.in_keys.clone(),
            in_fields: self.in_fields.clone(),
            return_param: self.return_param.clone(),
            summarize: self.summarize.clone(),
            highlight: self.highlight.clone(),
            slop: self.slop,
            in_order: self.in_order,
            language: self.language.clone(),
            expander: self.expander.clone(),
            scorer: self.scorer.clone(),
            explain_score: self.explain_score,
            payload: self.payload.clone(),
            sort_by: self.sort_by.clone(),
            limit: self.limit.clone(),
        }
    }
    pub fn filter(&self, value: FTSearchParametersFilter) -> FTSearchParameters {
        FTSearchParameters {
            no_content: self.no_content,
            verbatim: self.verbatim,
            no_stop_words: self.no_stop_words,
            with_scores: self.with_scores,
            with_payloads: self.with_payloads,
            with_sort_keys: self.with_sort_keys,
            filter: Some(value),
            geo_filter: self.geo_filter.clone(),
            in_keys: self.in_keys.clone(),
            in_fields: self.in_fields.clone(),
            return_param: self.return_param.clone(),
            summarize: self.summarize.clone(),
            highlight: self.highlight.clone(),
            slop: self.slop,
            in_order: self.in_order,
            language: self.language.clone(),
            expander: self.expander.clone(),
            scorer: self.scorer.clone(),
            explain_score: self.explain_score,
            payload: self.payload.clone(),
            sort_by: self.sort_by.clone(),
            limit: self.limit.clone(),
        }
    }
    pub fn geo_filter(&self, value: FTSearchParametersGeoFilter) -> FTSearchParameters {
        FTSearchParameters {
            no_content: self.no_content,
            verbatim: self.verbatim,
            no_stop_words: self.no_stop_words,
            with_scores: self.with_scores,
            with_payloads: self.with_payloads,
            with_sort_keys: self.with_sort_keys,
            filter: self.filter.clone(),
            geo_filter: Some(value),
            in_keys: self.in_keys.clone(),
            in_fields: self.in_fields.clone(),
            return_param: self.return_param.clone(),
            summarize: self.summarize.clone(),
            highlight: self.highlight.clone(),
            slop: self.slop,
            in_order: self.in_order,
            language: self.language.clone(),
            expander: self.expander.clone(),
            scorer: self.scorer.clone(),
            explain_score: self.explain_score,
            payload: self.payload.clone(),
            sort_by: self.sort_by.clone(),
            limit: self.limit.clone(),
        }
    }
    pub fn in_keys(&self, value: FTSearchParametersInKeys) -> FTSearchParameters {
        FTSearchParameters {
            no_content: self.no_content,
            verbatim: self.verbatim,
            no_stop_words: self.no_stop_words,
            with_scores: self.with_scores,
            with_payloads: self.with_payloads,
            with_sort_keys: self.with_sort_keys,
            filter: self.filter.clone(),
            geo_filter: self.geo_filter.clone(),
            in_keys: Some(value),
            in_fields: self.in_fields.clone(),
            return_param: self.return_param.clone(),
            summarize: self.summarize.clone(),
            highlight: self.highlight.clone(),
            slop: self.slop,
            in_order: self.in_order,
            language: self.language.clone(),
            expander: self.expander.clone(),
            scorer: self.scorer.clone(),
            explain_score: self.explain_score,
            payload: self.payload.clone(),
            sort_by: self.sort_by.clone(),
            limit: self.limit.clone(),
        }
    }
    pub fn in_fields(&self, value: FTSearchParametersInFields) -> FTSearchParameters {
        FTSearchParameters {
            no_content: self.no_content,
            verbatim: self.verbatim,
            no_stop_words: self.no_stop_words,
            with_scores: self.with_scores,
            with_payloads: self.with_payloads,
            with_sort_keys: self.with_sort_keys,
            filter: self.filter.clone(),
            geo_filter: self.geo_filter.clone(),
            in_keys: self.in_keys.clone(),
            in_fields: Some(value),
            return_param: self.return_param.clone(),
            summarize: self.summarize.clone(),
            highlight: self.highlight.clone(),
            slop: self.slop,
            in_order: self.in_order,
            language: self.language.clone(),
            expander: self.expander.clone(),
            scorer: self.scorer.clone(),
            explain_score: self.explain_score,
            payload: self.payload.clone(),
            sort_by: self.sort_by.clone(),
            limit: self.limit.clone(),
        }
    }
    pub fn return_param(&self, value: FTSearchParametersReturnParam) -> FTSearchParameters {
        FTSearchParameters {
            no_content: self.no_content,
            verbatim: self.verbatim,
            no_stop_words: self.no_stop_words,
            with_scores: self.with_scores,
            with_payloads: self.with_payloads,
            with_sort_keys: self.with_sort_keys,
            filter: self.filter.clone(),
            geo_filter: self.geo_filter.clone(),
            in_keys: self.in_keys.clone(),
            in_fields: self.in_fields.clone(),
            return_param: Some(value),
            summarize: self.summarize.clone(),
            highlight: self.highlight.clone(),
            slop: self.slop,
            in_order: self.in_order,
            language: self.language.clone(),
            expander: self.expander.clone(),
            scorer: self.scorer.clone(),
            explain_score: self.explain_score,
            payload: self.payload.clone(),
            sort_by: self.sort_by.clone(),
            limit: self.limit.clone(),
        }
    }
    pub fn summarize(&self, value: FTSearchParametersSummarize) -> FTSearchParameters {
        FTSearchParameters {
            no_content: self.no_content,
            verbatim: self.verbatim,
            no_stop_words: self.no_stop_words,
            with_scores: self.with_scores,
            with_payloads: self.with_payloads,
            with_sort_keys: self.with_sort_keys,
            filter: self.filter.clone(),
            geo_filter: self.geo_filter.clone(),
            in_keys: self.in_keys.clone(),
            in_fields: self.in_fields.clone(),
            return_param: self.return_param.clone(),
            summarize: Some(value),
            highlight: self.highlight.clone(),
            slop: self.slop,
            in_order: self.in_order,
            language: self.language.clone(),
            expander: self.expander.clone(),
            scorer: self.scorer.clone(),
            explain_score: self.explain_score,
            payload: self.payload.clone(),
            sort_by: self.sort_by.clone(),
            limit: self.limit.clone(),
        }
    }
    pub fn highlight(&self, value: FTSearchParametersHighlight) -> FTSearchParameters {
        FTSearchParameters {
            no_content: self.no_content,
            verbatim: self.verbatim,
            no_stop_words: self.no_stop_words,
            with_scores: self.with_scores,
            with_payloads: self.with_payloads,
            with_sort_keys: self.with_sort_keys,
            filter: self.filter.clone(),
            geo_filter: self.geo_filter.clone(),
            in_keys: self.in_keys.clone(),
            in_fields: self.in_fields.clone(),
            return_param: self.return_param.clone(),
            summarize: self.summarize.clone(),
            highlight: Some(value),
            slop: self.slop,
            in_order: self.in_order,
            language: self.language.clone(),
            expander: self.expander.clone(),
            scorer: self.scorer.clone(),
            explain_score: self.explain_score,
            payload: self.payload.clone(),
            sort_by: self.sort_by.clone(),
            limit: self.limit.clone(),
        }
    }
    pub fn slop(&self, value: i32) -> FTSearchParameters {
        FTSearchParameters {
            no_content: self.no_content,
            verbatim: self.verbatim,
            no_stop_words: self.no_stop_words,
            with_scores: self.with_scores,
            with_payloads: self.with_payloads,
            with_sort_keys: self.with_sort_keys,
            filter: self.filter.clone(),
            geo_filter: self.geo_filter.clone(),
            in_keys: self.in_keys.clone(),
            in_fields: self.in_fields.clone(),
            return_param: self.return_param.clone(),
            summarize: self.summarize.clone(),
            highlight: self.highlight.clone(),
            slop: Some(value),
            in_order: self.in_order,
            language: self.language.clone(),
            expander: self.expander.clone(),
            scorer: self.scorer.clone(),
            explain_score: self.explain_score,
            payload: self.payload.clone(),
            sort_by: self.sort_by.clone(),
            limit: self.limit.clone(),
        }
    }
    pub fn in_order(&self, value: bool) -> FTSearchParameters {
        FTSearchParameters {
            no_content: self.no_content,
            verbatim: self.verbatim,
            no_stop_words: self.no_stop_words,
            with_scores: self.with_scores,
            with_payloads: self.with_payloads,
            with_sort_keys: self.with_sort_keys,
            filter: self.filter.clone(),
            geo_filter: self.geo_filter.clone(),
            in_keys: self.in_keys.clone(),
            in_fields: self.in_fields.clone(),
            return_param: self.return_param.clone(),
            summarize: self.summarize.clone(),
            highlight: self.highlight.clone(),
            slop: self.slop,
            in_order: Some(value),
            language: self.language.clone(),
            expander: self.expander.clone(),
            scorer: self.scorer.clone(),
            explain_score: self.explain_score,
            payload: self.payload.clone(),
            sort_by: self.sort_by.clone(),
            limit: self.limit.clone(),
        }
    }
    pub fn language(&self, value: String) -> FTSearchParameters {
        FTSearchParameters {
            no_content: self.no_content,
            verbatim: self.verbatim,
            no_stop_words: self.no_stop_words,
            with_scores: self.with_scores,
            with_payloads: self.with_payloads,
            with_sort_keys: self.with_sort_keys,
            filter: self.filter.clone(),
            geo_filter: self.geo_filter.clone(),
            in_keys: self.in_keys.clone(),
            in_fields: self.in_fields.clone(),
            return_param: self.return_param.clone(),
            summarize: self.summarize.clone(),
            highlight: self.highlight.clone(),
            slop: self.slop,
            in_order: self.in_order,
            language: Some(value),
            expander: self.expander.clone(),
            scorer: self.scorer.clone(),
            explain_score: self.explain_score,
            payload: self.payload.clone(),
            sort_by: self.sort_by.clone(),
            limit: self.limit.clone(),
        }
    }
    pub fn expander(&self, value: String) -> FTSearchParameters {
        FTSearchParameters {
            no_content: self.no_content,
            verbatim: self.verbatim,
            no_stop_words: self.no_stop_words,
            with_scores: self.with_scores,
            with_payloads: self.with_payloads,
            with_sort_keys: self.with_sort_keys,
            filter: self.filter.clone(),
            geo_filter: self.geo_filter.clone(),
            in_keys: self.in_keys.clone(),
            in_fields: self.in_fields.clone(),
            return_param: self.return_param.clone(),
            summarize: self.summarize.clone(),
            highlight: self.highlight.clone(),
            slop: self.slop,
            in_order: self.in_order,
            language: self.language.clone(),
            expander: Some(value),
            scorer: self.scorer.clone(),
            explain_score: self.explain_score,
            payload: self.payload.clone(),
            sort_by: self.sort_by.clone(),
            limit: self.limit.clone(),
        }
    }
    pub fn scorer(&self, value: String) -> FTSearchParameters {
        FTSearchParameters {
            no_content: self.no_content,
            verbatim: self.verbatim,
            no_stop_words: self.no_stop_words,
            with_scores: self.with_scores,
            with_payloads: self.with_payloads,
            with_sort_keys: self.with_sort_keys,
            filter: self.filter.clone(),
            geo_filter: self.geo_filter.clone(),
            in_keys: self.in_keys.clone(),
            in_fields: self.in_fields.clone(),
            return_param: self.return_param.clone(),
            summarize: self.summarize.clone(),
            highlight: self.highlight.clone(),
            slop: self.slop,
            in_order: self.in_order,
            language: self.language.clone(),
            expander: self.expander.clone(),
            scorer: Some(value),
            explain_score: self.explain_score,
            payload: self.payload.clone(),
            sort_by: self.sort_by.clone(),
            limit: self.limit.clone(),
        }
    }
    pub fn explain_score(&self, value: bool) -> FTSearchParameters {
        FTSearchParameters {
            no_content: self.no_content,
            verbatim: self.verbatim,
            no_stop_words: self.no_stop_words,
            with_scores: self.with_scores,
            with_payloads: self.with_payloads,
            with_sort_keys: self.with_sort_keys,
            filter: self.filter.clone(),
            geo_filter: self.geo_filter.clone(),
            in_keys: self.in_keys.clone(),
            in_fields: self.in_fields.clone(),
            return_param: self.return_param.clone(),
            summarize: self.summarize.clone(),
            highlight: self.highlight.clone(),
            slop: self.slop,
            in_order: self.in_order,
            language: self.language.clone(),
            expander: self.expander.clone(),
            scorer: self.scorer.clone(),
            explain_score: Some(value),
            payload: self.payload.clone(),
            sort_by: self.sort_by.clone(),
            limit: self.limit.clone(),
        }
    }
    pub fn payload(&self, value: String) -> FTSearchParameters {
        FTSearchParameters {
            no_content: self.no_content,
            verbatim: self.verbatim,
            no_stop_words: self.no_stop_words,
            with_scores: self.with_scores,
            with_payloads: self.with_payloads,
            with_sort_keys: self.with_sort_keys,
            filter: self.filter.clone(),
            geo_filter: self.geo_filter.clone(),
            in_keys: self.in_keys.clone(),
            in_fields: self.in_fields.clone(),
            return_param: self.return_param.clone(),
            summarize: self.summarize.clone(),
            highlight: self.highlight.clone(),
            slop: self.slop,
            in_order: self.in_order,
            language: self.language.clone(),
            expander: self.expander.clone(),
            scorer: self.scorer.clone(),
            explain_score: self.explain_score,
            payload: Some(value),
            sort_by: self.sort_by.clone(),
            limit: self.limit.clone(),
        }
    }
    pub fn sort_by(&self, value: FTSearchParametersSortBy) -> FTSearchParameters {
        FTSearchParameters {
            no_content: self.no_content,
            verbatim: self.verbatim,
            no_stop_words: self.no_stop_words,
            with_scores: self.with_scores,
            with_payloads: self.with_payloads,
            with_sort_keys: self.with_sort_keys,
            filter: self.filter.clone(),
            geo_filter: self.geo_filter.clone(),
            in_keys: self.in_keys.clone(),
            in_fields: self.in_fields.clone(),
            return_param: self.return_param.clone(),
            summarize: self.summarize.clone(),
            highlight: self.highlight.clone(),
            slop: self.slop,
            in_order: self.in_order,
            language: self.language.clone(),
            expander: self.expander.clone(),
            scorer: self.scorer.clone(),
            explain_score: self.explain_score,
            payload: self.payload.clone(),
            sort_by: Some(value),
            limit: self.limit.clone(),
        }
    }
    pub fn limit(&self, value: FTSearchParametersLimit) -> FTSearchParameters {
        FTSearchParameters {
            no_content: self.no_content,
            verbatim: self.verbatim,
            no_stop_words: self.no_stop_words,
            with_scores: self.with_scores,
            with_payloads: self.with_payloads,
            with_sort_keys: self.with_sort_keys,
            filter: self.filter.clone(),
            geo_filter: self.geo_filter.clone(),
            in_keys: self.in_keys.clone(),
            in_fields: self.in_fields.clone(),
            return_param: self.return_param.clone(),
            summarize: self.summarize.clone(),
            highlight: self.highlight.clone(),
            slop: self.slop,
            in_order: self.in_order,
            language: self.language.clone(),
            expander: self.expander.clone(),
            scorer: self.scorer.clone(),
            explain_score: self.explain_score,
            payload: self.payload.clone(),
            sort_by: self.sort_by.clone(),
            limit: Some(value),
        }
    }
}
#[derive(Clone, Debug)]
struct FTAggregateParametersLoad {
    nargs: String,
    properties: Vec<String>,
}
#[derive(Clone, Debug)]
struct FTAggregateParametersApply {
    expression: String,
    as_type: String,
}
#[derive(Clone, Debug)]
struct FTAggregateParametersGroupBy {
    nargs: String,
    properties: Vec<String>,
}
#[derive(Clone, Debug)]
struct FTAggregateParametersReduce {
    function: String,
    nargs: String,
    args: Vec<String>,
    as_type: Option<String>,
}
#[derive(Clone, Debug)]
struct FTAggregateParametersSortByProperties {
    property: String,
    sort: String,
}
#[derive(Clone, Debug)]
struct FTAggregateParametersSortBy {
    nargs: String,
    properties: Vec<FTAggregateParametersSortByProperties>,
    max: i32,
}
#[derive(Clone, Debug)]
struct FTAggregateParametersExpressions {
    expression: String,
    as_type: String,
}
#[derive(Clone, Debug)]
struct FTAggregateParametersLimit {
    offset: String,
    number_of_results: i32,
}
#[derive(Clone, Debug)]
pub struct FTAggregateParameters {
    load: Option<FTAggregateParametersLoad>,
    apply: Option<Vec<FTAggregateParametersApply>>,
    group_by: Option<FTAggregateParametersGroupBy>,
    reduce: Option<Vec<FTAggregateParametersReduce>>,
    sort_by: Option<FTAggregateParametersSortBy>,
    expressions: Option<Vec<FTAggregateParametersExpressions>>,
    limit: Option<FTAggregateParametersLimit>,
    filter: Option<String>,
}

#[derive(Clone, Debug)]
pub struct FTSearchResultItem {
    pub key: String,
    pub path: String,
    pub value: String,
}
#[derive(Clone, Debug)]
pub struct FTSearchResult {
    pub results: Vec<FTSearchResultItem>,
}
impl redis::FromRedisValue for FTSearchResult {
    fn from_redis_value(value: &redis::Value) -> redis::RedisResult<Self> {
        match value {
            redis::Value::Bulk(items) => {
                if !(items.len() > 1) {
                    Ok(FTSearchResult { results: vec![] })
                } else {
                    let mut results_vec = vec![] as Vec<FTSearchResultItem>;
                    for item in items {
                        match item {
                            redis::Value::Int(_) => (),
                            redis::Value::Data(data) => {
                                if let Ok(key) = String::from_utf8(data.to_vec()) {
                                    results_vec.push(FTSearchResultItem {
                                        key,
                                        path: "".to_string(),
                                        value: "".to_string(),
                                    })
                                }
                            }
                            redis::Value::Bulk(pair) => {
                                if pair.len() != 2 {
                                    return Err(redis::RedisError::from((
                                        redis::ErrorKind::TypeError,
                                        "Invalid pair length in FT.SEARCH result",
                                    )));
                                } else {
                                    let path = pair.first();
                                    let value = pair.last();
                                    if let (
                                        Some(redis::Value::Data(path)),
                                        Some(redis::Value::Data(value)),
                                    ) = (path, value)
                                    {
                                        if let Some(last) = results_vec.last_mut() {
                                            let path_str = String::from_utf8(path.to_vec());
                                            let value_str = String::from_utf8(value.to_vec());
                                            if let (Ok(path), Ok(value)) = (path_str, value_str) {
                                                last.path = path;
                                                last.value = value;
                                            } else {
                                                results_vec.pop();
                                            }
                                        }
                                    }
                                }
                            }
                            _ => (),
                        }
                    }
                    Ok(FTSearchResult {
                        results: results_vec,
                    })
                }
            }
            _ => Err(redis::RedisError::from((
                redis::ErrorKind::TypeError,
                "Expected bulk result for FT.SEARCH command",
            ))),
        }
    }
}

pub struct Search {
    connection: redis::aio::MultiplexedConnection,
}
#[allow(dead_code)]
impl Search {
    fn new(connection: redis::aio::MultiplexedConnection) -> Self {
        Self { connection }
    }
    pub async fn create(
        &mut self,
        index: String,
        index_type: String,
        schema_fields: Vec<FTSchemaField>,
        parameters: Option<FTCreateParameters>,
    ) -> Result<String, error::Error> {
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
                if skip_initial_scan {
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
        Ok(cmd.query_async(&mut self.connection).await?)
    }
    pub async fn search(
        &mut self,
        index: String,
        query: String,
        parameters: Option<FTSearchParameters>,
    ) -> Result<FTSearchResult, error::Error> {
        let mut cmd = redis::cmd("FT.SEARCH");
        cmd.arg(index).arg(query);

        if let Some(parameters) = parameters {
            if let Some(no_content) = parameters.no_content {
                if no_content {
                    cmd.arg("NOCONTENT");
                }
            }
            if let Some(verbatim) = parameters.verbatim {
                if verbatim {
                    cmd.arg("VERBATIM");
                }
            }
            if let Some(no_stop_words) = parameters.no_stop_words {
                if no_stop_words {
                    cmd.arg("NOSTOPWORDS");
                }
            }
            if let Some(with_scores) = parameters.with_scores {
                if with_scores {
                    cmd.arg("WITHSCORES");
                }
            }
            if let Some(with_payloads) = parameters.with_payloads {
                if with_payloads {
                    cmd.arg("WITHPAYLOADS");
                }
            }
            if let Some(with_sort_keys) = parameters.with_sort_keys {
                if with_sort_keys {
                    cmd.arg("WITHSORTKEYS");
                }
            }
            if let Some(filter) = parameters.filter {
                cmd.arg("FILTER")
                    .arg(filter.field)
                    .arg(filter.min.to_string())
                    .arg(filter.max.to_string());
            }
            if let Some(geo_filter) = parameters.geo_filter {
                cmd.arg("GEOFILTER")
                    .arg(geo_filter.field)
                    .arg(geo_filter.lon.to_string())
                    .arg(geo_filter.lat.to_string())
                    .arg(geo_filter.radius.to_string())
                    .arg(geo_filter.measurement);
            }
            if let Some(in_keys) = parameters.in_keys {
                cmd.arg("INKEYS")
                    .arg(in_keys.num.to_string())
                    .arg(in_keys.field);
            }
            if let Some(in_fields) = parameters.in_fields {
                cmd.arg("INFIELDS")
                    .arg(in_fields.num.to_string())
                    .arg(in_fields.field);
            }
            if let Some(return_param) = parameters.return_param {
                cmd.arg("RETURN").arg(return_param.num.to_string());
                if let Some(fields) = return_param.fields {
                    for field in fields {
                        cmd.arg(field.name).arg("AS").arg(field.as_type);
                    }
                }
            }
            if let Some(summarize) = parameters.summarize {
                cmd.arg("SUMMARIZE");
                if let Some(fields) = summarize.fields {
                    cmd.arg("FIELDS");
                    for field in fields {
                        cmd.arg(field.num.to_string()).arg(field.field);
                    }
                }
                cmd.arg("FRAGS").arg(summarize.frags.to_string());
                cmd.arg("LEN").arg(summarize.len.to_string());
                cmd.arg("SEPARATOR").arg(summarize.seperator);
            }
            if let Some(highlight) = parameters.highlight {
                cmd.arg("HIGHLIGHT");
                if let Some(fields) = highlight.fields {
                    cmd.arg("FIELDS");
                    for field in fields {
                        cmd.arg(field.num.to_string()).arg(field.field);
                    }
                }
                if let Some(tags) = highlight.tags {
                    cmd.arg("TAGS");
                    for tag in tags {
                        cmd.arg(tag.open).arg(tag.close);
                    }
                }
            }
            if let Some(slop) = parameters.slop {
                cmd.arg("SLOP").arg(slop.to_string());
            }
            if let Some(in_order) = parameters.in_order {
                if in_order {
                    cmd.arg("INORDER");
                }
            }
            if let Some(language) = parameters.language {
                cmd.arg("LANGUAGE").arg(language);
            }
            if let Some(expander) = parameters.expander {
                cmd.arg("EXPANDER").arg(expander);
            }
            if let Some(scorer) = parameters.scorer {
                cmd.arg("SCORER").arg(scorer);
            }
            if let Some(explain_score) = parameters.explain_score {
                if explain_score {
                    cmd.arg("EXPLAINSCORE");
                }
            }
            if let Some(payload) = parameters.payload {
                cmd.arg("PAYLOAD").arg(payload);
            }
            if let Some(sort_by) = parameters.sort_by {
                cmd.arg("SORTBY").arg(sort_by.field).arg(sort_by.sort);
            }
            if let Some(limit) = parameters.limit {
                cmd.arg("LIMIT")
                    .arg(limit.first.to_string())
                    .arg(limit.num.to_string());
            }
        }
        Ok(cmd.query_async(&mut self.connection).await?)
    }
    pub async fn alter(
        &mut self,
        index: String,
        field: String,
        field_type: String,
        options: Option<FTFieldOptions>,
    ) -> Result<String, error::Error> {
        let mut cmd = redis::cmd("FT.ALTER");
        cmd.arg(index)
            .arg("SCHEMA")
            .arg("ADD")
            .arg(field)
            .arg(field_type);
        if let Some(options) = options {
            if let Some(sortable) = options.sortable {
                if sortable {
                    cmd.arg("SORTABLE");
                }
            }
            if let Some(noindex) = options.noindex {
                if noindex {
                    cmd.arg("NOINDEX");
                }
            }
            if let Some(nostem) = options.nostem {
                if nostem {
                    cmd.arg("NOSTEM");
                }
            }
            if let Some(phonetic) = options.phonetic {
                cmd.arg("PHONETIC").arg(phonetic);
            }
            if let Some(separator) = options.separator {
                cmd.arg("SEPARATOR").arg(separator);
            }
            if let Some(weight) = options.weight {
                cmd.arg("WEIGHT").arg(weight.to_string());
            }
        }
        Ok(cmd.query_async(&mut self.connection).await?)
    }
    pub async fn dropindex(
        &mut self,
        index: String,
        delete_hash: bool,
    ) -> Result<String, error::Error> {
        let mut cmd = redis::cmd("FT.DROPINDEX");
        cmd.arg(index);
        if delete_hash {
            cmd.arg("DD");
        }
        Ok(cmd.query_async(&mut self.connection).await?)
    }
    pub async fn tagvals(
        &mut self,
        index: String,
        field: String,
    ) -> Result<Vec<String>, error::Error> {
        let mut cmd = redis::cmd("FT.TAGVALS");
        cmd.arg(index).arg(field);
        Ok(cmd.query_async(&mut self.connection).await?)
    }
}

#[derive(Clone, Debug)]
pub struct RedisContext {
    client: redis::Client,
}
#[allow(dead_code)]
impl RedisContext {
    pub fn new() -> Result<Self, error::Error> {
        crate::console_log!("Creating Redis context...");

        let url = match std::env::var("REDIS_URL") {
            Ok(url) => url,
            Err(_error) => "redis://0.0.0.0:6379".to_string(),
        };
        let client = redis::Client::open(url)?;
        let instance = Self { client };
        Ok(instance)
    }
    pub async fn main(&self) -> Result<redis::aio::MultiplexedConnection, error::Error> {
        Ok(self.client.get_multiplexed_tokio_connection().await?)
    }
    pub async fn search(&self) -> Result<Search, error::Error> {
        Ok(Search::new(self.main().await?.clone()))
    }
    pub async fn json(&self) -> Result<JSON, error::Error> {
        Ok(JSON::new(self.main().await?.clone()))
    }
}
