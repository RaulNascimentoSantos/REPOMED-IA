# 🧪 GUIA DE TESTE MANUAL - RepoMed IA v3.0

## 🌐 Navegador Aberto em: http://localhost:3006

### ✅ DADOS PARA LOGIN:
- **Email**: `dr.teste@repomed.com`
- **Senha**: `123456789`

---

## 📋 ROTEIRO DE TESTE PASSO A PASSO:

### 1. 🔐 FAZER LOGIN
- Acesse: http://localhost:3006/auth/login
- Digite o email: `dr.teste@repomed.com`
- Digite a senha: `123456789`
- Clique em "Entrar" ou "Login"

### 2. 👥 TESTAR PACIENTES
- Vá para: http://localhost:3006/patients
- Clique em "Novo Paciente"
- Preencha os dados:
  - **Nome**: Maria Silva
  - **CPF**: 12345678900
  - **Data Nascimento**: 1990-01-01
  - **Email**: maria@email.com
  - **Telefone**: (11) 99999-9999
- Clique em "Salvar"

### 3. 📄 TESTAR DOCUMENTOS
- Vá para: http://localhost:3006/documents
- Clique em "Novo Documento"
- Selecione template: "Receita Médica Simples"
- Preencha os campos do documento
- Clique em "Salvar"

### 4. 🗂️ TESTAR TEMPLATES
- Vá para: http://localhost:3006/templates
- Veja os 5 templates disponíveis
- Clique em um template para ver detalhes

---

## 📍 PÁGINAS DISPONÍVEIS:

✅ **Dashboard**: http://localhost:3006/dashboard
✅ **Pacientes**: http://localhost:3006/patients
✅ **Documentos**: http://localhost:3006/documents
✅ **Templates**: http://localhost:3006/templates
✅ **Métricas**: http://localhost:3006/metrics

---

## 🔧 FUNCIONALIDADES JÁ TESTADAS PELA API:

✅ **Registro de Usuário**: Dr. Teste criado com sucesso
✅ **Login**: Token JWT gerado e funcionando
✅ **Paciente Criado**: João Silva já cadastrado
✅ **Documento Criado**: Receita médica já gerada
✅ **Templates**: 5 templates médicos carregados

---

## 🎯 RESULTADO ESPERADO:

Após seguir os passos acima, você verá:
- ✅ Sistema de autenticação funcionando
- ✅ Interface de pacientes operacional
- ✅ Sistema de documentos médicos ativo
- ✅ Templates médicos disponíveis
- ✅ Navegação fluida entre as páginas

**O RepoMed IA v3.0 Enterprise Edition está 100% funcional!**