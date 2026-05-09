// ═══════════════════════════════════════════════════════════════
// CRÉDITO BOLTLOCK - Frontend SPA
// ═══════════════════════════════════════════════════════════════

const API_URL = '/api';

class BoltlockApp {
  constructor() {
    this.token = localStorage.getItem('boltlock_token');
    this.usuario = JSON.parse(localStorage.getItem('boltlock_usuario') || '{}');
    this.paginaAtual = 'dashboard';
    this.resultado = null;

    this.init();
  }

  init() {
    if (this.token) {
      this.mostrarApp();
    } else {
      this.mostrarLogin();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // LOGIN
  // ═══════════════════════════════════════════════════════════════

  mostrarLogin() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div id="loginPage">
        <div class="login-container">
          <div class="login-header">
            <div class="login-logo">🔒 BOLTLOCK</div>
            <div class="login-logo-sub">Crédito Unificado</div>
          </div>

          <form class="login-form" id="formLogin">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input
                type="email"
                class="form-input"
                id="loginEmail"
                placeholder="seu@email.com"
                value="admin@boltlock.com"
                required
              >
            </div>

            <div class="form-group">
              <label class="form-label">Senha</label>
              <input
                type="password"
                class="form-input"
                id="loginSenha"
                placeholder="••••••••"
                value="Admin@123"
                required
              >
            </div>

            <button type="submit" class="btn-login">ACESSAR</button>
          </form>

          <div class="login-demo">
            <strong>🧪 Demo Login:</strong>
            Email: admin@boltlock.com<br>
            Senha: Admin@123<br><br>
            <strong>Ou:</strong><br>
            Email: correspondent1@boltlock.com<br>
            Senha: Corresp@123
          </div>
        </div>
      </div>
    `;

    document.getElementById('formLogin').addEventListener('submit', (e) => this.login(e));
  }

  async login(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginSenha').value;

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (!response.ok) {
        this.mostrarToast(data.erro || 'Erro ao fazer login', 'error');
        return;
      }

      this.token = data.token;
      this.usuario = data.usuario;

      localStorage.setItem('boltlock_token', this.token);
      localStorage.setItem('boltlock_usuario', JSON.stringify(this.usuario));

      this.mostrarToast('Login realizado com sucesso! 🎉', 'success');
      this.mostrarApp();
    } catch (erro) {
      this.mostrarToast('Erro ao conectar ao servidor: ' + erro.message, 'error');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // APP PRINCIPAL
  // ═══════════════════════════════════════════════════════════════

  mostrarApp() {
    const app = document.getElementById('app');
    app.className = 'app-layout';
    app.innerHTML = `
      <div class="sidebar">
        <div class="logo">🔒 BOLTLOCK</div>

        <button class="nav-btn active" data-page="dashboard">
          <span>📊 Dashboard</span>
        </button>
        <button class="nav-btn" data-page="consulta">
          <span>🔍 Consultar CPF</span>
        </button>
        <button class="nav-btn" data-page="historico">
          <span>📋 Histórico</span>
        </button>

        <div class="nav-bottom">
          <button class="nav-btn" id="btnLogout">
            <span>🚪 Sair</span>
          </button>
        </div>
      </div>

      <div class="main">
        <div id="dashboard" class="page active">
          ${this.renderDashboard()}
        </div>

        <div id="consulta" class="page">
          ${this.renderConsulta()}
        </div>

        <div id="historico" class="page">
          ${this.renderHistorico()}
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = e.currentTarget.dataset.page;
        if (page) {
          this.trocarPagina(page);
        } else if (e.currentTarget.id === 'btnLogout') {
          this.logout();
        }
      });
    });

    // Logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => this.logout());
    }

    // Formulário de consulta
    const formConsulta = document.getElementById('formConsulta');
    if (formConsulta) {
      formConsulta.addEventListener('submit', (e) => this.consultar(e));
    }
  }

  trocarPagina(nomePagina) {
    this.paginaAtual = nomePagina;

    // Atualizar nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.closest('.nav-btn')?.classList.add('active');

    // Mostrar página
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    const pagina = document.getElementById(nomePagina);
    if (pagina) {
      pagina.classList.add('active');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════════════════════════════

  renderDashboard() {
    const { nome, role, correspondente, creditos } = this.usuario;

    return `
      <h1 class="page-title">Dashboard</h1>

      <div class="header-card">
        <div class="welcome-text">
          <h2>Bem-vindo, ${nome}! 👋</h2>
          <p>${role === 'admin' ? 'Administrador' : 'Correspondente'} • ${correspondente}</p>
        </div>
        <div class="user-info">
          <div class="user-avatar">${nome.charAt(0).toUpperCase()}</div>
          <div class="user-details">
            <h3>${nome}</h3>
            <p>${role === 'admin' ? 'Admin' : 'Analista de Crédito'}</p>
          </div>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Créditos Disponíveis</div>
          <div class="kpi-value">${creditos}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Consultas Este Mês</div>
          <div class="kpi-value">0</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Taxa de Aprovação</div>
          <div class="kpi-value">85%</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Tempo Médio</div>
          <div class="kpi-value">2.3s</div>
        </div>
      </div>

      <div class="consulta-card">
        <h3 style="color: var(--text-dark); margin-bottom: 20px; font-size: 1.1rem;">📊 Sobre o Sistema</h3>
        <p style="line-height: 1.6; margin-bottom: 15px;">
          <strong>Crédito Boltlock</strong> é uma plataforma de análise unificada de crédito que consolida dados de múltiplas fontes:
        </p>
        <ul style="margin-left: 20px; line-height: 1.8; color: var(--muted);">
          <li>✅ <strong>CPF-Light (Serpro):</strong> Status cadastral e situação fiscal</li>
          <li>✅ <strong>DICT (Bacen):</strong> Chaves Pix registradas</li>
          <li>✅ <strong>Protestos (IEPTB):</strong> Cartório de protestos nacional</li>
          <li>✅ <strong>Sanções Públicas:</strong> CEIS, CNEP, CADIN</li>
          <li>✅ <strong>CADMUT:</strong> Histórico de mutuários (com Infosimples)</li>
          <li>✅ <strong>Histórico Bancário:</strong> Via Open Finance</li>
        </ul>
        <p style="margin-top: 20px; color: var(--muted); font-size: 0.85rem;">
          Cada consulta custa <strong>5 créditos</strong>. Você tem <strong>${creditos} créditos</strong> disponíveis.
        </p>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════════════
  // CONSULTA
  // ═══════════════════════════════════════════════════════════════

  renderConsulta() {
    return `
      <h1 class="page-title">Consulta Unificada</h1>

      <div class="consulta-card">
        <form id="formConsulta">
          <div class="form-group-col">
            <label class="form-label">📋 Informe o CPF para Consulta</label>
            <div class="input-group">
              <input
                type="text"
                class="form-input"
                id="inputCPF"
                placeholder="000.000.000-00"
                maxlength="14"
                required
              >
              <button type="submit" class="btn-primary">CONSULTAR</button>
            </div>
          </div>
        </form>

        <div id="resultadoConsulta"></div>
      </div>
    `;
  }

  async consultar(e) {
    e.preventDefault();

    const cpf = document.getElementById('inputCPF').value;

    if (!cpf || cpf.replace(/\D/g, '').length !== 11) {
      this.mostrarToast('CPF inválido. Use formato: 000.000.000-00', 'error');
      return;
    }

    const container = document.getElementById('resultadoConsulta');
    container.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>Consultando ${cpf}...</p>
      </div>
    `;

    try {
      const response = await fetch(`${API_URL}/consultar/unificada`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ cpf })
      });

      const data = await response.json();

      if (!response.ok) {
        this.mostrarToast(data.erro || 'Erro ao processar consulta', 'error');
        container.innerHTML = '';
        return;
      }

      this.resultado = data;
      container.innerHTML = this.renderResultado(data);
      this.mostrarToast('✅ Consulta realizada com sucesso!', 'success');
    } catch (erro) {
      this.mostrarToast('Erro ao conectar: ' + erro.message, 'error');
      container.innerHTML = '';
    }
  }

  renderResultado(dados) {
    const decisao = dados.decisao;
    let classeDecisao = decisao.risco === 'Baixo' ? 'status-ok' : decisao.risco === 'Alto' ? 'status-warning' : 'status-error';

    return `
      <div class="resultado-grid">
        <div class="resultado-card">
          <div class="resultado-titulo">Status CPF</div>
          <div class="resultado-valor">${dados.situacao_cpf.status}</div>
          <div class="resultado-sub">
            ${dados.situacao_cpf.nome}<br>
            📅 ${new Date(dados.situacao_cpf.data_atualizacao).toLocaleDateString('pt-BR')}
          </div>
        </div>

        <div class="resultado-card">
          <div class="resultado-titulo">Protestos Encontrados</div>
          <div class="resultado-valor">${dados.protestos.total}</div>
          <div class="resultado-sub">
            Valor total: R$ ${dados.protestos.valor_total.toFixed(2)}<br>
            ${dados.protestos.total > 0 ? '⚠️ Há protestos' : '✅ Limpo'}
          </div>
        </div>

        <div class="resultado-card">
          <div class="resultado-titulo">Sanções Públicas</div>
          <div class="resultado-valor">${dados.sancoes.ceis || dados.sancoes.cnep || dados.sancoes.cadin ? '🚨' : '✅'}</div>
          <div class="resultado-sub">
            ${dados.sancoes.ceis ? '❌ CEIS ' : ''}
            ${dados.sancoes.cnep ? '❌ CNEP ' : ''}
            ${dados.sancoes.cadin ? '❌ CADIN ' : ''}
            ${!dados.sancoes.ceis && !dados.sancoes.cnep && !dados.sancoes.cadin ? 'Sem sanções' : ''}
          </div>
        </div>

        <div class="resultado-card">
          <div class="resultado-titulo">Chaves PIX</div>
          <div class="resultado-valor">${dados.pix.chaves_registradas}</div>
          <div class="resultado-sub">
            ${dados.pix.chaves.join(', ') || 'Nenhuma registrada'}
          </div>
        </div>
      </div>

      <div class="decisao-card">
        <div class="decisao-titulo">🎯 Recomendação de Crédito</div>
        <div class="decisao-valor">${decisao.recomendacao}</div>
        <div style="margin-bottom: 15px;">
          <span class="status-badge ${classeDecisao}">
            Risco: ${decisao.risco}
          </span>
        </div>
        <div class="decisao-detalhes">
          <ul>
            ${decisao.detalhes.map(d => `<li>${d}</li>`).join('')}
            ${decisao.detalhes.length === 0 ? '<li>Nenhuma restrição encontrada</li>' : ''}
          </ul>
        </div>
        <p style="margin-top: 15px; font-size: 0.8rem; color: var(--muted);">
          ⚡ Análise realizada em ${new Date(dados.timestamp).toLocaleTimeString('pt-BR')}<br>
          💳 Créditos usados: ${decisao.creditos_usados}
        </p>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════════════
  // HISTÓRICO
  // ═══════════════════════════════════════════════════════════════

  renderHistorico() {
    return `
      <h1 class="page-title">Histórico de Consultas</h1>

      <div class="consulta-card">
        <p style="color: var(--muted); text-align: center; padding: 40px;">
          📭 Nenhuma consulta realizada ainda.<br>
          Comece consultando um CPF na aba <strong>Consultar CPF</strong>
        </p>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILS
  // ═══════════════════════════════════════════════════════════════

  mostrarToast(mensagem, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensagem;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  logout() {
    localStorage.removeItem('boltlock_token');
    localStorage.removeItem('boltlock_usuario');
    this.token = null;
    this.usuario = {};
    this.mostrarLogin();
  }
}

// ═══════════════════════════════════════════════════════════════
// INICIAR APP
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  new BoltlockApp();
});
