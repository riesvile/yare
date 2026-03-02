FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Install python & metapensiero.pj for transpiling from python
RUN apk add --no-cache python3 python3-dev py3-pip gcc g++ git && \
    git clone https://github.com/azazel75/metapensiero.pj && \
    python3 -m pip install -r metapensiero.pj/requirements.txt && \
    python3 -m pip install -e metapensiero.pj

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

RUN chown -R node:node /usr/src/app
USER node

EXPOSE 5000
CMD [ "node", "server.js" ]