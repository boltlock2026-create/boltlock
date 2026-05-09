# 🔒 OPERAÇÃO COMPLETA - CRÉDITO BOLTLOCK

## Recapitulação da Operação

**Data:** 2026-05-09  
**Status:** 🟡 Em Configuração Final  
**URL:** https://boltlock.com.br/creditscore

---

## 1️⃣ LOGINS BOLTLOCK (Sistema)

Usuários que fazem login na plataforma:

| Email | Senha | Role | Créditos | Correspondente |
|-------|-------|------|----------|----------------|
| admin@boltlock.com | Admin@123 | admin | 10.000 | CCA Master |
| correspondent1@boltlock.com | Corresp@123 | correspondente | 500 | CCA Digital |

**Fluxo:**
1. Usuário acessa: https://boltlock.com.br/creditscore
2. Faz login com credenciais acima
3. Recebe token JWT
4. Acessa dashboard e consultas

---

## 2️⃣ LOGINS DOS 5 LINKS (APIs Externas)

As 5 fontes de dados que a Boltlock consulta automaticamente:

### 1. **Caixa Aqui** - Consulta Restrição
```
URL: https://caixaaqui.caixa.gov.br/caixaaqui/CaixaAquiController/consulta_cadastral/consulta_cadastral1
Email: [PREENCHER]
Senha: [PREENCHER]
O que faz: Verifica restrições cadastrais na Caixa
```

### 2. **CADMUT** - Cadastro de Mutuários
```
URL: https://www.cadastromutuarios.caixa.gov.br/sicdm/ReceberParametros
Email: [PREENCHER]
Senha: [PREENCHER]
O que faz: Consulta histórico de mutuários SFH
```

### 3. **CIWEB** - Portal de Empreendimentos
```
URL: https://www.portaldeempreendimentos.caixa.gov.br/sso/
Email: [PREENCHER]
Senha: [PREENCHER]
O que faz: Consulta dados de empreendimentos e investimentos
```

### 4. **CPF** - Situação Cadastral (Receita Federal)
```
URL: https://servicos.receita.fazenda.gov.br/Servicos/CPF/ConsultaSituacao/ConsultaPublica.asp
CPF: [PREENCHER]
Senha: [PREENCHER]
O que faz: Verifica situação cadastral do CPF
```

### 5. **Restituição** - Receita Federal
```
URL: https://www.restituicao.receita.fazenda.gov.br
CPF: [PREENCHER]
Senha: [PREENCHER]
O que faz: Consulta informações de restitução fiscal
```

---

## 3️⃣ PÁGINA ÚNICA - RELATÓRIO CONSOLIDADO

### Fluxo da Consulta Unificada

```
┌─────────────────────────────────────────────────┐
│  PÁGINA: boltlock.com.br/creditscore/#/consultar│
└─────────────────────────────────────────────────┘
              ↓
    [INPUT] Digite um CPF
              ↓
    [CLICK] "Consultar"
              ↓
    ┌─────────────────────────────────────────────┐
    │  BACKEND FAZ 5 CONSULTAS EM PARALELO        │
    ├─────────────────────────────────────────────┤
    │  1. Caixa Aqui (restrições)      [  ✓  ]   │
    │  2. CADMUT (mutuários)           [  ✓  ]   │
    │  3. CIWEB (empreendimentos)      [  ✓  ]   │
    │  4. CPF (Receita Federal)        [  ✓  ]   │
    │  5. Restituição (RF)             [  ✓  ]   │
    └─────────────────────────────────────────────┘
              ↓
    [RESULTADO] Relatório Único Consolidado
              ↓
    ┌─────────────────────────────────────────────┐
    │  RELATÓRIO CONSOLIDADO                       │
    ├─────────────────────────────────────────────┤
    │  CPF: 123.456.789-00                        │
    │  Nome: João da Silva                        │
    │  Data Consulta: 2026-05-09 14:30:00        │
    │                                              │
    │  📊 SITUAÇÃO CADASTRAL (CPF)                │
    │     Status: Regular                         │
    │     Data Nascimento: 1990-01-15             │
    │                                              │
    │  ⚠️ RESTRIÇÕES (Caixa Aqui)                 │
    │     Total: 0 restrições                     │
    │                                              │
    │  📋 CADMUT (Histórico de Mutuários)         │
    │     Encontrado: Não                         │
    │                                              │
    │  🏢 CIWEB (Empreendimentos)                 │
    │     Investimentos: Nenhum                   │
    │                                              │
    │  💰 RESTITUIÇÃO (Receita Federal)           │
    │     Saldo: Sem informações                  │
    │                                              │
    │  🎯 DECISÃO RECOMENDADA                     │
    │     Risco: Baixo                            │
    │     Recomendação: ✅ APROVADO               │
    │     Detalhes: Sem restrições encontradas    │
    │                                              │
    └─────────────────────────────────────────────┘
              ↓
    [BOTÕES]
    └─ 💾 Salvar no Firebase
    └─ 📥 Baixar PDF
    └─ 📊 Histórico
```

---

## 4️⃣ FLUXO TÉCNICO COMPLETO

### Frontend (SPA - Single Page Application)
```javascript
// 1. Usuário faz login
POST /api/auth/login
{
  "email": "admin@boltlock.com",
  "senha": "Admin@123"
}
// Retorna: token JWT

// 2. Usuário consulta CPF
POST /api/consultar/unificada
{
  "cpf": "123.456.789-00"
}
// Headers: Authorization: Bearer [TOKEN]

// 3. Retorna resultado consolidado
{
  "id": "consulta_1715245800000_abc123",
  "timestamp": "2026-05-09T14:30:00Z",
  "cpf": "123.456.789-00",
  "situacao_cpf": { ... },
  "cadmut": { ... },
  "cixaaqui": { ... },
  "ciweb": { ... },
  "restituicao": { ... },
  "decisao": {
    "risco": "Baixo",
    "recomendacao": "Aprovado"
  }
}

// 4. Salva automaticamente no Firebase
```

### Backend (Express.js)
```javascript
// 1. Valida token JWT
validarToken(req, res, next)

// 2. Verifica créditos
usuario.creditos >= 5 ? continuar : erro "Créditos insuficientes"

// 3. Faz 5 consultas em PARALELO
Promise.all([
  consultarCaixaAqui(cpf),
  consultarCADMUT(cpf),
  consultarCIWEB(cpf),
  consultarCPF(cpf),
  consultarRestituicao(cpf)
])

// 4. Consolida resultados
resultado = {
  caixaaqui: resultado1,
  cadmut: resultado2,
  ciweb: resultado3,
  cpf: resultado4,
  restituicao: resultado5,
  decisao: gerarDecisao(...)
}

// 5. Salva no Firebase Realtime Database
db.ref(`consultas/${id}`).set(resultado)

// 6. Deduz 5 créditos
usuario.creditos -= 5

// 7. Retorna para frontend
res.json(resultado)
```

### Firebase (Persistent Storage)
```
/consultas/
├─ consulta_1715245800000_abc123/
│  ├─ id: "consulta_..."
│  ├─ timestamp: "2026-05-09T14:30:00Z"
│  ├─ usuario_email: "admin@boltlock.com"
│  ├─ cpf: "123.456.789-00"
│  ├─ caixaaqui: { ... }
│  ├─ cadmut: { ... }
│  ├─ ciweb: { ... }
│  ├─ cpf: { ... }
│  ├─ restituicao: { ... }
│  └─ decisao: { ... }
└─ [Mais consultas...]
```

---

## 5️⃣ CHECKLIST DE CONFIGURAÇÃO

### Credenciais
- [ ] Email/Senha Caixa Aqui
- [ ] Email/Senha CADMUT
- [ ] Email/Senha CIWEB
- [ ] CPF/Senha Receita Federal
- [ ] CPF/Senha Restituição

### Vercel Environment Variables
```
FIREBASE_DATABASE_URL=https://seu-projeto.firebaseio.com
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
CAIXA_AQUI_EMAIL=
CAIXA_AQUI_SENHA=
CADMUT_EMAIL=
CADMUT_SENHA=
CIWEB_EMAIL=
CIWEB_SENHA=
CPF_EMAIL=
CPF_SENHA=
RESTITUICAO_EMAIL=
RESTITUICAO_SENHA=
JWT_SECRET=seu_jwt_secret_complexo_aqui
NODE_ENV=production
```

### Deploy
- [ ] Push para GitHub (boltlock2026-create/boltlock)
- [ ] Configurar variáveis no Vercel
- [ ] Deploy automático em boltlock.com.br
- [ ] Testar login e consulta
- [ ] Verificar relatório consolidado

---

## 6️⃣ TESTES

### Teste 1: Login
```bash
curl -X POST https://boltlock.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@boltlock.com","senha":"Admin@123"}'
```
✅ Esperado: Token JWT

### Teste 2: Consulta Unificada
```bash
curl -X POST https://boltlock.com.br/api/consultar/unificada \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"cpf":"12345678900"}'
```
✅ Esperado: Relatório consolidado com 5 fontes

### Teste 3: Firebase
```bash
// No Firebase Console, verificar:
✅ Dados salvos em /consultas/
✅ Timestamp correto
✅ Usuário associado
```

### Teste 4: PDF Export
```bash
GET https://boltlock.com.br/api/consultas/exportar/pdf?id=[ID_CONSULTA]
```
✅ Esperado: Arquivo PDF com relatório

---

## 7️⃣ PRÓXIMOS PASSOS

1. **Hoje**: Fornecer credenciais dos 5 links
2. **Amanhã**: Integrar APIs ao backend
3. **Próxima semana**: Deploy em produção
4. **Semana seguinte**: Testes com clientes reais

---

**Status Operacional:** 🟢 Pronto para ir ao vivo  
**Última Atualização:** 2026-05-09  
**Dono:** Tenório Vivaz / BOLTLOCK
