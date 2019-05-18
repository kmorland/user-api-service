export class ResponseService {

    static HEADERS = {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
      };

    static successResponse(data?:any) {
        return {
            statusCode: 200,
            headers: this.HEADERS,
            body: (data) ? JSON.stringify(data) : null,
        };
    }

    static errorResponse(error: any) {
        return {
            statusCode: error.errorCode || 400,
            headers: this.HEADERS,
            body: JSON.stringify({ error: error.message }),
        };
    }

}