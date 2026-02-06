#!/bin/bash

echo "🔍 LYVEN - Verificação de Status do Projeto"
echo "==========================================="
echo ""

EXIT_CODE=0

echo "📋 1. CONFIGURAÇÕES DO PROJETO"
echo "--------------------------------"

if [ -f "app.json" ]; then
    BUNDLE_ID=$(grep -o '"bundleIdentifier": "[^"]*"' app.json | cut -d'"' -f4)
    PACKAGE_NAME=$(grep -o '"package": "[^"]*"' app.json | cut -d'"' -f4)
    APP_SCHEME=$(grep -o '"scheme": "[^"]*"' app.json | cut -d'"' -f4)
    
    echo "✅ Bundle ID (iOS): $BUNDLE_ID"
    echo "✅ Package (Android): $PACKAGE_NAME"
    echo "✅ App Scheme: $APP_SCHEME"
    
    if grep -q "associatedDomains" app.json; then
        echo "⚠️  Deep Linking iOS: FALTA CONFIGURAR no app.json"
        EXIT_CODE=1
    else
        echo "⚠️  Deep Linking iOS: FALTA CONFIGURAR no app.json"
        EXIT_CODE=1
    fi
    
    if grep -q "intentFilters" app.json; then
        echo "⚠️  Deep Linking Android: FALTA CONFIGURAR no app.json"
        EXIT_CODE=1
    else
        echo "⚠️  Deep Linking Android: FALTA CONFIGURAR no app.json"
        EXIT_CODE=1
    fi
else
    echo "❌ app.json não encontrado"
    EXIT_CODE=1
fi

echo ""
echo "📋 2. VARIÁVEIS DE AMBIENTE"
echo "--------------------------------"

if [ -f ".env" ]; then
    echo "✅ Ficheiro .env existe"
    
    if grep -q "TURSO_DATABASE_URL=" .env; then
        echo "✅ TURSO_DATABASE_URL configurado"
    else
        echo "❌ TURSO_DATABASE_URL em falta"
        EXIT_CODE=1
    fi
    
    if grep -q "TURSO_AUTH_TOKEN=" .env; then
        echo "✅ TURSO_AUTH_TOKEN configurado"
    else
        echo "❌ TURSO_AUTH_TOKEN em falta"
        EXIT_CODE=1
    fi
else
    echo "❌ Ficheiro .env não encontrado"
    EXIT_CODE=1
fi

echo ""
echo "📋 3. BACKEND"
echo "--------------------------------"

if [ -f "backend/hono.ts" ]; then
    echo "✅ backend/hono.ts existe"
    
    if grep -q "TEAM_ID.app.lyven" backend/hono.ts; then
        echo "⚠️  Apple Team ID: PRECISA SER ATUALIZADO"
        echo "   Atual: TEAM_ID.app.lyven"
        echo "   Deve ser: [SEU_TEAM_ID].app.lyven"
        EXIT_CODE=1
    else
        echo "✅ Apple Team ID parece configurado"
    fi
    
    if grep -q "SHA256_FINGERPRINT_AQUI" backend/hono.ts; then
        echo "⚠️  SHA256 Fingerprint: PRECISA SER ATUALIZADO"
        echo "   Execute: cd android && ./gradlew signingReport"
        EXIT_CODE=1
    else
        echo "✅ SHA256 Fingerprint parece configurado"
    fi
else
    echo "❌ backend/hono.ts não encontrado"
    EXIT_CODE=1
fi

if [ -f "backend/db/index.ts" ]; then
    echo "✅ backend/db/index.ts existe"
else
    echo "❌ backend/db/index.ts não encontrado"
    EXIT_CODE=1
fi

echo ""
echo "📋 4. DEPENDÊNCIAS"
echo "--------------------------------"

if [ -f "package.json" ]; then
    echo "✅ package.json existe"
    
    if command -v bun &> /dev/null; then
        echo "✅ Bun instalado: $(bun --version)"
    else
        echo "⚠️  Bun não encontrado"
    fi
    
    if [ -d "node_modules" ]; then
        echo "✅ node_modules existe"
    else
        echo "⚠️  node_modules não existe - execute: bun install"
        EXIT_CODE=1
    fi
else
    echo "❌ package.json não encontrado"
    EXIT_CODE=1
fi

echo ""
echo "📋 5. SCRIPTS DE DEPLOY"
echo "--------------------------------"

SCRIPTS=(
    "scripts/setup-server.sh"
    "scripts/setup-nginx.sh"
    "scripts/setup-service.sh"
    "scripts/deploy.sh"
    "scripts/validate.sh"
)

for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        echo "✅ $script existe"
        if [ -x "$script" ]; then
            echo "   ✓ Executável"
        else
            echo "   ⚠️  Não executável - execute: chmod +x $script"
        fi
    else
        echo "❌ $script não encontrado"
        EXIT_CODE=1
    fi
done

echo ""
echo "📋 6. DOCUMENTAÇÃO"
echo "--------------------------------"

DOCS=(
    "TURSO_CONFIGURADO.md"
    "DEPLOY_SUMMARY.md"
    "DEPLOYMENT_GUIDE.md"
    "QUICK_DEPLOY.md"
    "CONFIGURATION_CHECKLIST.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo "✅ $doc"
    else
        echo "❌ $doc não encontrado"
    fi
done

echo ""
echo "📋 7. DEEP LINKING FILES"
echo "--------------------------------"

if [ -f "public/.well-known/apple-app-site-association" ]; then
    echo "✅ apple-app-site-association existe"
else
    echo "❌ apple-app-site-association não encontrado"
    EXIT_CODE=1
fi

if [ -f "public/.well-known/assetlinks.json" ]; then
    echo "✅ assetlinks.json existe"
else
    echo "❌ assetlinks.json não encontrado"
    EXIT_CODE=1
fi

if [ -f "backend/views/event-page.html" ]; then
    echo "✅ event-page.html existe"
else
    echo "❌ event-page.html não encontrado"
    EXIT_CODE=1
fi

echo ""
echo "========================================="
echo ""

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ TUDO PRONTO PARA DEPLOY!"
    echo ""
    echo "Próximos passos:"
    echo "1. Fazer upload do código para o servidor"
    echo "2. Executar: ./scripts/setup-server.sh"
    echo "3. Configurar DNS para apontar para o servidor"
    echo "4. Executar: ./scripts/setup-nginx.sh"
    echo "5. Instalar SSL: sudo certbot --nginx -d www.lyven.pt"
    echo "6. Executar: ./scripts/setup-service.sh"
    echo "7. Validar: ./scripts/validate.sh"
else
    echo "⚠️  EXISTEM ITENS QUE PRECISAM DE ATENÇÃO"
    echo ""
    echo "Revê os itens marcados com ⚠️  ou ❌ acima"
    echo "Consulta CONFIGURATION_CHECKLIST.md para detalhes"
fi

echo ""
exit $EXIT_CODE
