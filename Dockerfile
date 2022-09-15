FROM node:lts-alpine

ENV TZ Etc/Universal
RUN apk update && apk add tzdata

WORKDIR /app

COPY ./package.json .
COPY ./yarn.lock .

RUN yarn install --frozen-lockfile --network-timeout 1000000

COPY . .

RUN yarn global add rimraf

RUN yarn build

RUN mkdir -p /app/log

EXPOSE 4000

CMD [ "yarn", "start" ]