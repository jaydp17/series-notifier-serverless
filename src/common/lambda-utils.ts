/**
 * Contains utility functions related to AWS Lambda
 */

import { Lambda } from 'aws-sdk';

import { processQuery } from './function-names';

const lambda = new Lambda();

export const invokeFunction = (functionName: string, payload: {}, invocationType: string = 'Event'): Promise<Lambda.InvocationResponse> => {
  return lambda.invoke({
    FunctionName: functionName,
    InvocationType: invocationType,
    Payload: JSON.stringify(payload),
  }).promise();
};

export const invokeProcessQuery = data => invokeFunction(processQuery, data);