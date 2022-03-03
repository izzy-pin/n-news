# news rn API 📰

## What's it about?

The news rn API serves content for its front-end, a social news site. This back-end controls access to data from the news rn database built with ProstgreSQL, handling queries and API calls with Express.js routing.

It was designed using the MVC framework, built using TDD and deployed to Heroku using CI/CD and GitHub Actions.

## Find the API hosted on _Heroku_

- View all currently available endpoints [here](https://newsrn.herokuapp.com/api).

## Front-end

- View the site on [Netlify](https://newsrn.netlify.app/).
- View the front-end repo [here](https://github.com/izzy-pin/news-rn-app).

## Create your own

## Setup

### Clone

- To copy this repo use
  `git clone https://github.com/izzy-pin/news-rn-back-end.git` in the directory you want to clone it to.
- Navigate into the project folder with `cd news-rn-back-end`

### Install dependencies

- To install all the dependencies and devDependencies listed in the package.json, run `npm install` in the root directory of your cloned repo.

This project uses:

| Dependencies | devDependencies |
| ------------ | --------------: |
| dotenv       |            jest |
| express      |     jest-sorted |
| pg           |         nodemon |
| pg-format    |       supertest |

### Create .env files

- dotenv is used to load the environment variables from the necessary env file into the process.env global object.
- So we need to create 2 local .env files to determine which database to connect to.

  1.  The `.env.test` file will contain only the line `PGDATABASE=nc_news_test` and connect to our test database when running our test suite.
  2.  `.env.development` will contain `PGDATABASE=nc_news` and connect to our development database when running the server manually.

### Seed the local database

- Run `npm run "setup-dbs" ` once to initially create the database.
- Then use `npm run "seed"` to seed it thereafter.

### Run the tests

- The test suite makes use of jest, jest-sorted and supertest as devDependencies to test its endpoints.
- Use `npm test app` to run the test suite file.
  - **jest** will set the `process.env` to `test` automatically to ensure we are only working with our test data.

### CI/CD

- GitHub Actions is leveraged to automate testing and deployment to Heroku and GitHub Secrets to store API keys.

### Minimum software versions needed for the project

- Postgres v8.7.1
- Node v16.9.1

---
