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
COPY . /app

RUN cmake -S /app/dependencies/AES_Implementation \
          -B /app/dependencies/AES_Implementation/build \
          -DCMAKE_BUILD_TYPE=Release \
 && cmake --build /app/dependencies/AES_Implementation/build --config Release \
 && cmake --install /app/dependencies/AES_Implementation/build --prefix /usr/local

FROM python:3.11-slim AS runtime

WORKDIR /app

COPY --from=base /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local /usr/local
COPY --from=builder /app /app

EXPOSE 8000
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]