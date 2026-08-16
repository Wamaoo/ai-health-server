FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install --registry=https://registry.npmmirror.com

COPY . .

EXPOSE 8088

CMD ["node", "server.js"]
