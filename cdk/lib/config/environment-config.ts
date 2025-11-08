/**
 * Environment-specific configuration for the Video Transcriber application
 */

import { Duration } from 'aws-cdk-lib';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

/**
 * Environment configuration interface
 */
export interface EnvironmentConfig {
  /**
   * Environment name
   */
  name: string;

  /**
   * Default transcription language code
   */
  transcribeLanguage: string;

  /**
   * CloudWatch log retention period in days
   */
  logRetentionDays: RetentionDays;

  /**
   * Log level for Lambda functions
   */
  logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

  /**
   * Enable AWS X-Ray tracing
   */
  enableXRay: boolean;

  /**
   * DynamoDB billing mode
   */
  dynamoDBBillingMode: 'PAY_PER_REQUEST' | 'PROVISIONED';

  /**
   * S3 lifecycle policy - days until transition to Glacier
   */
  s3GlacierTransitionDays?: number;

  /**
   * S3 lifecycle policy - days until expiration
   */
  s3ExpirationDays?: number;

  /**
   * API Gateway throttling - requests per second
   */
  apiThrottleRateLimit: number;

  /**
   * API Gateway throttling - burst limit
   */
  apiThrottleBurstLimit: number;

  /**
   * Enable API Gateway caching
   */
  enableAPICache: boolean;

  /**
   * API Gateway cache TTL
   */
  apiCacheTTL?: Duration;

  /**
   * CloudFront price class
   */
  cloudFrontPriceClass: 'PriceClass_100' | 'PriceClass_200' | 'PriceClass_All';

  /**
   * Enable CloudFront logging
   */
  enableCloudFrontLogging: boolean;

  /**
   * Removal policy for resources (RETAIN or DESTROY)
   */
  removalPolicy: 'RETAIN' | 'DESTROY';
}

/**
 * Development environment configuration
 */
export const devConfig: EnvironmentConfig = {
  name: 'dev',
  transcribeLanguage: 'en-US',
  logRetentionDays: RetentionDays.THREE_DAYS,
  logLevel: 'DEBUG',
  enableXRay: false,
  dynamoDBBillingMode: 'PAY_PER_REQUEST',
  s3ExpirationDays: 7,
  apiThrottleRateLimit: 100,
  apiThrottleBurstLimit: 200,
  enableAPICache: false,
  cloudFrontPriceClass: 'PriceClass_100',
  enableCloudFrontLogging: false,
  removalPolicy: 'DESTROY',
};

/**
 * Staging environment configuration
 */
export const stagingConfig: EnvironmentConfig = {
  name: 'staging',
  transcribeLanguage: 'en-US',
  logRetentionDays: RetentionDays.ONE_WEEK,
  logLevel: 'INFO',
  enableXRay: true,
  dynamoDBBillingMode: 'PAY_PER_REQUEST',
  s3GlacierTransitionDays: 30,
  s3ExpirationDays: 90,
  apiThrottleRateLimit: 500,
  apiThrottleBurstLimit: 1000,
  enableAPICache: true,
  apiCacheTTL: Duration.minutes(5),
  cloudFrontPriceClass: 'PriceClass_100',
  enableCloudFrontLogging: true,
  removalPolicy: 'RETAIN',
};

/**
 * Production environment configuration
 */
export const prodConfig: EnvironmentConfig = {
  name: 'prod',
  transcribeLanguage: 'en-US',
  logRetentionDays: RetentionDays.ONE_MONTH,
  logLevel: 'WARN',
  enableXRay: true,
  dynamoDBBillingMode: 'PAY_PER_REQUEST',
  s3GlacierTransitionDays: 90,
  s3ExpirationDays: 365,
  apiThrottleRateLimit: 1000,
  apiThrottleBurstLimit: 2000,
  enableAPICache: true,
  apiCacheTTL: Duration.minutes(10),
  cloudFrontPriceClass: 'PriceClass_200',
  enableCloudFrontLogging: true,
  removalPolicy: 'RETAIN',
};

/**
 * Map of environment names to configurations
 */
export const environments: Record<string, EnvironmentConfig> = {
  dev: devConfig,
  staging: stagingConfig,
  prod: prodConfig,
};

/**
 * Get environment configuration by name
 * @param environmentName - Name of the environment (dev, staging, prod)
 * @returns Environment configuration
 * @throws Error if environment name is not recognized
 */
export function getEnvironmentConfig(environmentName: string): EnvironmentConfig {
  const config = environments[environmentName.toLowerCase()];
  
  if (!config) {
    throw new Error(
      `Unknown environment: ${environmentName}. Valid environments are: ${Object.keys(environments).join(', ')}`
    );
  }
  
  return config;
}

/**
 * Validate environment name
 * @param environmentName - Name of the environment to validate
 * @returns True if valid, false otherwise
 */
export function isValidEnvironment(environmentName: string): boolean {
  return environmentName.toLowerCase() in environments;
}
