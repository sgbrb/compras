// ========== DADOS ==========
let lists = [];
let currentListId = null;
let currentFilter = 'all';

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderLists();
  updateStatsBar();
  renderStats();

  // Enter para adicionar item
  document.getElementById('itemName').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addItem();
  });
  document.getElementById('itemPrice').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addItem();
  });

    // Enter para criar lista
  document.getElementById('newListName').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') createList();
  });

  // Enter para salvar nome da lista
  document.getElementById('editListName').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveListName();
  });
});


// ========== LOCALSTORAGE ==========
function loadData() {
  const saved = localStorage.getItem('listaCompras_v1');
  if (saved) {
    lists = JSON.parse(saved);
  } else {
    // Dados de exemplo
    lists = [
      {
        id: generateId(),
        name: '🥬 Compras do Mês',
        createdAt: new Date().toISOString(),
        items: [
          { id: generateId(), name: 'Leite Integral', price: 8.50, done: true, date: new Date().toISOString() },
          { id: generateId(), name: 'Pão Francês', price: 6.00, done: true, date: new Date().toISOString() },
          { id: generateId(), name: 'Arroz Branco 5kg', price: 22.90, done: false, date: new Date().toISOString() },
          { id: generateId(), name: 'Feijão Carioca 1kg', price: 9.80, done: false, date: new Date().toISOString() },
          { id: generateId(), name: 'Azeite de Oliva', price: 28.00, done: false, date: new Date().toISOString() },
          { id: generateId(), name: 'Café em Pó', price: 18.90, done: true, date: new Date().toISOString() },
          { id: generateId(), name: 'Ovos 30un', price: 16.00, done: true, date: new Date().toISOString() },
          { id: generateId(), name: 'Banana Prata', price: 7.20, done: true, date: new Date().toISOString() }
        ]
      },
      {
        id: generateId(),
        name: '🎉 Churrasco do Fim de Semana',
        createdAt: new Date().toISOString(),
        items: [
          { id: generateId(), name: 'Carne para Churrasco', price: 89.90, done: false, date: new Date().toISOString() },
          { id: generateId(), name: 'Linguiça', price: 32.50, done: false, date: new Date().toISOString() },
          { id: generateId(), name: 'Coração de Frango', price: 24.00, done: true, date: new Date().toISOString() },
          { id: generateId(), name: 'Cerveja', price: 45.00, done: false, date: new Date().toISOString() },
          { id: generateId(), name: 'Refrigerante', price: 12.00, done: false, date: new Date().toISOString() },
          { id: generateId(), name: 'Pão de Alho', price: 18.00, done: false, date: new Date().toISOString() }
        ]
      },
      {
        id: generateId(),
        name: '💊 Farmácia',
        createdAt: new Date().toISOString(),
        items: [
          { id: generateId(), name: 'Dipirona', price: 12.50, done: false, date: new Date().toISOString() },
          { id: generateId(), name: 'Vitamina C', price: 25.00, done: false, date: new Date().toISOString() },
          { id: generateId(), name: 'Protetor Solar', price: 45.90, done: false, date: new Date().toISOString() }
        ]
      }
    ];
    saveData();
  }
}

function saveData() {
  localStorage.setItem('listaCompras_v1', JSON.stringify(lists));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ========== NAVEGAÇÃO ==========
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');

  // Atualizar bottom nav
  const navMap = { 'screen-lists': 0, 'screen-detail': -1, 'screen-stats': 1 };
  const navIndex = navMap[screenId];
  if (navIndex !== undefined && navIndex >= 0) {
    document.querySelectorAll('.nav-item').forEach((n, i) => {
      n.classList.toggle('active', i === navIndex);
    });
  }

  // Mostrar/esconder bottom nav
  const hideNav = screenId === 'screen-detail';
  document.getElementById('bottomNav').style.display = hideNav ? 'none' : 'flex';

  // Atualizar stats se for a tela de gastos
  if (screenId === 'screen-stats') {
    renderStats();
  }

  // Atualizar barra de stats
  if (screenId === 'screen-lists') {
    updateStatsBar();
  }
}

// ========== LISTAS ==========
function renderLists() {
  const container = document.getElementById('listsContainer');
  const empty = document.getElementById('emptyLists');

  if (lists.length === 0) {
    container.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  container.innerHTML = lists.map(list => {
    const totalItems = list.items.length;
    const doneItems = list.items.filter(i => i.done).length;
    const totalPrice = list.items.reduce((sum, i) => sum + (i.price || 0), 0);
    const donePrice = list.items.filter(i => i.done).reduce((sum, i) => sum + (i.price || 0), 0);
    const percent = totalItems > 0 ? (doneItems / totalItems) * 100 : 0;

    return `
      <div class="list-card" onclick="openList('${list.id}')">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div style="flex:1;">
           <h3 onclick="event.stopPropagation(); editListName('${list.id}')" style="cursor:pointer;">${escapeHtml(list.name)} ✏️</h3>
            <div class="list-meta">${totalItems} itens • R$ ${formatPrice(totalPrice)}</div>
          </div>
          <span style="font-size:18px; color:var(--text-muted);">→</span>
        </div>
        <div class="list-progress-bar">
          <div class="list-progress-fill" style="width:${percent}%"></div>
        </div>
       <div class="list-progress-text">${totalItems} itens • R$ ${formatPrice(totalPrice)} total</div>
      </div>
    `;
  }).join('');
}

function createList() {
  const nameInput = document.getElementById('newListName');
  const name = nameInput.value.trim();

  if (!name) {
    showToast('Digite um nome para a lista');
    return;
  }

  const newList = {
    id: generateId(),
    name: name,
    createdAt: new Date().toISOString(),
    items: []
  };

  lists.unshift(newList);
  saveData();
  renderLists();
  updateStatsBar();

  nameInput.value = '';
  closeModal('modalNewList');
  showToast('Lista criada!');
}

function openList(listId) {
  currentListId = listId;
  currentFilter = 'all';

  // Resetar tabs
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab')[0].classList.add('active');

  renderItems();
  showScreen('screen-detail');
}

function deleteCurrentList() {
  if (!confirm('Tem certeza que deseja excluir esta lista?')) return;

  lists = lists.filter(l => l.id !== currentListId);
  saveData();
  renderLists();
  updateStatsBar();
  showScreen('screen-lists');
  showToast('Lista excluída');
}

function editListName(listId) {
  const list = lists.find(l => l.id === listId);
  if (!list) return;
  currentListId = listId;
  document.getElementById('editListName').value = list.name;
  openModal('modalEditList');
}

function openEditListModal() {
  const list = lists.find(l => l.id === currentListId);
  if (!list) return;
  document.getElementById('editListName').value = list.name;
  openModal('modalEditList');
}

function saveListName() {
  const nameInput = document.getElementById('editListName');
  const name = nameInput.value.trim();

  if (!name) {
    showToast('Digite um nome para a lista');
    return;
  }

  const list = lists.find(l => l.id === currentListId);
  if (list) {
    list.name = name;
    saveData();
    renderLists();
    renderItems();
    showToast('Nome atualizado!');
    closeModal('modalEditList');
  }
}

// ========== ITENS ==========
function renderItems() {
  const list = lists.find(l => l.id === currentListId);
  if (!list) return;

  document.getElementById('detailTitle').textContent = list.name;

  const totalItems = list.items.length;
  const totalPrice = list.items.reduce((sum, i) => sum + (i.price || 0), 0);
  document.getElementById('detailMeta').textContent = `${totalItems} itens • R$ ${formatPrice(totalPrice)}`;

  const container = document.getElementById('itemsContainer');
  const empty = document.getElementById('emptyItems');

    let items = list.items;
  if (currentFilter === 'pending') items = items.filter(i => !i.done);

  // Ordenar: pendentes primeiro, depois por data (mais recente)
  items = items.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return new Date(b.date) - new Date(a.date);
  });

  if (items.length === 0) {
    container.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  container.innerHTML = items.map(item => `
    <div class="item-row ${item.done ? 'done' : ''}">
      <div class="checkbox ${item.done ? 'checked' : ''}" onclick="toggleItem('${item.id}')">
        ${item.done ? '✓' : ''}
      </div>
      <div class="item-info">
        <div class="item-name ${item.done ? 'checked' : ''}">${escapeHtml(item.name)}</div>
        <div class="item-date">${formatDate(item.date)}</div>
      </div>
      <div class="item-price ${item.done ? 'checked' : ''}">R$ ${formatPrice(item.price)}</div>
    </div>
  `).join('');
}

function addItem() {
  const nameInput = document.getElementById('itemName');
  const priceInput = document.getElementById('itemPrice');

  const name = nameInput.value.trim();
  const price = parseFloat(priceInput.value) || 0;

  if (!name) {
    sshowToast('Digite a descrição do gasto')
    return;
  }

  const list = lists.find(l => l.id === currentListId);
  if (!list) return;

  list.items.push({
    id: generateId(),
    name: name,
    price: price,
    done: false,
    date: new Date().toISOString()
  });

  saveData();
  renderItems();
  updateStatsBar();

  nameInput.value = '';
  priceInput.value = '';
  nameInput.focus();

  showToast(price > 0 ? `+ R$ ${formatPrice(price)}` : 'Gasto adicionado');
}

function toggleItem(itemId) {
  const list = lists.find(l => l.id === currentListId);
  if (!list) return;

  const item = list.items.find(i => i.id === itemId);
  if (item) {
    item.done = !item.done;
    item.date = new Date().toISOString();
    saveData();
    renderItems();
    updateStatsBar();

    if (item.done) {
      showToast(`✓ ${item.name}`);
    }
  }
}

function filterItems(filter) {
  currentFilter = filter;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  renderItems();
}

// ========== ESTATÍSTICAS ==========
function updateStatsBar() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  let gastoHoje = 0;
  let gastoMes = 0;

  lists.forEach(list => {
    list.items.forEach(item => {
            if (item.price) {
        const itemDate = new Date(item.date);
        if (itemDate >= hoje) gastoHoje += item.price;
        if (itemDate >= inicioMes) gastoMes += item.price;
      }
    });
  });

  document.getElementById('totalGastoHoje').textContent = `R$ ${formatPrice(gastoHoje)}`;
  document.getElementById('totalGastoMes').textContent = `R$ ${formatPrice(gastoMes)}`;
  document.getElementById('totalListas').textContent = lists.length;
}

function renderStats() {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const inicioMesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
  const fimMesPassado = new Date(hoje.getFullYear(), hoje.getMonth(), 0);

  let totalMes = 0;
  let totalItens = 0;
  const categorias = {};
  const historico = [];

  lists.forEach(list => {
    list.items.forEach(item => {
        if (item.price) {
        const itemDate = new Date(item.date);

        if (itemDate >= inicioMes) {
          totalMes += item.price;
          totalItens++;

          // Categorias simples (baseado na lista)
          const cat = list.name;
          categorias[cat] = (categorias[cat] || 0) + item.price;

          // Histórico
          historico.push({
            name: item.name,
            price: item.price,
            date: itemDate,
            list: list.name
          });
        }
      }
    });
  });

  // Stats cards
  document.getElementById('statTotalMes').textContent = `R$ ${formatPrice(totalMes)}`;
  document.getElementById('statTotalItens').textContent = totalItens;

  const diasNoMes = hoje.getDate();
  document.getElementById('statMediaDia').textContent = `R$ ${formatPrice(totalMes / (diasNoMes || 1))}`;

  // Categoria top
  let topCat = '—';
  let topVal = 0;
  for (const [cat, val] of Object.entries(categorias)) {
    if (val > topVal) {
      topVal = val;
      topCat = cat;
    }
  }
  document.getElementById('statCategoriaTop').textContent = topCat.length > 12 ? topCat.substring(0, 12) + '...' : topCat;

  // Categorias
  const catContainer = document.getElementById('categoriasContainer');
  const catEntries = Object.entries(categorias).sort((a, b) => b[1] - a[1]);
  const maxCat = catEntries[0]?.[1] || 1;

  if (catEntries.length === 0) {
    catContainer.innerHTML = '<div class="empty-state" style="padding:30px;"><div class="empty-text">Nenhum gasto registrado este mês</div></div>';
  } else {
    catContainer.innerHTML = catEntries.map(([cat, val]) => `
      <div class="categoria-row">
        <div class="categoria-info">
          <span class="categoria-name">${escapeHtml(cat)}</span>
          <span class="categoria-value">R$ ${formatPrice(val)}</span>
        </div>
        <div class="categoria-bar">
          <div class="categoria-fill" style="width:${(val / maxCat) * 100}%"></div>
        </div>
      </div>
    `).join('');
  }

  // Histórico
  const histContainer = document.getElementById('historicoContainer');
  const recentHistory = historico
    .sort((a, b) => b.date - a.date)
    .slice(0, 10);

  if (recentHistory.length === 0) {
    histContainer.innerHTML = '<div class="empty-state" style="padding:20px;"><div class="empty-text">Nenhuma compra ainda</div></div>';
  } else {
    histContainer.innerHTML = recentHistory.map(h => `
      <div class="historico-row">
        <div>
          <div class="historico-name">${escapeHtml(h.name)}</div>
          <div class="historico-meta">${escapeHtml(h.list)} • ${formatDate(h.date.toISOString())}</div>
        </div>
        <div class="historico-price">R$ ${formatPrice(h.price)}</div>
      </div>
    `).join('');
  }
}

// ========== COMPARTILHAMENTO ==========
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');

  if (modalId === 'modalShare') {
    const list = lists.find(l => l.id === currentListId);
    if (list) {
      const shareData = {
        name: list.name,
        items: list.items.map(i => ({ name: i.name, price: i.price, done: i.done }))
      };
      document.getElementById('shareCode').value = btoa(JSON.stringify(shareData));
    }
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

function copyShareCode() {
  const textarea = document.getElementById('shareCode');
  textarea.select();
  document.execCommand('copy');
  showToast('Código copiado!');
}

function importList() {
  const code = document.getElementById('importCode').value.trim();
  if (!code) {
    showToast('Cole um código válido');
    return;
  }

  try {
    const data = JSON.parse(atob(code));
    const newList = {
      id: generateId(),
      name: data.name + ' (importada)',
      createdAt: new Date().toISOString(),
      items: (data.items || []).map(i => ({
        id: generateId(),
        name: i.name,
        price: i.price || 0,
        done: false,
        date: new Date().toISOString()
      }))
    };

    lists.unshift(newList);
    saveData();
    renderLists();
    updateStatsBar();

    document.getElementById('importCode').value = '';
    closeModal('modalShare');
    showToast('Lista importada!');
  } catch (e) {
    showToast('Código inválido');
  }
}

// ========== UTILITÁRIOS ==========
function formatPrice(value) {
  return (value || 0).toFixed(2).replace('.', ',');
}

function formatDate(isoString) {
  const date = new Date(isoString);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);

  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');

  if (date.toDateString() === hoje.toDateString()) return 'Hoje';
  if (date.toDateString() === ontem.toDateString()) return 'Ontem';
  return `${d}/${m}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// Fechar modal ao clicar fora
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
});
