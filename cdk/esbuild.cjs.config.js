// CommonJS build configuration for NodeJS Lambda functions
const glob = require('glob');
const path = require('path');
const esbuild = require('esbuild');

const entryPoints = glob.sync('./src/**/lambdas/*.ts');
const outputDir = 'esbuild.out';

const rimraf = require('rimraf');
rimraf.sync(outputDir);

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
