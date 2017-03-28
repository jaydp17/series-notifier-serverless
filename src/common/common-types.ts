/**
 * This file contains types that are consumed by more than 1 function
 */

export type Callback = (error: Error | null | undefined, data?: any) => void; // tslint:disable-line:no-any
