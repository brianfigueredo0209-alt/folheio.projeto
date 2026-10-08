FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -o api-core ./cmd/server
FROM alpine:3.20
RUN adduser -D folheio
USER folheio
WORKDIR /app
COPY --from=builder /app/api-core .
EXPOSE 8080
CMD ["./api-core"]
