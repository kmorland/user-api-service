// tslint:disable: no-var-requires
import * as AWS from "aws-sdk-mock";

import { APIGatewayProxyEvent, Callback, Context } from "aws-lambda";
import { createUser } from "../handler";
import { STATUS } from "../services/response.service";

import createEvent from "aws-event-mocks";

const createUserBody = require("../data/create-user-body.json");
const createUserInvalid = require("../data/create-user-invalid.json");

const mockContext = {} as Context;
const mockCallback = {} as Callback;
const apiGatewayEvent: APIGatewayProxyEvent = createEvent({
    template: "aws:apiGateway",
    merge: {
        body: JSON.stringify(createUserBody),
    },
});

jest.setTimeout(240000);

describe("createUser Tests", () => {
    beforeAll(() => {
        AWS.mock("DynamoDB.DocumentClient", "get", (_params: any, callback: Callback) => {
            callback(null, null);
        });

        AWS.mock("DynamoDB.DocumentClient", "put", (_params: any, callback: Callback) => {
            callback(null, { Item: createUserBody });
        });
    });

    test("createUser should return HTTP status 200", async () => {
        const { statusCode }: any = await createUser(apiGatewayEvent, mockContext, mockCallback);
        expect(statusCode).toBe(200);
    });

    test("createUser should return created user", async () => {
        const { body }: any = await createUser(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(body)).toEqual(createUserBody);
    });

    test("createUser invalid user body return HTTP status 400 on error", async () => {

        apiGatewayEvent.body = JSON.stringify(createUserInvalid);

        const { statusCode }: any = await createUser(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(statusCode)).toBe(STATUS.ERROR);
    });

    // test("getUser should return HTTP status 400 on error", async () => {
    //     AWS.remock("DynamoDB.DocumentClient", "get", (_params: any, callback: Callback) => {
    //         callback(new Error("Invalid parameters"), null);
    //     });

    //     const { statusCode }: any = await getUser(apiGatewayEvent, mockContext, mockCallback);
    //     expect(JSON.parse(statusCode)).toBe(STATUS.ERROR);
    // });

    // test("getUser should return 400 on invalid email address", async () => {
    //     apiGatewayEvent.pathParameters.email = "kmorland@yahoocom";
    //     const response: any = await getUser(apiGatewayEvent, mockContext, mockCallback);
    //     expect(response.statusCode).toBe(STATUS.ERROR);
    // });

    // test("getUser should return 404 on unknown email address", async () => {
    //     apiGatewayEvent.pathParameters.email = "unknown@yahoo.com";
    //     AWS.remock("DynamoDB.DocumentClient", "get", (_params: any, callback: Callback) => {
    //         callback(null, { statusCode: STATUS.NOT_FOUND } );
    //     });

    //     const response: any = await getUser(apiGatewayEvent, mockContext, mockCallback);
    //     expect(response.statusCode).toBe(STATUS.NOT_FOUND);
    // });

    afterAll(() => {
        AWS.restore("DynamoDB.DocumentClient");
    });
});
