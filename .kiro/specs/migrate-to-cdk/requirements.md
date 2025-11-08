# Requirements Document

## Introduction

This document outlines the requirements for migrating the Video Transcriber solution from CloudFormation templates to AWS CDK (Cloud Development Kit). The current solution uses a 3000+ line CloudFormation YAML template that is difficult to maintain and extend. By migrating to CDK with TypeScript, we will gain better code organization, type safety, IDE support, and the ability to use programming constructs like loops and conditionals.

The migration will maintain feature parity with the existing CloudFormation deployment while improving the developer experience and making the infrastructure code more maintainable.

## Requirements

### Requirement 1: CDK Project Setup

**User Story:** As a developer, I want a properly structured CDK project, so that I can develop and deploy infrastructure using TypeScript.

#### Acceptance Criteria

1. WHEN the CDK project is initialized THEN it SHALL use TypeScript as the programming language
2. WHEN the CDK project is created THEN it SHALL include proper package.json with all necessary CDK dependencies
3. WHEN the CDK project is structured THEN it SHALL organize code into logical constructs (compute, storage, api, etc.)
4. WHEN the CDK project is configured THEN it SHALL support multiple environments (dev, staging, prod)
5. IF the project uses CDK THEN it SHALL use CDK v2 (the latest stable version)

### Requirement 2: Lambda Functions Migration

**User Story:** As a developer, I want all 27+ Lambda functions defined in CDK, so that they can be deployed and managed programmatically.

#### Acceptance Criteria

1. WHEN Lambda functions are defined THEN the system SHALL create all 27+ Lambda functions from the original template
2. WHEN Lambda functions are created THEN each SHALL reference the correct source code directory
3. WHEN Lambda functions are configured THEN each SHALL have the correct runtime (Node.js 16.x)
4. WHEN Lambda functions are configured THEN each SHALL have the correct memory, timeout, and environment variables
5. WHEN Lambda functions are created THEN each SHALL have an associated CloudWatch Log Group with 7-day retention
6. WHEN Lambda functions are defined THEN the system SHALL use a reusable construct or factory pattern to reduce code duplication
7. IF a Lambda function requires specific IAM permissions THEN it SHALL be granted only the necessary permissions

### Requirement 3: DynamoDB Tables Migration

**User Story:** As a developer, I want all DynamoDB tables defined in CDK, so that the data layer is properly configured.

#### Acceptance Criteria

1. WHEN DynamoDB tables are created THEN the system SHALL create the VideoDynamoDBTable with correct schema
2. WHEN DynamoDB tables are created THEN the system SHALL create the CaptionDynamoDBTable with correct schema
3. WHEN DynamoDB tables are created THEN the system SHALL create the ConfigDynamoDBTable with correct schema
4. WHEN DynamoDB tables are configured THEN each SHALL have encryption enabled (SSE)
5. WHEN DynamoDB tables are configured THEN each SHALL have appropriate billing mode and capacity settings
6. IF the table has GSI or LSI THEN they SHALL be properly defined with correct key schemas

### Requirement 4: S3 Buckets Migration

**User Story:** As a developer, I want all S3 buckets defined in CDK, so that storage resources are properly configured.

#### Acceptance Criteria

1. WHEN S3 buckets are created THEN the system SHALL create the Video bucket with correct naming convention
2. WHEN S3 buckets are created THEN the system SHALL create the Audio bucket with correct naming convention
3. WHEN S3 buckets are created THEN the system SHALL create the Transcribe bucket with correct naming convention
4. WHEN S3 buckets are created THEN the system SHALL create the Public bucket with CloudFront integration
5. WHEN S3 buckets are configured THEN each SHALL have appropriate encryption settings
6. WHEN S3 buckets are configured THEN each SHALL have correct CORS configuration where needed
7. WHEN S3 buckets are configured THEN each SHALL have appropriate lifecycle policies
8. WHEN S3 buckets trigger Lambda THEN the event notifications SHALL be properly configured

### Requirement 5: API Gateway Migration

**User Story:** As a developer, I want the REST API defined in CDK, so that the API endpoints are properly configured.

#### Acceptance Criteria

1. WHEN API Gateway is created THEN it SHALL be a REST API with regional endpoint type
2. WHEN API resources are defined THEN all endpoints SHALL match the original template structure
3. WHEN API methods are created THEN each SHALL have correct HTTP method (GET, POST, PUT, DELETE, PATCH)
4. WHEN API methods are configured THEN each SHALL integrate with the correct Lambda function
5. WHEN API methods are configured THEN CORS SHALL be properly enabled with OPTIONS methods
6. WHEN API Gateway is configured THEN request validation SHALL be enabled where appropriate
7. WHEN API Gateway is deployed THEN it SHALL create a deployment stage

### Requirement 6: IAM Roles and Policies Migration

**User Story:** As a developer, I want IAM roles and policies defined in CDK, so that permissions are properly managed.

#### Acceptance Criteria

1. WHEN IAM roles are created THEN the system SHALL create CommonRoleForLambda with appropriate policies
2. WHEN IAM roles are created THEN the system SHALL create TranscribeRole with Transcribe permissions
3. WHEN IAM roles are created THEN the system SHALL create MediaConvertRole with MediaConvert permissions
4. WHEN IAM roles are created THEN the system SHALL create MediaConvertForLambdaRole with appropriate policies
5. WHEN IAM roles are created THEN the system SHALL create InvokeLambdaRole with Lambda invoke permissions
6. WHEN IAM policies are defined THEN they SHALL follow the principle of least privilege
7. IF a role needs custom policies THEN they SHALL be defined inline or as managed policies

### Requirement 7: CloudFront Distribution Migration

**User Story:** As a developer, I want the CloudFront distribution defined in CDK, so that the web UI is properly served.

#### Acceptance Criteria

1. WHEN CloudFront is created THEN it SHALL serve content from the Public S3 bucket
2. WHEN CloudFront is configured THEN it SHALL have an Origin Access Identity for S3 access
3. WHEN CloudFront is configured THEN it SHALL have appropriate cache behaviors
4. WHEN CloudFront is configured THEN it SHALL serve the web UI with proper routing
5. IF CloudFront requires custom error pages THEN they SHALL be configured

### Requirement 8: Build and Deployment Process

**User Story:** As a developer, I want a streamlined build and deployment process, so that I can easily deploy the infrastructure.

#### Acceptance Criteria

1. WHEN the build process runs THEN it SHALL bundle all Lambda functions automatically
2. WHEN the build process runs THEN it SHALL compile TypeScript to JavaScript
3. WHEN CDK deploy is executed THEN it SHALL deploy all resources in the correct order
4. WHEN CDK deploy is executed THEN it SHALL handle dependencies between resources
5. WHEN deployment completes THEN it SHALL output important values (API URL, CloudFront URL, etc.)
6. IF Lambda code changes THEN CDK SHALL detect and redeploy only affected functions

### Requirement 9: Configuration and Parameters

**User Story:** As a developer, I want configurable parameters, so that I can customize the deployment.

#### Acceptance Criteria

1. WHEN the stack is deployed THEN it SHALL accept a TranscribeLanguage parameter
2. WHEN the stack is deployed THEN it SHALL accept environment-specific configuration
3. WHEN configuration is provided THEN it SHALL be validated before deployment
4. WHEN resources are named THEN they SHALL use consistent naming conventions
5. IF different environments are deployed THEN they SHALL have isolated resources

### Requirement 10: Testing and Validation

**User Story:** As a developer, I want to test the CDK code, so that I can ensure correctness before deployment.

#### Acceptance Criteria

1. WHEN CDK synth is run THEN it SHALL generate valid CloudFormation templates
2. WHEN CDK diff is run THEN it SHALL show changes compared to deployed stack
3. WHEN unit tests are written THEN they SHALL validate resource properties
4. WHEN snapshot tests are created THEN they SHALL detect unintended changes
5. IF the CDK code has errors THEN they SHALL be caught at compile time

### Requirement 11: Documentation and Migration Guide

**User Story:** As a developer, I want clear documentation, so that I can understand and maintain the CDK code.

#### Acceptance Criteria

1. WHEN the migration is complete THEN there SHALL be a README explaining the CDK structure
2. WHEN the migration is complete THEN there SHALL be deployment instructions
3. WHEN the migration is complete THEN there SHALL be a comparison guide between old and new approach
4. WHEN constructs are created THEN they SHALL have inline documentation
5. IF there are breaking changes THEN they SHALL be documented

### Requirement 12: Feature Parity Validation

**User Story:** As a developer, I want to ensure feature parity, so that the CDK deployment works identically to CloudFormation.

#### Acceptance Criteria

1. WHEN the CDK stack is deployed THEN all Lambda functions SHALL be created with identical configuration
2. WHEN the CDK stack is deployed THEN all DynamoDB tables SHALL have identical schemas
3. WHEN the CDK stack is deployed THEN all S3 buckets SHALL have identical configurations
4. WHEN the CDK stack is deployed THEN the API Gateway SHALL have identical endpoints
5. WHEN the CDK stack is deployed THEN all IAM permissions SHALL be equivalent
6. WHEN the system is tested THEN it SHALL function identically to the CloudFormation version
