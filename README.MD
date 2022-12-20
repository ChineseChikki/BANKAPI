# Bank API (Bank Name: LAST Bank)

## Description

A bank app API that enables users to create a bank account (either savings or current account), perform transactions( deposit , withdrawal and transfer money to another account) Enables the user to view balance and history of their account.

- [Postman API Documentation](https://documenter.getpostman.com/view/17748340/UVXbuKYk)

![Screenshot](Bank-API.png?raw=true "Bank API")

## Technologies

The following technologies were used in this project:

- [JavaScript](https://www.javascript.com/)
- [Node.js](https://nodejs.org/en/)
- [Express](https://expressjs.com/)
- [JSON Web Tokens](https://jwt.io/)
- [MongoDB](https://www.mongodb.com/)

## Requirements

Before starting, you need to have [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/) installed. Also ensure to create a .env file in the root directory of the project, and provide the following information:

MONGO_URI: The URI of your MongoDB database.
SECRET_KEY: The secret key used to sign the JWT.
EMAIL: Mail server email address.
PASSWORD: Mail server password.

Kindly ensure that you are in the root directory before running the following commands.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run dev
```
