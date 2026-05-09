# 🔒 Crédito Boltlock - SaaS de Consulta Unificada

Sistema completo de análise unificada de crédito para correspondentes bancários e analistas.

## 🎯 Funcionalidades

✅ **Consulta Unificada de CPF**
- Status na Receita Federal (CPF-Light)
- Histórico de mutuários (CADMUT)
- Protestos nacionais (IEPTB)
- Sanções públicas (CEIS/CNEP/CADIN)
- Chaves Pix registradas (DICT)

✅ **Dashboard Executivo**
- Visualização de créditos disponíveis
- KPIs de análise
- Estatísticas de aprovação

✅ **Segurança**
- Autenticação por token JWT
- Segregação de dados por usuário
- Auditoria de consultas

✅ **Sistema de Créditos**
- Cada consulta custa 5 créditos
- Controle de limite por correspondente
- Relatórios de uso

## 📂 Estrutura do Projeto

```
Credito-Boltlock/
├── frontend/
│   ├── index.html       # Página principal (SPA)
│   ├── app.js          # Lógica da aplicação
│   └── styles.css      # Estilos (Neumorphism + Boltlock)
│
├── backend/
│   ├── server.js       # API Express.js
│   ├── package.json    # Dependências
│   └── .env           # Configurações (credenciais)
│
└── docs/
    └── README.md      # Documentação
```

## 🚀 Como Usar

### 1. **Instalar Node.js**
- Baixar em: https://nodejs.org/ (versão 18+)

### 2. **Iniciar o Backend**

```bash
cd "C:\Users\{seu_usuario}\Desktop\Credito-Boltlock\backend"
npm install
npm run dev
```

O servidor rodará em: **http://localhost:3001**

### 3. **Abrir o Frontend**

Abra no navegador:
```
file:///C:/Users/{seu_usuario}/Desktop/Credito-Boltlock/frontend/index.html
```

Ou serve com um servidor HTTP simples:
```bash
cd frontend
npx http-server
```

Depois abra: **http://localhost:8080**

### 4. **Login de Teste**

```
Email: admin@boltlock.com
Senha: Admin@123
```

Ou:
```
Email: correspondent1@boltlock.com
Senha: Corresp@123
```

## 🎨 Cores do Design

- **Primária (Amarelo)**: `#f5c518`
- **Fundo (Cinza)**: `#2b2b2b`
- **Texto**: `#9a9a9a`
- **Ênfase**: `#dedede`

Design **Neumorphism** com **Dark Mode**.

## 🔌 APIs Integradas (Gratuitas)

| API | Descrição | Custo |
|-----|-----------|-------|
| **DICT (Bacen)** | Chaves Pix registradas | ✅ Gratuita |
| **IEPTB** | Protestos cartoriais | ✅ Gratuita |
| **Portal Transparência** | CEIS/CNEP/CADIN | ✅ Gratuita |
| **CPF-Light (Serpro)** | Status CPF | 💰 Paga (Gov.br) |
| **CADMUT** | Histórico habitacional | 💰 Requer Infosimples |

## 🔧 Próximos Passos

### Passo 1: Adicionar suas credenciais de API

Edite `backend/.env`:
```env
SERPRO_API_KEY=sua_chave_aqui
INFOSIMPLES_API_KEY=sua_chave_aqui
```

### Passo 2: Integrar Infosimples (CADMUT)

Se você tem contrato com Infosimples:

1. Copiar a chave API
2. Editar `backend/server.js`
3. Adicionar função `consultarCADMUT()` real

### Passo 3: Integrar Receita Federal (CPF-Light)

1. Registrar em: https://conectagov.serpro.gov.br/
2. Adicionar credenciais em `.env`
3. Implementar oauth2 em `consultarStatusCPF()`

### Passo 4: Deploy

Opções:
- **Vercel** (frontend) + **Heroku** (backend)
- **AWS** (Lambda + S3)
- **seu servidor** (Node.js + nginx)

## 📊 Endpoints da API

### Autenticação
```
POST /api/auth/login
Body: { email, senha }
Response: { token, usuario }
```

### Consulta Unificada
```
POST /api/consultar/unificada
Headers: Authorization: Bearer {token}
Body: { cpf }
Response: { situacao_cpf, cadmut, protestos, sancoes, pix, decisao }
```

### Dashboard
```
GET /api/dashboard
Headers: Authorization: Bearer {token}
Response: { usuario, creditos, stats }
```

### Health Check
```
GET /api/health
Response: { status, apis, versao }
```

## 🔐 Segurança

⚠️ **IMPORTANTE - NÃO USE EM PRODUÇÃO SEM:**

1. **Criptografia de senhas**: Implementar bcrypt
2. **JWT seguro**: Usar jsonwebtoken com expiração
3. **HTTPS obrigatório**: Usar certificado SSL
4. **Rate limiting**: Proteger contra brute force
5. **CORS restrito**: Apenas seus domínios
6. **Auditoria**: Logs de todas as consultas
7. **LGPD**: Implementar direito ao esquecimento

## 📝 Mock Users

```javascript
admin@boltlock.com     | Admin@123      | 10.000 créditos
correspondent1@...    | Corresp@123    | 500 créditos
```

Para adicionar mais usuários, edite `backend/server.js` na seção "DADOS DE USUÁRIOS".

## 🐛 Troubleshooting

### Erro: "Cannot find module 'express'"
```bash
cd backend
npm install
```

### Erro: "CORS policy"
Certifique-se de que o backend está rodando e a porta 3001 está aberta.

### Erro: "API não responde"
Verifique se o backend está ativo:
```
http://localhost:3001/api/health
```

## 💡 Dicas

1. **Cache de Consultas**: Resultados são cached por 1 hora (CPU-Light)
2. **Performance**: Todas as APIs são chamadas em paralelo
3. **Mobile**: Interface responsiva, funciona em celulares
4. **Offline**: Prefetch de dados quando possível

## 📞 Suporte

Para integrar APIs reais:
- **Serpro**: https://conectagov.serpro.gov.br/
- **Infosimples**: https://infosimples.com/
- **Bacen**: https://www.bcb.gov.br/

## 📄 Licença

MIT - Use livremente em seus projetos

---

**Desenvolvido com ❤️ por Tenório Vivaz**

Versão: 1.0.0  
Última atualização: 2026-05-08
