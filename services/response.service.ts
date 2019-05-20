export class ResponseService {

    public static HEADERS = {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
      };

    public static successResponse(data?: any) {
        return {
            statusCode: 200,
            headers: this.HEADERS,
            body: JSON.stringify(data),
        };
    }

    public static errorResponse(error: any) {
        return {
            statusCode: error.errorCode || 400,
            headers: this.HEADERS,
            body: JSON.stringify(error),
        };
    }

}
