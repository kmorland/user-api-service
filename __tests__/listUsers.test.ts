// tslint:disable: no-var-requires
import * as AWS from "aws-sdk-mock";

import { APIGatewayProxyEvent, Callback, Context } from "aws-lambda";
import { listUsers } from "../handler";
import { STATUS } from "../services/response.service";

import createEvent from "aws-event-mocks";

const getUserResponse = require("../data/get-user-response.json");

const mockContext = {} as Context;
const mockCallback = {} as Callback;
const apiGatewayEvent: APIGatewayProxyEvent = createEvent( { template: "aws:apiGateway" } );

jest.setTimeout(240000);

describe("listUser Tests", () => {
    beforeAll(() => {
        AWS.mock("DynamoDB.DocumentClient", "scan", (_params: any, callback: Callback) => {
            callback(null, { Items: [ getUserResponse ] });
        });
    });

    test("listUsers should return an array of 0 or more users", async () => {
        const { body }: any = await listUsers(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(body).length).toBeGreaterThanOrEqual(0);
    });

    test("listUsers should return HTTP Status 200 on success", async () => {
        const { statusCode }: any = await listUsers(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(statusCode)).toBe(STATUS.OK);
    });

    test("listUsers should return HTTP status 400 on error", async () => {
        AWS.remock("DynamoDB.DocumentClient", "scan", (_params: any, callback: Callback) => {
            callback("Invalid parameters", null);
        });

        const { statusCode }: any = await listUsers(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(statusCode)).toBe(STATUS.ERROR);
    });

    afterAll(() => {
        AWS.restore("DynamoDB.DocumentClient");
    });
});
