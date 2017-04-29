#!/usr/bin/env bash

. shell-scripts/parse_yaml.sh

if [ ! -f secret-dev.yml ]; then
  echo -e "${RED}Error: no secret-dev.yml file found!"
  exit 0
fi

# read yaml file
eval $(parse_yaml secret-dev.yml)

ts-node --compilerOptions '{"module": "commonjs", "target":"es2015"}' "$@"
