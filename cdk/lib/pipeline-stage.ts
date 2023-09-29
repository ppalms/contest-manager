import { Stack, Stage, StageProps } from 'aws-cdk-lib';
import { EnvironmentConfig } from './pipeline-stack';
import { AppStack } from './app-stack';

export interface ContestManagerStageProps extends StageProps {
  config: EnvironmentConfig;
}

export class ContestManagerStage extends Stage {
  constructor(scope: Stack, id: string, props: ContestManagerStageProps) {
    super(scope, id, props);

    if (!props.stageName) {
      throw new Error('stageName is required');
    }

    if (this.account !== props.config.account.accountId) {
      throw new Error(
        'Environment config must match the pipeline stage account'
      );
    }

    console.log(`Deploying ContestManagerStack to ${props.env!.account}`);

    new AppStack(this, 'ContestManagerStack', {
      env: {
        account: props.config.account.accountId,
        region: props.config.region,
      },
    });
  }
}
