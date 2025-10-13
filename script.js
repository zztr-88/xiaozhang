// ======== 全局数据 ========
let stores = JSON.parse(localStorage.getItem('stores')) || [
  {
    id: 1,
    name: "霸王茶姬",
    img: "https://picsum.photos/seed/bawang/300/200",
    rating: 4.8,
    desc: "人气奶茶品牌，月售6000+",
    tags: ["神券", "满减"],
    price: 25,
    distance: "7.5km",
    time: "45分钟",
    menu: [
      { name: "珍珠奶茶", price: 15 },
      { name: "椰果奶茶", price: 16 }
    ]
  },
  {
    id: 2,
    name: "松鼠便利超市",
    img: "https://picsum.photos/seed/squirrel/300/200",
    rating: 4.8,
    desc: "可口可乐、饮料零食应有尽有",
    tags: ["免配送费", "超值"],
    price: 11.9,
    distance: "900m",
    time: "32分钟",
    menu: [
      { name: "可乐", price: 6 },
      { name: "薯片", price: 8 }
    ]
  }
];

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ======== 检查登录状态 & 权限 ========
function checkAuth() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user) {
    const path = window.location.pathname;
    if (!path.includes('login.html') && !path.includes('register.html')) {
      window.location.href = 'login.html';
    }
  } else {
    currentUser = user;
    renderAdminLink();
  }
}

// ======== 渲染管理员链接 ========
function renderAdminLink() {
  const el = document.getElementById('adminLink');
  if (!el) return;
  if (currentUser && currentUser.role === 'admin') {
    el.innerHTML = '<a href="admin.html">商家管理</a>';
  } else {
    el.innerHTML = '';
  }
}

// ======== DOM 加载 ========
document.addEventListener('DOMContentLoaded', function () {
  checkAuth();

  const path = window.location.pathname;

  // 注册
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;

      if (!username || !password) {
        alert('请输入用户名和密码！');
        return;
      }

      if (username !== 'admin') {
        alert('❌ 仅允许用户名为 "admin" 的用户注册！');
        return;
      }

      localStorage.setItem('user', JSON.stringify({ username, password }));
      alert('✅ 管理员账号创建成功！');
      setTimeout(() => window.location.href = 'login.html', 1000);
    });
  }

  // 登录
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;

      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (!savedUser) {
        alert('请先注册 admin 账号！');
        return;
      }

      if (savedUser.username === username && savedUser.password === password) {
        const role = username === 'admin' ? 'admin' : 'user';
        localStorage.setItem('currentUser', JSON.stringify({ username, role }));
        alert(`欢迎回来，${username}！`);
        window.location.href = 'index.html';
      } else {
        alert('用户名或密码错误！');
      }
    });
  }

  // 首页
  if (path.includes('index.html')) {
    renderStores();
  }

  // 商家管理
  if (path.includes('admin.html')) {
    renderStoreList();
  }

  // 菜单页
  if (path.includes('menu.html')) {
    loadMenu();
  }

  // 搜索
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      const keyword = e.target.value.toLowerCase();
      const filtered = stores.filter(s =>
        s.name.toLowerCase().includes(keyword) ||
        s.desc.toLowerCase().includes(keyword)
      );
      renderFilteredStores(filtered);
    });
  }
});

// ======== 首页渲染商家 ========
function renderStores(data = stores) {
  const container = document.getElementById('storesContainer');
  if (!container) return;
  container.innerHTML = '';
  data.forEach(store => {
    const card = document.createElement('div');
    card.className = 'store-card';
    card.innerHTML = `
      <img src="${store.img}" alt="${store.name}" class="store-img">
      <div class="store-info">
        <div class="store-name">${store.name}</div>
        <div class="store-rating">⭐ ${store.rating} 分</div>
        <div class="store-desc">${store.desc}</div>
        <div class="store-tags">
          ${store.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <div class="store-price">起送 ¥${store.price}</div>
        <div class="store-meta">
          <span>${store.time}</span> · <span>${store.distance}</span>
        </div>
        <button class="view-menu-btn" onclick="viewStoreMenu(${store.id})">
          查看菜单
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderFilteredStores(filtered) {
  renderStores(filtered);
}

// ======== 跳转到菜单页 ========
function viewStoreMenu(storeId) {
  const store = stores.find(s => s.id === storeId);
  if (!store) {
    alert("商家未找到");
    return;
  }
  localStorage.setItem('currentStore', JSON.stringify(store));
  window.location.href = 'menu.html';
}

// ======== 加载菜单页 ========
function loadMenu() {
  const currentStore = JSON.parse(localStorage.getItem('currentStore'));
  if (!currentStore) {
    alert("请先选择商家！");
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('storeName').textContent = currentStore.name;
  document.getElementById('storeDesc').textContent = currentStore.desc;
  document.getElementById('minPrice').textContent = `¥${currentStore.price}`;

  const container = document.getElementById('productsContainer');
  container.innerHTML = '';

  (currentStore.menu || []).forEach(product => {
    const div = document.createElement('div');
    div.className = 'product-item';
    div.innerHTML = `
      <div>
        <div class="product-name">${product.name}</div>
        <div class="product-desc">${product.desc || ''}</div>
      </div>
      <div>
        <div class="product-price">¥${product.price}</div>
        <button class="add-to-cart-btn" onclick="addToCart('${product.name}', ${product.price})">
          加入购物车
        </button>
      </div>
    `;
    container.appendChild(div);
  });
}

// ======== 加入购物车 ========
function addToCart(name, price) {
  const item = cart.find(item => item.name === name);
  if (item) {
    item.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`🛒 已添加 ${name} 到购物车`);
  openPaymentModal();
}

// ======== 支付弹窗 ========
function openPaymentModal() {
  const modal = document.querySelector('.payment-modal');
  if (modal) {
    modal.classList.add('active');
    const qrImg = document.createElement('img');
    qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pay_' + Date.now();
    qrImg.alt = "扫码支付";
    const box = document.querySelector('.payment-box');
    const existingImg = box.querySelector('img');
    if (existingImg) box.removeChild(existingImg);
    box.insertBefore(qrImg, box.querySelector('button'));
  }
}

function closePaymentModal() {
  const modal = document.querySelector('.payment-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// ======== 商家管理函数 ========
function renderStoreList() {
  const container = document.getElementById('storeList');
  if (!container) return;
  container.innerHTML = '';

  stores.forEach(store => {
    const div = document.createElement('div');
    div.className = 'store-item';
    div.setAttribute('data-id', store.id);

    const menuItems = (store.menu || []).map((item, idx) => 
      `<li>${item.name} ¥${item.price} 
        <button type="button" onclick="removeMenuItem(${store.id}, ${idx})">删除</button>
      </li>`
    ).join('');

    div.innerHTML = `
      <strong>${store.name}</strong> - ¥${store.price} - ${store.rating}分
      <div class="menu-management">
        <input type="text" placeholder="商品名" class="product-name" />
        <input type="number" placeholder="价格" class="product-price" step="0.01" />
        <button type="button" onclick="addMenuItem(${store.id})">添加商品</button>
        <ul class="menu-list">${menuItems}</ul>
      </div>
    `;
    container.appendChild(div);
  });
}

function showAddForm() {
  document.getElementById('addStoreForm').style.display = 'block';
}

function hideAddForm() {
  document.getElementById('addStoreForm').style.display = 'none';
}

function addStore() {
  const name = document.getElementById('storeName').value.trim();
  const img = document.getElementById('storeImg').value.trim();
  const rating = parseFloat(document.getElementById('rating').value) || 4.5;
  const desc = document.getElementById('desc').value;

  if (!name || !img) {
    alert('请填写商家名称和图片链接');
    return;
  }

  const newStore = {
    id: Date.now(),
    name, img, rating, desc,
    tags: ["新店"], price: 20,
    distance: "1km", time: "15分钟",
    menu: []
  };

  stores.push(newStore);
  localStorage.setItem('stores', JSON.stringify(stores));
  renderStoreList();
  hideAddForm();
  alert('✅ 添加成功！');
}

function addMenuItem(storeId) {
  const store = stores.find(s => s.id === storeId);
  if (!store) return;

  const inputs = document.querySelectorAll(`#storeList .store-item[data-id="${storeId}"] input`);
  const name = inputs[0].value.trim();
  const price = parseFloat(inputs[1].value);

  if (!name || isNaN(price)) {
    alert('请填写正确的商品名和价格');
    return;
  }

  if (!store.menu) store.menu = [];
  store.menu.push({ name, price });

  localStorage.setItem('stores', JSON.stringify(stores));
  renderStoreList();
  alert(`✅ 已添加 ${name} 到 ${store.name} 菜单`);
}

function removeMenuItem(storeId, itemIndex) {
  const store = stores.find(s => s.id === storeId);
  if (!store || !store.menu) return;
  const name = store.menu[itemIndex].name;
  store.menu.splice(itemIndex, 1);
  localStorage.setItem('stores', JSON.stringify(stores));
  renderStoreList();
  alert(`🗑️ 已删除 ${name}`);
}

// ======== 退出登录 ========
function logout() {
  if (confirm('确定要退出吗？')) {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  }
}