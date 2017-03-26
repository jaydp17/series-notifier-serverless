export type LambdaEvent = {
  httpMethod: string;
  body: string;
  queryStringParameters: string | null;
};
