// tslint:disable: no-var-requires
import * as AWS from "aws-sdk-mock";

import { APIGatewayProxyEvent, Callback, Context } from "aws-lambda";
import { listUsers } from "../handler";

import createEvent from "aws-event-mocks";

const getUserResponse = require("../data/get-user-response.json");

const mockContext = {} as Context;
const mockCallback = {} as Callback;
const apiGatewayEvent: APIGatewayProxyEvent = createEvent( { template: "aws:apiGateway" } );

jest.setTimeout(240000);

describe("listUser API Tests", () => {
    beforeAll(() => {
        AWS.mock("DynamoDB.DocumentClient", "scan", (_params, callback) => {
            callback(null, { Items: [ getUserResponse ] });
        });
    });

    test("listUsers should return HTTP Status 200 on success", async () => {
        const response: any = await listUsers(apiGatewayEvent, mockContext, mockCallback);
        expect(response.statusCode).toBe(200);
    });

    test("listUsers should return HTTP status 400 on error", async () => {
        AWS.remock("DynamoDB.DocumentClient", "scan", (_params, callback) => {
            callback(new Error("Invalid parameters"), null);
        });

        const response: any = await listUsers(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(response.statusCode)).toBe(400);
    });

    test("listUsers should return at least one user", async () => {
        const response: any = await listUsers(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(response.body)).toHaveLength(1);
    });

    afterAll(() => {
        AWS.restore("DynamoDB.DocumentClient");
    });
});
