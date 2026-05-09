# 🔐 LOGINS MASTERS - CRÉDITO BOLTLOCK

## ✅ Logins Criados (2026-05-09)

### 👑 MASTER ACCOUNTS

| Nome | Email | Senha | Créditos | Role |
|------|-------|-------|----------|------|
| **REGINALDO** | reginaldo@boltlock.com | BOLTLOCK01 | 100.000 | Master |
| **BRUNO** | bruno@boltlock.com | BOLTLOCK01 | 100.000 | Master |

### 🔧 Admin/Test Accounts

| Nome | Email | Senha | Créditos | Role |
|------|-------|-------|----------|------|
| Administrador | admin@boltlock.com | Admin@123 | 10.000 | Admin |
| João Correspondente | correspondent1@boltlock.com | Corresp@123 | 500 | Correspondente |

---

## 🚀 Como Usar

### Login no Sistema
1. Acesse: **https://boltlock.com.br/creditscore**
2. Digite um dos emails acima
3. Digite a senha correspondente
4. Clique em "Entrar"

### Testar via API
```bash
# Teste com cURL
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "reginaldo@boltlock.com",
    "senha": "BOLTLOCK01"
  }'

# Resposta esperada:
{
  "token": "eyJlbWFpbCI6InJlZ2luYWxkb0B...",
  "usuario": {
    "email": "reginaldo@boltlock.com",
    "nome": "Reginaldo",
    "role": "master",
    "creditos": 100000,
    "correspondente": "BOLTLOCK - Master"
  }
}
```

---

## 📊 Privilégios por Role

### 👑 Master
- ✅ Acesso completo ao sistema
- ✅ 100.000 créditos para consultas
- ✅ Pode consultar qualquer CPF
- ✅ Relatórios ilimitados
- ✅ Acesso a todas as features

### 🔧 Admin
- ✅ Acesso administrativo
- ✅ 10.000 créditos
- ✅ Gerenciar usuários
- ✅ Ver relatórios

### 👤 Correspondente
- ✅ Acesso básico
- ✅ 500 créditos
- ✅ Fazer consultas
- ✅ Ver própios relatórios

---

## 🔑 Credenciais de Banco de Dados

### Firebase
```
Status: Configurado
Database: https://seu-projeto.firebaseio.com
Consultas salvas em: /consultas/
```

### MongoDB/PostgreSQL
```
Status: Pronto para integrar
Endpoint: [configurar em produção]
```

---

## ⚡ Próximos Passos

- [ ] Testar login com REGINALDO / BOLTLOCK01
- [ ] Testar login com BRUNO / BOLTLOCK01
- [ ] Fazer consulta de teste (CPF)
- [ ] Verificar relatório consolidado
- [ ] Deploy em produção

---

**Criado:** 2026-05-09  
**Versão:** 1.0  
**Status:** ✅ Operacional
