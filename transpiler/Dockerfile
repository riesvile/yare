FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Install python & metapensiero.pj for transpiling to python
RUN apk add --no-cache python3 python3-dev py3-pip gcc g++ git && \
    git clone https://github.com/azazel75/metapensiero.pj && \
    python3 -m pip install -r metapensiero.pj/requirements.txt && \
    python3 -m pip install -e metapensiero.pj

# # Install python & transcrypt for transpiling to python
# RUN apk add --no-cache python3 py3-pip && \
#     python3 -m pip install transcrypt

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 5000
CMD [ "node", "server.js" ]