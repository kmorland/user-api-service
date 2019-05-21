import { DocumentClient, UpdateItemOutput } from "aws-sdk/clients/dynamodb";
import { STATUS } from "./response.service";

export class UserService {

    private createdClient: DocumentClient;

// tslint:disable-next-line: no-empty
    constructor() {}

    /**
     * List of users, queries DynamoDB.  No limit set, just returns all records
     * @returns {Promise<DocumentClient.ScanOutput>} array of users
     * @author Kevin Morland
     * @public
     */
    public async listUsers(): Promise<DocumentClient.ScanOutput> {
        try {
            const params: DocumentClient.ScanInput = {
                TableName: process.env.DYNAMODB_TABLE,
            };
            return await this.client().scan(params).promise();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Creates user, from post request.  Fails if user exists
     * @param {any} user User object, from lambda handler
     * @returns {Promise<any>} created user
     * @author Kevin Morland
     * @public
     */
    public async createUser(user: any): Promise<any> {
        try {
            user.timestamp = {
                createdAt: new Date().toJSON(),
                updatedAt: new Date().toJSON(),
            };
            const params: DocumentClient.PutItemInput = {
                TableName: process.env.DYNAMODB_TABLE,
                Item: user,
                ConditionExpression: `attribute_not_exists(email)`,
                ReturnValues: "ALL_OLD",
            };

            await this.client().put(params).promise();
            return { Item: user };
        } catch (error) {
            if ( error && error.code === "ConditionalCheckFailedException" ) {
                throw { errorCode: STATUS.ERROR, message: `User already exist with email address ${user.email}` };
            }
            throw error;
        }
    }

    /**
     *  Returns the user by the key, which is the email field.
     * @param {string} pEmail Email address
     * @returns {Promise<DocumentClient.GetItemOutput>} user by email address
     * @author Kevin Morland
     * @public
     */
    public async getUser(pEmail: string): Promise<DocumentClient.GetItemOutput> {
        try {
            const params: DocumentClient.GetItemInput = {
                TableName: process.env.DYNAMODB_TABLE,
                Key: { email: pEmail },
            };
            const data: DocumentClient.GetItemOutput = await this.client().get(params).promise();
            if (!data || !data.Item) {
                throw { message: `User was not found with given email address ${pEmail}`, errorCode: STATUS.NOT_FOUND };
            }
            return data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Updates the user, from the PUT body
     * @param {string} pEmail
     * @param {string} pUser
     * @returns {Promise<UpdateItemOutput>} Returns the updated user
     * @author Kevin Morland
     */
    public async updateUser(pEmail: string, user: any): Promise<UpdateItemOutput> {
        try {
            const params: DocumentClient.UpdateItemInput = {
                TableName: process.env.DYNAMODB_TABLE,
                Key: { email: pEmail },
                UpdateExpression: `SET
                    gender = :gender,
                    cell = :cell,
                    phone = :phone,
                    #name = :name,
                    dob = :dob,
                    #location = :location,
                    #timestamp.updatedAt = :updatedAt`,
                ExpressionAttributeValues: {
                    ":cell": user.cell,
                    ":email": user.email,
                    ":gender": user.gender,
                    ":phone": user.phone,
                    ":name": user.name,
                    ":dob": user.dob,
                    ":location": user.location,
                    ":updatedAt": new Date().toJSON(),
                },
                ExpressionAttributeNames: {
                    "#name": "name",
                    "#location": "location",
                    "#timestamp": "timestamp",
                },
                ConditionExpression: "email = :email",
                ReturnValues: "ALL_NEW",
            };
            return await this.client().update(params).promise();
        } catch (error) {
            if ( error && error.code === "ConditionalCheckFailedException" ) {
                throw { errorCode: STATUS.NOT_FOUND, message: `User does not exist with email address ${pEmail}, user not found` };
            }
            throw error;
        }
    }

    /**
     * Deletes the user from the dynamodb table, by key
     * @param {string} pEmail
     * @returns {Promise<DocumentClient.DeleteItemOutput>}
     * @author Kevin Morland
     */
    public async deleteUser(pEmail: string): Promise<DocumentClient.DeleteItemOutput> {
        try {
            const params: DocumentClient.DeleteItemInput = {
                TableName: process.env.DYNAMODB_TABLE,
                Key: {
                    email: pEmail,
                },
                ExpressionAttributeValues: {
                    ":email" : pEmail,
                },
                ConditionExpression: "email = :email",
                ReturnValues: "NONE",
            };
            return await this.client().delete(params).promise();
        } catch (error) {
            if ( error && error.code === "ConditionalCheckFailedException" ) {
                throw { errorCode: STATUS.NOT_FOUND, message: `User does not exist with email address ${pEmail}` };
            }
            throw error;
        }
    }

    private client = () => (this.createdClient || this.createClient());
    private createClient = () => {
        this.createdClient = new DocumentClient({ region: "us-east-1" });
        return this.createdClient;
    }
}
