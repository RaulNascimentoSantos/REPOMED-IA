@echo off
echo =====================================================
echo RESTAURACAO COMPLETA DO POSTGRESQL - REPOMED IA V4.0
echo =====================================================
echo.

:: Verificar se PostgreSQL está instalado
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ PostgreSQL não está instalado ou não está no PATH
    echo.
    echo 💡 Para instalar PostgreSQL:
    echo    1. Baixe de: https://www.postgresql.org/download/windows/
    echo    2. Instale com as configurações padrão
    echo    3. Anote a senha do usuário postgres
    echo    4. Execute este script novamente
    echo.
    pause
    exit /b 1
)

echo ✅ PostgreSQL encontrado!
echo.

:: Solicitar senha do postgres
set /p PGPASSWORD="Digite a senha do usuário postgres: "
echo.

:: Testar conexão
echo 🔍 Testando conexão com PostgreSQL...
psql -U postgres -c "SELECT version();" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Não foi possível conectar ao PostgreSQL
    echo    Verifique se o serviço está rodando e a senha está correta
    pause
    exit /b 1
)

echo ✅ Conexão estabelecida com sucesso!
echo.

:: Executar restauração
echo 🚀 Iniciando restauração do banco de dados...
echo    Isso pode levar alguns minutos...
echo.

psql -U postgres -f "database\restore_complete_database.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ ============================================
    echo ✅ RESTAURAÇÃO CONCLUÍDA COM SUCESSO!
    echo ✅ ============================================
    echo.
    echo 📊 O que foi restaurado:
    echo    ✅ Banco de dados: repomed_ia
    echo    ✅ 1 Organização: Clínica RepoMed
    echo    ✅ 1 Usuário: Dr. João Silva
    echo    ✅ 8 Pacientes completos
    echo    ✅ 6 Templates de documentos
    echo    ✅ 6 Documentos de exemplo
    echo    ✅ Sistema de permissões completo
    echo    ✅ Índices otimizados para performance
    echo    ✅ Row Level Security habilitado
    echo.
    echo 🔗 Credenciais de acesso:
    echo    Email: dr.silva@repomed.com.br
    echo    Senha: RepoMed2025!
    echo.
    echo 🌐 URLs do sistema:
    echo    Frontend: http://localhost:3023
    echo    API: http://localhost:8086
    echo    Claude Bridge: http://localhost:8082
    echo.
    echo 💡 Próximos passos:
    echo    1. O frontend já está funcionando com dados mock
    echo    2. Configure a API para usar PostgreSQL
    echo    3. Teste a criação de documentos
    echo    4. Verifique a assinatura digital
    echo.
) else (
    echo.
    echo ❌ ============================================
    echo ❌ ERRO NA RESTAURAÇÃO!
    echo ❌ ============================================
    echo.
    echo 🔍 Possíveis causas:
    echo    - Permissões insuficientes
    echo    - PostgreSQL versão incompatível
    echo    - Extensões necessárias não disponíveis
    echo.
    echo 💡 Soluções:
    echo    1. Execute como administrador
    echo    2. Verifique se PostgreSQL é versão 12+
    echo    3. Instale extensões: uuid-ossp, pgcrypto
    echo.
)

echo.
echo Pressione qualquer tecla para sair...
pause >nul