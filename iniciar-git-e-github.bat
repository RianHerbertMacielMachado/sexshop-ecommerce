@echo off
echo Iniciando Git e enviando para GitHub...
echo.
echo ATENCAO: Antes de rodar este script:
echo 1. Crie um repositorio VAZIO no github.com/new
echo 2. Copie a URL do repositorio (ex: https://github.com/usuario/sexshop-ecommerce.git)
echo.
set /p REPO_URL="Cole aqui a URL do seu repositorio GitHub: "
echo.

git init
git add .
git commit -m "feat: initial project setup - full e-commerce platform"
git branch -M main
git remote add origin %REPO_URL%
git push -u origin main

echo.
echo Pronto! Codigo enviado para o GitHub!
pause
