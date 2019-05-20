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
});
