# 1. Imagen base: Node.js 22 sobre Alpine Linux (ultraligera)
FROM node:22-alpine

# 2. Instalar OpenSSL requerido por el motor de Prisma en Alpine Linux
RUN apk add --no-cache openssl

# 3. Habilitar pnpm mediante Corepack (integrado en Node.js)
RUN corepack enable && corepack prepare pnpm@latest --activate

# 4. Carpeta de trabajo dentro del contenedor
WORKDIR /app

# 5. Copiar manifiestos de dependencias y el esquema de Prisma primero (para aprovechar el caché de Docker)
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# 6. Instalar dependencias exactas sin scripts bloqueados por pnpm v12
RUN pnpm install --frozen-lockfile --ignore-scripts

# 7. Generar el cliente de Prisma para Linux
RUN pnpm prisma:generate


# 8. Copiar el código fuente y la configuración de TypeScript
COPY tsconfig.json ./
COPY src ./src/

# 8. Compilar TypeScript a JavaScript estándar (carpeta dist/)
RUN pnpm run build

# 9. Declarar el puerto donde escucha la API
EXPOSE 3000

# 10. Comando de arranque al encender el contenedor
CMD ["node", "dist/src/server.js"]
