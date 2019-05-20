import * as Joi from "@hapi/joi";
import { STATUS } from "./response.service";

export class ValidateService {

    public static isValidEmail(email: string): boolean {
        const {error} = Joi.validate(email, Joi.string().email().required());
        if (error) { throw { errorCode: STATUS.ERROR, message: "Email address required, invalid email address" }; }
        return true;
    }

    public static isValidUser(userData: any) {
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
                date: Joi.date().required(),
                age: Joi.number(),
            }),
            location: {
                street: Joi.string().required(),
                city: Joi.string().required(),
                state: Joi.string().required(),
                postcode: Joi.number().required(),
                coordinates: {
                    latitude: Joi.string(),
                    longitude: Joi.string(),
                },
                timezone: {
                    offset: Joi.string(),
                    description: Joi.string(),
                },
            },
            picture: {
                large: Joi.string(),
                thumbnail: Joi.string(),
                medium: Joi.string(),
            },
            registered: {
                date: Joi.date(),
                age: Joi.number(),
            },
        }).unknown();
        const { error } = Joi.validate(userData, schema);
        if (error) {
           throw { errorCode: STATUS.ERROR, message: error.details[0].message };
        }
        return true;
    }
}
