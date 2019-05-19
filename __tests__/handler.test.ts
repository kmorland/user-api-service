import { APIGatewayProxyEvent, Callback, Context } from "aws-lambda";
import * as AWS from "aws-sdk-mock";
import { listUsers, getUser } from "../handler";

import createEvent from "aws-event-mocks";

const mockContext = {} as Context;
const mockCallback = {} as Callback;

jest.setTimeout(120000);

describe("User API Tests", () => {
    beforeAll(() => {
        console.log("WTG");
        AWS.mock("DynamoDB.DocumentClient", "scan", (params, callback) => {
            console.log("params", params);
            console.log("callback", callback);
            callback(null, "got it");
        });
    });

    test("listUsers should return HTTP Status 200", async () => {
        AWS.mock("DynamoDB.DocumentClient", "scan", (params, callback) => {
            console.log("params", params);
            console.log("callback", callback);
            callback(null, "got it");
        });
        const apiGatewayEvent: APIGatewayProxyEvent = createEvent({
            template: "aws:apiGateway",
        });

        const response: any = await listUsers(apiGatewayEvent, mockContext, mockCallback);
        expect(response.statusCode).toBe(200);
    });

    test("getUser should return 400, invalid email address", async () => {
        const apiGatewayEvent: APIGatewayProxyEvent = createEvent({
            template: "aws:apiGateway",
            merge: {
                pathParameters: {
                    email: "kmorland@yahoocom",
                },
            },
        });
        const response: any = await getUser(apiGatewayEvent, mockContext, mockCallback);
        expect(response.statusCode).toBe(400);
    });

    test("getUser body should return 'Email address required, invalid email address'", async () => {
        const apiGatewayEvent: APIGatewayProxyEvent = createEvent({
            template: "aws:apiGateway",
            merge: {
                pathParameters: {
                    email: "kmorland@yahoocom",
                },
            },
        });
        const response: any = await getUser(apiGatewayEvent, mockContext, mockCallback);
        const { error } = JSON.parse(response.body);
        expect(error).toBe("Email address required, invalid email address");
    });

    afterAll(() => {
        AWS.restore("DynamoDB.DocumentClient");
    });
});
