import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  CodePipelineSource,
  CodeBuildStep,
  CodePipeline,
  ManualApprovalStep,
} from 'aws-cdk-lib/pipelines';
import { ContestManagerStage } from './pipeline-stage';
import { EnvironmentConfig } from '../bin/app';

export interface PipelineProps extends StackProps {
  readonly owner: string;
  readonly repository: string;
  readonly branch: string;
  readonly githubTokenName: string;
  readonly devConfig: EnvironmentConfig;
  readonly prodConfig: EnvironmentConfig;
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: PipelineProps) {
    super(scope, id, props);

    const {
      owner,
      repository,
      branch,
      githubTokenName,
      devConfig: Dev,
      prodConfig: Prod,
    } = props;

    const githubRepo = `${owner}/${repository}`;
    const source = CodePipelineSource.gitHub(githubRepo, branch, {
      authentication: SecretValue.secretsManager(githubTokenName),
    });

    const synth = new CodeBuildStep('SynthStep', {
      input: source,
      commands: [
        'cd cdk && yarn install --frozen-lockfile',
        'npx tsc --noEmit',
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
        stageName: 'Dev',
        config: Dev,
        env: {
          account: Dev.account.accountId,
          region: Dev.region,
        },
      })
    );

    pipeline.addStage(
      new ContestManagerStage(this, 'ContestManagerProdStage', {
        stageName: 'Prod',
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
