FROM node:21-slim as Runner

WORKDIR /app

RUN apt-get update \
    && apt-get install -y \
    awscli \
    libc6-dev \
    make

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME 0.0.0.0
ENV NODE_ENV=production

# Set the NEXT_PUBLIC_ENV_NAME environment variable using the ARG instruction
# Default to 'production' if not provided as a build argument
ARG NEXT_PUBLIC_ENV_NAME=production
ENV NEXT_PUBLIC_ENV_NAME=${NEXT_PUBLIC_ENV_NAME}

# Copy the built public directory containing static assets
COPY --chown=node:node next.config.ts ./
COPY --chown=node:node public ./public
COPY --chown=node:node .next ./.next
COPY --chown=node:node node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node .env-test-encrypted ./.env-test-encrypted
COPY --chown=node:node .env-prod-encrypted ./.env-prod-encrypted
COPY --chown=node:node ./entrypoint.sh /usr/local/bin/decode.sh

# Expose the specified port
EXPOSE $PORT

RUN chown node:node /app \
     && chmod +x /usr/local/bin/decode.sh

# Set the user context to the non-root user for better security
USER node

# Set the entrypoint
ENTRYPOINT ["/usr/local/bin/decode.sh"]

# Start the Next.js server using 'server.js' script
CMD ["npm", "start"]