@echo off
echo Criando arquivos da raiz...

:: .gitignore
(
echo node_modules/
echo .next/
echo dist/
echo build/
echo .env
echo .env.local
echo .env.production
echo logs/
echo *.log
echo .DS_Store
echo .turbo/
echo coverage/
echo prisma/migrations/
) > .gitignore

:: .env.example
(
echo # === BACKEND ===
echo NODE_ENV=development
echo PORT=3001
echo DATABASE_URL=postgresql://user:password@localhost:5432/sexshop
echo.
echo JWT_ACCESS_SECRET=seu_jwt_access_secret_aqui_min_32_chars
echo JWT_REFRESH_SECRET=seu_jwt_refresh_secret_aqui_min_32_chars
echo JWT_ACCESS_EXPIRY=15m
echo JWT_REFRESH_EXPIRY=7d
echo.
echo ENCRYPTION_KEY=sua_chave_hex_64_chars_aqui
echo.
echo FRONTEND_URL=http://localhost:3000
echo.
echo # Stripe
echo STRIPE_SECRET_KEY=sk_test_...
echo STRIPE_PUBLISHABLE_KEY=pk_test_...
echo STRIPE_WEBHOOK_SECRET=whsec_...
echo.
echo # Mercado Pago
echo MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
echo MERCADOPAGO_WEBHOOK_SECRET=seu_webhook_secret
echo.
echo # Cloudinary
echo CLOUDINARY_CLOUD_NAME=seu_cloud_name
echo CLOUDINARY_API_KEY=sua_api_key
echo CLOUDINARY_API_SECRET=seu_api_secret
echo.
echo # SMTP
echo SMTP_HOST=smtp.gmail.com
echo SMTP_PORT=587
echo SMTP_USER=seu@email.com
echo SMTP_PASS=sua_senha_app
echo SMTP_FROM=noreply@sexshop.com
echo.
echo # === FRONTEND ===
echo NEXT_PUBLIC_API_URL=http://localhost:3001
echo NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
echo NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-...
echo NEXT_PUBLIC_STORE_NAME=SexShop
) > .env.example

:: turbo.json
(
echo {
echo   "$schema": "https://turbo.build/schema.json",
echo   "pipeline": {
echo     "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
echo     "dev": { "cache": false, "persistent": true },
echo     "lint": { "outputs": [] },
echo     "test": { "outputs": ["coverage/**"] },
echo     "start": { "cache": false }
echo   }
echo }
) > turbo.json

:: .prettierrc
(
echo {
echo   "semi": false,
echo   "singleQuote": true,
echo   "trailingComma": "es5",
echo   "tabWidth": 2,
echo   "printWidth": 100
echo }
) > .prettierrc

echo Arquivos raiz criados!
pause
