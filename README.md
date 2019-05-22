## Orange Theory Fitness -- User API Sample

Developed by Kevin Morland!

### Serverless API
  
`serverless deploy -r us-east-1 --aws-profile profile_name -s dev` 

Generates a serverless API with: 
  - POST `/users`, creates a user
  - GET `/users`, retrieves all users
  - GET `/users/{email}`, retrieves a single user by email
  - DELETE `/users/{email}`, delete a single user by email
  - PUT `/users/{email}`, update a single user by email
  - `package.json` with npm commands `test`

#### Want to add DynamoDB to your API?

Just add `--dynamodb` to the api command and it will create a table with the endpoint name

`create-serverless api --actions crud --endpoints users --dynamodb`  creates a DynamoDB table `users`

  
### Payment (Stripe)  

`create-serverless payment --stripe` 
  
Generates a serverless payment micro service, ready for Stripe Checkout integration with: 
- POST `/create-payment`, creates a Stripe charge


#### TODO: 
- multiple endpoints
- appending new endpoints to existing ones
- AWS SNS integration, 
- AWS Cognito integration
- Generate API w/ API GW from Swagger file
- Generate API w/ API GW from API Blueprint file
