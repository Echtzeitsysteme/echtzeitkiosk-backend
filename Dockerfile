FROM node:lts-alpine

#set timezone
ENV TZ Etc/Universal
RUN apk update && apk add tzdata

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install

# Bundle app source
COPY . .

CMD [ "node", "--trace-warnings","src/index.ts" ]