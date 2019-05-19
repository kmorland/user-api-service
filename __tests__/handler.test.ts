import { APIGatewayProxyEvent, Callback, Context } from "aws-lambda";
import { listUsers } from "../handler";
import * as AWS from "aws-sdk-mock";

import createEvent from "aws-event-mocks";

const mockContext = {} as Context;
const mockCallback = {} as Callback;

jest.setTimeout(120000);

describe("User API Tests", () => {
    beforeAll(() => {
        AWS.mock("DynamoDB.DocumentClient", "scan", (params, callback) => {
            console.log(params);
            console.log(callback);
        });
    });
    
    test("listUsers should return HTTP Status 200", async () => {
        const apiGatewayEvent: APIGatewayProxyEvent = createEvent({
            template: "aws:apiGateway",
        });

        const response: any = await listUsers(apiGatewayEvent, mockContext, mockCallback);
        expect(response.statusCode).toBe(200);
    });

    afterAll(() => {
        AWS.restore("DynamoDB.DocumentClient");
    });
});
