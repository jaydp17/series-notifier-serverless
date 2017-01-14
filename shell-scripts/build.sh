rm -rf build
babel src -d build --source-maps
cp -r src/node_modules build/node_modules
