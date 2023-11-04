#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Account, Accounts } from '../accounts';
import { PipelineStack } from '../lib/pipeline-stack';
import { AppStack } from '../lib/app-stack';

require('dotenv').config();
const app = new cdk.App({ context: { appName: 'contest-manager' } });
const accounts = Accounts.load();

export interface EnvironmentConfig {
  account: Account;
  region: string;
}

const Dev: EnvironmentConfig = {
  account: accounts.development!,
  region: process.env.AWS_REGION!,
};

const Prod: EnvironmentConfig = {
  account: accounts.production!,
  region: process.env.AWS_REGION!,
};

new PipelineStack(app, 'ContestManagerPipelineStack', {
  owner: process.env.GITHUB_OWNER!,
  repository: process.env.GITHUB_REPO!,
  branch: process.env.GITHUB_BRANCH!,
  githubTokenName: process.env.GITHUB_TOKEN_NAME!,
  devConfig: Dev,
  prodConfig: Prod,
  env: {
    account: accounts.toolchain!.accountId,
    region: process.env.AWS_REGION,
  },
});

// Uncomment to use yarn deploy command
// new AppStack(app, 'ContestManagerStack', {});

app.synth();
