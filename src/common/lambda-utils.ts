/**
 * Contains utility functions related to AWS Lambda
 */

import { Lambda } from 'aws-sdk';

import { messengerReply, processQuery } from './function-names';
import { IMessage } from './internal-message-types';

const lambda = new Lambda();

export const invokeFunction = (functionName: string, payload: {}, invocationType: string = 'Event'): Promise<Lambda.InvocationResponse> => {
  return lambda.invoke({
    FunctionName: functionName,
    InvocationType: invocationType,
    Payload: JSON.stringify(payload),
  }).promise();
};

export const invokeProcessQuery = (data: IMessage) => invokeFunction(processQuery, data);

/**
 * Invokes the function that replies FB Messenger back
 */
export function invokeMessengerReply(event: IMessage): Promise<Lambda.InvocationResponse> {
  return invokeFunction(messengerReply, event);
}
