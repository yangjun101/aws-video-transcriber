# Design Document

## Overview

This design document outlines the architecture and implementation approach for migrating the Video Transcriber solution from CloudFormation templates to AWS CDK using TypeScript. The migration will transform a monolithic 3000+ line YAML template into a modular, maintainable, and type-safe infrastructure-as-code solution.

The CDK implementation will leverage TypeScript's type system, object-oriented programming principles, and CDK's high-level constructs to create a more developer-friendly infrastructure codebase while maintaining 100% feature parity with the existing CloudFormation deployment.

## Architecture

### High-Level Architecture

The Video Transcriber system consists of the following major components:

1. **Compute Layer**: 27+ Lambda functions handling video processing, transcription, translation, and API operations
2. **Storage Layer**: 4 S3 buckets (video, audio, transcribe, public) and 3 DynamoDB tables (video, caption, config)
3. **API Layer**: API Gateway REST API with 15+ endpoints
4. **Content Delivery**: CloudFront distribution serving the web UI
5. **Security Layer**: IAM roles and policies for service-to-service communication
6. **Monitoring**: CloudWatch Log Groups for all Lambda functions

### CDK Project Structure

```
cdk/
├── bin/
│   └── video-transcriber.ts          # CDK app entry point
├── lib/
│   ├── video-transcriber-stack.ts    # Main stack orchestrator
│   ├── constructs/
│   │   ├── lambda-construct.ts       # Reusable Lambda construct
│   │   ├── storage-construct.ts      # S3 and DynamoDB resources
│   │   ├── api-construct.ts          # API Gateway configuration
│   │   ├── cdn-construct.ts          # CloudFront distribution
│   │   └── iam-construct.ts          # IAM roles and policies
│   ├── config/
│   │   ├── lambda-config.ts          # Lambda function configurations
│   │   ├── api-config.ts             # API endpoint configurations
│   │   └── environment-config.ts     # Environment-specific settings
│   └── utils/
│       ├── naming.ts                 # Resource naming utilities
│       └── constants.ts              # Shared constants
├── test/
│   ├── video-transcriber.test.ts     # Stack tests
│   └── constructs/
│       └── *.test.ts                 # Construct unit tests
├── cdk.json                          # CDK configuration
├── package.json                      # Dependencies
└── tsconfig.json                     # TypeScript configuration
```

## Components and Interfaces

### 1. Main Stack (VideoTranscriberStack)

The main stack acts as an orchestrator, composing all constructs together.

**Responsibilities:**
- Initialize all constructs in the correct order
- Pass dependencies between constructs
- Export important outputs (API URL, CloudFront URL, etc.)
- Handle stack-level configuration

**Key Properties:**
```typescript
interface VideoTranscriberStackProps extends StackProps {
  transcribeLanguage: string;
  environment: 'dev' | 'staging' | 'prod';
  retentionDays?: number;
}
```

**Construct Composition:**
```typescript
class VideoTranscriberStack extends Stack {
  constructor(scope: Construct, id: string, props: VideoTranscriberStackProps) {
    // 1. Create storage resources (S3, DynamoDB)
    const storage = new StorageConstruct(this, 'Storage', {...});
    
    // 2. Create IAM roles
    const iam = new IAMConstruct(this, 'IAM', {...});
    
    // 3. Create Lambda functions
    const lambdas = new LambdaConstruct(this, 'Lambdas', {
      storage,
      roles: iam.roles,
      ...
    });
    
    // 4. Create API Gateway
    const api = new APIConstruct(this, 'API', {
      lambdas: lambdas.functions,
      ...
    });
    
    // 5. Create CloudFront distribution
    const cdn = new CDNConstruct(this, 'CDN', {
      publicBucket: storage.publicBucket,
      ...
    });
  }
}
```

### 2. Storage Construct

Manages all storage resources including S3 buckets and DynamoDB tables.

**S3 Buckets:**
- **Video Bucket**: Stores uploaded videos, triggers Lambda on upload
- **Audio Bucket**: Stores extracted audio files, triggers transcription
- **Transcribe Bucket**: Stores transcription results and caption files
- **Public Bucket**: Serves web UI through CloudFront

**DynamoDB Tables:**
- **Video Table**: Stores video metadata (videoId, name, status, language, etc.)
- **Caption Table**: Stores caption segments with timestamps
- **Config Table**: Stores vocabulary and system configuration

**Interface:**
```typescript
interface StorageConstructProps {
  environment: string;
  retentionDays?: number;
}

class StorageConstruct extends Construct {
  public readonly videoBucket: s3.Bucket;
  public readonly audioBucket: s3.Bucket;
  public readonly transcribeBucket: s3.Bucket;
  public readonly publicBucket: s3.Bucket;
  
  public readonly videoTable: dynamodb.Table;
  public readonly captionTable: dynamodb.Table;
  public readonly configTable: dynamodb.Table;
}
```

**Key Design Decisions:**
- Use `removalPolicy: RemovalPolicy.RETAIN` for production data buckets
- Enable versioning on critical buckets
- Configure CORS for buckets accessed from web UI
- Use encryption at rest for all storage resources
- Set up S3 event notifications to trigger Lambda functions

### 3. Lambda Construct

Creates and configures all Lambda functions using a factory pattern to reduce code duplication.

**Lambda Function Categories:**
1. **Video Processing**: extractaudio, burncaption
2. **Transcription**: transcribeaudio, createcaptions
3. **Translation**: translatecaptions
4. **API Handlers**: getvideos, getvideo, updatevideo*, deletevideo, etc.
5. **Utility**: bootstrap, customresource, batchcomplete

**Interface:**
```typescript
interface LambdaConfig {
  name: string;
  handler: string;
  memorySize: number;
  timeout: Duration;
  environment: Record<string, string>;
  role?: iam.IRole;
  layers?: lambda.ILayerVersion[];
}

interface LambdaConstructProps {
  storage: StorageConstruct;
  roles: IAMRoles;
  transcribeLanguage: string;
  environment: string;
}

class LambdaConstruct extends Construct {
  public readonly functions: Map<string, lambda.Function>;
  
  private createFunction(config: LambdaConfig): lambda.Function;
  private createLogGroup(functionName: string): logs.LogGroup;
}
```

**Key Design Decisions:**
- Use `NodejsFunction` construct for automatic bundling and minification
- Create a factory method to reduce boilerplate
- Store function configurations in a separate config file
- Automatically create CloudWatch Log Groups with retention
- Use environment variables for configuration instead of hardcoding
- Bundle Lambda code from `../source/lambda/{function-name}` directory

**Lambda Function Factory Pattern:**
```typescript
private createFunction(config: LambdaConfig): lambda.Function {
  // Create log group first
  const logGroup = new logs.LogGroup(this, `${config.name}LogGroup`, {
    logGroupName: `/aws/lambda/prod-aws-captions-${config.name}`,
    retention: logs.RetentionDays.ONE_WEEK,
    removalPolicy: RemovalPolicy.DESTROY,
  });
  
  // Create function
  const fn = new lambda.Function(this, config.name, {
    functionName: `prod-aws-captions-${config.name}`,
    runtime: lambda.Runtime.NODEJS_16_X,
    handler: config.handler,
    code: lambda.Code.fromAsset(`../source/lambda/${config.name}`),
    memorySize: config.memorySize,
    timeout: config.timeout,
    environment: config.environment,
    role: config.role,
  });
  
  return fn;
}
```

### 4. IAM Construct

Manages all IAM roles and policies required by the system.

**Roles:**
1. **CommonRoleForLambda**: Used by most Lambda functions for DynamoDB and S3 access
2. **TranscribeRole**: Grants Transcribe service permissions
3. **MediaConvertRole**: Grants MediaConvert service permissions
4. **MediaConvertForLambdaRole**: Allows Lambda to invoke MediaConvert
5. **InvokeLambdaRole**: Allows Lambda to invoke other Lambda functions

**Interface:**
```typescript
interface IAMRoles {
  commonRole: iam.Role;
  transcribeRole: iam.Role;
  mediaConvertRole: iam.Role;
  mediaConvertForLambdaRole: iam.Role;
  invokeLambdaRole: iam.Role;
}

class IAMConstruct extends Construct {
  public readonly roles: IAMRoles;
  
  private createCommonRole(): iam.Role;
  private createTranscribeRole(): iam.Role;
  private createMediaConvertRole(): iam.Role;
}
```

**Key Design Decisions:**
- Use managed policies where appropriate (e.g., `AWSLambdaBasicExecutionRole`)
- Create custom policies for specific resource access
- Follow principle of least privilege
- Use resource-based policies for cross-service access
- Grant permissions at construct level rather than in stack

### 5. API Construct

Creates the API Gateway REST API with all endpoints and integrations.

**API Structure:**
```
/videos (GET)
/video/{videoId} (GET, DELETE, PATCH)
/videostatus/{videoId} (POST)
/videoname/{videoId} (POST)
/videodescription/{videoId} (POST)
/upload (POST)
/caption/{videoId} (GET, PUT)
/burnedvideo/{videoId} (GET)
/vocabulary (GET, PUT, HEAD)
/tweaks (GET, PUT)
/language (PUT)
/batchstart (POST)
/batchcomplete (POST)
/translate (POST)
/burn/{videoId} (POST)
```

**Interface:**
```typescript
interface APIEndpoint {
  path: string;
  method: string;
  lambdaFunction: lambda.Function;
  requestValidator?: boolean;
  requestParameters?: Record<string, boolean>;
}

interface APIConstructProps {
  lambdas: Map<string, lambda.Function>;
  apiName: string;
}

class APIConstruct extends Construct {
  public readonly api: apigateway.RestApi;
  public readonly apiUrl: string;
  
  private createEndpoint(config: APIEndpoint): void;
  private addCorsOptions(resource: apigateway.Resource): void;
}
```

**Key Design Decisions:**
- Use REST API (not HTTP API) for compatibility
- Enable CORS on all endpoints
- Add request validation where appropriate
- Use Lambda proxy integration
- Create a deployment stage automatically
- Export API URL as stack output

### 6. CDN Construct

Creates the CloudFront distribution for serving the web UI.

**Interface:**
```typescript
interface CDNConstructProps {
  publicBucket: s3.Bucket;
  environment: string;
}

class CDNConstruct extends Construct {
  public readonly distribution: cloudfront.Distribution;
  public readonly distributionUrl: string;
  
  private createOriginAccessIdentity(): cloudfront.OriginAccessIdentity;
  private configureCacheBehaviors(): cloudfront.BehaviorOptions;
}
```

**Key Design Decisions:**
- Use Origin Access Identity for secure S3 access
- Configure appropriate cache behaviors for static assets
- Set default root object to `index.html`
- Enable compression
- Configure custom error responses for SPA routing

## Data Models

### DynamoDB Table Schemas

**Video Table:**
```typescript
{
  partitionKey: { name: 'videoId', type: AttributeType.STRING },
  attributes: {
    videoId: string,
    name: string,
    description: string,
    status: string,
    language: string,
    createdAt: number,
    updatedAt: number,
    videoPath: string,
    audioPath: string,
    transcribePath: string,
    burnedVideoPath: string,
  }
}
```

**Caption Table:**
```typescript
{
  partitionKey: { name: 'videoId', type: AttributeType.STRING },
  sortKey: { name: 'startTime', type: AttributeType.NUMBER },
  attributes: {
    videoId: string,
    startTime: number,
    endTime: number,
    text: string,
    language: string,
  }
}
```

**Config Table:**
```typescript
{
  partitionKey: { name: 'configKey', type: AttributeType.STRING },
  attributes: {
    configKey: string,
    configValue: string,
    vocabulary: string[],
    tweaks: object,
  }
}
```

## Error Handling

### Lambda Error Handling
- All Lambda functions should use try-catch blocks
- Errors should be logged to CloudWatch
- API responses should include appropriate HTTP status codes
- Retry logic for transient failures (S3, DynamoDB throttling)

### CDK Error Handling
- Use TypeScript's type system to catch errors at compile time
- Validate configuration before deployment
- Use CDK aspects for cross-cutting concerns
- Implement custom resource error handling

### Deployment Error Handling
- Use CDK rollback on failure
- Implement health checks for critical resources
- Use CloudFormation stack policies for production

## Testing Strategy

### Unit Tests
- Test each construct in isolation
- Mock dependencies using CDK's testing utilities
- Validate resource properties and configurations
- Test naming conventions and tagging

**Example:**
```typescript
test('Lambda function has correct configuration', () => {
  const app = new cdk.App();
  const stack = new VideoTranscriberStack(app, 'TestStack', {
    transcribeLanguage: 'en-US',
    environment: 'test',
  });
  
  const template = Template.fromStack(stack);
  
  template.hasResourceProperties('AWS::Lambda::Function', {
    Runtime: 'nodejs16.x',
    MemorySize: 2048,
    Timeout: 600,
  });
});
```

### Integration Tests
- Deploy to a test environment
- Run end-to-end tests against deployed resources
- Validate API endpoints
- Test video upload and processing workflow

### Snapshot Tests
- Generate CloudFormation template snapshots
- Detect unintended changes in infrastructure
- Review diffs before deployment

**Example:**
```typescript
test('Stack matches snapshot', () => {
  const app = new cdk.App();
  const stack = new VideoTranscriberStack(app, 'TestStack', {
    transcribeLanguage: 'en-US',
    environment: 'test',
  });
  
  expect(Template.fromStack(stack).toJSON()).toMatchSnapshot();
});
```

### Validation Tests
- Validate that CDK-generated CloudFormation matches original template
- Compare resource counts and types
- Verify IAM permissions are equivalent
- Check environment variable configurations

## Build and Deployment Process

### Build Process

1. **TypeScript Compilation**
   ```bash
   npm run build
   ```
   - Compiles TypeScript to JavaScript
   - Runs type checking
   - Generates source maps

2. **Lambda Bundling**
   - CDK automatically bundles Lambda functions using esbuild
   - Minifies code for smaller package size
   - Excludes AWS SDK (already available in Lambda runtime)
   - Includes only production dependencies

3. **Asset Preparation**
   - Web UI assets copied to CDK asset directory
   - Lambda code zipped and uploaded to CDK staging bucket
   - CloudFormation template synthesized

### Deployment Process

1. **Synthesize CloudFormation**
   ```bash
   cdk synth
   ```
   - Generates CloudFormation template from CDK code
   - Validates template structure
   - Outputs template to `cdk.out/` directory

2. **Diff Changes**
   ```bash
   cdk diff
   ```
   - Compares local changes with deployed stack
   - Shows resource additions, modifications, deletions
   - Highlights security-sensitive changes

3. **Deploy Stack**
   ```bash
   cdk deploy --require-approval never
   ```
   - Uploads assets to S3
   - Creates/updates CloudFormation stack
   - Waits for stack completion
   - Outputs important values

4. **Post-Deployment**
   - Upload web UI to public bucket
   - Invalidate CloudFront cache
   - Run smoke tests

### CI/CD Integration

**GitHub Actions / GitLab CI Example:**
```yaml
deploy:
  steps:
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: CDK Synth
      run: npm run cdk synth
    
    - name: CDK Deploy
      run: npm run cdk deploy -- --require-approval never
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## Configuration Management

### Environment-Specific Configuration

**config/environment-config.ts:**
```typescript
export interface EnvironmentConfig {
  transcribeLanguage: string;
  retentionDays: number;
  logLevel: string;
  enableXRay: boolean;
}

export const environments: Record<string, EnvironmentConfig> = {
  dev: {
    transcribeLanguage: 'en-US',
    retentionDays: 3,
    logLevel: 'DEBUG',
    enableXRay: false,
  },
  staging: {
    transcribeLanguage: 'en-US',
    retentionDays: 7,
    logLevel: 'INFO',
    enableXRay: true,
  },
  prod: {
    transcribeLanguage: 'en-US',
    retentionDays: 30,
    logLevel: 'WARN',
    enableXRay: true,
  },
};
```

### Lambda Configuration

**config/lambda-config.ts:**
```typescript
export interface LambdaFunctionConfig {
  name: string;
  handler: string;
  memorySize: number;
  timeout: number;
  role: 'common' | 'transcribe' | 'mediaConvert' | 'invokeLambda';
}

export const lambdaConfigs: LambdaFunctionConfig[] = [
  {
    name: 'extractaudio',
    handler: 'extractaudio.handler',
    memorySize: 2048,
    timeout: 600,
    role: 'mediaConvert',
  },
  {
    name: 'transcribeaudio',
    handler: 'lambda/transcribeaudio.handler',
    memorySize: 512,
    timeout: 15,
    role: 'transcribe',
  },
  // ... more configs
];
```

## Migration Strategy

### Phase 1: Setup and Foundation
1. Initialize CDK project with TypeScript
2. Set up project structure and dependencies
3. Create base constructs and utilities
4. Set up testing framework

### Phase 2: Storage Layer
1. Migrate S3 buckets
2. Migrate DynamoDB tables
3. Configure encryption and policies
4. Set up S3 event notifications

### Phase 3: Compute Layer
1. Create IAM roles
2. Migrate Lambda functions using factory pattern
3. Configure environment variables
4. Set up CloudWatch Log Groups

### Phase 4: API Layer
1. Create API Gateway REST API
2. Define all resources and methods
3. Configure CORS and validation
4. Set up Lambda integrations

### Phase 5: CDN Layer
1. Create CloudFront distribution
2. Configure Origin Access Identity
3. Set up cache behaviors
4. Deploy web UI

### Phase 6: Testing and Validation
1. Run unit tests
2. Deploy to test environment
3. Run integration tests
4. Compare with CloudFormation deployment
5. Validate feature parity

### Phase 7: Documentation and Cleanup
1. Write deployment documentation
2. Create migration guide
3. Document differences from CloudFormation
4. Clean up old build scripts

## Advantages of CDK Approach

### Developer Experience
- **Type Safety**: Catch errors at compile time
- **IDE Support**: Auto-completion and inline documentation
- **Refactoring**: Easy to rename and restructure
- **Code Reuse**: Create reusable constructs and patterns

### Maintainability
- **Modularity**: Separate concerns into constructs
- **DRY Principle**: Eliminate repetitive YAML
- **Version Control**: Better diff and merge capabilities
- **Testing**: Unit and integration tests

### Flexibility
- **Conditionals**: Use if/else for conditional resources
- **Loops**: Generate resources programmatically
- **Functions**: Extract common logic
- **Imports**: Share code across stacks

### Deployment
- **Faster Feedback**: Compile-time validation
- **Better Diffs**: See exactly what will change
- **Asset Management**: Automatic bundling and uploading
- **Rollback**: Built-in rollback on failure

## Comparison: CloudFormation vs CDK

| Aspect | CloudFormation | CDK |
|--------|---------------|-----|
| Lines of Code | 3253 lines | ~800-1000 lines (estimated) |
| Language | YAML | TypeScript |
| Type Safety | None | Full type checking |
| Code Reuse | Limited (nested stacks) | High (constructs, classes) |
| Testing | Difficult | Built-in testing utilities |
| IDE Support | Basic | Full IntelliSense |
| Learning Curve | Low | Medium |
| Flexibility | Limited | High (programming constructs) |
| Maintenance | Difficult for large templates | Easier with modular code |

## Security Considerations

### IAM Permissions
- Use least privilege principle
- Avoid wildcard permissions where possible
- Use resource-based policies for cross-service access
- Regularly audit permissions

### Encryption
- Enable encryption at rest for all storage
- Use AWS managed keys (KMS) for sensitive data
- Enable encryption in transit (HTTPS, TLS)

### Network Security
- Use VPC for Lambda functions if needed
- Configure security groups appropriately
- Use private subnets for sensitive resources

### Secrets Management
- Use AWS Secrets Manager for sensitive configuration
- Never hardcode credentials
- Rotate secrets regularly

### Monitoring and Auditing
- Enable CloudTrail for API auditing
- Set up CloudWatch alarms for anomalies
- Use AWS Config for compliance checking

## Performance Considerations

### Lambda Optimization
- Right-size memory allocation
- Use Lambda layers for shared dependencies
- Enable X-Ray tracing for performance insights
- Implement connection pooling for DynamoDB

### API Gateway
- Enable caching where appropriate
- Use throttling to prevent abuse
- Implement request validation to reduce Lambda invocations

### CloudFront
- Configure appropriate TTLs
- Use compression for static assets
- Implement cache invalidation strategy

### DynamoDB
- Choose appropriate capacity mode (on-demand vs provisioned)
- Design efficient partition keys
- Use GSI/LSI for query patterns
- Enable auto-scaling if using provisioned capacity

## Cost Optimization

### Lambda
- Right-size memory and timeout
- Use ARM architecture (Graviton2) for cost savings
- Implement efficient code to reduce execution time

### Storage
- Use S3 lifecycle policies to transition to cheaper storage classes
- Enable S3 Intelligent-Tiering
- Clean up old transcription files

### API Gateway
- Use caching to reduce Lambda invocations
- Consider HTTP API for lower cost (if REST features not needed)

### DynamoDB
- Use on-demand billing for unpredictable workloads
- Use provisioned capacity with auto-scaling for predictable workloads
- Archive old data to S3

## Future Enhancements

### Potential Improvements
1. **Multi-Stack Architecture**: Separate stacks for different components
2. **Cross-Region Deployment**: Deploy to multiple regions
3. **Blue-Green Deployment**: Zero-downtime deployments
4. **Canary Deployments**: Gradual rollout of changes
5. **Custom Constructs**: Publish reusable constructs to npm
6. **CDK Pipelines**: Automated CI/CD with CDK Pipelines
7. **Monitoring Dashboard**: Custom CloudWatch dashboard
8. **Cost Allocation Tags**: Better cost tracking

### Extensibility
- Easy to add new Lambda functions
- Simple to add new API endpoints
- Straightforward to add new storage resources
- Clear patterns for adding new features
