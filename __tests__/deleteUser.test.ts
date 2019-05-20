// tslint:disable: no-var-requires
import * as AWS from "aws-sdk-mock";

import { APIGatewayProxyEvent, Callback, Context } from "aws-lambda";
import { deleteUser } from "../handler";
import { STATUS } from "../services/response.service";

import createEvent from "aws-event-mocks";

const getUserResponse = require("../data/get-user-response.json");

const mockContext = {} as Context;
const mockCallback = {} as Callback;
const apiGatewayEvent: APIGatewayProxyEvent = createEvent({
    template: "aws:apiGateway",
    merge: {
        pathParameters: {
            email: "kmorland@yahoo.com",
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
            callback(new Error("Invalid parameters"), null);
        });

        const { statusCode }: any = await deleteUser(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(statusCode)).toBe(STATUS.ERROR);
    });

    test("deleteUser should return HTTP status 400 on invalid email address", async () => {
        AWS.remock("DynamoDB.DocumentClient", "delete", (_params: any, callback: Callback) => {
            callback(new Error("Invalid parameters"), null);
        });

        const response: any = await deleteUser(apiGatewayEvent, mockContext, mockCallback);
        expect(response.statusCode).toBe(STATUS.ERROR);
    });

    test("deleteUser should return HTTP status 400 on unknown email address", async () => {
        AWS.remock("DynamoDB.DocumentClient", "delete", (_params: any, callback: Callback) => {
            callback(new Error("ConditionalError thrown by DynamoDB"), null);
        });

        apiGatewayEvent.pathParameters.email = "unknown@yahoo.com";
        const response: any = await deleteUser(apiGatewayEvent, mockContext, mockCallback);
        expect(response.statusCode).toBe(STATUS.ERROR);
    });

    afterAll(() => {
        AWS.restore("DynamoDB.DocumentClient");
    });
});
