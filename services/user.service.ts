import { DynamoDB } from 'aws-sdk';
import { GetItemOutput } from 'aws-sdk/clients/dynamodb';

export class UserService {

    private db: DynamoDB.DocumentClient;

    constructor(dbClient: DynamoDB.DocumentClient) {
        this.db = dbClient;
    }

    /**
     * List of users, queries DynamoDB
     * @returns {Promise<DynamoDB.DocumentClient.ScanOutput>} array of users
     * @author Kevin Morland
     */
    async listUsers(): Promise<DynamoDB.DocumentClient.ScanOutput> {
        const params: DynamoDB.DocumentClient.ScanInput = {
            TableName: process.env.DYNAMODB_TABLE
        };
        return await this.db.scan(params).promise();
    }

    /**
     * Creates user, from post request
     * @param {any} user
     * @returns {Promise<DynamoDB.DocumentClient.GetItemOutput>} created user
     * @author Kevin Morland
     */
    async createUser( user: any ): Promise<DynamoDB.DocumentClient.GetItemOutput> {
        user.creationDate = new Date().toJSON();
        const params: DynamoDB.DocumentClient.PutItemInput = {
            TableName: process.env.DYNAMODB_TABLE,
            Item: user,
        };

        try {
            const userCheckParams: DynamoDB.DocumentClient.GetItemInput = {
                TableName: process.env.DYNAMODB_TABLE,
                Key: {email : user.email}
            }
            const userCheck: GetItemOutput = await this.db.get(userCheckParams).promise();
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
     *  @returns {Promise<DynamoDB.DocumentClient.GetItemOutput>} user by email address
     *  @author Kevin Morland
     */
    async getUser( pEmail: string ): Promise<DynamoDB.DocumentClient.GetItemOutput> {
        const params: DynamoDB.DocumentClient.GetItemInput = {
            TableName: process.env.DYNAMODB_TABLE,
            Key: {email: pEmail}
        };

        try {
            const data: DynamoDB.DocumentClient.GetItemOutput = await this.db.get(params).promise();
            if( !data && !data.Item ) {
                throw { errorMessage: `User was not found with given email address ${pEmail}`, errorCode: 404 };
            }
            return data;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * Updates the user, from the PUT body
     * @param {string} pEmail 
     * @param {string} pUser
     * @returns  {Promise<DynamoDB.DocumentClient.GetItemOutput>} Returns the updated user
     * @author Kevin Morland
     */
    async updateUser( pEmail: string, pUser: any ): Promise<DynamoDB.DocumentClient.GetItemOutput> {
        const params: DynamoDB.DocumentClient.UpdateItemInput = {
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
            
            const updatedUser: DynamoDB.DocumentClient.UpdateItemOutput =await this.db.update(params).promise();
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
     * @returns {Promise<DynamoDB.DocumentClient.DeleteItemOutput>}
     * @author Kevin Morland 
     */
    async deleteUser (pEmail: string): Promise<DynamoDB.DocumentClient.DeleteItemOutput> {
        const params: DynamoDB.DocumentClient.DeleteItemInput = {
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