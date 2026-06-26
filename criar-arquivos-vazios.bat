@echo off
echo Criando todos os arquivos do projeto...

:: ==================
:: RAIZ
:: ==================
type nul > .gitignore
type nul > .env.example
type nul > .prettierrc
type nul > .eslintrc.json
type nul > turbo.json
type nul > package.json
type nul > railway.toml
type nul > README.md

:: ==================
:: PRISMA
:: ==================
type nul > prisma\schema.prisma
type nul > prisma\seed.ts

:: ==================
:: PACKAGES / SHARED
:: ==================
type nul > packages\shared\package.json
type nul > packages\shared\tsconfig.json
type nul > packages\shared\src\index.ts

:: ==================
:: APPS / API - RAIZ
:: ==================
type nul > apps\api\package.json
type nul > apps\api\tsconfig.json
type nul > apps\api\Dockerfile
type nul > apps\api\.env

:: ==================
:: APPS / API - LIB
:: ==================
type nul > apps\api\src\lib\env.ts
type nul > apps\api\src\lib\prisma.ts
type nul > apps\api\src\lib\logger.ts
type nul > apps\api\src\lib\cloudinary.ts
type nul > apps\api\src\lib\mailer.ts
type nul > apps\api\src\lib\stripe.ts
type nul > apps\api\src\lib\mercadopago.ts
type nul > apps\api\src\lib\crypto.ts

:: ==================
:: APPS / API - MIDDLEWARE
:: ==================
type nul > apps\api\src\middleware\auth.middleware.ts
type nul > apps\api\src\middleware\error.middleware.ts
type nul > apps\api\src\middleware\audit.middleware.ts
type nul > apps\api\src\middleware\rateLimiter.middleware.ts
type nul > apps\api\src\middleware\multer.middleware.ts

:: ==================
:: APPS / API - SERVER
:: ==================
type nul > apps\api\src\server.ts

:: ==================
:: APPS / API - AUTH
:: ==================
type nul > apps\api\src\modules\auth\auth.schema.ts
type nul > apps\api\src\modules\auth\auth.service.ts
type nul > apps\api\src\modules\auth\auth.controller.ts
type nul > apps\api\src\modules\auth\auth.routes.ts

:: ==================
:: APPS / API - PRODUCTS
:: ==================
type nul > apps\api\src\modules\products\products.schema.ts
type nul > apps\api\src\modules\products\products.service.ts
type nul > apps\api\src\modules\products\products.controller.ts
type nul > apps\api\src\modules\products\products.routes.ts

:: ==================
:: APPS / API - CATEGORIES
:: ==================
type nul > apps\api\src\modules\categories\categories.schema.ts
type nul > apps\api\src\modules\categories\categories.service.ts
type nul > apps\api\src\modules\categories\categories.controller.ts
type nul > apps\api\src\modules\categories\categories.routes.ts

:: ==================
:: APPS / API - ORDERS
:: ==================
type nul > apps\api\src\modules\orders\orders.schema.ts
type nul > apps\api\src\modules\orders\orders.service.ts
type nul > apps\api\src\modules\orders\orders.controller.ts
type nul > apps\api\src\modules\orders\orders.routes.ts

:: ==================
:: APPS / API - PAYMENTS
:: ==================
type nul > apps\api\src\modules\payments\payments.schema.ts
type nul > apps\api\src\modules\payments\payments.service.ts
type nul > apps\api\src\modules\payments\payments.controller.ts
type nul > apps\api\src\modules\payments\payments.routes.ts

:: ==================
:: APPS / API - COUPONS
:: ==================
type nul > apps\api\src\modules\coupons\coupons.schema.ts
type nul > apps\api\src\modules\coupons\coupons.service.ts
type nul > apps\api\src\modules\coupons\coupons.controller.ts
type nul > apps\api\src\modules\coupons\coupons.routes.ts

:: ==================
:: APPS / API - SHIPPING
:: ==================
type nul > apps\api\src\modules\shipping\shipping.schema.ts
type nul > apps\api\src\modules\shipping\shipping.service.ts
type nul > apps\api\src\modules\shipping\shipping.controller.ts
type nul > apps\api\src\modules\shipping\shipping.routes.ts

:: ==================
:: APPS / API - REVIEWS
:: ==================
type nul > apps\api\src\modules\reviews\reviews.schema.ts
type nul > apps\api\src\modules\reviews\reviews.service.ts
type nul > apps\api\src\modules\reviews\reviews.controller.ts
type nul > apps\api\src\modules\reviews\reviews.routes.ts

:: ==================
:: APPS / API - BANNERS
:: ==================
type nul > apps\api\src\modules\banners\banners.schema.ts
type nul > apps\api\src\modules\banners\banners.service.ts
type nul > apps\api\src\modules\banners\banners.controller.ts
type nul > apps\api\src\modules\banners\banners.routes.ts

:: ==================
:: APPS / API - WISHLIST
:: ==================
type nul > apps\api\src\modules\wishlist\wishlist.schema.ts
type nul > apps\api\src\modules\wishlist\wishlist.service.ts
type nul > apps\api\src\modules\wishlist\wishlist.controller.ts
type nul > apps\api\src\modules\wishlist\wishlist.routes.ts

:: ==================
:: APPS / API - ADMIN
:: ==================
type nul > apps\api\src\modules\admin\admin.schema.ts
type nul > apps\api\src\modules\admin\admin.service.ts
type nul > apps\api\src\modules\admin\admin.controller.ts
type nul > apps\api\src\modules\admin\admin.routes.ts

:: ==================
:: APPS / API - SETTINGS
:: ==================
type nul > apps\api\src\modules\settings\settings.schema.ts
type nul > apps\api\src\modules\settings\settings.service.ts
type nul > apps\api\src\modules\settings\settings.controller.ts
type nul > apps\api\src\modules\settings\settings.routes.ts

:: ==================
:: APPS / API - TESTS
:: ==================
type nul > apps\api\src\__tests__\auth.service.test.ts
type nul > apps\api\src\__tests__\payments.service.test.ts
type nul > apps\api\src\__tests__\crypto.test.ts
type nul > apps\api\jest.config.ts

:: ==================
:: APPS / WEB - RAIZ
:: ==================
type nul > apps\web\package.json
type nul > apps\web\tsconfig.json
type nul > apps\web\Dockerfile
type nul > apps\web\next.config.ts
type nul > apps\web\tailwind.config.ts
type nul > apps\web\postcss.config.js

:: ==================
:: APPS / WEB - APP (PAGES)
:: ==================
type nul > apps\web\src\app\layout.tsx
type nul > apps\web\src\app\page.tsx
type nul > apps\web\src\app\globals.css
type nul > apps\web\src\app\providers.tsx
type nul > apps\web\src\app\produtos\page.tsx
type nul > apps\web\src\app\produtos\[slug]\page.tsx
type nul > apps\web\src\app\carrinho\page.tsx
type nul > apps\web\src\app\checkout\page.tsx
type nul > apps\web\src\app\checkout\pix\page.tsx
type nul > apps\web\src\app\checkout\success\page.tsx
type nul > apps\web\src\app\conta\layout.tsx
type nul > apps\web\src\app\conta\page.tsx
type nul > apps\web\src\app\conta\pedidos\page.tsx
type nul > apps\web\src\app\conta\pedidos\[id]\page.tsx
type nul > apps\web\src\app\conta\dados\page.tsx
type nul > apps\web\src\app\conta\enderecos\page.tsx
type nul > apps\web\src\app\conta\lista-desejos\page.tsx
type nul > apps\web\src\app\entrar\page.tsx
type nul > apps\web\src\app\cadastro\page.tsx
type nul > apps\web\src\app\esqueci-a-senha\page.tsx
type nul > apps\web\src\app\admin\layout.tsx
type nul > apps\web\src\app\admin\page.tsx
type nul > apps\web\src\app\admin\produtos\page.tsx
type nul > apps\web\src\app\admin\categorias\page.tsx
type nul > apps\web\src\app\admin\pedidos\page.tsx
type nul > apps\web\src\app\admin\pedidos\[id]\page.tsx
type nul > apps\web\src\app\admin\clientes\page.tsx
type nul > apps\web\src\app\admin\cupons\page.tsx
type nul > apps\web\src\app\admin\banners\page.tsx
type nul > apps\web\src\app\admin\avaliacoes\page.tsx
type nul > apps\web\src\app\admin\configuracoes\page.tsx
type nul > apps\web\src\app\admin\relatorios\page.tsx
type nul > apps\web\src\app\admin\frete\page.tsx
type nul > apps\web\src\app\admin\pagamentos\page.tsx

:: ==================
:: APPS / WEB - COMPONENTS / LAYOUT
:: ==================
type nul > apps\web\src\components\layout\Header.tsx
type nul > apps\web\src\components\layout\Footer.tsx
type nul > apps\web\src\components\layout\AdminSidebar.tsx
type nul > apps\web\src\components\layout\MobileMenu.tsx
type nul > apps\web\src\components\layout\CartDrawer.tsx

:: ==================
:: APPS / WEB - COMPONENTS / UI
:: ==================
type nul > apps\web\src\components\ui\button.tsx
type nul > apps\web\src\components\ui\input.tsx
type nul > apps\web\src\components\ui\label.tsx
type nul > apps\web\src\components\ui\select.tsx
type nul > apps\web\src\components\ui\switch.tsx
type nul > apps\web\src\components\ui\textarea.tsx
type nul > apps\web\src\components\ui\tabs.tsx
type nul > apps\web\src\components\ui\badge.tsx
type nul > apps\web\src\components\ui\Pagination.tsx
type nul > apps\web\src\components\ui\LoadingSpinner.tsx

:: ==================
:: APPS / WEB - COMPONENTS / PRODUCT
:: ==================
type nul > apps\web\src\components\product\ProductCard.tsx
type nul > apps\web\src\components\product\ProductGallery.tsx
type nul > apps\web\src\components\product\ProductReviews.tsx
type nul > apps\web\src\components\product\ProductDetailClient.tsx

:: ==================
:: APPS / WEB - COMPONENTS / HOME
:: ==================
type nul > apps\web\src\components\home\HeroBanner.tsx
type nul > apps\web\src\components\home\CategoriesGrid.tsx
type nul > apps\web\src\components\home\FeaturedProducts.tsx
type nul > apps\web\src\components\home\NewArrivals.tsx
type nul > apps\web\src\components\home\MiddleBanner.tsx
type nul > apps\web\src\components\home\BottomBanner.tsx
type nul > apps\web\src\components\home\PromoSection.tsx
type nul > apps\web\src\components\home\TestimonialsSection.tsx

:: ==================
:: APPS / WEB - COMPONENTS / CHECKOUT
:: ==================
type nul > apps\web\src\components\checkout\CheckoutIdentification.tsx
type nul > apps\web\src\components\checkout\CheckoutAddress.tsx
type nul > apps\web\src\components\checkout\CheckoutPayment.tsx

:: ==================
:: APPS / WEB - COMPONENTS / ADMIN
:: ==================
type nul > apps\web\src\components\admin\products\ProductFormModal.tsx
type nul > apps\web\src\components\admin\categories\CategoryFormModal.tsx
type nul > apps\web\src\components\admin\coupons\CouponFormModal.tsx
type nul > apps\web\src\components\admin\banners\BannerFormModal.tsx
type nul > apps\web\src\components\admin\shipping\ShippingZoneFormModal.tsx

:: ==================
:: APPS / WEB - COMPONENTS / ACCOUNT
:: ==================
type nul > apps\web\src\components\account\AddressFormModal.tsx

:: ==================
:: APPS / WEB - LIB
:: ==================
type nul > apps\web\src\lib\api.ts
type nul > apps\web\src\lib\utils.ts
type nul > apps\web\src\lib\formatters.ts

:: ==================
:: APPS / WEB - STORES
:: ==================
type nul > apps\web\src\stores\cartStore.ts
type nul > apps\web\src\stores\authStore.ts
type nul > apps\web\src\stores\wishlistStore.ts

:: ==================
:: APPS / WEB - HOOKS
:: ==================
type nul > apps\web\src\hooks\useSettings.ts
type nul > apps\web\src\hooks\useAuth.ts
type nul > apps\web\src\hooks\useCart.ts

:: ==================
:: APPS / WEB - TYPES
:: ==================
type nul > apps\web\src\types\index.ts

echo.
echo ============================================
echo  Todos os arquivos foram criados com sucesso!
echo  Agora abra a pasta no VS Code e cole o
echo  conteudo em cada arquivo.
echo ============================================
pause
