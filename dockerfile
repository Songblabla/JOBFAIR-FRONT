FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .

# RUN yarn build

EXPOSE 3051

ENV PORT=3051

CMD ["yarn", "dev"]
