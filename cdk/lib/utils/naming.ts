/**
 * Utility functions for consistent resource naming across the Video Transcriber application
 */

import { RESOURCE_PREFIX, BUCKET_SUFFIXES, TABLE_NAMES } from './constants';

/**
 * Generate a consistent Lambda function name
 * @param functionName - The base name of the Lambda function
 * @returns Formatted Lambda function name with prefix
 */
export function getLambdaFunctionName(functionName: string): string {
  return `${RESOURCE_PREFIX}-${functionName}`;
}

/**
 * Generate a consistent CloudWatch Log Group name for Lambda functions
 * @param functionName - The base name of the Lambda function
 * @returns Formatted CloudWatch Log Group name
 */
export function getLambdaLogGroupName(functionName: string): string {
  return `/aws/lambda/${getLambdaFunctionName(functionName)}`;
}

/**
 * Generate a consistent S3 bucket name
 * @param accountId - AWS account ID
 * @param region - AWS region
 * @param bucketType - Type of bucket (video, audio, transcribe, public)
 * @returns Formatted S3 bucket name
 */
export function getS3BucketName(
  accountId: string,
  region: string,
  bucketType: keyof typeof BUCKET_SUFFIXES
): string {
  return `${RESOURCE_PREFIX}-${accountId}-${region}-${BUCKET_SUFFIXES[bucketType]}`;
}

/**
 * Generate a consistent DynamoDB table name
 * @param environment - Environment name (dev, staging, prod)
 * @param tableType - Type of table (VIDEO, CAPTION, CONFIG)
 * @returns Formatted DynamoDB table name
 */
export function getDynamoDBTableName(
  environment: string,
  tableType: keyof typeof TABLE_NAMES
): string {
  return `${RESOURCE_PREFIX}-${environment}-${TABLE_NAMES[tableType]}`;
}

/**
 * Generate a consistent IAM role name
 * @param roleName - The base name of the IAM role
 * @returns Formatted IAM role name with prefix
 */
export function getIAMRoleName(roleName: string): string {
  return `${RESOURCE_PREFIX}-${roleName}`;
}

/**
 * Generate a consistent API Gateway name
 * @param environment - Environment name (dev, staging, prod)
 * @returns Formatted API Gateway name
 */
export function getAPIGatewayName(environment: string): string {
  return `${RESOURCE_PREFIX}-${environment}-api`;
}

/**
 * Generate a consistent CloudFront distribution comment/description
 * @param environment - Environment name (dev, staging, prod)
 * @returns Formatted CloudFront distribution description
 */
export function getCloudFrontDescription(environment: string): string {
  return `Video Transcriber CDN - ${environment}`;
}

/**
 * Generate resource tags for consistent tagging
 * @param environment - Environment name (dev, staging, prod)
 * @param additionalTags - Additional tags to merge
 * @returns Object containing standard tags
 */
export function getResourceTags(
  environment: string,
  additionalTags?: Record<string, string>
): Record<string, string> {
  return {
    Application: 'VideoTranscriber',
    Environment: environment,
    ManagedBy: 'CDK',
    ...additionalTags,
  };
}
