/**
 * Gives a common axios instance across the entire app
 */

import axios, { AxiosResponse } from 'axios';

function requestInterceptor(config: {}) {
  return { ...config, startTime: Date.now() };
}

function responseInterceptor(response: AxiosResponse) {
  const { startTime } = <any>response.config; // tslint:disable-line:no-any
  const endTime = Date.now();
  // tslint:disable-next-line:no-console
  console.log(`[TimeLogger]:: ${response.config.url} -> ${endTime - startTime}ms`);
  return response;
}

axios.interceptors.request.use(requestInterceptor);
axios.interceptors.response.use(responseInterceptor);

export default axios;
