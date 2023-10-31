FROM node:lts-alpine
ENV NODE_ENV=production
RUN apk add wireless-tools wpa_supplicant 
RUN apt-get update && apt-get install -y network-manager
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
RUN chown -R node /usr/src/app
USER node
CMD ["node", "index.js"]
