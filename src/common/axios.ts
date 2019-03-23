/**
 * Gives a common axios instance across the entire app
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import Logger from '../common/logger';

const timeLogger = Logger('TimeLogger');

function requestInterceptor(config: AxiosRequestConfig) {
  return { ...config, startTime: Date.now() };
}

function responseInterceptor(response: AxiosResponse) {
  const { startTime } = response.config as any; // tslint:disable-line:no-any
  const endTime = Date.now();
  timeLogger.log(`[TimeLogger]:: ${response.config.url} -> ${endTime - startTime}ms`);
  return response;
}

axios.interceptors.request.use(requestInterceptor);
axios.interceptors.response.use(responseInterceptor);

export default axios;
