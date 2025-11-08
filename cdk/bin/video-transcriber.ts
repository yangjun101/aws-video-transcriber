#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VideoTranscriberStack } from '../lib/video-transcriber-stack';

const app = new cdk.App();

// Get configuration from context or use defaults
const transcribeLanguage = app.node.tryGetContext('transcribeLanguage') || 'zh-CN';
const environment = app.node.tryGetContext('environment') || 'dev';

new VideoTranscriberStack(app, 'VideoTranscriberStack', {
  transcribeLanguage,
  environment,
  
  // Stack properties
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  
  description: 'Video Transcriber - Serverless video transcription and captioning solution',
  
  tags: {
    Project: 'VideoTranscriber',
    Environment: environment,
    ManagedBy: 'CDK',
  },
});

app.synth();
