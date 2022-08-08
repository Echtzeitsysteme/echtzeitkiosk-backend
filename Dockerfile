FROM node as builder

ENV TZ Etc/Universal

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM node:lts-alpine

#set timezone
ENV TZ Etc/Universal
RUN apk update && apk add tzdata

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json yarn.lock ./

RUN yarn install --production --frozen-lockfile

COPY --from=builder /usr/src/app/dist ./dist
RUN mkdir -p /usr/src/app/log

EXPOSE 4000
CMD [ "node", "--trace-warnings","dist/index.js" ]