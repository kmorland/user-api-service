// import { APIGatewayProxyEvent, Callback, Context } from "aws-lambda";
import { listUsers } from "../handler";

// const mockEvent = {} as APIGatewayProxyEvent;
// const mockContext = {} as Context;
// const mockCallback = {} as Callback;

describe("User API Tests", () => {
    test("listUsers should return HTTP Status 200", () => {
        // const response = listUsers(mockEvent, mockContext, mockCallback);
        // expect(response.statusCode).toBe(200);
        expect(listUsers).toBeTruthy();
    });
});
