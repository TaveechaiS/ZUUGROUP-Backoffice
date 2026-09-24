FROM node:24.21.0-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "5000"]
