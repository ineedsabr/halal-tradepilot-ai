FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/admin/package.json apps/admin/package.json
RUN npm install

COPY tsconfig.base.json ./
COPY apps/admin apps/admin

EXPOSE 3001
CMD ["npm", "run", "dev:admin", "--", "--host", "0.0.0.0"]
