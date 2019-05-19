import * as Joi from "@hapi/joi";

export class ValidateService {

    static isValidEmail(email: String): Boolean {
        const {error} = Joi.validate(email, Joi.string().email().required());
        return (error) ? false : true;
    }

    static isValidUser() {
        const schema = Joi.object().keys({
            email: Joi.string().email().required(),
            phone: Joi.string().required(),
            cell: Joi.string().required(),
            gender: Joi.string().required().min(4).max(6),
            nat: Joi.string(),
            name: Joi.object().keys({
                title: Joi.string(),
                first: Joi.string().required(),
                last: Joi.string().required(),
            }),
            dob: Joi.object().keys({
                date: Joi.string.date().required(),
                age: Joi.number()
            }),
            
        });
    }

}