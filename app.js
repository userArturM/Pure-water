

const waters = [
  ['butyl-tara','Бутыль тара','Тара для воды','assets/tara.webp',320,320,19],
  ['cristal','Кристальная','Вода питьевая «Кристальная»','assets/water/kristalnaya.webp',210,155,19],
  ['kubai','Кубай','Вода питьевая «Кубай»','assets/water/kubai.webp',395,345,19],
  ['dombay','Домбай','Вода питьевая «Домбай»','assets/water/dombay.webp',350,300,19],
  ['chernogolovka','Черноголовка','Вода питьевая «Черноголовка»','assets/water/chernogolovka.webp',320,270,19],
  ['arkhyz','Архыз','Вода питьевая «Архыз»','assets/water/arkhyz.webp',385,335,19],
  ['piligrim','Пилигрим','Вода питьевая «Пилигрим»','assets/water/piligrim.webp',450,400,19],
  ['mountain','Горная вершина','Вода питьевая «Горная вершина»','assets/water/gornaya-vershina.webp',365,315,19],
  ['dysheps','Дышэпс','Вода питьевая «Дышэпс»','assets/water/dysheps.webp',270,220,19],
  ['belaya','Белая рука','Вода питьевая «Белая рука»','assets/water/belaya-ruka.webp',210,155,19],
  ['prirodny','Природный источник','Вода питьевая «Природный источник»','assets/water/prirodny-istochnik.webp',177,127,10],
  ['pompa','Помпа механическая','Классическая механическая ручная помпа','assets/water/pompa.webp',420,420,0],
  ['pompakran','Помпа с краном','Механическая помпа с краном','assets/water/pompakran.webp',465,465,0]
];

let mode = 'delivery';
let cat = 'all';
const isWater = w => !/^(pompa|butyl)/.test(w[0]);
const inCat = w => cat === 'all' || (cat === 'water') === isWater(w);
const qty = Object.create(null);
const LS = 'cw_order_v3';
try { localStorage.removeItem('cw_order_v2'); } catch(e) {}
let saved = {};
try { saved = JSON.parse(localStorage.getItem(LS) || '{}'); } catch(e) {}
if (saved.qty) Object.assign(qty, saved.qty);
if (saved.mode === 'store' || saved.mode === 'delivery') mode = saved.mode;

const grid = document.getElementById('grid');
const cartPanel = document.getElementById('cartPanel');
const cartBackdrop = document.getElementById('cartBackdrop');
const cartFab = document.getElementById('cartFab');
const fabCount = document.getElementById('fabCount');
const cartClear = document.getElementById('cartClear');
const storeAddress = document.getElementById('storeAddress');
const cartFabMobile = document.getElementById('cartFabMobile');
const fabCountMobile = document.getElementById('fabCountMobile');
const orderSuccess = document.getElementById('orderSuccess');
const successClose = document.getElementById('successClose');
const cartTotal = document.getElementById('cartTotal');
const cartProducts = document.getElementById('cartProducts');
const cartStepProducts = document.getElementById('cartStepProducts');
const cartStepDetails = document.getElementById('cartStepDetails');
const cartTitle = document.getElementById('cartTitle');
const cartNext = document.getElementById('cartNext');
const cartBack = document.getElementById('cartBack');
const detailsTotal = document.getElementById('detailsTotal');
const orderName = document.getElementById('orderName');
const orderAddress = document.getElementById('orderAddress');
const orderDate = document.getElementById('orderDate');
const orderPayment = document.getElementById('orderPayment');
const orderPhone = document.getElementById('orderPhone');
const orderComment = document.getElementById('orderComment');
const personalConsent = document.getElementById('personalConsent');
const offerConsent = document.getElementById('offerConsent');
const successText = document.getElementById('successText');
const waOrder = document.getElementById('waOrder');
const tgOrder = document.getElementById('tgOrder');
const maxOrder = document.getElementById('maxOrder');

function money(n) { return n.toLocaleString('ru-RU') + ' ₽'; }

function makeOrderNumber() {
  const d = new Date();
  const date = d.getFullYear().toString() + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0');
  const rnd = Math.floor(1000 + Math.random()*9000);
  return `CW-${date}-${rnd}`;
}

function saveState() {
  try {
    localStorage.setItem(LS, JSON.stringify({ qty, mode }));
  } catch(e) {}
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 4000);
}

function control(i) {
  // В режиме «Самовывоз» кнопки добавления/изменения количества
  // у товаров каталога не показываем.
  if (mode === 'store') return '';
  const q = qty[i] || 0;
  return q
    ? `<span class="qty-step"><button type="button" data-cart="minus" data-i="${i}" aria-label="Уменьшить">−</button><b>${q}</b><button type="button" data-cart="plus" data-i="${i}" aria-label="Увеличить">+</button></span>`
    : `<button type="button" class="add" data-cart="plus" data-i="${i}">Добавить</button>`;
}

function render() {
  if (!grid) return;
  grid.innerHTML = waters.map((w, i) => {
    if (!inCat(w)) return '';
    return `
    <article class="card reveal" style="transition-delay:${(i % 4) * 0.06}s">
      <div class="photo">
        <img loading="lazy" src="${w[3]}" alt="${w[1]}${isWater(w) ? ', ' + w[6] + ' л' : ''}"
          onerror="this.onerror=null;this.src='assets/logo.png'">
      </div>
      <div class="card-body">
        <div class="card-top">
          <h3>${w[1]}</h3>
          ${i === 1 ? `<span class="badge badge-hit">Хит</span>` :
            i === 0 ? `<span class="badge badge-deal">Выгодная цена</span>` :
            (isWater(w) && w[6] ? `<span class="badge">${w[6]} л</span>` : '')}
        </div>
        <div class="desc">${w[2]}</div>
        <div class="buy">
          <div class="price-wrap">
            <strong class="price">${money(mode === 'delivery' ? w[4] : w[5])}</strong>
            <span class="price-caption">${mode === 'delivery' ? 'цена с доставкой' : 'цена в магазине'}</span>
          </div>
          <span id="cart-control-${i}">${control(i)}</span>
        </div>
      </div>
    </article>`;
  }).join('');
  observe(grid.querySelectorAll('.reveal'));
}

function flyToCart(btn) {
  const rect = btn.getBoundingClientRect();
  const targetFab = cartFab;
  if (!targetFab) return;
  const fab = targetFab.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'fly-item';
  el.style.left = rect.left + rect.width / 2 - 24 + 'px';
  el.style.top = rect.top + rect.height / 2 - 24 + 'px';
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.transform = `translate(${fab.left - rect.left}px, ${fab.top - rect.top}px) scale(0.3)`;
    el.style.opacity = '0';
  });
  setTimeout(() => el.remove(), 750);
}

function updateCart() {
  let total = 0;
  let productHtml = [];
  waters.forEach((w, i) => {
    const q = qty[i] || 0;
    if (q) {
      const price = mode === 'delivery' ? w[4] : w[5];
      total += q * price;
      productHtml.push(`
        <div class="cart-product">
          <div class="cart-product-left">
            <img class="cart-product-thumb" src="${w[3]}" alt="" onerror="this.style.display='none'">
            <div class="cart-product-main">
              <b>${w[1]}</b>
              <span>${money(price)} / шт.</span>
              <span class="cart-qty">
                <button type="button" data-cart="minus" data-i="${i}" aria-label="Уменьшить">−</button>
                <b>${q}</b>
                <button type="button" data-cart="plus" data-i="${i}" aria-label="Увеличить">+</button>
              </span>
            </div>
          </div>
          <div class="cart-product-right">
            <strong>${money(q * price)}</strong>
            <button type="button" class="cart-remove" data-cart="remove" data-i="${i}" aria-label="Удалить ${w[1]}">×</button>
          </div>
        </div>`);
    }
    const el = document.getElementById(`cart-control-${i}`);
    if (el) el.innerHTML = control(i);
  });

  const itemCount = Object.values(qty).reduce((s, v) => s + (Number(v) || 0), 0);
  if (cartFab) cartFab.classList.toggle('has-items', total > 0);
  const countText = itemCount > 99 ? '99+' : String(itemCount);
  if (fabCount) fabCount.textContent = countText;
  if (fabCountMobile) fabCountMobile.textContent = countText;
  if (cartTotal) cartTotal.textContent = money(total);
  if (cartClear) cartClear.classList.toggle('show', total > 0);
  if (storeAddress) storeAddress.classList.toggle('show', mode === 'store');
  document.querySelectorAll('.price-caption').forEach(p => {
    p.textContent = mode === 'delivery' ? 'цена с доставкой' : 'цена в магазине';
  });
  if (detailsTotal) detailsTotal.textContent = money(total);
  if (cartProducts) cartProducts.innerHTML = productHtml.length ? productHtml.join('') : '<div class="cart-empty">Товары не выбраны</div>';
  if (cartNext) cartNext.disabled = total <= 0;
  saveState();
  if (total <= 0) closeCart();

  const receive = mode === 'delivery' ? 'доставка' : 'самовывоз';
  const lines = [`Здравствуйте! Хочу заказать (${receive}):`];
  let n = 0;
  waters.forEach((w, i) => {
    const q = qty[i] || 0;
    if (q) {
      n++;
      const price = mode === 'delivery' ? w[4] : w[5];
      lines.push(`${n}. ${w[1]} — ${q} × ${price} ₽ = ${q * price} ₽`);
    }
  });
  lines.push(`Итого: ${money(total)}`);
  if (orderAddress.value.trim()) lines.push(`Адрес: ${orderAddress.value.trim()}`);
  if (orderDate.value) {
    const [y, m, d] = orderDate.value.split('-');
    lines.push(`Дата: ${d}.${m}.${y}`);
  }
  if (orderPhone.value.trim()) lines.push(`Телефон: ${orderPhone.value.trim()}`);
  if (orderPayment.value) lines.push(`Оплата: ${orderPayment.value}`);
  if (orderName.value.trim()) lines.push(`Имя: ${orderName.value.trim()}`);
  if (orderComment.value.trim()) lines.push(`Комментарий: ${orderComment.value.trim()}`);
  const orderNumber = window.__orderNumber || makeOrderNumber();
  window.__orderNumber = orderNumber;
  lines.unshift(`Заказ №${orderNumber}`);

  window.__orderText = lines.join('\n');
  const needsAddress = receive === 'доставка';
  if (orderAddress) orderAddress.required = needsAddress;
  if (orderAddress) orderAddress.placeholder = needsAddress ? 'Адрес доставки *' : 'Адрес / примечание';
  if (orderDate) orderDate.required = needsAddress;
  if (orderPhone) orderPhone.required = needsAddress;
  if (orderDate) orderDate.disabled = !needsAddress;

  const phone = '79282235333';
  waOrder.href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(window.__orderText);
  tgOrder.href = 'https://t.me/+' + phone;
  maxOrder.href = 'https://max.ru/:share?text=' + encodeURIComponent(window.__orderText);
}

function openCart() {
  if (!cartPanel || !cartFab || !cartFab.classList.contains('has-items')) return;
  cartStepProducts.hidden = false;
  cartStepDetails.hidden = true;
  cartTitle.textContent = 'Ваша корзина';
  cartPanel.classList.add('open');
  cartBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  if (!cartPanel) return;
  cartPanel.classList.remove('open');
  cartBackdrop.classList.remove('open');
  document.body.style.overflow = '';
  cartStepDetails.hidden = true;
  cartStepProducts.hidden = false;
  cartTitle.textContent = 'Ваша корзина';
}

if (cartFab) cartFab.addEventListener('click', openCart);
document.getElementById('cartClose')?.addEventListener('click', closeCart);
cartBackdrop?.addEventListener('click', closeCart);

cartNext?.addEventListener('click', () => {
  cartStepProducts.hidden = true;
  cartStepDetails.hidden = false;
  cartTitle.textContent = 'Данные заказа';
  setTimeout(() => orderName.focus(), 150);
});
cartBack?.addEventListener('click', () => {
  cartStepDetails.hidden = true;
  cartStepProducts.hidden = false;
  cartTitle.textContent = 'Ваша корзина';
});

document.addEventListener('click', e => {
  const b = e.target.closest('[data-cart]');
  if (!b) return;
  const i = Number(b.dataset.i);
  const action = b.dataset.cart;
  if (action === 'remove') {
    qty[i] = 0;
    updateCart();
    return;
  }
  const wasZero = !(qty[i] || 0);
  qty[i] = Math.max(0, (qty[i] || 0) + (action === 'plus' ? 1 : -1));
  if (action === 'plus' && wasZero) flyToCart(b);
  updateCart();
});

document.querySelectorAll('#modeSwitch button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#modeSwitch button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;
    render();
    updateCart();
    document.querySelectorAll('.price,.price-caption').forEach(p => {
      p.classList.remove('pulse','pulse-caption');
      void p.offsetWidth;
      p.classList.add(p.classList.contains('price-caption') ? 'pulse-caption' : 'pulse');
    });
  });
});

document.querySelectorAll('#catSwitch button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#catSwitch button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    cat = btn.dataset.cat;
    render();
    updateCart();
  });
});

let io = null;
try {
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  }
} catch (err) { io = null; }

function observe(els) {
  els.forEach(el => {
    if (io) io.observe(el);
    else el.classList.add('visible');
  });
}

observe(document.querySelectorAll('.reveal'));

const today = new Date();
if (orderDate) orderDate.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
orderDate?.addEventListener('click', () => {
  if (!orderDate.disabled && typeof orderDate.showPicker === 'function') {
    try { orderDate.showPicker(); } catch (e) {}
  }
});

if (personalConsent) personalConsent.checked = false;
if (offerConsent) offerConsent.checked = false;

document.querySelectorAll('#modeSwitch button').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

[orderName, orderAddress, orderDate, orderPayment, orderPhone, orderComment, personalConsent, offerConsent].filter(Boolean).forEach(el => {
  el.addEventListener('input', () => { el.style.borderColor = ''; updateCart(); });

  el.addEventListener('change', updateCart);
});

[waOrder, tgOrder, maxOrder].forEach(link => {
  link.addEventListener('click', e => {
    const bad = (el, msg) => { e.preventDefault(); el.style.borderColor = '#d33'; el.focus(); toast(msg); };
    if (!personalConsent?.checked) { e.preventDefault(); toast('Подтвердите согласие на обработку персональных данных'); personalConsent?.focus(); return; }
    if (!offerConsent?.checked) { e.preventDefault(); toast('Подтвердите ознакомление с публичной офертой'); offerConsent?.focus(); return; }
    if (mode === 'delivery') {
      if (!orderAddress.value.trim()) return bad(orderAddress, 'Укажите адрес доставки');
      if (!orderDate.value) return bad(orderDate, 'Выберите дату доставки');
    }
    if (mode === 'delivery' || orderPhone.value.trim()) {
      if (orderPhone.value.replace(/\D/g, '').length < 10) return bad(orderPhone, 'Укажите телефон (не меньше 10 цифр)');
    }
    setTimeout(showSuccess, 450);
    if (link !== waOrder) {
      try {
        navigator.clipboard.writeText(window.__orderText)
          .then(() => toast('Заказ скопирован — вставьте в чат'))
          .catch(() => toast('Скопируйте заказ вручную'));
      } catch (_) { toast('Скопируйте заказ вручную'); }
    }
  });
});



function formatPhone(value) {
  let d = String(value || '').replace(/\D/g,'');
  if (d.startsWith('8')) d = '7' + d.slice(1);
  if (!d.startsWith('7')) d = '7' + d;
  d = d.slice(0,11);
  let s = '+7';
  if (d.length > 1) s += ' (' + d.slice(1,4);
  if (d.length >= 4) s += ') ' + d.slice(4,7);
  if (d.length >= 7) s += '-' + d.slice(7,9);
  if (d.length >= 9) s += '-' + d.slice(9,11);
  return s;
}
orderPhone.addEventListener('input', () => {
  if (orderPhone) orderPhone.value = formatPhone(orderPhone.value);
  orderPhone.style.borderColor = '';
  updateCart();
});

if (cartClear) cartClear.addEventListener('click', () => {
  Object.keys(qty).forEach(k => qty[k] = 0);
  updateCart();
  toast('Корзина очищена');
});
if (successClose) successClose.addEventListener('click', () => orderSuccess.classList.remove('show'));

function showSuccess() {
  if (successText) successText.textContent = `Номер заказа: ${window.__orderNumber || makeOrderNumber()}. Открылся выбранный мессенджер с готовым сообщением. ИП Манукян А.Б. свяжется с вами для подтверждения заказа, стоимости и условий доставки.`;
  orderSuccess.classList.add('show');
}
function hideSplash() {
  const s = document.getElementById('splash');
  if (s) setTimeout(() => s.classList.add('hide'), 650);
}
hideSplash();

// Установка PWA: браузер сам покажет возможность установки, когда выполнены его условия.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

render();
updateCart();


const menuBtn = document.querySelector('.menu-btn');
const mobileMenu = document.getElementById('mobileMenu');
if (menuBtn && mobileMenu) menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));
