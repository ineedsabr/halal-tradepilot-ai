FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/webapp/package.json apps/webapp/package.json
RUN npm install

COPY tsconfig.base.json ./
COPY apps/webapp apps/webapp

EXPOSE 5173
CMD ["npm", "run", "dev:webapp", "--", "--host", "0.0.0.0"]
