const productStore = createStore({
  products: window.__INITIAL_PRODUCTS__ || [],
  filter: 'all', // 'all' | 'available' | 'out'
  searchQuery: '', // dipake buat cari nama produk
  category: 'all', // 'all' | 'Atasan' | 'Bawahan' | 'Sepatu' | 'Aksesoris'
});

// komponen badge & card versi JS, paralel sama versi EJS di views/partials
function renderBadge({ label, color }) {
  const colorMap = {
    green: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700',
    red: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-700',
    gray: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
    blue: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700',
    purple: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700',
  };
  const classes = colorMap[color] || colorMap.gray;
  return `<span class="inline-block px-2 py-1 text-xs font-semibold rounded-full border ${classes}">${label}</span>`;
}

// map kategori -> warna badge, dipake bareng-bareng sama badge stok (pola sama kaya EJS)
const CATEGORY_COLOR_MAP = { Atasan: 'blue', Bawahan: 'purple', Sepatu: 'gray', Aksesoris: 'gray' };

function renderProductCard(product) {
  const isAvailable = product.stock > 0;
  const stockBadge = renderBadge({
    label: isAvailable ? 'Tersedia' : 'Habis',
    color: isAvailable ? 'green' : 'red',
  });

  const categoryLabel = product.category || 'Umum';
  const categoryBadge = renderBadge({
    label: categoryLabel,
    color: CATEGORY_COLOR_MAP[categoryLabel] || 'gray',
  });

  return `
    <div class="product-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow" data-stock="${product.stock}" data-category="${categoryLabel}">
      <div class="flex items-start justify-between mb-2">
        <h3 class="font-semibold text-gray-800 dark:text-gray-100">${product.name}</h3>
        ${stockBadge}
      </div>
      <div class="mb-2">${categoryBadge}</div>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">${product.description || 'Tanpa deskripsi'}</p>
      <div class="flex items-center justify-between mb-3">
        <span class="text-blue-600 dark:text-blue-400 font-bold">Rp${Number(product.price).toLocaleString('id-ID')}</span>
        <span class="text-xs text-gray-400 dark:text-gray-500">Stok: ${product.stock}</span>
      </div>
      <button
        class="add-to-cart-btn w-full ${isAvailable ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'} text-sm font-semibold py-2 rounded-lg transition-colors"
        data-id="${product.id}"
        data-name="${product.name}"
        data-price="${product.price}"
        ${isAvailable ? '' : 'disabled'}
      >
        ${isAvailable ? '+ Tambah ke Keranjang' : 'Stok Habis'}
      </button>
    </div>
  `;
}

function getFilteredProducts(state) {
  let result = state.products;

  // 1. filter stok (tombol Semua/Tersedia/Habis)
  if (state.filter === 'available') result = result.filter((p) => p.stock > 0);
  if (state.filter === 'out') result = result.filter((p) => p.stock === 0);

  // 2. filter kategori (dropdown)
  if (state.category !== 'all') {
    result = result.filter((p) => (p.category || 'Umum') === state.category);
  }

  // 3. search by nama produk (case-insensitive)
  if (state.searchQuery.trim() !== '') {
    const q = state.searchQuery.trim().toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(q));
  }

  return result;
}

function renderProductList(state) {
  const container = document.getElementById('product-list');
  const emptyState = document.getElementById('empty-state');
  const filtered = getFilteredProducts(state);

  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  container.innerHTML = filtered.map(renderProductCard).join('');
}

productStore.subscribe(renderProductList);

// tombol filter
document.getElementById('filter-buttons').addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;

  productStore.setState({ filter: btn.dataset.filter });

  document.querySelectorAll('.filter-btn').forEach((b) => {
    b.classList.remove('bg-blue-600', 'text-white');
    b.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
  });
  btn.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
  btn.classList.add('bg-blue-600', 'text-white');
});

document.getElementById('product-list').addEventListener('click', (e) => {
  const btn = e.target.closest('.add-to-cart-btn');
  if (!btn || btn.disabled) return;

  addToCart({
    id: btn.dataset.id,
    name: btn.dataset.name,
    price: Number(btn.dataset.price),
  });

  // buka keranjang otomatis biar user liat item baru masuk
  cartStore.setState({ isOpen: true });
});

// --- search input: tiap ketikan update searchQuery di state, langsung re-render ---
document.getElementById('search-input').addEventListener('input', (e) => {
  productStore.setState({ searchQuery: e.target.value });
});

// --- dropdown kategori: update state category ---
document.getElementById('category-select').addEventListener('change', (e) => {
  productStore.setState({ category: e.target.value });
});