// tslint:disable: no-var-requires
import * as AWS from "aws-sdk-mock";

import { APIGatewayProxyEvent, Callback, Context } from "aws-lambda";
import { updateUser } from "../handler";
import { STATUS } from "../services/response.service";

import createEvent from "aws-event-mocks";
import { ConditionalCheckFailedException } from "../exceptions/conditional-check-failed-exception";

const updateUserBody = require("../data/update-user-body.json");
const updateUserInvalid = require("../data/create-user-invalid.json");
const existingUser = require("../data/existing-user.json");

const mockContext = {} as Context;
const mockCallback = {} as Callback;
const apiGatewayEvent: APIGatewayProxyEvent = createEvent({
    template: "aws:apiGateway",
    merge: {
        body: JSON.stringify(updateUserBody),
        pathParameters: {
            email: "known@email.com",
        },
    },
});

jest.setTimeout(240000);

describe("updateUser Tests", () => {
    beforeAll(() => {
        AWS.mock("DynamoDB.DocumentClient", "update", (_params: any, callback: Callback) => {
            callback(null, { Attributes: updateUserBody });
        });
    });

    test("updateUser should return HTTP status 200", async () => {
        const { statusCode }: any = await updateUser(apiGatewayEvent, mockContext, mockCallback);
        expect(statusCode).toBe(STATUS.OK);
    });

    test("updateUser should return updated user", async () => {
        const { body }: any = await updateUser(apiGatewayEvent, mockContext, mockCallback);
        const user: any = JSON.parse(body);
        expect(user).toHaveProperty("gender");
        expect(user).toHaveProperty("email");
        expect(user).toHaveProperty("name");
        expect(user).toHaveProperty("dob");
        expect(user).toHaveProperty("phone");
        expect(user).toHaveProperty("cell");
        expect(user).toHaveProperty("nat");
        expect(user).toHaveProperty("location");
        expect(user).toHaveProperty("picture");
    });

    test("udpateUser invalid parameter return HTTP status 400 on error", async () => {
        AWS.remock("DynamoDB.DocumentClient", "update", (_params: any, callback: Callback) => {
            callback(new Error("Invalid parameters"), null);
        });

        const { statusCode }: any = await updateUser(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(statusCode)).toBe(STATUS.ERROR);
    });

    test("updateUser invalid user validation check HTTP status 400 on error", async () => {
        apiGatewayEvent.body = JSON.stringify(updateUserInvalid);
        const { statusCode }: any = await updateUser(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(statusCode)).toBe(STATUS.ERROR);
    });

    test("updateUser invalid user validation message should contain at least one error", async () => {
        apiGatewayEvent.body = JSON.stringify(updateUserInvalid);
        const { body }: any = await updateUser(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(body).message).toHaveLength(1);
    });

    test("updateUser user not found HTTP status 404 on error", async () => {
        apiGatewayEvent.pathParameters.email = "unknownuser@gmail.com";
        apiGatewayEvent.body = JSON.stringify(existingUser);

        AWS.remock("DynamoDB.DocumentClient", "update", (_params: any, callback: Callback) => {
            callback(new ConditionalCheckFailedException("ConditionalCheckFailedException", `User does not exist with email address ${apiGatewayEvent.pathParameters.email}, user not found`), null);
        });

        const { statusCode }: any = await updateUser(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(statusCode)).toBe(STATUS.NOT_FOUND);
    });

    test("updateUser user not found check error message", async () => {
        apiGatewayEvent.pathParameters.email = "unknownuser@gmail.com";
        apiGatewayEvent.body = JSON.stringify(existingUser);

        AWS.remock("DynamoDB.DocumentClient", "update", (_params: any, callback: Callback) => {
            callback(new ConditionalCheckFailedException("ConditionalCheckFailedException", `User does not exist with email address ${apiGatewayEvent.pathParameters.email}, user not found`), null);
        });

        const { body }: any = await updateUser(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(body).message).toBe(`User does not exist with email address ${apiGatewayEvent.pathParameters.email}, user not found`);
    });

    afterAll(() => {
        AWS.restore("DynamoDB.DocumentClient");
    });
});
