#!/usr/bin/env bash

. shell-scripts/parse_yaml.sh

fileName="secret-dev.yml"

if [ "${NODE_ENV}" == "production" ]; then
  fileName="secret-production.yml"
fi

if [ ! -f ${fileName} ]; then
  echo -e "${RED}Error: no ${fileName} file found!"
  exit 0
fi

# read yaml file
eval $(parse_yaml ${fileName})

ts-node --compilerOptions '{"module": "commonjs", "target":"es2015"}' "$@"
