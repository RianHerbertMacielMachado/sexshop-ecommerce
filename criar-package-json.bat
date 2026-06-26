@echo off
echo Criando package.json...

:: Raiz
(
echo {
echo   "name": "sexshop-ecommerce",
echo   "version": "1.0.0",
echo   "private": true,
echo   "workspaces": ["apps/*", "packages/*"],
echo   "scripts": {
echo     "dev": "turbo run dev",
echo     "build": "turbo run build",
echo     "start": "turbo run start",
echo     "lint": "turbo run lint",
echo     "test": "turbo run test",
echo     "db:generate": "prisma generate --schema=prisma/schema.prisma",
echo     "db:push": "prisma db push --schema=prisma/schema.prisma",
echo     "db:seed": "ts-node prisma/seed.ts",
echo     "db:studio": "prisma studio --schema=prisma/schema.prisma",
echo     "format": "prettier --write \"**/*.{ts,tsx,js,json,md}\""
echo   },
echo   "devDependencies": {
echo     "turbo": "^2.0.0",
echo     "prettier": "^3.2.0",
echo     "typescript": "^5.4.0",
echo     "prisma": "^5.14.0",
echo     "@types/node": "^20.0.0",
echo     "ts-node": "^10.9.0"
echo   },
echo   "engines": { "node": ">=20", "npm": ">=10" }
echo }
) > package.json

:: apps/api/package.json
(
echo {
echo   "name": "@sexshop/api",
echo   "version": "1.0.0",
echo   "scripts": {
echo     "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
echo     "build": "tsc",
echo     "start": "node dist/server.js",
echo     "lint": "eslint src --ext .ts",
echo     "test": "jest --coverage"
echo   },
echo   "dependencies": {
echo     "express": "^4.19.0",
echo     "@prisma/client": "^5.14.0",
echo     "bcryptjs": "^2.4.3",
echo     "cloudinary": "^2.2.0",
echo     "cors": "^2.8.5",
echo     "helmet": "^7.1.0",
echo     "jsonwebtoken": "^9.0.2",
echo     "multer": "^1.4.5-lts.1",
echo     "nodemailer": "^6.9.13",
echo     "stripe": "^15.7.0",
echo     "mercadopago": "^2.0.6",
echo     "winston": "^3.13.0",
echo     "zod": "^3.23.0",
echo     "axios": "^1.7.0",
echo     "express-rate-limit": "^7.3.0",
echo     "morgan": "^1.10.0",
echo     "dotenv": "^16.4.0"
echo   },
echo   "devDependencies": {
echo     "@types/express": "^4.17.21",
echo     "@types/bcryptjs": "^2.4.6",
echo     "@types/cors": "^2.8.17",
echo     "@types/jsonwebtoken": "^9.0.6",
echo     "@types/multer": "^1.4.11",
echo     "@types/nodemailer": "^6.4.15",
echo     "@types/morgan": "^1.9.9",
echo     "@types/jest": "^29.5.12",
echo     "typescript": "^5.4.0",
echo     "ts-node": "^10.9.0",
echo     "ts-node-dev": "^2.0.0",
echo     "ts-jest": "^29.1.4",
echo     "jest": "^29.7.0"
echo   }
echo }
) > apps\api\package.json

:: apps/web/package.json
(
echo {
echo   "name": "@sexshop/web",
echo   "version": "1.0.0",
echo   "scripts": {
echo     "dev": "next dev -p 3000",
echo     "build": "next build",
echo     "start": "next start",
echo     "lint": "next lint"
echo   },
echo   "dependencies": {
echo     "next": "14.2.3",
echo     "react": "^18.3.0",
echo     "react-dom": "^18.3.0",
echo     "@tanstack/react-query": "^5.40.0",
echo     "axios": "^1.7.0",
echo     "zustand": "^4.5.2",
echo     "react-hook-form": "^7.51.5",
echo     "@hookform/resolvers": "^3.6.0",
echo     "zod": "^3.23.0",
echo     "framer-motion": "^11.2.0",
echo     "react-hot-toast": "^2.4.1",
echo     "recharts": "^2.12.7",
echo     "lucide-react": "^0.395.0",
echo     "class-variance-authority": "^0.7.0",
echo     "clsx": "^2.1.1",
echo     "tailwind-merge": "^2.3.0",
echo     "@radix-ui/react-dialog": "^1.1.0",
echo     "@radix-ui/react-select": "^2.1.0",
echo     "@radix-ui/react-switch": "^1.1.0",
echo     "@radix-ui/react-label": "^2.1.0",
echo     "@radix-ui/react-tabs": "^1.1.0",
echo     "@radix-ui/react-slot": "^1.1.0",
echo     "stripe": "^15.7.0"
echo   },
echo   "devDependencies": {
echo     "@types/react": "^18.3.0",
echo     "@types/react-dom": "^18.3.0",
echo     "@types/node": "^20.0.0",
echo     "typescript": "^5.4.0",
echo     "tailwindcss": "^3.4.4",
echo     "postcss": "^8.4.38",
echo     "autoprefixer": "^10.4.19",
echo     "eslint": "^8.57.0",
echo     "eslint-config-next": "14.2.3"
echo   }
echo }
) > apps\web\package.json

echo Package.json criados!
pause
