import { APIGatewayProxyResult } from 'aws-lambda';

export function addCors(result: APIGatewayProxyResult) {
  if (!result.headers) {
    result.headers = {};
  }

  result.headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Methods': (process.env.ALLOWED_METHODS || '')
      .split(',')
      .join(', '),
  };
}
