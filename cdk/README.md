# Video Transcriber CDK

AWS CDK implementation of the Video Transcriber solution - a serverless framework for generating and editing closed captions for video content.

## Prerequisites

- Node.js >= 18.x
- AWS CLI configured with appropriate credentials
- AWS CDK CLI: `npm install -g aws-cdk`

## Project Structure

```
cdk/
├── bin/
│   └── video-transcriber.ts          # CDK app entry point
├── lib/
│   ├── video-transcriber-stack.ts    # Main stack
│   ├── constructs/                   # Reusable constructs
│   │   ├── storage-construct.ts      # S3 and DynamoDB
│   │   ├── iam-construct.ts          # IAM roles and policies
│   │   ├── lambda-construct.ts       # Lambda functions
│   │   ├── api-construct.ts          # API Gateway
│   │   └── cdn-construct.ts          # CloudFront
│   ├── config/                       # Configuration files
│   │   ├── lambda-config.ts          # Lambda configurations
│   │   ├── api-config.ts             # API endpoint configurations
│   │   └── environment-config.ts     # Environment settings
│   └── utils/                        # Utility functions
│       ├── naming.ts                 # Resource naming utilities
│       └── constants.ts              # Shared constants
├── test/                             # Unit tests
├── cdk.json                          # CDK configuration
├── package.json                      # Dependencies
└── tsconfig.json                     # TypeScript configuration
```

## Installation

```bash
cd cdk
npm install
```

## Usage

### Synthesize CloudFormation Template

```bash
npm run synth
```

### Deploy to AWS

```bash
# Deploy with default settings (zh-CN language, dev environment)
npm run deploy

# Deploy with custom language
npm run deploy -- -c transcribeLanguage=en-US

# Deploy to production environment
npm run deploy -- -c environment=prod
```

### View Differences

```bash
npm run diff
```

### Destroy Stack

```bash
npm run destroy
```

## Configuration

### Environment Variables

- `CDK_DEFAULT_ACCOUNT`: AWS account ID (auto-detected)
- `CDK_DEFAULT_REGION`: AWS region (default: us-east-1)

### Context Parameters

Pass these via `-c` flag:

- `transcribeLanguage`: Language for transcription (default: zh-CN)
- `environment`: Deployment environment - dev/staging/prod (default: dev)

Example:
```bash
cdk deploy -c transcribeLanguage=en-US -c environment=prod
```

## Architecture

The solution consists of:

1. **Storage Layer**
   - S3 buckets for video, audio, transcriptions, and web UI
   - DynamoDB tables for video metadata, captions, and configuration

2. **Compute Layer**
   - 27+ Lambda functions for video processing, transcription, and API operations

3. **API Layer**
   - API Gateway REST API with 15+ endpoints

4. **Content Delivery**
   - CloudFront distribution for web UI

5. **Security**
   - IAM roles and policies with least privilege access

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

### Run Tests

```bash
npm test
```

## Comparison with CloudFormation

| Aspect | CloudFormation | CDK |
|--------|---------------|-----|
| Lines of Code | 3253 lines | ~800-1000 lines |
| Language | YAML | TypeScript |
| Type Safety | None | Full |
| Code Reuse | Limited | High |
| Testing | Difficult | Built-in |
| IDE Support | Basic | Full IntelliSense |

## License

Apache-2.0
