#!/bin/sh
echo "#!/bin/sh\n DENO_DIR=.cache/ deno run --unstable --import-map import-map.json --allow-all cli/cli.ts \$@" > /usr/local/bin/turtle
chmod +x /usr/local/bin/turtle
curl -O https://dl.dropboxusercontent.com/s/g7sy2qc69xdj3db/.cache.zip
unzip -oq .cache.zip
rm -rf .cache.zip
