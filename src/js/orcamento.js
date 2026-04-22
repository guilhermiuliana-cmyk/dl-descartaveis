/* orcamento.js — formulário inteligente de orçamento */
/* WA_NUMBER é declarado globalmente em main.js (carregado antes deste arquivo) */

let todosProdutos = [];
let listaOrcamento = [];  // [{ nome, codigo, categoria, qty }]
let selectedIndex = -1;

/* ── Carregar produtos para autocomplete ─────────────────── */
fetch('data/produtos.json')
  .then(r => r.json())
  .then(data => {
    todosProdutos = data.categorias.flatMap(cat =>
      cat.produtos.map(p => ({ ...p, categoria: cat.nome }))
    );
    lerQueryString();
  });

/* ── Query string: produto pré-adicionado via catálogo ─────── */
function lerQueryString() {
  const params = new URLSearchParams(window.location.search);
  const codigo = params.get('produto');
  const nome   = params.get('nome');
  const cat    = params.get('cat');

  if (nome) {
    const match = todosProdutos.find(p =>
      p.codigo === codigo || p.nome.toLowerCase() === nome.toLowerCase()
    ) || { nome, codigo, categoria: cat || '' };
    adicionarItem(match, 1);
  }
}

/* ── Autocomplete ─────────────────────────────────────────── */
const inputProduto = document.getElementById('input-produto');
const autoList     = document.getElementById('autocomplete-list');

inputProduto.addEventListener('input', () => {
  const q = inputProduto.value.trim().toLowerCase();
  selectedIndex = -1;
  if (!q || q.length < 2) { fecharAuto(); return; }

  const matches = todosProdutos.filter(p =>
    p.nome.toLowerCase().includes(q) || (p.codigo && String(p.codigo).toLowerCase().includes(q))
  ).slice(0, 8);

  if (!matches.length) { fecharAuto(); return; }

  autoList.hidden = false;
  autoList.innerHTML = '';
  matches.forEach((p, i) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.dataset.idx = i;
    li.innerHTML = `<strong>${p.nome}</strong><small>${p.categoria}${p.codigo ? ' — Cód. ' + p.codigo : ''}</small>`;
    li.addEventListener('mousedown', e => {
      e.preventDefault();
      selecionarSugestao(p);
    });
    autoList.appendChild(li);
  });

  autoList._matches = matches;
});

inputProduto.addEventListener('keydown', e => {
  const items = autoList.querySelectorAll('li');
  if (!items.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
    atualizarSelecao(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex = Math.max(selectedIndex - 1, -1);
    atualizarSelecao(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (selectedIndex >= 0 && autoList._matches) {
      selecionarSugestao(autoList._matches[selectedIndex]);
    } else {
      tentarAdicionar();
    }
  } else if (e.key === 'Escape') {
    fecharAuto();
  }
});

inputProduto.addEventListener('blur', () => setTimeout(fecharAuto, 150));

function atualizarSelecao(items) {
  items.forEach((li, i) => li.classList.toggle('selected', i === selectedIndex));
}

function selecionarSugestao(produto) {
  inputProduto.value = produto.nome;
  inputProduto.dataset.selectedProduto = JSON.stringify(produto);
  fecharAuto();
  document.getElementById('input-qty').focus();
}

function fecharAuto() {
  autoList.hidden = true;
  autoList.innerHTML = '';
  selectedIndex = -1;
}

/* ── Adicionar item ──────────────────────────────────────── */
document.getElementById('btn-add').addEventListener('click', tentarAdicionar);

document.getElementById('input-qty').addEventListener('keydown', e => {
  if (e.key === 'Enter') tentarAdicionar();
});

function tentarAdicionar() {
  const qty = parseInt(document.getElementById('input-qty').value, 10) || 1;
  const dataStr = inputProduto.dataset.selectedProduto;

  if (dataStr) {
    const produto = JSON.parse(dataStr);
    adicionarItem(produto, qty);
  } else {
    const texto = inputProduto.value.trim();
    if (!texto) { inputProduto.focus(); return; }
    adicionarItem({ nome: texto, codigo: null, categoria: '' }, qty);
  }
}

function adicionarItem(produto, qty) {
  listaOrcamento.push({ ...produto, qty });
  inputProduto.value = '';
  delete inputProduto.dataset.selectedProduto;
  document.getElementById('input-qty').value = 1;
  renderLista();
  atualizarBotao();
  inputProduto.focus();
}

/* ── Remover item ─────────────────────────────────────────── */
function removerItem(idx) {
  listaOrcamento.splice(idx, 1);
  renderLista();
  atualizarBotao();
}

/* ── Renderizar lista ─────────────────────────────────────── */
function renderLista() {
  const cont  = document.getElementById('lista-itens');
  const count = document.getElementById('lista-count');
  count.textContent = `${listaOrcamento.length} item(s)`;

  if (!listaOrcamento.length) {
    cont.innerHTML = '<p style="font-size:.83rem;color:var(--cinza-md);padding:8px 0">Nenhum produto adicionado ainda.</p>';
    return;
  }

  cont.innerHTML = '';
  listaOrcamento.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'produto-item-row';
    const codStr = item.codigo ? ` (Cód. ${item.codigo})` : '';
    row.innerHTML = `
      <span class="produto-item-nome">${item.nome}${codStr}</span>
      <span class="produto-item-qty">${item.qty}x</span>
      <button class="produto-item-del" aria-label="Remover ${item.nome}" data-idx="${i}">×</button>`;
    cont.appendChild(row);
  });

  cont.querySelectorAll('.produto-item-del').forEach(btn => {
    btn.addEventListener('click', () => removerItem(parseInt(btn.dataset.idx, 10)));
  });
}

/* ── Validação e botão ────────────────────────────────────── */
function atualizarBotao() {
  const nome     = document.getElementById('nome').value.trim();
  const empresa  = document.getElementById('empresa').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const temItens = listaOrcamento.length > 0;
  const ok = nome && empresa && telefone && temItens;

  const btn  = document.getElementById('btn-enviar');
  const hint = document.getElementById('btn-hint');
  btn.disabled = !ok;
  btn.style.opacity = ok ? '1' : '0.5';
  hint.style.display = ok ? 'none' : 'block';
}

['nome', 'empresa', 'telefone'].forEach(id => {
  document.getElementById(id).addEventListener('input', atualizarBotao);
});

/* ── Montar mensagem e abrir WhatsApp ────────────────────── */
document.getElementById('btn-enviar').addEventListener('click', () => {
  const nome    = document.getElementById('nome').value.trim();
  const empresa = document.getElementById('empresa').value.trim();
  const tel     = document.getElementById('telefone').value.trim();
  const obs     = document.getElementById('obs').value.trim();

  const itens = listaOrcamento.map(p => {
    const cod = p.codigo ? ` (Cód. ${p.codigo})` : '';
    return `• ${p.qty}x ${p.nome}${cod}`;
  }).join('\n');

  let msg = `Olá! Gostaria de um orçamento:\n\n${itens}\n\nNome: ${nome}\nEmpresa: ${empresa}\nTelefone: ${tel}`;
  if (obs) msg += `\nObs: ${obs}`;

  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
});

/* ── Init ─────────────────────────────────────────────────── */
renderLista();
atualizarBotao();
