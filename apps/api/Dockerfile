# ---- build
FROM rust:1.85 as builder
WORKDIR /app
COPY Cargo.toml ./
COPY Cargo.lock ./
COPY src ./src
RUN cargo build --release --locked

# ---- run
FROM debian:bookworm-slim
WORKDIR /app
RUN apt-get update \
  && apt-get install -y ca-certificates libsqlite3-0 \
  && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/amigo-api /app/amigo-api
EXPOSE 3000
ENV RUST_LOG=info
CMD ["/app/amigo-api"]
