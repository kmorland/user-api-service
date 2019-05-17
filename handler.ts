import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { UserService } from './services/user.service';
import { DynamoDB } from 'aws-sdk';
import * as AWS from 'aws-sdk';

const HEADERS = {
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Origin": "*",
};


AWS.config.update({ region: 'us-east-1' });
const dynamoDB: DynamoDB.DocumentClient = new DynamoDB.DocumentClient({ region: 'us-east-1' });

export const listUsers: APIGatewayProxyHandler = async (_event, _context) => {
  _context.callbackWaitsForEmptyEventLoop = false;

  try {
    const userService: UserService = new UserService(dynamoDB);
    const result: DynamoDB.DocumentClient.ScanOutput = await userService.listUsers();

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: error.message }),
    }
  }
}


export const createUser: APIGatewayProxyHandler = async (event, _context) => {
  _context.callbackWaitsForEmptyEventLoop = false;

  try {
    const userService: UserService = new UserService(dynamoDB);
    const result: DynamoDB.DocumentClient.GetItemOutput = await userService.createUser(JSON.parse(event.body));

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify(result.Item),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: error.message }),
    }
  }
}

export const getUser: APIGatewayProxyHandler = async (event, _context) => {
  _context.callbackWaitsForEmptyEventLoop = false;

  try {
    const userService: UserService = new UserService(dynamoDB);
    const result: DynamoDB.DocumentClient.GetItemOutput = await userService.getUser(event.pathParameters.email);

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify(result.Item),
    };
  } catch (error) {
    return {
      statusCode: error.errorCode || 400,
      headers: HEADERS,
      body: JSON.stringify({ error: error.message }),
    }
  }
}

export const updateUser: APIGatewayProxyHandler = async (event, _context) => {
  _context.callbackWaitsForEmptyEventLoop = false;

  try {
    const userService: UserService = new UserService(dynamoDB);
    const result: DynamoDB.DocumentClient.GetItemOutput = await userService.updateUser(event.pathParameters.email, JSON.parse(event.body));
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify(result.Item),
    };
  } catch (error) {
    return {
      statusCode: error.errorCode || 400,
      headers: HEADERS,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

export const deleteUser: APIGatewayProxyHandler = async (event, _context) => {
  _context.callbackWaitsForEmptyEventLoop = false;

  try {
    const userService: UserService = new UserService(dynamoDB);
    const result: DynamoDB.DocumentClient.DeleteItemOutput = await userService.deleteUser(event.pathParameters.email);
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: error.message }),
    };
  }
}