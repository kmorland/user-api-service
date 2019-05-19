import * as Joi from "@hapi/joi";

export class ValidateService {

    public static isValidEmail(email: string): boolean {
        const {error} = Joi.validate(email, Joi.string().email().required());
        return (error) ? false : true;
    }

}
