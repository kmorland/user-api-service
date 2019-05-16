import { DynamoDB } from 'aws-sdk';
import { GetItemOutput } from 'aws-sdk/clients/dynamodb';
import { User } from './model/user';

export class UserService {

    private db: DynamoDB.DocumentClient;

    constructor(dbClient: DynamoDB.DocumentClient) {
        this.db = dbClient;
    }

    async createUser( user: User ): Promise<User> {
        user.creationDate = new Date().toJSON();
        const params: DynamoDB.DocumentClient.PutItemInput = {
            TableName: process.env.DYNAMODB_TABLE,
            Item: user
        };

        try {
            await this.db.put(params).promise();
            return await this.getUser(user.email);
        } catch (error) {
            throw new Error(error);
        }        
    }

    async getUser( pEmail: string ): Promise<User> {
        const params: DynamoDB.DocumentClient.GetItemInput = {
            TableName: process.env.DYNAMODB_TABLE,
            Key: {email: pEmail}
        };

        try {
            const data: GetItemOutput =  await this.db.get(params).promise();
            return new User(data.Item);
        } catch (error) {
            throw new Error(error);
        }
    }

    async updateUser( pEmail: string, pUser: User ): Promise<User> {
        const params: DynamoDB.DocumentClient.UpdateItemInput = {
            TableName: process.env.DYNAMODB_TABLE,
            Key: {email: pEmail},
            UpdateExpression: `SET 
                cell = :cell, 
                gender = :gender`,
            ExpressionAttributeValues: {
                ':cell': pUser.cell,
                ':gender': pUser.gender
                //':updatedDate': new Date().toJSON()
            },
            ReturnValues: 'UPDATED_NEW'
        };

        try {
            await this.db.update(params).promise();
            return await this.getUser(pEmail);
        } catch (error) {
            console.log('update error', error);
            throw new Error(error);
        }
    }

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