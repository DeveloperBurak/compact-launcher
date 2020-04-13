// eslint-disable-next-line import/no-unresolved
import env from 'env';

export const isDev = () => env.name === 'development';
export const isTesting = () => env.name === 'testing';
export const isProduction = () => env.name === 'production';
