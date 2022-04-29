export const BASE_URL =
  process.env.NODE_ENV == 'production'
    ? process.env.PROD_URL
    : 'http://localost:3000';
