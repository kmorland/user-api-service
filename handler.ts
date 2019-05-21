import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Callback, Context } from "aws-lambda";
import { ResponseService } from "./services/response.service";
import { UserService } from "./services/user.service";
import { ValidateService } from "./services/validate.service";

import "source-map-support/register";

const userService: UserService = new UserService();

export const listUsers: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent, _context: Context, _callback: Callback<APIGatewayProxyResult>) => {
  _context.callbackWaitsForEmptyEventLoop = false;

  try {
    const { Items } = await userService.listUsers();

    return ResponseService.successResponse(Items);
  } catch (error) {
    return ResponseService.errorResponse(error);
  }
};

export const createUser: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, _context: Context, _callback: Callback<APIGatewayProxyResult>) => {
  _context.callbackWaitsForEmptyEventLoop = false;

  try {
    ValidateService.isValidUser(JSON.parse(event.body));
    const { Item } = await userService.createUser(JSON.parse(event.body));

    return ResponseService.successResponse( Item );
  } catch (error) {
    return ResponseService.errorResponse(error);
  }
};

export const getUser: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, _context: Context, _callback: Callback<APIGatewayProxyResult>) => {
  _context.callbackWaitsForEmptyEventLoop = false;

  try {
    ValidateService.isValidEmail(event.pathParameters.email);
    const { Item } = await userService.getUser(event.pathParameters.email);

    return ResponseService.successResponse(Item);
  } catch (error) {
    return ResponseService.errorResponse(error);
  }
};

export const updateUser: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, _context: Context, _callback: Callback<APIGatewayProxyResult>) => {
  _context.callbackWaitsForEmptyEventLoop = false;

  try {
    ValidateService.isValidEmail(event.pathParameters.email);
    ValidateService.isValidUser(JSON.parse(event.body));

    const { Attributes } = await userService.updateUser(event.pathParameters.email, JSON.parse(event.body));
    return ResponseService.successResponse(Attributes);
  } catch (error) {
    return ResponseService.errorResponse(error);
  }
};

export const deleteUser: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, _context: Context, _callback: Callback<APIGatewayProxyResult>) => {
  _context.callbackWaitsForEmptyEventLoop = false;

  try {
    ValidateService.isValidEmail(event.pathParameters.email);
    await userService.deleteUser(event.pathParameters.email);
    return ResponseService.successResponse();
  } catch (error) {
    return ResponseService.errorResponse(error);
  }
};
