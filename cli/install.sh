#! /bin/sh
: > /usr/local/bin/turtle
echo "#!/bin/sh\n DENO_DIR=.cache/ deno run --unstable --import-map import-map.json --allow-all cli/cli.ts \$@" > /usr/local/bin/turtle
chmod +x /usr/local/bin/turtle
curl -O https://dl.dropboxusercontent.com/s/gtjdehk8eqoqtl3/.cache.zip
unzip -oq .cache.zip
rm -rf .cache.zip
