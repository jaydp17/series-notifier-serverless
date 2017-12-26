/**
 * Contains utility functions related to AWS Lambda
 */

import { Lambda } from 'aws-sdk';

import { messengerReply, processQuery } from './function-names';
import { AnyAction, AnyReplyKind } from './internal-message-types';

const lambda = new Lambda();

export const invokeFunction = (
  functionName: string,
  payload: {},
  invocationType: string = 'Event',
): Promise<Lambda.InvocationResponse> => {
  return lambda
    .invoke({
      FunctionName: functionName,
      InvocationType: invocationType,
      Payload: JSON.stringify(payload),
    })
    .promise();
};

export const invokeProcessQuery = (data: AnyAction) => invokeFunction(processQuery, data);

/**
 * Invokes the function that replies FB Messenger back
 */
export function invokeMessengerReply(event: AnyReplyKind): Promise<Lambda.InvocationResponse> {
  return invokeFunction(messengerReply, event);
}
