import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { VideoTranscriberStack } from '../lib/video-transcriber-stack';

describe('VideoTranscriberStack', () => {
  test('Stack creates successfully', () => {
    const app = new cdk.App();
    
    const stack = new VideoTranscriberStack(app, 'TestStack', {
      transcribeLanguage: 'en-US',
      environment: 'test',
    });
    
    const template = Template.fromStack(stack);
    
    // Basic validation - stack should be created
    expect(template).toBeDefined();
  });

  test('Stack has correct outputs', () => {
    const app = new cdk.App();
    
    const stack = new VideoTranscriberStack(app, 'TestStack', {
      transcribeLanguage: 'zh-CN',
      environment: 'dev',
    });
    
    const template = Template.fromStack(stack);
    
    // Check for expected outputs
    template.hasOutput('StackName', {});
    template.hasOutput('Region', {});
    template.hasOutput('TranscribeLanguage', {});
  });
});
