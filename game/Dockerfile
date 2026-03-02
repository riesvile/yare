FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

RUN chown -R node:node /usr/src/app
USER node

EXPOSE 5000
CMD [ "node", "--enable-source-maps", "game/game-server.js" ]