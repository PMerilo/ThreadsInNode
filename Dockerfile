FROM node

WORKDIR /usr/src/app

COPY . .

RUN apt-get update && apt-get install -y curl

RUN npm install 

EXPOSE 5000

CMD [ "npm","start" ]