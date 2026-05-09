# 🔌 Integração de APIs - Crédito Boltlock

Guia para integrar APIs reais em seu sistema.

## 📋 Checklist de Integração

### Fase 1: APIs Gratuitas (Já Implementadas)
- [x] DICT (Bacen) - Chaves Pix
- [x] IEPTB - Protestos
- [x] Portal Transparência - Sanções
- [ ] CPF-Light (Serpro) - Status CPF
- [ ] CADMUT (Caixa/Infosimples) - Histórico

---

## 1️⃣ Integração: CPF-Light (Receita Federal via Serpro)

### Custo
- **R$ 0,50 a R$ 1,50 por consulta** (conforme contrato)
- Volume: 5.000/mês = ~R$ 2.500-7.500/mês

### Passo 1: Registrar em Gov.br
```
1. Acesse: https://conectagov.serpro.gov.br/
2. Clique em "API CPF-Light v2"
3. Preencha formulário de registro
4. Aguarde aprovação (24-48h)
```

### Passo 2: Obter Credenciais
Após aprovação, você terá:
```
- SERPRO_CLIENT_ID = seu_id
- SERPRO_CLIENT_SECRET = seu_secret
- SERPRO_API_KEY = sua_chave
```

### Passo 3: Adicionar ao .env
```env
SERPRO_API_KEY=sua_chave_aqui
SERPRO_CLIENT_ID=seu_id
SERPRO_CLIENT_SECRET=seu_secret
```

### Passo 4: Implementar no Code
Edite `backend/server.js` - função `consultarStatusCPF()`:

```javascript
async function consultarStatusCPF(cpf) {
  try {
    const token = await gerarTokenSerpro();
    
    const response = await axios.get('https://api.serpro.gov.br/consulta-cpf/v2/pessoais', {
      params: { cpf },
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return {
      status: response.data.status || 'Regular',
      nome: response.data.nome,
      data_nascimento: response.data.data_nascimento,
      data_atualizacao: new Date().toISOString()
    };
  } catch (erro) {
    console.error('[CPF-LIGHT ERROR]', erro.message);
    return { status: 'Erro', mensagem: erro.message };
  }
}

async function gerarTokenSerpro() {
  const response = await axios.post('https://api.serpro.gov.br/oauth/authorize', {
    grant_type: 'client_credentials',
    client_id: process.env.SERPRO_CLIENT_ID,
    client_secret: process.env.SERPRO_CLIENT_SECRET
  });
  
  return response.data.access_token;
}
```

---

## 2️⃣ Integração: CADMUT (via Infosimples)

### Custo
- **R$ 500-2.000/mês** (depende do plano)
- Incluso: 850+ portais públicos
- Suporte: integração RPA automática

### Passo 1: Contatar Infosimples
```
Site: https://infosimples.com/
Email: contato@infosimples.com
Tel: (11) 3959-8100

Mencione:
- Volume: 5.000 pesquisas/mês
- Necessidade: CADMUT + Registrato/SCR
- Budget: ~R$ 1.000-2.000
```

### Passo 2: Obter API Key
Após contrato:
```
INFOSIMPLES_API_KEY = sua_chave
```

### Passo 3: Adicionar ao .env
```env
INFOSIMPLES_API_KEY=sua_chave_aqui
INFOSIMPLES_BASE_URL=https://api.infosimples.com/v2
```

### Passo 4: Implementar no Code
Edite `backend/server.js` - função `consultarCADMUT()`:

```javascript
async function consultarCADMUT(cpf) {
  try {
    const response = await axios.get(
      `${process.env.INFOSIMPLES_BASE_URL}/cadmut`,
      {
        params: { cpf },
        headers: { Authorization: `Bearer ${process.env.INFOSIMPLES_API_KEY}` }
      }
    );
    
    return {
      encontrado: response.data.encontrado || false,
      status: response.data.status,
      tipo_operacao: response.data.tipo_operacao,
      data_operacao: response.data.data_operacao,
      situacao: response.data.situacao,
      score_estimado: response.data.score
    };
  } catch (erro) {
    console.error('[CADMUT ERROR]', erro.message);
    return { erro: erro.message };
  }
}
```

### Passo 5: Adicionar outros serviços Infosimples
```javascript
// Registrato/SCR
async function consultarRegistrato(cpf) {
  return await axios.get(
    `${process.env.INFOSIMPLES_BASE_URL}/registrato`,
    {
      params: { cpf },
      headers: { Authorization: `Bearer ${process.env.INFOSIMPLES_API_KEY}` }
    }
  );
}

// Certidões
async function consultarCertidoes(cpf) {
  return await axios.get(
    `${process.env.INFOSIMPLES_BASE_URL}/certidoes`,
    {
      params: { cpf },
      headers: { Authorization: `Bearer ${process.env.INFOSIMPLES_API_KEY}` }
    }
  );
}
```

---

## 3️⃣ Integração: Open Finance (Histórico Bancário)

### Custo
- **R$ 500-1.500/mês** (conforme volume)
- Requer consentimento do cliente
- Acesso: saldos, transações, investimentos

### Opções
1. **Pluggy** - https://pluggy.ai/
2. **Belvo** - https://belvo.com/
3. **AWS FinSpace** - https://aws.amazon.com/finspace/

### Implementação (Pluggy)
```javascript
async function consultarOpenFinance(cpf) {
  try {
    const response = await axios.post(
      'https://api.pluggy.ai/accounts',
      {
        accessToken: process.env.PLUGGY_TOKEN,
        cpf: cpf
      }
    );
    
    return {
      saldo_total: response.data.saldo,
      historico_credito: response.data.historico,
      investimentos: response.data.investimentos
    };
  } catch (erro) {
    return { erro: 'Open Finance indisponível' };
  }
}
```

---

## 4️⃣ Integração: BigDataCorp (Imovelweb)

### Custo
- **R$ 1.000-3.000/mês**
- Incluso: +2M imóveis no Brasil
- Dados: matrícula, proprietários, IPTU

### Implementação
```javascript
async function consultarPatrimonioImvel(cpf) {
  try {
    const response = await axios.get(
      'https://api.bigdatacorp.com/consultas/imoveis',
      {
        params: { cpf },
        headers: { 'X-API-KEY': process.env.BIGDATACORP_API_KEY }
      }
    );
    
    return {
      imoveis: response.data.imoveis,
      valor_total: response.data.valor_total,
      hipotecas: response.data.hipotecas
    };
  } catch (erro) {
    return { erro: 'Imovelweb indisponível' };
  }
}
```

---

## 5️⃣ Endpoints Finais (Após Integração)

```javascript
// Resultado consolidado com TODAS as APIs
{
  "timestamp": "2026-05-08T10:30:00Z",
  "cpf": "000.000.000-00",
  
  "situacao_cpf": {
    "status": "Regular",
    "nome": "João Silva",
    "data_nascimento": "1990-01-15"
  },
  
  "cadmut": {
    "encontrado": false,
    "status": null,
    "score_estimado": null
  },
  
  "registrato": {
    "dívida_total": 0,
    "operacoes_ativas": 0,
    "score_credito": 800
  },
  
  "patrimonio": {
    "imoveis": [],
    "valor_total": 0
  },
  
  "protestos": {
    "total": 0,
    "valor_total": 0
  },
  
  "sancoes": {
    "ceis": false,
    "cnep": false,
    "cadin": false
  },
  
  "pix": {
    "chaves_registradas": 1,
    "chaves": ["email@example.com"]
  },
  
  "open_finance": {
    "saldo_total": 5000.00,
    "historico_credito": [...]
  },
  
  "decisao": {
    "risco": "Baixo",
    "recomendacao": "Aprovado",
    "detalhes": [...]
  }
}
```

---

## 📊 Tabela de Custos Completa

| API | Mínimo | Máximo | Tempo | Dificuldade |
|-----|--------|--------|-------|------------|
| Serpro (CPF) | R$ 1.250 | R$ 7.500 | 1 semana | ⭐⭐⭐ |
| Infosimples | R$ 500 | R$ 2.000 | 2 dias | ⭐⭐ |
| Pluggy (Open) | R$ 500 | R$ 1.500 | 3 dias | ⭐⭐ |
| BigDataCorp | R$ 1.000 | R$ 3.000 | 3 dias | ⭐⭐ |
| **TOTAL** | **~R$ 3k** | **~R$ 14k** | | |

---

## ✅ Checklist de Produção

Antes de ir para produção, verifique:

- [ ] Todas as credenciais em `.env`
- [ ] Rate limiting implementado
- [ ] Cache de resultados
- [ ] Auditoria de consultas
- [ ] CORS restrito
- [ ] HTTPS obrigatório
- [ ] Backup de dados
- [ ] Monitoramento 24/7
- [ ] Alertas de erros
- [ ] Documentação atualizada
- [ ] Testes automatizados
- [ ] Load test (100+ req/s)

---

## 🚀 Próximas Funcionalidades

- [ ] Notificações em tempo real
- [ ] Export em PDF
- [ ] Webhooks para integrações
- [ ] Multi-tenant (múltiplos correspondentes)
- [ ] Machine Learning (scoring)
- [ ] Mobile app nativo
- [ ] Blockchain para auditoria

---

## 📞 Suporte

**Contatos das APIs:**

- Serpro: https://www.gov.br/conectagov
- Infosimples: https://infosimples.com/
- Pluggy: https://pluggy.ai/
- BigDataCorp: https://bigdatacorp.com/
- Bacen: https://www.bcb.gov.br/

---

**Última atualização**: Maio 2026
