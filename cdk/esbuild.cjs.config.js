// CommonJS build configuration for NodeJS Lambda functions
// TODO move lambdas into individual directories; e.g., authorizer/handler.ts
const entryPoints = require('glob').sync('./src/lambdas/*.ts');

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
