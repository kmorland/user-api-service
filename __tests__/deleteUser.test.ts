// tslint:disable: no-var-requires
import * as AWS from "aws-sdk-mock";

import { APIGatewayProxyEvent, Callback, Context } from "aws-lambda";
import { deleteUser } from "../handler";
import { STATUS } from "../services/response.service";

import createEvent from "aws-event-mocks";
import { ConditionalCheckFailedException } from "../exceptions/conditional-check-failed-exception";

const getUserResponse = require("../data/get-user-response.json");

const mockContext = {} as Context;
const mockCallback = {} as Callback;
const apiGatewayEvent: APIGatewayProxyEvent = createEvent({
    template: "aws:apiGateway",
    merge: {
        pathParameters: {
            email: "valid@email.com",
        },
    },
});

jest.setTimeout(240000);

describe("deleteUser Tests", () => {
    beforeAll(() => {
        AWS.mock("DynamoDB.DocumentClient", "delete", (_params: any, callback: Callback) => {
            callback(null, { Item: getUserResponse });
        });
    });

    test("deleteUser should return no body", async () => {
        const { body }: any = await deleteUser(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(body)).toEqual(null);
    });

    test("deleteUser should return HTTP status 200 on success", async () => {
        const { statusCode }: any = await deleteUser(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(statusCode)).toBe(STATUS.OK);
    });

    test("deleteUser should return HTTP status 400 on error", async () => {
        AWS.remock("DynamoDB.DocumentClient", "delete", (_params: any, callback: Callback) => {
            callback("Invalid parameters", null);
        });

        const { statusCode }: any = await deleteUser(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(statusCode)).toBe(STATUS.ERROR);
    });

    test("deleteUser should return HTTP status 400 on invalid email address", async () => {
        AWS.remock("DynamoDB.DocumentClient", "delete", (_params: any, callback: Callback) => {
            callback(null, null);
        });
        apiGatewayEvent.pathParameters.email = "notvalid@emailcom";

        const response: any = await deleteUser(apiGatewayEvent, mockContext, mockCallback);
        expect(response.statusCode).toBe(STATUS.ERROR);
    });

    test("deleteUser unknown email address, HTTP status 404 on error", async () => {
        apiGatewayEvent.pathParameters.email = "unknown@yahoo.com";

        AWS.remock("DynamoDB.DocumentClient", "delete", (_params: any, callback: Callback) => {
            callback(new ConditionalCheckFailedException("ConditionalCheckFailedException", `User does not exist with email address ${apiGatewayEvent.pathParameters.email}`), null);
        });

        const response: any = await deleteUser(apiGatewayEvent, mockContext, mockCallback);
        expect(response.statusCode).toBe(STATUS.NOT_FOUND);
    });

    test("deleteUser unknown email address, check error message on error", async () => {
        apiGatewayEvent.pathParameters.email = "unknown@yahoo.com";

        AWS.remock("DynamoDB.DocumentClient", "delete", (_params: any, callback: Callback) => {
            callback(new ConditionalCheckFailedException("ConditionalCheckFailedException", `User does not exist with email address ${apiGatewayEvent.pathParameters.email}`), null);
        });

        const { body }: any = await deleteUser(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(body).message).toBe(`User does not exist with email address ${apiGatewayEvent.pathParameters.email}`);
    });

    afterAll(() => {
        AWS.restore("DynamoDB.DocumentClient");
    });
});
