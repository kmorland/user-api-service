## Orange Theory Fitness -- User API Sample

Developed by Kevin Morland!

### Serverless API Installation for AWS cloud environment
`npm install`

Make sure you have latest version of serverless framework installed
`serverless -v` 1.42.3

### Serverless API Deployment
  
`serverless deploy -r us-east-1 --aws-profile profile_name -s dev` 

Generates a serverless API with: 
  - POST `/users`, creates a user
  - GET `/users`, retrieves all users
  - GET `/users/{email}`, retrieves a single user by email
  - DELETE `/users/{email}`, delete a single user by email
  - PUT `/users/{email}`, update a single user by email
  
Generates API Gateway, Lambda, and DynamoDB

#### Want to test the API?

Test are written using JEST
To execute test

`npm run test`  Runs the test suites, which consist of 7 test suites and 33 test. 
  
### Documentation provided  

Login into AWS console.  API Gateway -> Documentation -> Publish -> Swagger or Open API for Postman

Generates a file that can be imported into Swagger or Postman, depending what you choose.
