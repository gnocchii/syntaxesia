# Stage 1: Build frontend
FROM node:18-slim AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Python backend + built frontend
FROM python:3.11-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY api/ ./api/
COPY extraction/ ./extraction/

# Copy public assets (needed by backend at startup for met_women_artists.json)
COPY public/ ./public/

# Copy built frontend from stage 1
COPY --from=frontend /app/dist ./dist

EXPOSE 8080
CMD python -m uvicorn api.main:app --host 0.0.0.0 --port ${PORT:-8080}
