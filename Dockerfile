FROM --platform=linux/amd64 oven/bun:latest AS builder

WORKDIR /src
COPY . .
RUN bun install

EXPOSE 3000

FROM builder AS development
CMD ["bun", "run", "dev"]

FROM builder AS production
CMD ["bun", "run", "prod"]
