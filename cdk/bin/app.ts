#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AppStack } from '../lib/app-stack';
import { Accounts } from '../accounts';
import { PipelineStack } from '../lib/pipeline-stack';

const appName = 'contest-manager';
const app = new cdk.App({ context: { appName } });
const accounts = Accounts.load();

new PipelineStack(app, 'ContestManagerPipelineStack', {
  owner: 'ppalms',
  repository: 'contest-manager',
  branch: 'main',
  githubTokenName: 'cm-contest-manager-deploy-token',
  env: {
    account: accounts.toolchain!.accountId,
    region: 'us-east-1',
  },
});

// Uncomment to use yarn deploy command
// new AppStack(app, 'ContestManagerStack', {});

app.synth();
