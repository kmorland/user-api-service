import * as Joi from "@hapi/joi";

export class ValidateService {

    static isValidEmail(email: String): Boolean {
        const {error} = Joi.validate(email, Joi.string().email().required());
        return (error) ? false : true;
    }

}