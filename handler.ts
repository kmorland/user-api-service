import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context, Callback, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import { UserService } from './services/user.service';
import { DynamoDB } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as AWS from 'aws-sdk';

const HEADERS = {
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Origin": "*",
};

AWS.config.update({ region: 'us-east-1' });
const dynamoDB: DocumentClient = new DocumentClient({ region: 'us-east-1' });

export const listUsers: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent, _context: Context, _callback: Callback<APIGatewayProxyResult>) => {
  _context.callbackWaitsForEmptyEventLoop = false;

  try {
    const userService: UserService = new UserService(dynamoDB);
    const {Items} = await userService.listUsers();

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify(Items),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: error.message }),
    }
  }
}

export const createUser: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent, _context: Context, _callback: Callback<APIGatewayProxyResult>) => {
  _context.callbackWaitsForEmptyEventLoop = false;

  try {
    const userService: UserService = new UserService(dynamoDB);
    const {Item} = await userService.createUser(JSON.parse(_event.body));

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify(Item),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: error.message }),
    }
  }
}

export const getUser: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent, _context: Context, _callback: Callback<APIGatewayProxyResult>) => {
  _context.callbackWaitsForEmptyEventLoop = false;

  try {
    const userService: UserService = new UserService(dynamoDB);
    const {Item} = await userService.getUser(_event.pathParameters.email);

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify(Item),
    };
  } catch (error) {
    return {
      statusCode: error.errorCode || 400,
      headers: HEADERS,
      body: JSON.stringify({ error: error.message }),
    }
  }
}

export const updateUser: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent, _context: Context, _callback: Callback<APIGatewayProxyResult>) => {
  _context.callbackWaitsForEmptyEventLoop = false;

  try {
    const userService: UserService = new UserService(dynamoDB);
    const {Item} = await userService.updateUser(_event.pathParameters.email, JSON.parse(_event.body));
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify(Item),
    };
  } catch (error) {
    return {
      statusCode: error.errorCode || 400,
      headers: HEADERS,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

export const deleteUser: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent, _context: Context, _callback: Callback<APIGatewayProxyResult>) => {
  _context.callbackWaitsForEmptyEventLoop = false;

  try {
    const userService: UserService = new UserService(dynamoDB);
    await userService.deleteUser(_event.pathParameters.email);
    return {
      statusCode: 200,
      headers: HEADERS,
      body: null,
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: error.message }),
    };
  }
}