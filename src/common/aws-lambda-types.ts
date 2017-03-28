/**
 * Contains types that are related to AWS Lambda
 */

export type LambdaEvent = {
  httpMethod: string;
  body: string;
  queryStringParameters: string | null;
};

export type LambdaCallback = (error: Error | null | undefined, response?: { statusCode: number, body?: string }) => void;
