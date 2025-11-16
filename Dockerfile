FROM python:3.11-slim AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    git \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM base AS builder
COPY dependencies/AES_Implementation ./dependencies/AES_Implementation

RUN cmake -S dependencies/AES_Implementation \
          -B dependencies/AES_Implementation/build \
          -DCMAKE_BUILD_TYPE=Release \
 && cmake --build dependencies/AES_Implementation/build --config Release

FROM python:3.11-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=base /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages

COPY --from=builder /app/dependencies/AES_Implementation/build /app/dependencies/AES_Implementation/build

COPY . .
RUN ls -lh dependencies/AES_Implementation/build || true
EXPOSE 8000
ENV PYTHONUNBUFFERED=1
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]