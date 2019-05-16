import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { UserService } from './services/user.service';
import { DynamoDB } from 'aws-sdk';
import * as AWS from 'aws-sdk';
import { User } from './services/model/user';

AWS.config.update({region: 'us-east-1'});
const dynamoDB : DynamoDB.DocumentClient = new DynamoDB.DocumentClient({region: 'us-east-1'});

export const createUser: APIGatewayProxyHandler = async (event, _context) => {
  _context.callbackWaitsForEmptyEventLoop = false;

  try {
    const userService: UserService = new UserService( dynamoDB );
    const result: User = await userService.createUser( new User( JSON.parse(event.body) ) );

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    }; 
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({error: error.message}),
    }
  }
}

export const getUser: APIGatewayProxyHandler = async (event, _context) => {
  _context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    const userService: UserService = new UserService( dynamoDB );
    const result: User = await userService.getUser( event.pathParameters.id );

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };  
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({error: error.message}),
    }
  }
}

export const updateUser: APIGatewayProxyHandler = async (event, _context) => {
  _context.callbackWaitsForEmptyEventLoop = false;

  try {
    const userService: UserService = new UserService( dynamoDB );
    const result: User = await userService.updateUser( event.pathParameters.id, new User( JSON.parse(event.body) ) );
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({error: error.message}),
    };
  }
}

export const deleteUser: APIGatewayProxyHandler = async (event, _context) => {
  _context.callbackWaitsForEmptyEventLoop = false;

  try {
    const userService: UserService = new UserService( dynamoDB );
    const result: DynamoDB.DocumentClient.DeleteItemOutput = await userService.deleteUser( event.pathParameters.id );
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({error: error.message}),
    };
  }
}
