/**
 * Contains types that are related to AWS Lambda
 */

export type LambdaEvent = {
  httpMethod: string;
  body: string;
  queryStringParameters: {} | null;
};

/**
 * Callback type that should be used when the lambda is gonna be invoked with an HTTP req
 */
export type LambdaHttpCallback = (error: Error | null | undefined, response?: { statusCode: number, body?: string }) => void;

/**
 * Non-HTTP lambda callback type
 */
export type LambdaCallback = (error: Error | null | undefined, response?: {}) => void;
