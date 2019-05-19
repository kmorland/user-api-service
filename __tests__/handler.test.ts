import * as AWS from "aws-sdk-mock";

import { APIGatewayProxyEvent, Callback, Context } from "aws-lambda";
import { listUsers } from "../handler";

import createEvent from "aws-event-mocks";

import getUserResponse from "../data/get-user-response.json";

const mockContext = {} as Context;
const mockCallback = {} as Callback;

jest.setTimeout(240000);

describe("User API Tests", () => {
    beforeAll(() => {
        AWS.mock("DynamoDB.DocumentClient", "scan", (_params, callback) => {
            callback(null, { Items: [ getUserResponse ] });
        });
    });

    test("listUsers should return HTTP Status 200", async () => {
        const apiGatewayEvent: APIGatewayProxyEvent = createEvent({
            template: "aws:apiGateway",
        });

        const response: any = await listUsers(apiGatewayEvent, mockContext, mockCallback);
        expect(response.statusCode).toBe(200);
    });

    test("listUsers should return at least one user", async () => {
        const apiGatewayEvent: APIGatewayProxyEvent = createEvent({
            template: "aws:apiGateway",
        });

        const response: any = await listUsers(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(response.body)).toHaveLength(1);
    });

    test("listUsers should match snapshot", async () => {
        const apiGatewayEvent: APIGatewayProxyEvent = createEvent({
            template: "aws:apiGateway",
        });

        const response: any = await listUsers(apiGatewayEvent, mockContext, mockCallback);
        expect(response).toMatchSnapshot();
    });

    afterAll(() => {
        AWS.restore("DynamoDB.DocumentClient");
    });
});
