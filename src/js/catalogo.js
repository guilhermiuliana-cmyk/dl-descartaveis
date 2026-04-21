/* catalogo.js — carrega produtos.json, filtra e renderiza o catálogo */

const WA_NUMBER = '559288166201';

let todosOsProdutos = [];  // { ...produto, categoria }
let todasCategorias = [];
let filtroAtual = '';
let buscaAtual  = '';

/* ── Carregar dados ──────────────────────────────────────── */
fetch('data/produtos.json')
  .then(r => r.json())
  .then(data => {
    todasCategorias = data.categorias;
    todosOsProdutos = data.categorias.flatMap(cat =>
      cat.produtos.map(p => ({ ...p, categoria: cat.nome, slug_categoria: cat.slug }))
    );
    construirSidebar(data.categorias);
    construirSelectMobile(data.categorias);
    lerQueryString();
    renderizar();
  })
  .catch(() => {
    document.getElementById('catalogo-content').innerHTML =
      '<p style="color:var(--cinza-md);text-align:center;padding:60px 0">Erro ao carregar produtos. Execute via servidor local: <code>python -m http.server</code></p>';
  });

/* ── Sidebar ─────────────────────────────────────────────── */
function construirSidebar(categorias) {
  const ul = document.getElementById('sidebar-list');
  categorias.forEach(cat => {
    const li = document.createElement('li');
    const a  = document.createElement('a');
    a.href = '#';
    a.dataset.cat = cat.slug;
    a.textContent = cat.nome;
    a.addEventListener('click', e => { e.preventDefault(); setCategoria(cat.slug, a); });
    li.appendChild(a);
    ul.appendChild(li);
  });

  // "Todos" link
  ul.querySelector('[data-cat=""]').addEventListener('click', e => {
    e.preventDefault();
    setCategoria('', ul.querySelector('[data-cat=""]'));
  });
}

function construirSelectMobile(categorias) {
  const sel = document.getElementById('cat-select');
  categorias.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.slug;
    opt.textContent = cat.nome;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', () => {
    filtroAtual = sel.value;
    atualizarSidebarAtivo();
    renderizar();
    atualizarURL();
  });
}

function setCategoria(slug, linkEl) {
  filtroAtual = slug;
  document.getElementById('cat-select').value = slug;
  atualizarSidebarAtivo(linkEl);
  renderizar();
  atualizarURL();
  // Scroll suave para o topo do conteúdo
  document.querySelector('.catalogo-layout').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function atualizarSidebarAtivo(linkEl) {
  document.querySelectorAll('.sidebar-list a').forEach(a => a.classList.remove('active'));
  if (linkEl) {
    linkEl.classList.add('active');
  } else {
    const match = document.querySelector(`.sidebar-list a[data-cat="${filtroAtual}"]`);
    if (match) match.classList.add('active');
  }
}

/* ── Busca ───────────────────────────────────────────────── */
document.getElementById('busca').addEventListener('input', e => {
  buscaAtual = e.target.value.trim().toLowerCase();
  renderizar();
});

/* ── Query string ────────────────────────────────────────── */
function lerQueryString() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('categoria') || '';
  if (cat) {
    filtroAtual = cat;
    atualizarSidebarAtivo();
    const sel = document.getElementById('cat-select');
    if (sel) sel.value = cat;
  }
}

function atualizarURL() {
  const url = new URL(window.location);
  if (filtroAtual) {
    url.searchParams.set('categoria', filtroAtual);
  } else {
    url.searchParams.delete('categoria');
  }
  history.replaceState(null, '', url);
}

/* ── Renderizar ──────────────────────────────────────────── */
function filtrarProdutos() {
  return todosOsProdutos.filter(p => {
    const passaCat = !filtroAtual || p.slug_categoria === filtroAtual;
    if (!buscaAtual) return passaCat;
    const haystack = `${p.nome} ${p.codigo || ''} ${p.categoria}`.toLowerCase();
    return passaCat && haystack.includes(buscaAtual);
  });
}

function renderizar() {
  const produtos = filtrarProdutos();
  const cont = document.getElementById('catalogo-content');
  const count = document.getElementById('catalogo-count');

  count.textContent = `${produtos.length} produto${produtos.length !== 1 ? 's' : ''} encontrado${produtos.length !== 1 ? 's' : ''}`;

  if (!produtos.length) {
    cont.innerHTML = `
      <div class="no-results">
        <p>🔍</p>
        <p>Nenhum produto encontrado para "<strong>${buscaAtual || filtroAtual}</strong>".</p>
        <p style="margin-top:8px;font-size:.85rem">Tente outro termo ou <a href="contato.html" style="color:var(--preto);font-weight:700">fale conosco pelo WhatsApp</a>.</p>
      </div>`;
    return;
  }

  if (buscaAtual || filtroAtual) {
    // Visão plana: um grid único
    cont.innerHTML = '';
    const grid = criarGrid(produtos);
    cont.appendChild(grid);
  } else {
    // Agrupado por categoria
    const groups = {};
    produtos.forEach(p => {
      if (!groups[p.slug_categoria]) groups[p.slug_categoria] = { nome: p.categoria, produtos: [] };
      groups[p.slug_categoria].produtos.push(p);
    });

    cont.innerHTML = '';
    Object.values(groups).forEach(g => {
      const titulo = document.createElement('h2');
      titulo.className = 'catalogo-section-title';
      titulo.id = `cat-${g.produtos[0].slug_categoria}`;
      titulo.textContent = g.nome;
      cont.appendChild(titulo);
      cont.appendChild(criarGrid(g.produtos));
    });
  }
}

function criarGrid(produtos) {
  const grid = document.createElement('div');
  grid.className = 'produtos-grid';
  produtos.forEach(p => grid.appendChild(criarCard(p)));
  return grid;
}

function criarCard(p) {
  const card = document.createElement('article');
  card.className = 'produto-card';

  const imgSrc = p.imagem || '';
  const imgHTML = imgSrc
    ? `<img src="${imgSrc}" alt="${p.nome}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=produto-img-placeholder>📦</div>'">`
    : `<div class="produto-img-placeholder">📦</div>`;

  const codigoHTML = p.codigo
    ? `<span class="produto-codigo">Cód. ${p.codigo}</span>`
    : '';

  const dimsHTML = p.dimensoes
    ? `<span class="produto-dimensoes">${p.dimensoes}</span>`
    : (p.unidade ? `<span class="produto-dimensoes">${p.unidade}</span>` : '');

  const params = new URLSearchParams({ produto: p.codigo || p.nome, nome: p.nome, cat: p.categoria });

  card.innerHTML = `
    <div class="produto-img-wrap">${imgHTML}</div>
    <div class="produto-info">
      ${codigoHTML}
      <h3 class="produto-nome">${p.nome}</h3>
      ${dimsHTML}
    </div>
    <a href="contato.html?${params}" class="btn-orcamento" aria-label="Pedir orçamento de ${p.nome}">
      Pedir orçamento
    </a>`;
  return card;
}
