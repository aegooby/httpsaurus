
FROM ubuntu:latest

# Setup
ENV DEBIAN_FRONTEND="noninteractive"
RUN apt-get update
RUN apt-get install -y curl unzip nodejs npm git --no-install-recommends

# Deno
RUN curl -fsSL https://deno.land/x/install/install.sh | DENO_INSTALL=/usr/local sh

# Yarn & Node
RUN npm install --global yarn
RUN npm install --global n
RUN n latest
