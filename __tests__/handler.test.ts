import createEvent from "aws-event-mocks";
import { APIGatewayProxyEvent, Callback, Context } from "aws-lambda";
import { listUsers } from "../handler";

const mockContext = {} as Context;
const mockCallback = {} as Callback;

jest.setTimeout(120000);

describe("User API Tests", () => {
    test("listUsers should return HTTP Status 200", async () => {
        const apiGatewayEvent: APIGatewayProxyEvent = createEvent({
            template: "aws:apiGateway",
        });

        const response: any = await listUsers(apiGatewayEvent, mockContext, mockCallback);
        expect(response.statusCode).toBe(200);
    });
});
