#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Account, Accounts } from '../accounts';
import { PipelineStack } from '../lib/pipeline-stack';
import { AppStack } from '../lib/app-stack';

const app = new cdk.App({ context: { appName: 'contest-manager' } });
const accounts = Accounts.load();

export interface EnvironmentConfig {
  account: Account;
  region: string;
}

const Dev: EnvironmentConfig = {
  account: accounts.development!,
  region: 'us-east-1',
};

const Prod: EnvironmentConfig = {
  account: accounts.production!,
  region: 'us-east-1',
};

new PipelineStack(app, 'ContestManagerPipelineStack', {
  owner: 'ppalms',
  repository: 'contest-manager',
  branch: 'main',
  githubTokenName: 'cm-contest-manager-deploy-token',
  devConfig: Dev,
  prodConfig: Prod,
  env: {
    account: accounts.toolchain!.accountId,
    region: 'us-east-1',
  },
});

// Uncomment to use yarn deploy command
// new AppStack(app, 'ContestManagerStack', {});

app.synth();
