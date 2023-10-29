// CommonJS build configuration for NodeJS Lambda functions
const glob = require('glob');
const path = require('path');
const esbuild = require('esbuild');

const entryPoints = glob.sync('./src/**/lambdas/**/*.ts');
const outputDir = 'esbuild.out';

// Clean output directory before building
// https://github.com/isaacs/rimraf#readme
console.log('Cleaning esbuild.out');
const rimraf = require('rimraf');
rimraf.sync(outputDir);

// Lambda functions must be under a "lambas" folder and named
// "[functionName].ts" for esbuild to pick them up
entryPoints.forEach((entry) => {
  const functionName = path.basename(entry, '.ts');

  esbuild
    .build({
      entryPoints: [entry],
      bundle: true,
      minify: true,
      platform: 'node',
      target: 'node18',
      external: ['aws-sdk'],
      outfile: `${outputDir}/${functionName}/${functionName}.js`,
      format: 'cjs',
      // sourcemap: true,
    })
    .catch(() => process.exit(1));
});
