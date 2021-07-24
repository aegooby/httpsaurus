FROM redis:latest

EXPOSE 6379

ENV DEBIAN_FRONTEND="noninteractive"
RUN apt-get update
RUN apt-get install -y curl unzip git build-essential ca-certificates python2 clang --no-install-recommends
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /root

RUN git clone --recursive --single-branch --branch 2.2 https://github.com/RediSearch/RediSearch.git
RUN git clone --recursive --single-branch --branch 2.0 https://github.com/RedisJSON/RedisJSON.git

WORKDIR /root/RediSearch
RUN make setup
RUN make build
ENV REDIS_SEARCH="/root/RediSearch/build/redisearch.so"

WORKDIR /root/RedisJSON
RUN cargo build --release
ENV REDIS_JSON="/root/RedisJSON/target/release/librejson.so"

WORKDIR /root
RUN mkdir -p /usr/local/lib/redis
RUN cp -r ${REDIS_SEARCH} /usr/local/lib/redis/libsearch.so
RUN cp -r ${REDIS_JSON} /usr/local/lib/redis/libjson.so
