import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Callback, Context } from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { ResponseService } from "./services/response.service";
import { UserService } from "./services/user.service";
import { ValidateService } from "./services/validate.service";

import "source-map-support/register";

const dynamoDB: DocumentClient = new DocumentClient({ region: "us-east-1" });

export const listUsers: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent, _context: Context, _callback: Callback<APIGatewayProxyResult>) => {
  _context.callbackWaitsForEmptyEventLoop = false;

  try {
    const userService: UserService = new UserService(dynamoDB);
    const { Items } = await userService.listUsers();

    return ResponseService.successResponse(Items);
  } catch (error) {
    return ResponseService.errorResponse(error);
  }
};

export const createUser: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent, _context: Context, _callback: Callback<APIGatewayProxyResult>) => {
  _context.callbackWaitsForEmptyEventLoop = false;

  try {
    const userService: UserService = new UserService(dynamoDB);
    const { Item } = await userService.createUser(JSON.parse(_event.body));

    return ResponseService.successResponse(Item);
  } catch (error) {
    return ResponseService.errorResponse(error);
  }
};

export const getUser: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent, _context: Context, _callback: Callback<APIGatewayProxyResult>) => {
  _context.callbackWaitsForEmptyEventLoop = false;

  if ( !ValidateService.isValidEmail(_event.pathParameters.email) ) {
    return ResponseService.errorResponse( new Error("Email address required, invalid email address") );
  }

  try {
    const userService: UserService = new UserService(dynamoDB);
    const { Item } = await userService.getUser(_event.pathParameters.email);

    return ResponseService.successResponse(Item);
  } catch (error) {
    return ResponseService.errorResponse(error);
  }
};

export const updateUser: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent, _context: Context, _callback: Callback<APIGatewayProxyResult>) => {
  _context.callbackWaitsForEmptyEventLoop = false;

  if ( !ValidateService.isValidEmail(_event.pathParameters.email) ) {
    return ResponseService.errorResponse( new Error("Email address required, invalid email address") );
  }

  try {
    const userService: UserService = new UserService(dynamoDB);
    const { Item } = await userService.updateUser(_event.pathParameters.email, JSON.parse(_event.body));
    return ResponseService.successResponse(Item);
  } catch (error) {
    return ResponseService.errorResponse(error);
  }
};

export const deleteUser: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent, _context: Context, _callback: Callback<APIGatewayProxyResult>) => {
  _context.callbackWaitsForEmptyEventLoop = false;

  if ( !ValidateService.isValidEmail(_event.pathParameters.email) ) {
    return ResponseService.errorResponse( new Error("Email address required, invalid email address") );
  }

  try {
    const userService: UserService = new UserService(dynamoDB);
    await userService.deleteUser(_event.pathParameters.email);
    return ResponseService.successResponse();
  } catch (error) {
    return ResponseService.errorResponse(error);
  }
};
