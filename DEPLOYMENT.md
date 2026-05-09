# 🚀 Guia de Deploy - Crédito Boltlock

URL Final: **https://boltlock.com.br/creditscore**

---

## 📋 Pré-requisitos

- [ ] Conta GitHub
- [ ] Conta Vercel (conectada ao GitHub)
- [ ] Conta Firebase
- [ ] Domínio boltlock.com.br (ou apontado para Vercel)
- [ ] Node.js v18+

---

## 1️⃣ GitHub - Criar Repositório e Fazer Push

### 1.1 Criar repositório no GitHub

1. Vá para https://github.com/new
2. Nome: `credito-boltlock`
3. Descrição: "SaaS platform for unified credit analysis"
4. Público ou privado (escolha sua preferência)
5. **Não inicialize com README** (já temos)

### 1.2 Adicionar remote e fazer push

```bash
cd C:\Users\x\Desktop\Credito-Boltlock

# Adicionar remote
git remote add origin https://github.com/SEU_USUARIO/credito-boltlock.git

# Fazer commit de todos os arquivos
git add .
git commit -m "Initial commit: Crédito Boltlock SaaS platform

- Full-stack SaaS for credit analysis
- Frontend: Vanilla JS + Neumorphism Design
- Backend: Express.js with unified API integrations
- Firebase support for data persistence
- Ready for Vercel deployment"

# Push para main
git branch -M main
git push -u origin main
```

---

## 2️⃣ Firebase - Configurar Credenciais

### 2.1 Criar Projeto Firebase

1. Vá para https://console.firebase.google.com
2. Clique "Criar Projeto"
3. Nome: `boltlock-credito` (ou similar)
4. Desative Google Analytics (opcional)
5. Crie o projeto

### 2.2 Criar Realtime Database

1. No Firebase Console, vá para **Realtime Database**
2. Clique **Criar banco de dados**
3. Localização: `us-central1` (padrão)
4. Modo de início: **Modo de teste** (depois configurar rules)
5. Copie a URL do banco (ex: `https://seu-projeto.firebaseio.com`)

### 2.3 Gerar Chave Privada

1. Vá para **Project Settings** (engrenagem no canto superior)
2. Aba **Service Accounts**
3. Linguagem: **Node.js**
4. Clique **Gerar nova chave privada**
5. Salve o arquivo JSON

### 2.4 Converter Credenciais para String

Abra o JSON baixado e copie TODO o conteúdo em uma linha:

```bash
# Comando para converter (no PowerShell):
$json = Get-Content "caminho/do/arquivo.json" -Raw
$json | Set-Clipboard
```

---

## 3️⃣ Vercel - Configurar Environment Variables

### 3.1 Conectar GitHub ao Vercel

1. Vá para https://vercel.com
2. Clique "New Project"
3. Importar repositório GitHub `credito-boltlock`
4. Conecte sua conta GitHub

### 3.2 Definir Variáveis de Ambiente

No Vercel, vá para **Project Settings → Environment Variables** e adicione:

```
FIREBASE_DATABASE_URL = https://seu-projeto.firebaseio.com
FIREBASE_SERVICE_ACCOUNT = {"type":"service_account","project_id":"..."}
JWT_SECRET = seu_jwt_secret_bem_complexo_aqui
NODE_ENV = production
```

### 3.3 Configurar Root Directory

1. Em **Settings → Root Directory**, defina: `./`
2. Build Command: `npm install && npm run build`
3. Output Directory: `./` (Vercel detecta automaticamente)

### 3.4 Fazer Deploy

```bash
# Instalar CLI do Vercel
npm install -g vercel

# Fazer deploy
cd C:\Users\x\Desktop\Credito-Boltlock
vercel --prod
```

---

## 4️⃣ Apontar Domínio para Vercel

### 4.1 Configurar Domínio no Vercel

1. No projeto Vercel, vá para **Settings → Domains**
2. Clique **Add Domain**
3. Digite: `boltlock.com.br`
4. Vercel mostrará os **Nameservers** para configurar

### 4.2 Atualizar DNS do Registrar

Seu registrador de domínio (Registro.br, HostGator, etc):

1. Vá para DNS/Nameservers
2. Atualize para os nameservers do Vercel:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
   - `ns3.vercel-dns.com`
   - `ns4.vercel-dns.com`

3. Aguarde propagação (até 48 horas)

### 4.3 Configurar SSL

Vercel configura automaticamente. Após propagação:
- [ ] Verificar HTTPS em https://boltlock.com.br
- [ ] Certificado SSL ativo

---

## 5️⃣ Configurar Rota /creditscore

O arquivo `vercel.json` já está configurado. Quando deployado:

- `https://boltlock.com.br/creditscore` → Frontend
- `https://boltlock.com.br/api/*` → Backend Express

---

## 6️⃣ Testes Pós-Deploy

```bash
# Testar saúde da API
curl https://boltlock.com.br/api/health

# Testar login
curl -X POST https://boltlock.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@boltlock.com","senha":"Admin@123"}'

# Acessar frontend
open https://boltlock.com.br/creditscore
```

---

## 7️⃣ Monitoramento Contínuo

### Vercel Analytics

- [ ] Ativar **Web Analytics** no Vercel
- [ ] Monitorar Performance, Errors, Status

### Firebase Console

- [ ] Monitorar uso de **Realtime Database**
- [ ] Configurar **Firebase Rules** para segurança:

```json
{
  "rules": {
    "consultas": {
      "$id": {
        ".read": "root.child('consultas').child($id).child('usuario_email').val() === auth.uid",
        ".write": "root.child('consultas').child($id).child('usuario_email').val() === auth.uid"
      }
    }
  }
}
```

---

## ⚠️ Checklist Final

- [ ] GitHub: Repositório criado e código pushed
- [ ] Firebase: Projeto criado, DB ativa, credenciais geradas
- [ ] Vercel: Projeto conectado, variáveis de ambiente configuradas
- [ ] Domínio: Apontado para Vercel
- [ ] SSL: Certificado ativo
- [ ] Testes: API respondendo, frontend carregando
- [ ] Monitoramento: Alertas configurados

---

## 🆘 Troubleshooting

### "FIREBASE_SERVICE_ACCOUNT não reconhecido"
- Certifique-se que é JSON válido (sem quebras de linha)
- Use aspas duplas em todo o JSON

### "Domínio não resolve"
- Aguarde 48 horas para propagação DNS
- Verifique nameservers com: `nslookup boltlock.com.br`

### "Erro ao salvar no Firebase"
- Verifique as Firebase Rules
- Confirme que a Database URL está correta

### "Deploy falha no Vercel"
- Verifique logs: `vercel logs`
- Confirme que não há erro no backend/server.js
- Instale dependências: `npm install` antes de commitar

---

**Desenvolvido por**: Tenório Vivaz  
**Atualizado**: Maio 2026
