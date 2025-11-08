# Implementation Plan

- [-] 1. Initialize CDK project structure
  - Create new CDK project with TypeScript
  - Set up package.json with required dependencies (@aws-cdk/aws-lambda, @aws-cdk/aws-s3, etc.)
  - Configure tsconfig.json for TypeScript compilation
  - Create directory structure (bin/, lib/, lib/constructs/, lib/config/, test/)
  - Initialize cdk.json with app configuration
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [ ] 2. Create utility modules and constants
  - Implement naming utility functions for consistent resource naming
  - Define shared constants (region, account, prefixes)
  - Create environment configuration module with dev/staging/prod settings
  - _Requirements: 1.4, 9.4_

- [ ] 3. Implement Storage Construct for S3 buckets
  - [ ] 3.1 Create StorageConstruct class with S3 bucket definitions
    - Implement Video bucket with encryption and CORS configuration
    - Implement Audio bucket with encryption
    - Implement Transcribe bucket with encryption and lifecycle policies
    - Implement Public bucket for web UI with CloudFront access
    - Export bucket references as public properties
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ] 3.2 Add S3 event notifications for Lambda triggers
    - Configure Video bucket to trigger ExtractAudio Lambda on object creation
    - Configure Audio bucket to trigger TranscribeAudio Lambda on object creation
    - _Requirements: 4.8_

- [ ] 4. Implement Storage Construct for DynamoDB tables
  - [ ] 4.1 Create DynamoDB table definitions in StorageConstruct
    - Implement VideoDynamoDBTable with videoId as partition key
    - Implement CaptionDynamoDBTable with videoId as partition key and startTime as sort key
    - Implement ConfigDynamoDBTable with configKey as partition key
    - Enable encryption (SSE) on all tables
    - Configure billing mode and capacity settings
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 4.2 Write unit tests for Storage Construct
    - Test that all S3 buckets are created with correct properties
    - Test that all DynamoDB tables are created with correct schemas
    - Test encryption settings
    - _Requirements: 10.3_

- [ ] 5. Implement IAM Construct for roles and policies
  - [ ] 5.1 Create IAMConstruct class with role definitions
    - Implement CommonRoleForLambda with DynamoDB and S3 permissions
    - Implement TranscribeRole with Transcribe service permissions
    - Implement MediaConvertRole with MediaConvert service permissions
    - Implement MediaConvertForLambdaRole with Lambda and MediaConvert permissions
    - Implement InvokeLambdaRole with Lambda invoke permissions
    - Export roles as public properties
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ] 5.2 Write unit tests for IAM Construct
    - Test that all roles are created
    - Test that roles have correct trust policies
    - Test that roles have appropriate permissions
    - _Requirements: 10.3_

- [ ] 6. Create Lambda function configuration file
  - Define configuration interface for Lambda functions
  - Create array of Lambda function configurations with name, handler, memory, timeout, role
  - Include all 27+ Lambda functions from original template
  - _Requirements: 2.1, 2.4, 9.1_

- [ ] 7. Implement Lambda Construct with factory pattern
  - [ ] 7.1 Create LambdaConstruct class with function factory
    - Implement createFunction method that accepts LambdaConfig
    - Create CloudWatch Log Group for each function with 7-day retention
    - Create Lambda function with correct runtime, memory, timeout
    - Set environment variables from configuration
    - Assign appropriate IAM role
    - Store functions in Map for easy access
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ] 7.2 Generate all Lambda functions from configuration
    - Loop through lambda configurations and create each function
    - Pass storage resources and roles as dependencies
    - Configure environment variables with bucket names, table names, region
    - _Requirements: 2.1, 2.4, 2.7_

  - [ ] 7.3 Write unit tests for Lambda Construct
    - Test that all Lambda functions are created
    - Test that functions have correct configuration
    - Test that log groups are created with correct retention
    - Test that environment variables are set correctly
    - _Requirements: 10.3_

- [ ] 8. Create API endpoint configuration file
  - Define interface for API endpoint configuration
  - Create array of endpoint configurations with path, method, Lambda function name
  - Include all 15+ endpoints from original template
  - _Requirements: 5.2_

- [ ] 9. Implement API Gateway Construct
  - [ ] 9.1 Create APIConstruct class with REST API definition
    - Create REST API with regional endpoint type
    - Create request validator for parameter validation
    - Implement method to create resources from path
    - Implement method to add CORS OPTIONS method
    - _Requirements: 5.1, 5.6, 5.7_

  - [ ] 9.2 Generate all API endpoints from configuration
    - Loop through endpoint configurations
    - Create API Gateway resources for each path
    - Create methods with correct HTTP method
    - Configure Lambda proxy integration
    - Add CORS OPTIONS method for each resource
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

  - [ ] 9.3 Create API deployment and stage
    - Create deployment for the API
    - Create stage with appropriate name
    - Export API URL as stack output
    - _Requirements: 5.7_

  - [ ] 9.4 Write unit tests for API Construct
    - Test that REST API is created
    - Test that all resources are created
    - Test that all methods are created with correct configuration
    - Test that CORS is enabled
    - _Requirements: 10.3_

- [ ] 10. Implement CloudFront CDN Construct
  - [ ] 10.1 Create CDNConstruct class with CloudFront distribution
    - Create Origin Access Identity for S3 access
    - Configure S3 origin with OAI
    - Set up cache behaviors for static assets
    - Configure default root object to index.html
    - Enable compression
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 10.2 Configure S3 bucket policy for CloudFront access
    - Update Public bucket policy to allow OAI access
    - Deny direct S3 access
    - _Requirements: 7.1_

  - [ ] 10.3 Export CloudFront URL as stack output
    - Export distribution domain name
    - _Requirements: 8.5_

  - [ ] 10.4 Write unit tests for CDN Construct
    - Test that CloudFront distribution is created
    - Test that OAI is configured
    - Test cache behaviors
    - _Requirements: 10.3_

- [ ] 11. Implement main VideoTranscriberStack
  - [ ] 11.1 Create VideoTranscriberStack class that composes all constructs
    - Define stack properties interface with transcribeLanguage and environment
    - Instantiate StorageConstruct
    - Instantiate IAMConstruct
    - Instantiate LambdaConstruct with dependencies
    - Instantiate APIConstruct with Lambda functions
    - Instantiate CDNConstruct with Public bucket
    - _Requirements: 9.2, 9.3_

  - [ ] 11.2 Add stack outputs for important values
    - Output API Gateway URL
    - Output CloudFront distribution URL
    - Output S3 bucket names
    - Output DynamoDB table names
    - _Requirements: 8.5_

  - [ ] 11.3 Write integration tests for complete stack
    - Test that stack synthesizes without errors
    - Test that all resources are created
    - Validate resource count matches original template
    - _Requirements: 10.1, 10.2, 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 12. Create CDK app entry point
  - Create bin/video-transcriber.ts file
  - Instantiate CDK App
  - Create VideoTranscriberStack with configuration
  - Add tags to stack for cost allocation
  - _Requirements: 1.1_

- [ ] 13. Set up build and deployment scripts
  - [ ] 13.1 Add npm scripts to package.json
    - Add "build" script for TypeScript compilation
    - Add "watch" script for development
    - Add "test" script for running tests
    - Add "cdk" script for CDK commands
    - _Requirements: 8.1, 8.2_

  - [ ] 13.2 Create deployment documentation
    - Document prerequisites (Node.js, AWS CLI, CDK CLI)
    - Document deployment steps (npm install, cdk bootstrap, cdk deploy)
    - Document how to pass parameters
    - Document how to deploy to different environments
    - _Requirements: 11.2, 11.3_

- [ ] 14. Implement snapshot tests
  - Create snapshot test for complete stack
  - Generate CloudFormation template snapshot
  - Configure test to detect unintended changes
  - _Requirements: 10.4, 10.5_

- [ ] 15. Create validation tests for feature parity
  - [ ] 15.1 Write tests to compare CDK output with original CloudFormation
    - Compare Lambda function count and configurations
    - Compare DynamoDB table schemas
    - Compare S3 bucket configurations
    - Compare API Gateway endpoints
    - Compare IAM role permissions
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ] 15.2 Deploy to test environment and run integration tests
    - Deploy CDK stack to test AWS account
    - Test video upload workflow
    - Test transcription workflow
    - Test API endpoints
    - Verify functionality matches CloudFormation deployment
    - _Requirements: 12.6_

- [ ] 16. Create migration documentation
  - Document differences between CloudFormation and CDK approach
  - Create comparison table of key differences
  - Document advantages of CDK approach
  - Document any breaking changes or considerations
  - Create troubleshooting guide
  - _Requirements: 11.1, 11.3, 11.4, 11.5_

- [ ] 17. Optimize and refactor
  - Review code for opportunities to reduce duplication
  - Extract common patterns into reusable utilities
  - Add inline documentation to constructs
  - Ensure consistent naming conventions
  - Add type annotations where missing
  - _Requirements: 11.4_

- [ ] 18. Final validation and cleanup
  - Run all tests and ensure they pass
  - Synthesize CloudFormation template and review
  - Compare synthesized template with original
  - Clean up any temporary files or unused code
  - Update README with final instructions
  - _Requirements: 10.1, 10.2, 11.1_
