# Echtzeitkiosk - Backend

At the department of Real-Time Systems Lab (ES) at the Technische Universität Darmstadt, employees of the department got together and opened a small kiosk with self-service in the common kitchen. The kiosk was independently filled with different goods to build up a certain stock.  Initially it was financed by an appointed employee (from now on called administrator/superuser) who took over the administration of the kiosk and regularly checked the stock. As a result, any employee at the department is able to purchase available products from the kiosk with one payment. In the context of the project seminar software systems at the TU Darmstadt the two authors of this document are to develop a digital solution for inventory and invoice management. This GitHub repository contains the backend code of the project. The frontend code can be found [here](https://github.com/Echtzeitsysteme/echtzeitkiosk-frontend). You can fork this repository and use it as a template for your own project. The frontend is written in TypeScript with [React.js](https://reactjs.org/) and uses [Material-UI](https://material-ui.com/) with the react-admin library for the user interface. The backend is also written in TypeScript with [Node.js](https://nodejs.org/en/) and uses [Express.js](https://expressjs.com/) as web framework. The database is a [PostgreSQL](https://www.postgresql.org/) database and TypeORM is chosen as an object-relational mapper (ORM). Easy deployment with [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) is supported. You can utilize Traefikv2 as a reverse proxy and Let's Encrypt for SSL certificates easily with the provided docker-compose files which contains also Portainer for container management & monitoring and Adminer for database management on browser. Customer invoices can be sent via email manually or automatically using cron jobs. JWT authentication with role based authorization is implemented.


![](/es_logo_gross.jpeg)

# Setup

## Prerequisites

* Basic knowledge of the command line, UNIX, Docker, Node.js, Git, and GitHub... or the willingness to learn
* [Docker](https://www.docker.com/)
* [Docker Compose](https://docs.docker.com/compose/)
* Node - LTS (v16.17.0 at the time of writing) - installation with nvm is recommended
* npm  - LTS (v8.15.0 at the time of writing) - use it only to install yarn in order to make things consistent 
* yarn - stable (v1.22.15 at the time of writing) - install global packages with yarn instead of npm. Run `yarn` in the project root to install all dependencies of the project when you clone the repository.
* TypeScript - stable (v4.4.2 at the time of writing)
* [Git](https://git-scm.com/)
* Insomnia or Postman - for testing the API - import the provided Insomnia export file in the `./insomnia` folder. Check and edit environment variables on the top left corner of the Insomnia app.
* [Visual Studio Code](https://code.visualstudio.com) (optional)
* [Docker Desktop](https://www.docker.com/products/docker-desktop) (optional)
* [GitHub Desktop](https://desktop.github.com/) (optional)
* API - [echtzeitkiosk-backend](https://github.com/Echtzeitsysteme/echtzeitkiosk-backend)

## .env

``` 
# production || development || test
NODE_ENV=production

# port of the backend
PORT=4000

# timezone
TZ=Etc/Universal

### Database - Postgres
POSTGRES_HOST=localhost
# POSTGRES_HOST=postgresdb
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB_NAME=postgres
PGTZ='GMT'

# JWT
JWT_SECRET=secret # change this
JWT_ACCESS_EXPIRATION_MINUTES=525600 # change this
JWT_RESET_PASSWORD_EXPIRATION_MINUTES = 60
JWT_VERIFY_EMAIL_EXPIRATION_MINUTES = 10080

# EMAIL
SMTP_HOST=
SMTP_PORT=
SMTP_USERNAME=test@mail.com # change this
SMTP_PASSWORD=password # change this
EMAIL_FROM_NAME=Echtzeitkiosk
EMAIL_FROM_ADDRESS=test@mail.com # change this

# Used for generating URLs for email templates (e.g. password reset, download PDF from backend server)
BACKEND_URL=http://localhost:4000/v1
FRONTEND_URL=http://localhost:3000

SUPERUSER_EMAIL=test@mail.com# change this
SUPERUSER_PASSWORD=Password123! # change this but follow the password rules
INVITATION_CODE=1A-2B-3C-4D # change this

# At 05:00 AM, on day 1 of the every month, https://crontab.cronhub.io/
MONTHLY_INVOICE_CRON_JOB_STRING=0 0 5 1 * *
```
## CLI Commands
Useful scripts/commands can be found in packag.json. Some of them are deprecated but still useful as example. The following scripts can be used:
* `yarn dev`
  * Run the server in development mode with hot reloading
* `yarn dev:debug`
  * Run the server in development mode with hot reloading and debugging. You should start the debugger in VS Code after running this command and set breakpoints in the code.
* `yarn build`
  * Build the server for production
* `yarn start`
  * Run the server in production mode using the built files
* `yarn lint`
  * Run ESLint on the project and run TypeScript compiler to check for type errors etc.
* `yarn lint:fix`
  * Try to fix linting errors automatically
* `yarn format-lint`
  * Run Prettier on the project to format the code
* `yarn format-fix`
  * Try to fix formatting errors automatically
* `yarn commit`
  * Run commitizen to create a commit message with emojis
* `yarn docker:db-dev`
  * Run the database in development mode and follow output. Database data is stored in the `./database` folder. Check `.env.db-dev` for DB connection details.
* For migration scripts, check the `./src/orm/migrations` folder. First you should create a new migration file with `yarn migration:create new-migration-name` and then you can follow the TypeORM docs to handle migrations. Use migration scripts carefully.

## GitHub Actions
* `./github/workflows/arm64.yml`  and `./github/workflows/amd64.yml` are used to build docker images for ARM64 and AMD64 architectures respectively and then push them to GitHub Container Registry. When a new commit is pushed to the `deployment` branch, the workflow is triggered. You can use the images in your own project by changing the image name in the docker-compose files. 
  * Images are stored in the `packages` tab of the GitHub Container Registry.
    * https://github.com/Echtzeitsysteme/echtzeitkiosk-frontend/pkgs/container/echtzeitkiosk-frontend
  * https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry
  * You should create a `read:packages` token on GitHub. Then you can use it on your server to pull the images from GitHub Container Registry.
  * Be sure that you pull the correct image for your architecture. You can check your architecture with `uname -m` command on your server. And you should also use the correct image in your docker-compose file.

## Docker and Docker Compose

### Dockerfile
* Two step build
  * FROM node as builder
    * transpile TypeScript to JavaScript
  * FROM node:lts-alpine
    * serves the built server app


### Docker Compose
#### docker-compose.yml
* `./docker-compose.yml` is used to run the application in development mode without SSL certificates and reverse proxy. You should use it only for development purposes. You can use it to run the application in production mode if you don't want to use Traefikv2 and Let's Encrypt. Be sure that you set open required ports in your firewall for the services that you want to expose to the internet. 
#### docker-compose.with-traefik.yml
* `./docker-compose.with-traefik.yml` is used to run the application in production mode with Traefikv2 and Let's Encrypt. You can use it for production purposes. Be sure that you set open required ports in your firewall for the services that you want to expose to the internet. You can play with labels to configure Traefikv2.
  * Check this documentation: https://rafrasenberg.com/posts/docker-container-management-with-traefik-v2-and-portainer/

## Server Infrastructure
Follow this documentation to set up your server infrastructure with SSL and reverse proxy: https://rafrasenberg.com/posts/docker-container-management-with-traefik-v2-and-portainer/


Check `/server_infrastructure` folder. Create a project workspace on your server, for example `/home/your_username/echtzeitkiosk` and then create the following folders:
```
/home/your_username/echtzeitkiosk
├── echtzeitkiosk-frontend
├── echtzeitkiosk-backend
``` 
Database and log folders are created automatically inside the echtzeitkiosk-backend folder by docker-compose. You can change the paths in the docker-compose files.

Copy the compose files to their respective folders. Use docker-compose.with-traefik.yml, for SSL and reverse proxy. You should also copy the .env file for backend. Example:
```
/home/your_username/echtzeitkiosk
├── echtzeitkiosk-frontend
│   ├── docker-compose.yml
├── echtzeitkiosk-backend
│   ├── docker-compose.yml
│   ├── .env
```
Pull the required images from GitHub Container Registry. You can use the following commands for amd64:
```
docker pull ghcr.io/echtzeitsysteme/echtzeitkiosk-backend:amd64
docker pull ghcr.io/echtzeitsysteme/echtzeitkiosk-frontend:amd64
```
And then run the containers with docker compose:
```
docker compose up -d
```

## Useful Tips and Notes

* `src/index.ts` is the entry point of the application like the `main.cpp` in C++ and `Main.java` in Java.
* Check CORS settings of your backend if you get any problems after a deployment, when you try to access the API from a browser.
* Check console logs of the browser if you get any problems after a deployment or while developing. Be sure that the API URL is correct. You should see someting like this in the console: `API_URL http://localhost:4000/v1`. You can also use tact Developer Tools extension of the browser to inspect the React components. 
* Do not delete the `yarn.lock` file. It is used to lock the versions of the dependencies of the project. If you delete it, you may get different versions of the dependencies and you may get errors. Do not use `npm` to install dependencies. Use `yarn` instead. If you use `npm` to install dependencies, you may get different versions of the dependencies and you may get errors. Furthermore `npm` is not compatible with `yarn.lock` file. If you use `npm` to install dependencies, you will get an extra `package-lock.json` file which will make the project inconsistent. So use `yarn` to install dependencies and if you want to install a global package, use `yarn global add <package-name>` instead of `npm install -g <package-name>`. yarn is also used for Docker images. So if you use `npm` to install dependencies, you may get different versions of the dependencies in the Docker image and you may get errors.
* POSTGRES_HOST variable for PostgreSQL connection is be postgres (for Docker) or localhost (for local development). However, it depens on the network settings of the Docker Compose file. If you want to use a different host or it does not work somehow, you should change and check possibilities for the correct match.
  
## Commit Messages

### **`yarn commit`**

This project uses [commitizen](https://github.com/commitizen/cz-cli) with the cz-emoji extension to standardize commit messages. To use it, run `yarn commit` instead of `git commit` after staging your changes. You will be prompted to select a commit type and write a commit message. You can select the commit type by typing keywords or with arrow keys. The commit message will be automatically formatted according to the commit type. cz-cli package is also installed to use commitizen from the command line. Be sure that required dependencies are installed before using it. You can also use the normal `git commit` command. We don't validate commit messages, but it's a good practice to use commitizen.

## Credits

* [This project](https://github.com/mkosir/typeorm-express-typescript) was used as boilerplate for this project.
* Inspired by [node-express-boilerplate](https://github.com/hagopj13/node-express-boilerplate) project.
* [pdfkit](https://www.npmjs.com/package/pdfkit) to generate PDF invoices.
* [Deployment with Docker & Traefikv2 & free SSL certs from Let’s Encrypt](https://rafrasenberg.com/posts/docker-container-management-with-traefik-v2-and-portainer/)
* [GitHub Copilot](https://github.com/features/copilot/) - AI assisted code completion and suggestions. 😉
* [Tabnine](https://www.tabnine.com/) - AI assisted code completion and suggestions. 😉
* and many more packages which are listed in package.json.

# Changelog

## [0.1.0] - 2022-09-14

Init release.

### Major changes

- Initial release

### Changed features

- Initial release

# Roadmap (implicit post-mortem 🥲)

- [ ] Code splitting 🙈
- [ ] Better folder structure 🙈
- [ ] Use JSON body instead of url-encoding 🙈 
- [ ] Testing 🙈
- [ ] Better CI/CD and linting\ 
  - [ ] lint-staged\🤕
  - [ ] husky🤕
  - [ ] ...
- [ ] "DRY" 🙈
- [ ] Use proper strict TypeScript with TSC_COMPILE_ON_ERROR=false... 🥲
  - [ ] Use more TypeScript features like Interfaces, Enums, etc. 🙈
- [ ] Avoid loops inside loops 🙈
  - [ ] Use the built-in Promise object to optimize code 🙈
- [ ] Use websockets for real-time updates for React ⚡️
- [ ] Improve SQL queries and relations 🙈
- [ ] Use TypeORM migrations
- [ ] Controller validations 🙈

# Contributing

Feel free to contribute to this project. You can open an issue or a pull request. If you want to contribute to this project.

# LICENSE

[GNU General Public License v3.0](LICENSE)
