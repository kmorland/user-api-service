// tslint:disable: no-var-requires
import * as AWS from "aws-sdk-mock";

import { APIGatewayProxyEvent, Callback, Context } from "aws-lambda";
import { getUser } from "../handler";
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

describe("getUser Tests", () => {
    beforeAll(() => {
        AWS.mock("DynamoDB.DocumentClient", "get", (_params: any, callback: Callback) => {
            callback(null, { Item: getUserResponse });
        });
    });

    test("getUser should return one user", async () => {
        const { body }: any = await getUser(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(body)).toEqual(getUserResponse);
    });

    test("getUser should return HTTP status 200 on success", async () => {
        const { statusCode }: any = await getUser(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(statusCode)).toBe(STATUS.OK);
    });

    test("getUser should return HTTP status 400 on error", async () => {
        AWS.remock("DynamoDB.DocumentClient", "get", (_params: any, callback: Callback) => {
            callback("Invalid parameters", null);
        });

        const { statusCode }: any = await getUser(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(statusCode)).toBe(STATUS.ERROR);
    });

    test("getUser should return 400 on invalid email address", async () => {
        apiGatewayEvent.pathParameters.email = "kmorland@yahoocom";
        const response: any = await getUser(apiGatewayEvent, mockContext, mockCallback);
        expect(response.statusCode).toBe(STATUS.ERROR);
    });

    test("getUser should return 404 on unknown email address", async () => {
        apiGatewayEvent.pathParameters.email = "unknown@yahoo.com";
        AWS.remock("DynamoDB.DocumentClient", "get", (_params: any, callback: Callback) => {
            callback(null, { statusCode: STATUS.NOT_FOUND } );
        });

        const response: any = await getUser(apiGatewayEvent, mockContext, mockCallback);
        expect(response.statusCode).toBe(STATUS.NOT_FOUND);
    });

    afterAll(() => {
        AWS.restore("DynamoDB.DocumentClient");
    });
});
