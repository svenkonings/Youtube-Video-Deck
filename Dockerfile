FROM node:lts-alpine as builder
WORKDIR /usr/src/app
COPY package.json .
RUN npm install && npm cache clean --force
COPY . .
RUN npm run sync
RUN npm run build

FROM node:lts-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package.json .
COPY --from=builder /usr/src/app/build build
CMD ["node", "build"]
