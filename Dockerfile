FROM node:14.15.0-alpine
WORKDIR /src
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm i -g @nestjs/cli@7.5.1
RUN npm install
COPY . .
RUN cp .env.example .env
RUN npm run build
EXPOSE 3000
CMD [ "npm", "start", "dist/main.js"]