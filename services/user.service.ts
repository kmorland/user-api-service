import { DynamoDB } from 'aws-sdk';
import { GetItemOutput } from 'aws-sdk/clients/dynamodb';
import { User } from './model/user';

export class UserService {

    private db: DynamoDB.DocumentClient;

    constructor(dbClient: DynamoDB.DocumentClient) {
        this.db = dbClient;
    }

    async listUsers(): Promise<User[]> {
        const params: DynamoDB.DocumentClient.ScanInput = {
            TableName: process.env.DYNAMODB_TABLE
        };
        const result: DynamoDB.DocumentClient.ScanOutput = await this.db.scan(params).promise();
        const users: User[] = result.Items.map( (u:any) => {
            return new User(u);
        });
        return users;
    }

    async createUser( user: User ): Promise<User> {
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

    async getUser( pEmail: string ): Promise<User> {
        const params: DynamoDB.DocumentClient.GetItemInput = {
            TableName: process.env.DYNAMODB_TABLE,
            Key: {email: pEmail}
        };

        try {
            const data: GetItemOutput =  await this.db.get(params).promise();
            if( !data && !data.Item ) {
                throw new Error(`User was not found with given email address ${pEmail}`);
            }
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