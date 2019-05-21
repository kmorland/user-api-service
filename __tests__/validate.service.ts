// tslint:disable: no-var-requires
import { ValidateService } from "../services/validate.service";

const existingUser = require("../data/existing-user.json");

jest.setTimeout(240000);

describe("validate.service Tests", () => {
    test("isValidEmail should return true for valid email", async () => {
        const result: boolean = ValidateService.isValidEmail(existingUser.email);
        expect(result).toBe(true);
    });

    test.skip("isValidEmail should throw error for invalid email", async () => {
        // const result = ValidateService.isValidEmail("1234");
        expect(ValidateService.isValidEmail("1234")).toThrowError();
    });

    test("isValidUser should return true for valid user", async () => {
        const result: boolean = ValidateService.isValidUser(existingUser);
        expect(result).toBe(true);
    });

    test.skip("isValidUser should throw error for invalid user", async () => {
        // const result = ValidateService.isValidUser({});
        expect(ValidateService.isValidUser({})).toThrowError();
    });
});
