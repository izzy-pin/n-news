# news-rn API 📰

## What's it about?

\*_coming soon_

## Find the app hosted on _Heroku_

View the app [here](https://newsrn.herokuapp.com/api)

View a JSON object of all currently available endpoints [here](https://newsrn.herokuapp.com/api)

## Setup

### Clone:

---

- To copy this repo use
  `git clone https://github.com/izzy-pin/news-rn.git`

### Install dependencies:

---

- To install all the dependencies and devDependencies listed in the package.json, run `npm install` in the root directory of your cloned repo.

This project uses:

| Dependencies | devDependencies |
| ------------ | --------------: |
| dotenv       |            jest |
| express      |     jest-sorted |
| pg           |         nodemon |
| pg-format    |       supertest |

### Create .env files:

---

- This project use dotenv to load the environment variables from the necessary env file into the process.env global object.
- So, we need to create 2 local .env files to determine which database to connect to.

  1.  The `.env.test` file will contain only the line `PGDATABASE=nc_news_test` and connect to our test database when running our test suite.
  2.  `.env.development` will contain `PGDATABASE=nc_news` and connect to our development database when running the server manually.

### Seed the local database:

---

- Run `npm run "setup-dbs" ` once to initially create the database.
- Then use `npm run "seed"` to seed it thereafter.

### Run the tests:

---

- This test suite makes use of jest, jest-sorted and supertest as devDependencies.
- Use the command `npm test app` to run our test suite file.
  - **jest** will set the `process.env` to `test` automatically to ensure we are only working with our test data.

### Minimum software versions needed for the project

---

- Postgres v8.7.1,
- Node v16.9.1

---
