import { DynamoDB } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export class UserService {

    private db: DocumentClient;

    constructor(dbClient: DocumentClient) {
        this.db = dbClient;
    }

    /**
     * List of users, queries DynamoDB
     * @returns {Promise<ScanOutput>} array of users
     * @author Kevin Morland
     */
    async listUsers(): Promise<DocumentClient.ScanOutput> {
        const params: DocumentClient.ScanInput = {
            TableName: process.env.DYNAMODB_TABLE
        };
        return await this.db.scan(params).promise();
    }

    /**
     * Creates user, from post request
     * @param {any} user
     * @returns {Promise<GetItemOutput>} created user
     * @author Kevin Morland
     */
    async createUser( user: any ): Promise<DocumentClient.GetItemOutput> {
        user.creationDate = new Date().toJSON();
        const params: DocumentClient.PutItemInput = {
            TableName: process.env.DYNAMODB_TABLE,
            Item: user,
        };

        try {
            const userCheckParams: DocumentClient.GetItemInput = {
                TableName: process.env.DYNAMODB_TABLE,
                Key: {email : user.email}
            }
            const userCheck: DocumentClient.GetItemOutput = await this.db.get(userCheckParams).promise();
            if( userCheck && userCheck.Item ) {
                throw new Error(`User already exists, with email ${user.email}`);
            }

            await this.db.put(params).promise();
            return await this.getUser(user.email);
        } catch (error) {
            throw new Error(error);
        }        
    }
    
    /**
     *  Returns the user by the key, which is the email field
     *  @returns {Promise<GetItemOutput>} user by email address
     *  @author Kevin Morland
     */
    async getUser( pEmail: string ): Promise<DocumentClient.GetItemOutput> {
        const params: DocumentClient.GetItemInput = {
            TableName: process.env.DYNAMODB_TABLE,
            Key: {email: pEmail}
        };

        try {
            const data: DocumentClient.GetItemOutput =  await this.db.get(params).promise();
            if( !data || !data.Item ) {
                throw { errorMessage: `User was not found with given email address ${pEmail}`, errorCode: 404 };
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
     * @returns  {Promise<DocumentClient.GetItemOutput>} Returns the updated user
     * @author Kevin Morland
     */
    async updateUser( pEmail: string, pUser: any ): Promise<DocumentClient.GetItemOutput> {
        const params: DocumentClient.UpdateItemInput = {
            TableName: process.env.DYNAMODB_TABLE,
            Key: {email: pEmail},
            UpdateExpression: `SET 
                gender = :gender,
                cell = :cell,
                phone = :phone,
                #name = :name,
                dob = :dob,
                #location = :location,
                updatedDate = :updatedDate`,
            ExpressionAttributeValues: {
                ':cell': pUser.cell,
                ':gender': pUser.gender,
                ':phone' : pUser.phone,
                ':name' : pUser.name,
                ':dob' : pUser.dob,
                ':location' : pUser.location,
                ':updatedDate': new Date().toJSON()
            },
            ExpressionAttributeNames: {
                "#name": "name",
                "#location": "location"
            },
            ReturnValues: 'UPDATED_NEW'
        };

        try {
            
            const updatedUser: DynamoDB.DocumentClient.UpdateItemOutput = await this.db.update(params).promise();
            if( !updatedUser.Attributes ) {
                throw { errorMessage: `User was not found with given email address ${pEmail}`, errorCode: 404 };
            }
            return await this.getUser(pEmail);
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * Deletes the user from the dynamodb table, by key
     * @param {string} pEmail
     * @returns {Promise<DocumentClient.DeleteItemOutput>}
     * @author Kevin Morland 
     */
    async deleteUser (pEmail: string): Promise<DocumentClient.DeleteItemOutput> {
        const params: DocumentClient.DeleteItemInput = {
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                email: pEmail
            },
            ReturnValues: 'NONE'
        };
        try {
            return this.db.delete(params).promise();    
        } catch (error) {
            throw new Error(error);
        }
    }
}