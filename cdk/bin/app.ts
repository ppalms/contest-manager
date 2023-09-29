#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Accounts } from '../accounts';
import { PipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App({ context: { appName: 'contest-manager' } });
const accounts = Accounts.load();

new PipelineStack(app, 'ContestManagerPipelineStack', {
  owner: process.env.GITHUB_OWNER!,
  repository: process.env.GITHUB_REPO!,
  branch: process.env.GITHUB_BRANCH!,
  githubTokenName: process.env.GITHUB_TOKEN_NAME!,
  env: {
    account: accounts.toolchain!.accountId,
    region: process.env.AWS_REGION,
  },
});

// Uncomment to use yarn deploy command
// new AppStack(app, 'ContestManagerStack', {});

app.synth();
