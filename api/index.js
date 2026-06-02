import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { load } from 'cheerio';
import NodeCache from 'node-cache';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const cache = new NodeCache({ stdTTL: 3600 });

let db = null;
let firebaseInitialized = false;

// ═══════════════════════════════════════════════════════════════
// FIREBASE INITIALIZATION
// ═══════════════════════════════════════════════════════════════

try {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  const databaseURL = process.env.FIREBASE_DATABASE_URL;

  if (serviceAccountString && serviceAccountString !== '{}' && databaseURL) {
    try {
      const serviceAccount = JSON.parse(serviceAccountString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL
      });
      db = admin.database();
      firebaseInitialized = true;
      console.log('✅ Firebase Realtime Database conectado!');
    } catch (parseError) {
      console.warn('⚠️ Firebase: erro ao fazer parse das credenciais. Use JSON válido no .env');
    }
  } else {
    console.log('ℹ️ Firebase não configurado. Consultas serão salvas localmente.');
  }
} catch (error) {
  console.warn('⚠️ Firebase não inicializado:', error.message);
}

// Middleware
app.use(cors());
app.use(express.json());

const presentationContext = `
Você é uma IA de apoio da apresentação de Bruno Kvetik.
Responda sempre em português do Brasil, com tom amigável, direto e executivo.
Se a pessoa disser apenas "oi", cumprimente, pergunte sobre o contexto dela e ofereça caminhos de conversa.
Não invente que uma reunião já aconteceu. Não prometa integração pronta se não houver contexto.

Contexto da apresentação:
- Bruno Kvetik apresenta soluções aplicadas com IA, dados, marketing, automação, ferramentas digitais, sites, LPs, CRM, SaaS e área dev.
- A proposta é entender o negócio, achar gargalos e criar solução prática para empresas.
- Frentes gerais: IA aplicada, dados/telemetria/BI, marketing/ads/conteúdo/vídeos, ferramentas digitais, sites/LP/CRM/SaaS, informação como vantagem, dados que viram dinheiro, inovação aplicada e empresas humanas com IA.
- Se o assunto for imobiliário, fale da Aceleradora Imobiliária: RH, contratação ativa, IA para contratar, IA para manter, gestão de RH, pessoas, treinamentos, cursos, plano de desenvolvimento de 6 meses a 1 ano, mentorias, gamificação acoplada a dados/CRM/WhatsApp, IA com imobiliárias e corretores, produtos no WhatsApp do corretor, IA respondendo leads ou atuando como copiloto, recepção IA em plantões e manutenção/evolução da operação.
- Para um Head de Marketing de incorporadora, priorize: qualidade do lead, mídia, CRM, conversão, velocidade de atendimento, corretor, plantão, dados, ROI e integração marketing-comercial.
`;

function getAgentInstruction(agent = 'Estratégia') {
  const instructions = {
    'Estratégia': 'Pense como consultor estratégico. Ajude a priorizar oportunidade, dor, impacto e primeiro passo.',
    'Operação': 'Pense em processo, rotina, gargalo, CRM, atendimento, time e execução diária.',
    'Marketing': 'Pense em aquisição, criativos, conteúdo, mídia paga, funil, conversão e posicionamento.',
    'Dados': 'Pense em BI, telemetria, indicadores, leitura de funil, margem, alertas e decisão.',
    'Produto': 'Pense em ferramenta digital, jornada, interface, portal, SaaS e adoção pelo time.',
    'Dev': 'Pense em arquitetura, integrações, segurança, deploy, automação e viabilidade técnica.',
    'Vendas': 'Pense em lead, follow-up, proposta, CRM, cadência, objeção e fechamento.'
  };
  return instructions[agent] || instructions.Estratégia;
}

function localPresentationReply(message = '', agent = 'Estratégia') {
  const text = message.trim().toLowerCase();
  if (!text || /^(oi|olá|ola|bom dia|boa tarde|boa noite|e ai|e aí)$/.test(text)) {
    return `Oi! Sou a IA ${agent} da apresentação do Bruno. Posso te ajudar a transformar essa conversa em algo bem prático: IA aplicada, dados/BI, marketing, automação, ferramentas digitais ou uma ideia específica para o mercado imobiliário. Qual dessas frentes você quer explorar primeiro?`;
  }
  if (text.includes('imobili') || text.includes('corretor') || text.includes('plantão') || text.includes('plantao') || text.includes('tecnisa')) {
    return `Boa. Para o mercado imobiliário, eu olharia primeiro para a ligação entre mídia, CRM, corretor e plantão. A Aceleradora Imobiliária pode atuar em RH, treinamento, gamificação conectada a dados, WhatsApp do corretor, IA copiloto para leads e recepção IA documentando tudo no CRM. Se você me disser a dor principal, eu desenho um primeiro fluxo.`;
  }
  return `Entendi. Pensando como IA ${agent}, eu começaria mapeando objetivo, gargalo, dados disponíveis e canal principal. A partir disso, o Bruno pode transformar a ideia em uma solução prática: IA para atendimento, BI para decisão, automação operacional, marketing com dados ou ferramenta digital sob medida.`;
}

async function callGroq(messages) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
      messages,
      temperature: 0.55,
      max_tokens: 520
    },
    { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 18000 }
  );
  return response.data?.choices?.[0]?.message?.content?.trim() || null;
}

async function callXai(messages) {
  const apiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
  if (!apiKey) return null;
  const response = await axios.post(
    'https://api.x.ai/v1/chat/completions',
    {
      model: process.env.XAI_MODEL || process.env.GROK_MODEL || 'grok-3-mini',
      messages,
      temperature: 0.55,
      max_tokens: 520
    },
    { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 18000 }
  );
  return response.data?.choices?.[0]?.message?.content?.trim() || null;
}

async function callGemini(messages) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const prompt = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.55, maxOutputTokens: 520 }
    },
    { timeout: 18000 }
  );
  return response.data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join('').trim() || null;
}

app.post('/api/presentation-chat', async (req, res) => {
  try {
    const { message = '', agent = 'Estratégia', history = [] } = req.body || {};
    const cleanHistory = Array.isArray(history)
      ? history.slice(-6).map((item) => ({
        role: item.role === 'assistant' ? 'assistant' : 'user',
        content: String(item.content || '').slice(0, 800)
      }))
      : [];

    const messages = [
      { role: 'system', content: presentationContext },
      { role: 'system', content: getAgentInstruction(agent) },
      ...cleanHistory,
      { role: 'user', content: String(message || '').slice(0, 1200) }
    ];

    let provider = 'local';
    let answer = null;
    const providers = [
      ['groq', callGroq],
      ['xai', callXai],
      ['gemini', callGemini]
    ];

    for (const [name, fn] of providers) {
      try {
        answer = await fn(messages);
        if (answer) {
          provider = name;
          break;
        }
      } catch (error) {
        console.warn(`[presentation-chat] ${name} indisponível:`, error.response?.status || error.message);
      }
    }

    if (!answer) answer = localPresentationReply(message, agent);
    res.json({ answer, provider });
  } catch (error) {
    console.error('[presentation-chat]', error.message);
    res.json({ answer: localPresentationReply(req.body?.message, req.body?.agent), provider: 'local' });
  }
});

// ═══════════════════════════════════════════════════════════════
// 1. DADOS DE USUÁRIOS (Mock - em produção seria banco de dados)
// ═══════════════════════════════════════════════════════════════

const usuarios = {
  'reginaldo@boltlock.com': {
    senha: 'BOLTLOCK01',
    nome: 'Reginaldo',
    role: 'master',
    creditos: 100000,
    correspondente: 'BOLTLOCK - Master'
  },
  'bruno@boltlock.com': {
    senha: 'BOLTLOCK01',
    nome: 'Bruno',
    role: 'master',
    creditos: 100000,
    correspondente: 'BOLTLOCK - Master'
  },
  'admin@boltlock.com': {
    senha: 'Admin@123',
    nome: 'Administrador',
    role: 'admin',
    creditos: 10000,
    correspondente: 'CCA Master'
  },
  'correspondent1@boltlock.com': {
    senha: 'Corresp@123',
    nome: 'João Correspondente',
    role: 'correspondente',
    creditos: 500,
    correspondente: 'CCA Digital'
  }
};

// ═══════════════════════════════════════════════════════════════
// 2. AUTENTICAÇÃO
// ═══════════════════════════════════════════════════════════════

app.post('/api/auth/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
  }

  const usuario = usuarios[email];

  if (!usuario || usuario.senha !== senha) {
    return res.status(401).json({ erro: 'Email ou senha inválidos' });
  }

  // Simular JWT (em produção, usar jsonwebtoken)
  const token = Buffer.from(JSON.stringify({ email, role: usuario.role })).toString('base64');

  res.json({
    token,
    usuario: {
      email,
      nome: usuario.nome,
      role: usuario.role,
      creditos: usuario.creditos,
      correspondente: usuario.correspondente
    }
  });
});

// Middleware para validar token
function validarToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    req.usuario = decoded;
    next();
  } catch (err) {
    res.status(401).json({ erro: 'Token inválido' });
  }
}

// ═══════════════════════════════════════════════════════════════
// 3. CONSULTA UNIFICADA (MAIN ENDPOINT)
// ═══════════════════════════════════════════════════════════════

app.post('/api/consultar/unificada', validarToken, async (req, res) => {
  try {
    const { cpf } = req.body;

    if (!cpf) {
      return res.status(400).json({ erro: 'CPF é obrigatório' });
    }

    // Verificar créditos
    const usuario = usuarios[req.usuario.email];
    if (usuario.creditos < 5) {
      return res.status(402).json({ erro: 'Créditos insuficientes. Mínimo: 5' });
    }

    // Checar cache
    const cacheKey = `consulta_${cpf}`;
    const resultadoCache = cache.get(cacheKey);
    if (resultadoCache) {
      console.log(`[CACHE HIT] CPF: ${cpf}`);
      return res.json(resultadoCache);
    }

    console.log(`[CONSULTA] Iniciando consulta unificada para CPF: ${cpf}`);

    // Executar todas as consultas em paralelo
    const [statusCPF, cadmut, protestos, sancoes, pix] = await Promise.all([
      consultarStatusCPF(cpf),
      consultarCADMUT(cpf),
      consultarProtestos(cpf),
      consultarSancoes(cpf),
      consultarPix(cpf)
    ]);

    const resultado = {
      id: `consulta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      usuario_email: req.usuario.email,
      cpf,
      situacao_cpf: statusCPF,
      cadmut,
      protestos,
      sancoes,
      pix,
      decisao: gerarDecisao(statusCPF, cadmut, protestos, sancoes)
    };

    // Salvar em cache
    cache.set(cacheKey, resultado);

    // Deduzir créditos
    usuario.creditos -= 5;

    // Salvar no Firebase/Arquivo
    salvarConsulta(resultado);

    // Registrar consulta
    console.log(`[OK] Consulta realizada com sucesso. Créditos restantes: ${usuario.creditos}`);

    res.json(resultado);
  } catch (erro) {
    console.error('[ERRO]', erro.message);
    res.status(500).json({ erro: 'Erro ao processar consulta', detalhes: erro.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// 4. CONSULTAS INDIVIDUAIS
// ═══════════════════════════════════════════════════════════════

async function consultarStatusCPF(cpf) {
  try {
    // Simular resposta da API Serpro/Gov.br
    const cpfLimpo = cpf.replace(/\D/g, '');

    // Validação simples de CPF (apenas para demo)
    if (cpfLimpo.length !== 11) {
      return {
        status: 'Inválido',
        nome: null,
        data_nascimento: null,
        mensagem: 'CPF com formato inválido'
      };
    }

    // Mock response
    return {
      status: 'Regular',
      nome: 'João da Silva',
      data_nascimento: '1990-01-15',
      data_atualizacao: new Date().toISOString()
    };
  } catch (erro) {
    console.error('[CPF-LIGHT ERROR]', erro.message);
    return { status: 'Erro', mensagem: erro.message };
  }
}

async function consultarCADMUT(cpf) {
  try {
    // Simular consulta ao CADMUT
    // Em produção: integração com Infosimples ou RPA

    return {
      encontrado: false,
      status: null,
      tipo_operacao: null,
      data_operacao: null,
      situacao: null,
      nota: 'Integração com Infosimples requer credenciais'
    };
  } catch (erro) {
    console.error('[CADMUT ERROR]', erro.message);
    return { erro: erro.message };
  }
}

async function consultarProtestos(cpf) {
  try {
    // Consultar API IEPTB (Cartório de Protestos)
    // Simular response

    return {
      total: 0,
      valor_total: 0.00,
      cartorio: null,
      protestos: [],
      data_consulta: new Date().toISOString()
    };
  } catch (erro) {
    console.error('[PROTESTOS ERROR]', erro.message);
    return { erro: erro.message };
  }
}

async function consultarSancoes(cpf) {
  try {
    // Consultar Portal da Transparência (CEIS, CNEP, CADIN)
    // Simular response

    return {
      ceis: false,
      cnep: false,
      cadin: false,
      data_consulta: new Date().toISOString()
    };
  } catch (erro) {
    console.error('[SANCOES ERROR]', erro.message);
    return { erro: erro.message };
  }
}

async function consultarPix(cpf) {
  try {
    // Consultar API DICT do Bacen (Gratuita)
    // Simular response

    return {
      chaves_registradas: 1,
      chaves: ['email@example.com'],
      telefone_registrado: false,
      data_consulta: new Date().toISOString()
    };
  } catch (erro) {
    console.error('[DICT ERROR]', erro.message);
    return { erro: erro.message };
  }
}

// ═══════════════════════════════════════════════════════════════
// 5. GERAR DECISÃO
// ═══════════════════════════════════════════════════════════════

function gerarDecisao(cpf, cadmut, protestos, sancoes) {
  let risco = 'Baixo';
  let recomendacao = 'Aprovado';
  let detalhes = [];

  // Se CPF suspenso/cancelado
  if (cpf.status === 'Suspensa' || cpf.status === 'Cancelada') {
    risco = 'Alto';
    recomendacao = 'Negado';
    detalhes.push('CPF irregular na Receita Federal');
  }

  // Se tem protestos
  if (protestos.total > 0) {
    risco = 'Alto';
    recomendacao = 'Negado';
    detalhes.push(`${protestos.total} protesto(s) encontrado(s)`);
  }

  // Se tem sanções
  if (sancoes.ceis || sancoes.cnep || sancoes.cadin) {
    risco = 'Crítico';
    recomendacao = 'Negado';
    detalhes.push('Presente em cadastro de sanções públicas');
  }

  return {
    risco,
    recomendacao,
    detalhes,
    creditos_usados: 5,
    data_analise: new Date().toISOString()
  };
}

// ═══════════════════════════════════════════════════════════════
// 6. SALVAR CONSULTAS (Firebase ou Arquivo Local)
// ═══════════════════════════════════════════════════════════════

function salvarConsulta(resultado) {
  if (firebaseInitialized) {
    // Salvar no Firebase Realtime Database
    const consultasRef = db.ref(`consultas/${resultado.id}`);
    consultasRef.set(resultado, (error) => {
      if (error) {
        console.error('[FIREBASE ERROR]', error);
      } else {
        console.log(`[FIREBASE OK] Consulta ${resultado.id} salva no Firebase`);
      }
    });
  } else {
    // Salvar localmente em arquivo JSON
    const consultasDir = path.join(__dirname, 'consultas_salvas');
    if (!fs.existsSync(consultasDir)) {
      fs.mkdirSync(consultasDir, { recursive: true });
    }

    const filePath = path.join(consultasDir, `${resultado.id}.json`);
    fs.writeFile(filePath, JSON.stringify(resultado, null, 2), (err) => {
      if (err) {
        console.error('[ARQUIVO ERROR]', err);
      } else {
        console.log(`[ARQUIVO OK] Consulta ${resultado.id} salva localmente em ${filePath}`);
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// 7. RECUPERAR TODAS AS CONSULTAS
// ═══════════════════════════════════════════════════════════════

app.get('/api/consultas/historico', validarToken, async (req, res) => {
  try {
    const usuario = usuarios[req.usuario.email];

    if (firebaseInitialized) {
      // Buscar do Firebase
      const consultasRef = db.ref('consultas').orderByChild('usuario_email').equalTo(req.usuario.email);
      consultasRef.once('value', (snapshot) => {
        const consultas = [];
        snapshot.forEach((childSnapshot) => {
          consultas.push(childSnapshot.val());
        });
        res.json({
          fonte: 'firebase',
          total: consultas.length,
          consultas: consultas.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        });
      });
    } else {
      // Buscar do arquivo local
      const consultasDir = path.join(__dirname, 'consultas_salvas');
      if (!fs.existsSync(consultasDir)) {
        return res.json({ fonte: 'arquivo', total: 0, consultas: [] });
      }

      const files = fs.readdirSync(consultasDir);
      const consultas = [];

      files.forEach((file) => {
        if (file.endsWith('.json')) {
          const filePath = path.join(consultasDir, file);
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          if (data.usuario_email === req.usuario.email) {
            consultas.push(data);
          }
        }
      });

      res.json({
        fonte: 'arquivo',
        total: consultas.length,
        consultas: consultas.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      });
    }
  } catch (erro) {
    console.error('[ERRO HISTORICO]', erro.message);
    res.status(500).json({ erro: 'Erro ao buscar histórico', detalhes: erro.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// 8. DASHBOARD
// ═══════════════════════════════════════════════════════════════

app.get('/api/dashboard', validarToken, (req, res) => {
  const usuario = usuarios[req.usuario.email];

  res.json({
    usuario: {
      email: req.usuario.email,
      nome: usuario.nome,
      role: usuario.role,
      correspondente: usuario.correspondente
    },
    creditos: {
      disponivel: usuario.creditos,
      usados_hoje: 0,
      limite_mensal: 10000
    },
    stats: {
      consultas_realizadas: 0,
      taxa_aprovacao: '85%',
      tempo_medio_consulta: '2.3s'
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 9. EXPORTAR CONSULTAS
// ═══════════════════════════════════════════════════════════════

app.get('/api/consultas/exportar/:formato', validarToken, async (req, res) => {
  try {
    const { formato } = req.params;
    const usuario = usuarios[req.usuario.email];

    let consultas = [];

    if (firebaseInitialized) {
      const consultasRef = db.ref('consultas').orderByChild('usuario_email').equalTo(req.usuario.email);
      await new Promise((resolve) => {
        consultasRef.once('value', (snapshot) => {
          snapshot.forEach((childSnapshot) => {
            consultas.push(childSnapshot.val());
          });
          resolve();
        });
      });
    } else {
      const consultasDir = path.join(__dirname, 'consultas_salvas');
      if (fs.existsSync(consultasDir)) {
        const files = fs.readdirSync(consultasDir);
        files.forEach((file) => {
          if (file.endsWith('.json')) {
            const filePath = path.join(consultasDir, file);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (data.usuario_email === req.usuario.email) {
              consultas.push(data);
            }
          }
        });
      }
    }

    if (formato === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="consultas_${Date.now()}.json"`);
      res.send(JSON.stringify(consultas, null, 2));
    } else if (formato === 'csv') {
      // Gerar CSV simples
      const headers = ['ID', 'Data/Hora', 'CPF', 'Status CPF', 'Protestos', 'Sanções', 'Decisão'];
      const rows = consultas.map((c) => [
        c.id,
        c.timestamp,
        c.cpf,
        c.situacao_cpf.status,
        c.protestos.total || 0,
        (c.sancoes.ceis || c.sancoes.cnep || c.sancoes.cadin) ? 'Sim' : 'Não',
        c.decisao.recomendacao
      ]);

      let csv = headers.join(',') + '\n';
      rows.forEach((row) => {
        csv += row.map((cell) => `"${cell}"`).join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="consultas_${Date.now()}.csv"`);
      res.send(csv);
    } else {
      res.status(400).json({ erro: 'Formato inválido. Use: json ou csv' });
    }
  } catch (erro) {
    console.error('[ERRO EXPORTAR]', erro.message);
    res.status(500).json({ erro: 'Erro ao exportar', detalhes: erro.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// 10. HEALTH CHECK
// ═══════════════════════════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    versao: '1.0.0',
    apis: {
      'CPF-Light (Serpro)': 'Gratuita (com credenciais)',
      'DICT (Bacen)': 'Gratuita',
      'IEPTB (Protestos)': 'Gratuita',
      'Portal Transparência': 'Gratuita',
      'CADMUT (Caixa)': 'Requer Infosimples'
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// EXPORT PARA VERCEL FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export default app;
