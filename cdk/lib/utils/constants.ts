/**
 * Shared constants used across the Video Transcriber CDK application
 */

/**
 * AWS region for deployment
 * Can be overridden by CDK_DEFAULT_REGION environment variable
 */
export const DEFAULT_REGION = process.env.CDK_DEFAULT_REGION || 'us-east-1';

/**
 * AWS account ID
 * Can be overridden by CDK_DEFAULT_ACCOUNT environment variable
 */
export const DEFAULT_ACCOUNT = process.env.CDK_DEFAULT_ACCOUNT;

/**
 * Resource naming prefix for all resources
 */
export const RESOURCE_PREFIX = 'prod-aws-captions';

/**
 * Lambda runtime configuration
 */
export const LAMBDA_RUNTIME = 'nodejs16.x';

/**
 * Default CloudWatch log retention in days
 */
export const DEFAULT_LOG_RETENTION_DAYS = 7;

/**
 * DynamoDB table names
 */
export const TABLE_NAMES = {
  VIDEO: 'VideoDynamoDBTable',
  CAPTION: 'CaptionDynamoDBTable',
  CONFIG: 'ConfigDynamoDBTable',
} as const;

/**
 * S3 bucket suffixes
 */
export const BUCKET_SUFFIXES = {
  VIDEO: 'video',
  AUDIO: 'audio',
  TRANSCRIBE: 'transcribe',
  PUBLIC: 'public',
} as const;

/**
 * API Gateway configuration
 */
export const API_CONFIG = {
  NAME: 'VideoTranscriberAPI',
  STAGE_NAME: 'prod',
} as const;

/**
 * CloudFront configuration
 */
export const CLOUDFRONT_CONFIG = {
  DEFAULT_ROOT_OBJECT: 'index.html',
  PRICE_CLASS: 'PriceClass_100',
} as const;
