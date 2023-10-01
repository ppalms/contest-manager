import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  CodePipelineSource,
  CodeBuildStep,
  CodePipeline,
  ManualApprovalStep,
} from 'aws-cdk-lib/pipelines';
import { ContestManagerStage } from './pipeline-stage';
import { Account, Accounts } from '../accounts';

const accounts = Accounts.load();

export interface EnvironmentConfig {
  name: string;
  account: Account;
  region: string;
}

export interface PipelineProps extends StackProps {
  readonly owner: string;
  readonly repository: string;
  readonly branch: string;
  readonly githubTokenName: string;
}

export const Dev: EnvironmentConfig = {
  name: 'Dev',
  account: accounts.development!,
  region: 'us-east-1',
};

export const Prod: EnvironmentConfig = {
  name: 'Prod',
  account: accounts.production!,
  region: 'us-east-1',
};

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: PipelineProps) {
    super(scope, id, props);

    const githubRepo = `${props.owner}/${props.repository}`;

    const source = CodePipelineSource.gitHub(githubRepo, props.branch, {
      authentication: SecretValue.secretsManager(props.githubTokenName),
    });

    const synth = new CodeBuildStep('SynthStep', {
      input: source,
      commands: [
        'cd cdk && yarn install --frozen-lockfile',
        'npm run build:cjs',
        'npx cdk synth',
      ],
      primaryOutputDirectory: 'cdk/cdk.out',
    });

    const pipeline = new CodePipeline(this, 'ContestManagerPipeline', {
      pipelineName: 'ContestManagerPipeline',
      synth: synth,
      crossAccountKeys: true,
    });

    pipeline.addStage(
      new ContestManagerStage(this, 'ContestManagerDevStage', {
        stageName: Dev.name,
        config: Dev,
        env: {
          account: Dev.account.accountId,
          region: Dev.region,
        },
      })
    );

    pipeline.addStage(
      new ContestManagerStage(this, 'ContestManagerProdStage', {
        stageName: Prod.name,
        config: Prod,
        env: {
          account: Prod.account.accountId,
          region: Prod.region,
        },
      }),
      {
        pre: [
          new ManualApprovalStep('ApproveDeploy', {
            comment: 'Please approve the deployment',
          }),
        ],
      }
    );
  }
}
