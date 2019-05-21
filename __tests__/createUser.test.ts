// tslint:disable: no-var-requires
import * as AWS from "aws-sdk-mock";

import { APIGatewayProxyEvent, Callback, Context } from "aws-lambda";
import { createUser } from "../handler";
import { STATUS } from "../services/response.service";

import createEvent from "aws-event-mocks";
import { ConditionalCheckFailedException } from "../exceptions/conditional-check-failed-exception";

const createUserBody = require("../data/create-user-body.json");
const createUserInvalid = require("../data/create-user-invalid.json");
const existingUser = require("../data/existing-user.json");

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
        AWS.mock("DynamoDB.DocumentClient", "put", (_params: any, callback: Callback) => {
            callback(null, null);
        });
    });

    test("createUser should return HTTP status 200", async () => {
        const { statusCode }: any = await createUser(apiGatewayEvent, mockContext, mockCallback);
        expect(statusCode).toBe(STATUS.OK);
    });

    test("createUser should return created user", async () => {
        const { body }: any = await createUser(apiGatewayEvent, mockContext, mockCallback);
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

    test("createUser invalid parameter return HTTP status 400 on error", async () => {
        AWS.remock("DynamoDB.DocumentClient", "put", (_params: any, callback: Callback) => {
            callback("Invalid parameters", null);
        });

        const { statusCode }: any = await createUser(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(statusCode)).toBe(STATUS.ERROR);
    });

    test("createUser invalid user validation check HTTP status 400 on error", async () => {
        apiGatewayEvent.body = JSON.stringify(createUserInvalid);
        const { statusCode }: any = await createUser(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(statusCode)).toBe(STATUS.ERROR);
    });

    test("createUser invalid user validation message should contain at least one error", async () => {
        apiGatewayEvent.body = JSON.stringify(createUserInvalid);
        const { body }: any = await createUser(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(body).message).toHaveLength(1);
    });

    test("createUser user already exist HTTP status 400 on error", async () => {
        AWS.remock("DynamoDB.DocumentClient", "put", (_params: any, callback: Callback) => {
            callback(new ConditionalCheckFailedException("ConditionalCheckFailedException", `User already exist with email address ${existingUser.email}`), null);
        });
        apiGatewayEvent.body = JSON.stringify(existingUser);
        const { statusCode }: any = await createUser(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(statusCode)).toBe(STATUS.ERROR);
    });

    test("createUser user already exist check error message", async () => {
        AWS.remock("DynamoDB.DocumentClient", "put", (_params: any, callback: Callback) => {
            callback(new ConditionalCheckFailedException("ConditionalCheckFailedException", `User already exist with email address ${existingUser.email}`), null);
        });
        apiGatewayEvent.body = JSON.stringify(existingUser);
        const { body }: any = await createUser(apiGatewayEvent, mockContext, mockCallback);
        expect(JSON.parse(body).message).toBe(`User already exist with email address ${existingUser.email}`);
    });

    afterAll(() => {
        AWS.restore("DynamoDB.DocumentClient");
    });
});
