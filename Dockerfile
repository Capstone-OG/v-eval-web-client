# Stage 1: Build React 19 Vite Web App
FROM node:22-alpine AS build
WORKDIR /app

# Copy dependency manifests
COPY ["All Services/V-Eval-Web_Client/package*.json", "./"]
RUN npm install

# Copy source code and build
COPY ["All Services/V-Eval-Web_Client/", "./"]
RUN npm run build

# Stage 2: Serve with lightweight Nginx web server
FROM nginx:alpine AS final
COPY ["All Services/V-Eval-Web_Client/nginx.conf", "/etc/nginx/conf.d/default.conf"]
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
