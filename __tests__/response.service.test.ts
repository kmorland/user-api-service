import { ResponseService, STATUS } from "../services/response.service";

jest.setTimeout(240000);

describe("response.service Tests", () => {
    test("successResponse should return statusCode 200", async () => {
        const { statusCode }: any = ResponseService.successResponse();
        expect(statusCode).toBe(STATUS.OK);
    });

    test("errorResponse should return statusCode 400", async () => {
        const { statusCode }: any = ResponseService.errorResponse();
        expect(statusCode).toBe(STATUS.ERROR);
    });

    test("errorResponse error thrown should return statusCode 400", async () => {
        const { statusCode }: any = ResponseService.errorResponse(new Error("Invalid Response"));
        expect(statusCode).toBe(STATUS.ERROR);
    });

    test("errorResponse should return statusCode 404", async () => {
        const { statusCode }: any = ResponseService.errorResponse({errorCode: STATUS.NOT_FOUND, message: "Not found 404"});
        expect(statusCode).toBe(STATUS.NOT_FOUND);
    });
});
