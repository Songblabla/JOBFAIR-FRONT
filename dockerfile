FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .

# RUN yarn build

EXPOSE 3050

ENV PORT=3050

CMD ["yarn", "dev"]
