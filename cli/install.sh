#! /bin/sh
deno install --allow-all --unstable --name turtle --root /usr/local cli/cli.ts
curl -O https://dl.dropboxusercontent.com/s/g7sy2qc69xdj3db/.cache.zip
unzip -oq .cache.zip
rm -rf .cache.zip
