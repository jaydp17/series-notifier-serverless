/**
 * Transpiles the code first with TypeScript
 * and then gives it to babelJest
 */

// ref : https://github.com/facebook/jest/issues/1466

const tsc = require('typescript');
const babelJest = require('babel-jest');

module.exports = {
  process(src, path) {
    const isTs = path.endsWith('.ts');
    const isTsx = path.endsWith('.tsx');

    if (isTs || isTsx) {
      src = tsc.transpileModule(src, {
        compilerOptions: {
          module: tsc.ModuleKind.ES2015,
          target: tsc.ScriptTarget.ESNext,
          moduleResolution: tsc.ModuleResolutionKind.Node,
          allowSyntheticDefaultImports: true,
          jsx: tsc.JsxEmit.Preserve,
          sourceMap: true,
          outDir: './dist/',
        },
        exclude: ['node_modules'],
        fileName: path,
      });
      src = src.outputText;

      // update the path so babel can try and process the output
      path = path.substr(0, path.lastIndexOf('.')) + (isTs ? '.js' : '.jsx') || path;
    }

    if (path.endsWith('.js') || path.endsWith('.jsx')) {
      src = babelJest.process(src, path);
    }
    // console.log('src', src);
    return src;
  },
};
