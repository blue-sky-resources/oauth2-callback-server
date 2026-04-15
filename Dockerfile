FROM node:25-alpine3.22

RUN apk update && \
    apk add --no-cache openssl

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk upgrade --no-cache \
    && npm ci --omit=dev \
    && npm cache clean --force

COPY . .
RUN npm link

CMD ["sh", "entrypoint.sh"]
