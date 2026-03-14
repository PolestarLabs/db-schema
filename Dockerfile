# Dashboard application container
FROM node:24-alpine

WORKDIR /db

# copy package files first
COPY package.json package-lock.json* ./

# install dependencies (include dev deps for prepare hook, then drop them)
RUN npm ci && npm prune --production

# copy the rest of the application
COPY . .

# bind to all interfaces so Docker networking works
ENV NODE_ENV=production

EXPOSE 4400

