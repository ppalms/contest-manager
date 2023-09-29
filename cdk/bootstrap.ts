#!/usr/bin/env ts-node
import * as child from 'child_process';
import { prompts } from 'prompts';
import { STS } from '@aws-sdk/client-sts';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { loadSharedConfigFiles } from '@aws-sdk/shared-ini-file-loader';
import { Account, Accounts } from './accounts';

export interface EnvironmentConfig {
  name: string;
  account: Account;
  region?: string;
}

async function main() {
  const accounts = Accounts.load();

  const Network: EnvironmentConfig = {
    name: 'Network',
    account: accounts.network!,
  };

  const Dev: EnvironmentConfig = {
    name: 'Dev',
    account: accounts.development!,
  };

  const Prod: EnvironmentConfig = {
    name: 'Prod',
    account: accounts.production!,
  };

  // make sure all accounts are setup
  for (const accountName of [
    'toolchain',
    'network',
    'development',
    'production',
  ] as const) {
    const account = accounts[accountName];
    accounts[accountName] = await promptAccount(
      `Select AWS profile for '${accountName}' account`,
      account?.profile
    );
  }

  Network.account = accounts.network!;
  Dev.account = accounts.development!;
  Prod.account = accounts.production!;

  accounts.store();

  const commands: string[] = [];

  // bootstrap toolchain
  const toolchainRegion = await getRegion(accounts.toolchain!.profile);
  const toolchainAccountId = accounts.toolchain!.accountId;
  commands.push(
    `npx cdk bootstrap --profile ${
      accounts.toolchain!.profile
    } --cloudformation-execution-policies=arn:aws:iam::aws:policy/AdministratorAccess aws://${toolchainAccountId}/${toolchainRegion}`
  );

  for (let account of [Network, Dev, Prod]) {
    // const accountRegions = account.waves
    //   .flatMap((w: any[]) =>
    //     w.map((r: any) => `aws://${account.account?.accountId}/${r}`)
    //   )
    //   .join(' ');

    // commands.push(
    //   `npx cdk bootstrap --profile ${
    //     account.account!.profile
    //   } --trust ${toolchainAccountId} --cloudformation-execution-policies USES_DpraCfnExecutionPolicy_IN_TEMPLATE --template ./infrastructure/src/dpra_bootstrap_template.yaml ${accountRegions}`
    // );

    commands.push(
      `npx cdk bootstrap --profile ${
        account.account!.profile
      } --trust ${toolchainAccountId} --cloudformation-execution-policies=arn:aws:iam::aws:policy/AdministratorAccess aws://${
        account.account!.accountId
      }/us-east-1`
    );
  }

  for (let command of commands) {
    console.log(command);
    const commandParts = command.split(/\s+/);
    const resp = child.spawnSync(commandParts[0], commandParts.slice(1), {
      stdio: 'inherit',
    });
    if (resp.status !== 0) {
      throw new Error(`${resp.status} - Error`);
    }
  }
}

async function promptAccount(
  message: string,
  initialProfile?: string
): Promise<Account> {
  const profile = await promptProfile(message, initialProfile);
  const accountId = await getAccountId(profile);

  return {
    profile,
    accountId,
  };
}

async function promptProfile(
  message: string,
  initialProfile?: string
): Promise<string> {
  const config = await loadSharedConfigFiles();
  const profiles = Object.keys(config.configFile).sort();
  if (profiles.length == 0) {
    throw new Error('You must have AWS CLI profiles defined');
  }
  let initial = initialProfile ? profiles.indexOf(initialProfile) : undefined;
  if (initial === -1) {
    initial = undefined;
  }
  const profile = (await prompts.select({
    type: 'select',
    name: 'profile',
    message,
    initial,
    choices: profiles.map((k) => ({ title: k, value: k })),
  })) as unknown as string;

  return profile;
}

async function getAccountId(profile: string): Promise<string> {
  const client = new STS({
    credentials: fromNodeProviderChain({ profile }),
  });

  return (await client.getCallerIdentity({})).Account!;
}

async function getRegion(profile: string): Promise<string> {
  const client = new STS({
    credentials: fromNodeProviderChain({ profile }),
  });

  return client.config.region();
}

main().catch(console.error);
