// import { APIGatewayProxyEvent, Callback, Context } from "aws-lambda";
import { Context } from "aws-lambda";
import {} from "jest";
//import eventStub from "./stubs/list-user-event.json";
import { listUsers } from "../handler";
import * as AWS from "aws-sdk-mock";

// const mockEvent = {} as APIGatewayProxyEvent;
// const mockContext = {} as Context;
// const mockCallback = {} as Callback;

describe("User API Tests", () => {
    beforeAll(() => {
        AWS.mock("DynamoDB.DocumentClient", "scan", (params, callback) => {
            console.log(params);
            console.log(callback);
        });
    });
    
    test("listUsers should return HTTP Status 200", async () => {
        // const response = listUsers(mockEvent, mockContext, mockCallback);
        // expect(response.statusCode).toBe(200);
        //const event: APIGatewayProxyEvent = eventStub;
        const context = {};
        const result = await listUsers(null, context as Context, null);
        console.log("result", result);
        expect(result).toMatchSnapshot();
        expect(listUsers).toBeTruthy();
    });

    afterAll(() => {
        AWS.restore("DynamoDB.DocumentClient");
    });
});
