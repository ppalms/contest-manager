// CommonJS build configuration for NodeJS Lambda functions
const entryPoints = require('glob').sync('./src/authorizer.ts');

require('esbuild')
  .build({
    entryPoints: entryPoints,
    bundle: true,
    platform: 'node',
    target: 'node18',
    outdir: 'esbuild.out',
    format: 'cjs',
  })
  .catch(() => process.exit(1));
