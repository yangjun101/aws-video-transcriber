import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface VideoTranscriberStackProps extends cdk.StackProps {
  transcribeLanguage: string;
  environment: string;
  retentionDays?: number;
}

export class VideoTranscriberStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: VideoTranscriberStackProps) {
    super(scope, id, props);

    // TODO: Add constructs here
    // This is a placeholder stack that will be populated with:
    // - Storage Construct (S3 buckets and DynamoDB tables)
    // - IAM Construct (roles and policies)
    // - Lambda Construct (all Lambda functions)
    // - API Construct (API Gateway)
    // - CDN Construct (CloudFront distribution)

    // Output important values
    new cdk.CfnOutput(this, 'StackName', {
      value: this.stackName,
      description: 'Stack name',
    });

    new cdk.CfnOutput(this, 'Region', {
      value: this.region,
      description: 'AWS Region',
    });

    new cdk.CfnOutput(this, 'TranscribeLanguage', {
      value: props.transcribeLanguage,
      description: 'Transcribe language setting',
    });
  }
}
