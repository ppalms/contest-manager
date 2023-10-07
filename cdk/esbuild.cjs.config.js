// CommonJS build configuration for NodeJS Lambda functions
const glob = require('glob');
const path = require('path');
const esbuild = require('esbuild');

const entryPoints = glob.sync('./src/**/lambdas/*.ts');

entryPoints.forEach((entry) => {
  const filename = path.basename(entry, '.ts');

  esbuild
    .build({
      entryPoints: [entry],
      bundle: true,
      minify: true,
      platform: 'node',
      target: 'node18',
      outfile: `esbuild.out/${filename}/${filename}.js`,
      format: 'cjs',
    })
    .catch(() => process.exit(1));
});
