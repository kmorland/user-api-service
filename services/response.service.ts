export const STATUS = {
    OK: 200,
    ERROR: 400,
    NOT_FOUND: 404,
};

const HEADERS = {
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Origin": "*",
};

export class ResponseService {
    public static successResponse(data?: any) {
        return {
            statusCode: STATUS.OK,
            headers: HEADERS,
            body: (data) ? JSON.stringify(data) : null,
        };
    }

    public static errorResponse(error: any) {
        return {
            statusCode: error.errorCode || STATUS.ERROR,
            headers: HEADERS,
            body: JSON.stringify(error),
        };
    }

}
