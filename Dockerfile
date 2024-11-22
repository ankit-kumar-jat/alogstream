# base node image
FROM node:22-alpine AS base

# set for base and all layer that inherit from it
ENV NODE_ENV=production

RUN --mount=type=secret,id=session-secret \
    --mount=type=secret,id=db-url \
    --mount=type=secret,id=api-key \
    export SESSION_SECRET=$(cat /run/secrets/session-secret) && \
    export HONEYPOT_SECRET=$(cat /run/secrets/session-secret) && \
    export DATABASE_URL=$(cat /run/secrets/db-url) && \
    export API_KEY=$(cat /run/secrets/api-key)

# Install all node_modules, including dev dependencies
FROM base AS deps

WORKDIR /myapp

ADD package.json package-lock.json ./
RUN npm install --include=dev

# Setup production node_modules
FROM base AS production-deps

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules
ADD package.json package-lock.json ./
RUN npm prune --omit=dev

# Build the app
FROM base AS build

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules

ADD prisma .
RUN npx prisma generate

ADD . .
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

WORKDIR /myapp

COPY --from=production-deps /myapp/node_modules /myapp/node_modules
COPY --from=build /myapp/node_modules/.prisma /myapp/node_modules/.prisma

COPY --from=build /myapp/build /myapp/build
COPY --from=build /myapp/package.json /myapp/package.json
COPY --from=build /myapp/prisma /myapp/prisma
ADD . .

CMD ["npm", "run", "deploy"]