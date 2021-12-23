const menuItems = [
  {
    name: 'French Fries with Ketchup',
    price: 223,
    image: 'plate__french-fries.png',
    count: 0,
  },
  {
    name: 'Salmon and Vegetables',
    price: 512,
    image: 'plate__salmon-vegetables.png',
    count: 0,
  },
  {
    name: 'Spaghetti Meat Sauce',
    price: 782,
    image: 'plate__spaghetti-meat-sauce.png',
    count: 0,
  },
  {
    name: 'Bacon, Eggs, and Toast',
    price: 599,
    image: 'plate__bacon-eggs.png',
    count: 0,
  },
  {
    name: 'Chicken Salad with Parmesan',
    price: 698,
    image: 'plate__chicken-salad.png',
    count: 0,
  },
  {
    name: 'Fish Sticks and Fries',
    price: 634,
    image: 'plate__fish-sticks-fries.png',
    count: 0,
  },
];

// Helpers
const asPrice = (num) => {
  const numStr = String(num);
  const strLen = numStr.length;

  return strLen <= 2
    ? `$0.${num}`
    : `$${numStr.slice(0, strLen - 2)}.${numStr.slice(strLen - 2)}`;
};

const changeVisibility = (elem, show = false) =>
  show ? elem.classList.remove('hidden') : elem.classList.add('hidden');

const showEmpty = (show = true) =>
  document.querySelector('.empty').classList.toggle('hidden', !show);

const Menu = function _Menu() {
  return _Menu.state.items;
};

const createMenuItem = (itemObj) => {
  const { name, price, image } = itemObj;

  const item = document.createElement('li');
  item.innerHTML = `
    <div class="plate">
      <img src="images/${image}" aria-hidden class="plate" />
    </div>
    <div class="content">
      <p class="menu-item">${name}</p>
    	<p class="price">${asPrice(price)}</p>
    	<button class="add">Add to Cart</button>
      <button class="in-cart hidden aria-selected="true"">
      <img src="images/check.svg" aria-hidden />
      In Cart
    </button>
  	</div>
    `;

  item.querySelector('.add').addEventListener('click', (e) => {
    Cart.state.append(itemObj);
    changeVisibility(e.target);
    changeVisibility(item.querySelector('.in-cart'), true);
  });

  return item;
};

const createCartItem = (itemObj) => {
  const { name, price, image } = itemObj;
  const item = document.createElement('li');

  item.innerHTML = `
	<div class="plate">
      <img src="./images/${image}" aria-hidden class="plate" />
      <div class="quantity">1</div>
    </div>
    <div class="content">
      <p class="menu-item">${name}</p>
      <p class="price">${asPrice(price)}</p>
    </div>
    <div class="quantity__wrapper">
      <button class="decrease" aria-label="Decrease item quantity">
        <img src="images/chevron.svg" aria-hidden />
      </button>
      <div class="quantity">1</div>
      <button class="increase" aria-label="Increase item quantity">
        <img src="images/chevron.svg" aria-hidden/>
      </button>
    </div>
    <div class="subtotal">
      ${asPrice(price)}
    </div>
	`;

  const increase = item.querySelector('.increase');
  const decrease = item.querySelector('.decrease');

  increase.addEventListener('click', () => Cart.state.updateItemCount(itemObj));
  decrease.addEventListener('click', () => Cart.state.updateItemCount(itemObj, false));

  return item;
};

Menu.state = {
  items: [],
  append: (itemObj) => {
    Menu().push(itemObj);
    document.getElementById('menu').appendChild(createMenuItem(itemObj));
  },
  changeButton: (itemObj, show = false) => {
    const itemIdx = Menu().indexOf(itemObj);
    const menuDOM = document.getElementById('menu');
    const itemDOM = [...menuDOM.children][itemIdx];

    changeVisibility(itemDOM.querySelector('.add'), show ? false : true);
    changeVisibility(itemDOM.querySelector('.in-cart'), show ? true : false);
  },
};

const Cart = function _Cart() {
  return _Cart.state.items;
};

Cart.state = {
  items: [],
  totals: {
    subtotal: 0,
    tax: 0,
    total: 0,
  },

  append: (itemObj) => {
    const { updateTotals } = Cart.state;

    if (!Cart().includes(itemObj)) {
      document.getElementById('cart').classList.remove('hidden');
      document.querySelector('.totals').classList.remove('hidden');

      itemObj.count += 1;
      Cart().push(itemObj);

      updateTotals();
      document.getElementById('cart').appendChild(createCartItem(itemObj));
      showEmpty(false);
    }
  },

  updateCart: () => {},

  remove: (itemObj) => {
    const { updateTotals } = Cart.state;
    const itemEl = [...document.getElementById('cart').children][Cart().indexOf(itemObj)];

    Cart().splice(Cart().indexOf(itemObj), 1);
    document.getElementById('cart').removeChild(itemEl);

    Menu.state.changeButton(itemObj);

    updateTotals();

    if (Cart().length <= 0) {
      changeVisibility(document.getElementById('cart'));
      changeVisibility(document.querySelector('.totals'));
      changeVisibility(document.querySelector('.empty'));
    }
  },

  updateTotals: () => {
    const { totals } = Cart.state;
    const newSubtotal = Cart().reduce((total, { count, price }) => total + price * count, 0);

    totals.subtotal = newSubtotal;
    totals.tax = totals.subtotal * 0.0975;
    totals.total = totals.subtotal + totals.tax;

    document.getElementById('subtotal').textContent = asPrice(totals.subtotal);
    document.getElementById('tax').textContent = asPrice(Math.ceil(totals.tax));
    document.getElementById('total').textContent = asPrice(Math.ceil(totals.total));
  },

  updateItemCount: (itemObj, increase = true) => {
    const { updateCart, updateTotals, remove } = Cart.state;
    const item = Cart()[Cart().indexOf(itemObj)];
    const itemDOM = [...document.getElementById('cart').children][Cart().indexOf(itemObj)];

    increase ? (item.count += 1) : (item.count -= 1);

    if (item.count <= 0) {
      remove(itemObj);
      updateCart();
    }

    [...itemDOM.querySelectorAll('.quantity')].forEach(
      (count) => (count.textContent = item.count)
    );
    itemDOM.querySelector('.subtotal').textContent = asPrice(item.price * item.count);

    updateTotals();
  },
};

// Init
for (const item of menuItems) Menu.state.append(item);
