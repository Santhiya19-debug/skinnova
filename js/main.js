// SKINNOVA - Main JavaScript
// All interactions, cart, wishlist, search functionality

// ============================================
// STATE MANAGEMENT
// ============================================
let products = [];
let cart = JSON.parse(localStorage.getItem('skinnova_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('skinnova_wishlist')) || [];

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  initializeHeader();
  initializeCart();
  initializeWishlist();
  initializeSearch();
  
  // Page-specific initializations
  const page = document.body.dataset.page;
  if (page === 'home') initHomePage();
  if (page === 'category') initCategoryPage();
  if (page === 'product') initProductPage();
  if (page === 'cart') initCartPage();
  if (page === 'checkout') initCheckoutPage();
  if (page === 'wishlist') initWishlistPage();
  if (page === 'login') initLoginPage();
});

// ============================================
// LOAD PRODUCTS DATA
// ============================================
async function loadProducts() {
  try {
    const response = await fetch('products.json');
    const data = await response.json();
    products = data.products;
  } catch (error) {
    console.error('Failed to load products:', error);
    // Fallback: inline products if JSON fails
    products = []; // Would contain fallback data
  }
}

// ============================================
// HEADER & NAVIGATION
// ============================================
function initializeHeader() {
  const header = document.querySelector('.header');
  const menuToggle = document.querySelector('.header__menu-toggle');
  const nav = document.querySelector('.header__nav');
  const searchIcon = document.querySelector('[data-search-trigger]');
  
  // Sticky header on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });
  
  // Mobile menu toggle
  menuToggle?.addEventListener('click', () => {
    nav?.classList.toggle('active');
  });
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header__nav') && !e.target.closest('.header__menu-toggle')) {
      nav?.classList.remove('active');
    }
  });
  
  // Search overlay
  searchIcon?.addEventListener('click', openSearchOverlay);
  
  updateCartBadge();
}

// ============================================
// CART FUNCTIONALITY
// ============================================
function initializeCart() {
  updateCartBadge();
}

function addToCart(productId, quantity = 1) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: quantity
    });
  }
  
  saveCart();
  updateCartBadge();
  showToast(product.name, 'Added to cart', product.images[0]);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartBadge();
  if (document.body.dataset.page === 'cart') {
    renderCartItems();
  }
}

function updateCartQuantity(productId, quantity) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity = Math.max(1, quantity);
    saveCart();
    updateCartBadge();
    if (document.body.dataset.page === 'cart') {
      renderCartItems();
    }
  }
}

function saveCart() {
  localStorage.setItem('skinnova_cart', JSON.stringify(cart));
}

function updateCartBadge() {
  const badge = document.querySelector('.header__icon-badge');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (badge) {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// ============================================
// WISHLIST FUNCTIONALITY
// ============================================
function initializeWishlist() {
  // Update all wishlist icons on page load
  document.querySelectorAll('[data-wishlist-toggle]').forEach(btn => {
    const productId = btn.dataset.wishlistToggle;
    if (wishlist.includes(productId)) {
      btn.classList.add('active');
    }
  });
}

function toggleWishlist(productId) {
  const index = wishlist.indexOf(productId);
  const product = products.find(p => p.id === productId);
  
  if (index > -1) {
    wishlist.splice(index, 1);
  } else {
    wishlist.push(productId);
    if (product) {
      showToast(product.name, 'Added to wishlist', product.images[0]);
    }
  }
  
  saveWishlist();
  updateWishlistUI(productId);
}

function saveWishlist() {
  localStorage.setItem('skinnova_wishlist', JSON.stringify(wishlist));
}

function updateWishlistUI(productId) {
  const buttons = document.querySelectorAll(`[data-wishlist-toggle="${productId}"]`);
  const isInWishlist = wishlist.includes(productId);
  
  buttons.forEach(btn => {
    if (isInWishlist) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Refresh wishlist page if active
  if (document.body.dataset.page === 'wishlist') {
    renderWishlistItems();
  }
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================
function initializeSearch() {
  const searchClose = document.querySelector('.search-overlay__close');
  const searchInput = document.querySelector('.search-overlay__input');
  
  searchClose?.addEventListener('click', closeSearchOverlay);
  searchInput?.addEventListener('input', handleSearchInput);
  
  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSearchOverlay();
    }
  });
}

function openSearchOverlay() {
  const overlay = document.querySelector('.search-overlay');
  overlay?.classList.add('active');
  document.querySelector('.search-overlay__input')?.focus();
}

function closeSearchOverlay() {
  const overlay = document.querySelector('.search-overlay');
  overlay?.classList.remove('active');
}

function handleSearchInput(e) {
  const query = e.target.value.toLowerCase().trim();
  const resultsContainer = document.querySelector('.search-overlay__results');
  
  if (!resultsContainer) return;
  
  if (query.length < 2) {
    resultsContainer.innerHTML = '';
    return;
  }
  
  const results = products.filter(product => 
    product.name.toLowerCase().includes(query) ||
    product.tags.some(tag => tag.toLowerCase().includes(query)) ||
    product.category.toLowerCase().includes(query)
  ).slice(0, 6);
  
  if (results.length === 0) {
    resultsContainer.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--grey);">No products found</p>';
    return;
  }
  
  resultsContainer.innerHTML = results.map(product => `
    <a href="product.html?id=${product.slug}" class="search-overlay__result">
      <div class="search-overlay__result-image">
        <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
      </div>
      <div class="search-overlay__result-info">
        <div class="search-overlay__result-name">${product.name}</div>
        <div class="search-overlay__result-price">₹${product.price}</div>
      </div>
    </a>
  `).join('');
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(title, message, image) {
  // Remove existing toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    ${image ? `<div class="toast__image"><img src="${image}" alt="${title}"></div>` : ''}
    <div class="toast__content">
      <div class="toast__title">${title}</div>
      <div class="toast__message">${message}</div>
    </div>
    <span class="toast__close">&times;</span>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('active'), 10);
  
  const closeToast = () => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 300);
  };
  
  toast.querySelector('.toast__close').addEventListener('click', closeToast);
  setTimeout(closeToast, 2500);
}

// ============================================
// MODAL FUNCTIONALITY
// ============================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal?.classList.remove('active');
  document.body.style.overflow = '';
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    closeModal(e.target.id);
  }
});

// ============================================
// HOME PAGE
// ============================================
function initHomePage() {
  renderFeaturedProducts();
  initHeroParallax();
}

function renderFeaturedProducts() {
  const container = document.querySelector('[data-featured-products]');
  if (!container || products.length === 0) return;
  
  const featured = products.slice(0, 8);
  container.innerHTML = featured.map(product => createProductCard(product)).join('');
  attachProductCardListeners();
}

function initHeroParallax() {
  const heroImage = document.querySelector('.hero__image img');
  if (!heroImage) return;
  
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    heroImage.style.transform = `translateY(${scrolled * 0.3}px)`;
  });
}

// ============================================
// CATEGORY PAGE
// ============================================
function initCategoryPage() {
  renderCategoryProducts();
  initFilters();
  initSort();
}

function renderCategoryProducts(filteredProducts = products) {
  const container = document.querySelector('[data-product-grid]');
  if (!container) return;
  
  container.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
  attachProductCardListeners();
}

function initFilters() {
  const filterInputs = document.querySelectorAll('.filters__checkbox input, .filters__range');
  filterInputs.forEach(input => {
    input.addEventListener('change', applyFilters);
  });
}
// ===============================
// PRICE SLIDER LIVE UPDATE
// ===============================
const priceSlider = document.getElementById('price-slider');
const priceMinOutput = document.getElementById('price-min');
const priceMaxOutput = document.getElementById('price-max');

if (priceSlider) {
  priceSlider.addEventListener('input', () => {
    priceMaxOutput.textContent = `₹${priceSlider.value}`;
  });
}

function applyFilters() {
  let filtered = [...products];
  
  // Price range filter
  const priceRange = document.querySelector('.filters__range');
  if (priceRange) {
    const maxPrice = parseInt(priceRange.value);
    filtered = filtered.filter(p => p.price <= maxPrice);
  }
  
  // Category filter
  const selectedCategories = Array.from(document.querySelectorAll('.filters__checkbox input[name="category"]:checked'))
    .map(input => input.value);
  if (selectedCategories.length > 0) {
    filtered = filtered.filter(p => selectedCategories.includes(p.category));
  }
  
  // Rating filter
  const selectedRatings = Array.from(document.querySelectorAll('.filters__checkbox input[name="rating"]:checked'))
    .map(input => parseFloat(input.value));
  if (selectedRatings.length > 0) {
    filtered = filtered.filter(p => selectedRatings.some(rating => p.rating >= rating));
  }
  
  renderCategoryProducts(filtered);
}

function initSort() {
  const sortSelect = document.querySelector('[data-sort-select]');
  if (!sortSelect) return;
  
  sortSelect.addEventListener('change', (e) => {
    const sortBy = e.target.value;
    let sorted = [...products];
    
    switch(sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    
    renderCategoryProducts(sorted);
  });
}

// ============================================
// PRODUCT PAGE
// ============================================
function initProductPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productSlug = urlParams.get('id');
  
  if (!productSlug) {
    window.location.href = 'category.html';
    return;
  }
  
  const product = products.find(p => p.slug === productSlug);
  if (!product) {
    window.location.href = '404.html';
    return;
  }
  
  renderProductDetail(product);
  initProductGallery();
  initAccordion();
  initQuantityControls();
  renderRelatedProducts(product);
  
  // Add to cart button
  const addToCartBtn = document.querySelector('[data-add-to-cart]');
  addToCartBtn?.addEventListener('click', () => {
    const quantity = parseInt(document.querySelector('[data-quantity-value]')?.textContent || 1);
    addToCart(product.id, quantity);
  });
  
  // Wishlist toggle
  const wishlistBtn = document.querySelector('[data-wishlist-toggle]');
  wishlistBtn?.addEventListener('click', () => toggleWishlist(product.id));
}

function renderProductDetail(product) {
  // Update gallery
  const mainImage = document.querySelector('.product-gallery__main img');
  const thumbnails = document.querySelector('.product-gallery__thumbnails');
  
  if (mainImage) mainImage.src = product.images[0];
  if (thumbnails) {
    thumbnails.innerHTML = product.images.map((img, index) => `
      <div class="product-gallery__thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
        <img src="${img}" alt="${product.name}">
      </div>
    `).join('');
  }
  
  // Update info
  document.querySelector('.product-info__name').textContent = product.name;
  document.querySelector('.product-info__price').textContent = `₹${product.price}`;
  document.querySelector('.product-info__rating-value').textContent = product.rating;
  document.querySelector('.product-info__description').textContent = product.longDesc;
  
  // Update accordions
  document.querySelector('[data-ingredients]').innerHTML = product.ingredients.map(i => `<li>${i}</li>`).join('');
  
  // Update reviews
  const reviewsContainer = document.querySelector('[data-reviews]');
  if (reviewsContainer) {
    reviewsContainer.innerHTML = product.reviews.map(review => `
      <div class="review-card">
        <div class="review-card__stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
        <p class="review-card__text">${review.text}</p>
        <div class="review-card__author">${review.name}</div>
      </div>
    `).join('');
  }
}

function initProductGallery() {
  const mainImage = document.querySelector('.product-gallery__main img');
  const thumbnails = document.querySelectorAll('.product-gallery__thumbnail');
  
  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const index = parseInt(thumb.dataset.index);
      const product = products.find(p => p.slug === new URLSearchParams(window.location.search).get('id'));
      
      mainImage.src = product.images[index];
      
      thumbnails.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
  
  // Zoom on click
  mainImage?.addEventListener('click', () => {
    openImageZoom(mainImage.src);
  });
}

function openImageZoom(imageSrc) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay zoom-modal active';
  modal.innerHTML = `
    <div class="modal">
      <span class="modal__close">&times;</span>
      <img src="${imageSrc}" alt="Product" class="zoom-modal__image">
    </div>
  `;
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  
  modal.querySelector('.modal__close').addEventListener('click', () => {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = '';
    }, 300);
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      modal.querySelector('.modal__close').click();
    }
  });
}

function initAccordion() {
  const accordionHeaders = document.querySelectorAll('.accordion__header');
  
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');
      
      // Close all
      document.querySelectorAll('.accordion__item').forEach(i => i.classList.remove('active'));
      
      // Open clicked if it wasn't active
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

function initQuantityControls() {
  const decreaseBtn = document.querySelector('[data-quantity-decrease]');
  const increaseBtn = document.querySelector('[data-quantity-increase]');
  const valueDisplay = document.querySelector('[data-quantity-value]');
  
  let quantity = 1;
  
  decreaseBtn?.addEventListener('click', () => {
    if (quantity > 1) {
      quantity--;
      valueDisplay.textContent = quantity;
    }
  });
  
  increaseBtn?.addEventListener('click', () => {
    quantity++;
    valueDisplay.textContent = quantity;
  });
}

function renderRelatedProducts(currentProduct) {
  const container = document.querySelector('[data-related-products]');
  if (!container) return;
  
  const related = products
    .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
    .slice(0, 4);
  
  container.innerHTML = related.map(product => createProductCard(product)).join('');
  attachProductCardListeners();
}

// ============================================
// CART PAGE
// ============================================
function initCartPage() {
  renderCartItems();
}

function renderCartItems() {
  const container = document.querySelector('[data-cart-items]');
  const summaryContainer = document.querySelector('[data-cart-summary]');
  
  if (!container) return;
  
  if (cart.length === 0) {
    container.innerHTML = '<p style="padding: 3rem; text-align: center; color: var(--grey);">Your cart is empty. <a href="category.html" style="color: var(--olive); font-weight: 600;">Start shopping</a></p>';
    if (summaryContainer) summaryContainer.style.display = 'none';
    return;
  }
  
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item__image">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
      </div>
      <div class="cart-item__info">
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__price">₹${item.price}</div>
      </div>
      <div class="cart-item__actions">
        <div class="product-info__quantity">
          <button class="product-info__quantity-btn" data-cart-decrease="${item.id}">−</button>
          <span class="product-info__quantity-value" data-cart-quantity="${item.id}">${item.quantity}</span>
          <button class="product-info__quantity-btn" data-cart-increase="${item.id}">+</button>
        </div>
        <div class="cart-item__subtotal">₹${(item.price * item.quantity).toLocaleString()}</div>
        <span class="cart-item__remove" data-cart-remove="${item.id}">Remove</span>
      </div>
    </div>
  `).join('');
  
  // Attach listeners
  cart.forEach(item => {
    document.querySelector(`[data-cart-decrease="${item.id}"]`)?.addEventListener('click', () => {
      updateCartQuantity(item.id, item.quantity - 1);
    });
    
    document.querySelector(`[data-cart-increase="${item.id}"]`)?.addEventListener('click', () => {
      updateCartQuantity(item.id, item.quantity + 1);
    });
    
    document.querySelector(`[data-cart-remove="${item.id}"]`)?.addEventListener('click', () => {
      if (confirm('Remove this item from cart?')) {
        removeFromCart(item.id);
      }
    });
  });
  
  // Update summary
  const subtotal = getCartTotal();
  const shipping = subtotal > 999 ? 0 : 50;
  const total = subtotal + shipping;
  
  document.querySelector('[data-subtotal]').textContent = `₹${subtotal.toLocaleString()}`;
  document.querySelector('[data-shipping]').textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
  document.querySelector('[data-total]').textContent = `₹${total.toLocaleString()}`;
}

// ============================================
// CHECKOUT PAGE
// ============================================
function initCheckoutPage() {
  const form = document.querySelector('[data-checkout-form]');
  const placeOrderBtn = document.querySelector('[data-place-order]');
  
  // Render order summary
  const summaryContainer = document.querySelector('[data-order-summary]');
  if (summaryContainer && cart.length > 0) {
    const subtotal = getCartTotal();
    const shipping = subtotal > 999 ? 0 : 50;
    const total = subtotal + shipping;
    
    summaryContainer.innerHTML = `
      <h3 class="cart-summary__title">Order Summary</h3>
      <div class="cart-summary__row">
        <span>Subtotal:</span>
        <span>₹${subtotal.toLocaleString()}</span>
      </div>
      <div class="cart-summary__row">
        <span>Shipping:</span>
        <span>${shipping === 0 ? 'FREE' : '₹' + shipping}</span>
      </div>
      <div class="cart-summary__row cart-summary__row--total">
        <span>Total:</span>
        <span>₹${total.toLocaleString()}</span>
      </div>
      <button class="btn btn--primary btn--full" data-place-order>Place Order</button>
    `;
    
    document.querySelector('[data-place-order]').addEventListener('click', handleCheckout);
  }
  
  // Payment option selection
  document.querySelectorAll('.payment-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('active'));
      option.classList.add('active');
    });
  });
}

function handleCheckout(e) {
  e.preventDefault();
  
  const form = document.querySelector('[data-checkout-form]');
  if (!form) return;
  
  // Basic validation
  const requiredFields = form.querySelectorAll('[required]');
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      isValid = false;
      field.style.borderColor = '#E74C3C';
    } else {
      field.style.borderColor = '';
    }
  });
  
  if (!isValid) {
    showToast('Validation Error', 'Please fill in all required fields', null);
    return;
  }
  
  // Show integration required modal
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="modal">
      <span class="modal__close">&times;</span>
      <h3 class="modal__title">Payment Integration Required</h3>
      <div class="modal__content">
        <p>This is a frontend template demo. To complete orders, you'll need to integrate a payment gateway such as:</p>
        <ul style="margin: 1rem 0; padding-left: 1.5rem;">
          <li>Razorpay</li>
          <li>Stripe</li>
          <li>PayU</li>
          <li>CCAvenue</li>
        </ul>
        <p>Your order details are ready and can be sent to your backend API.</p>
      </div>
      <button class="btn btn--primary" onclick="this.closest('.modal-overlay').querySelector('.modal__close').click()">Got it</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  
  modal.querySelector('.modal__close').addEventListener('click', () => {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = '';
    }, 300);
  });
}

// ============================================
// WISHLIST PAGE
// ============================================
function initWishlistPage() {
  renderWishlistItems();
}

function renderWishlistItems() {
  const container = document.querySelector('[data-wishlist-grid]');
  if (!container) return;
  
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));
  
  if (wishlistProducts.length === 0) {
    container.innerHTML = '<p style="padding: 3rem; text-align: center; color: var(--grey); grid-column: 1 / -1;">Your wishlist is empty. <a href="category.html" style="color: var(--olive); font-weight: 600;">Discover products</a></p>';
    return;
  }
  
  container.innerHTML = wishlistProducts.map(product => createProductCard(product)).join('');
  attachProductCardListeners();
}

// ============================================
// LOGIN PAGE
// ============================================
function initLoginPage() {
  const loginForm = document.querySelector('[data-login-form]');
  
  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Demo Mode', 'Authentication not implemented in this template', null);
  });
}

// ============================================
// PRODUCT CARD COMPONENT
// ============================================
function createProductCard(product) {
  const isInWishlist = wishlist.includes(product.id);
  
  return `
    <div class="product-card">
      <div class="product-card__image-wrapper">
        <img src="${product.images[0]}" alt="${product.name}" class="product-card__image" loading="lazy">
        <div class="product-card__wishlist ${isInWishlist ? 'active' : ''}" data-wishlist-toggle="${product.id}">
          <span class="product-card__wishlist-icon">♥</span>
        </div>
        <button class="btn btn--small product-card__quick-add" data-quick-add="${product.id}">Quick Add</button>
      </div>
      <div class="product-card__content">
        <h3 class="product-card__name">${product.name}</h3>
        <div class="product-card__price">₹${product.price}</div>
        <div class="product-card__rating">
          <span class="product-card__stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</span>
          <span>(${product.rating})</span>
        </div>
        <div class="product-card__actions">
          <a href="product.html?id=${product.slug}" class="btn btn--secondary btn--small btn--full">View Details</a>
        </div>
      </div>
    </div>
  `;
}

function attachProductCardListeners() {
  // Wishlist toggles
  document.querySelectorAll('[data-wishlist-toggle]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const productId = btn.dataset.wishlistToggle;
      toggleWishlist(productId);
    });
  });
  
  // Quick add buttons
  document.querySelectorAll('[data-quick-add]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const productId = btn.dataset.quickAdd;
      addToCart(productId, 1);
    });
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatPrice(price) {
  return `₹${price.toLocaleString()}`;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Export functions for global access
window.SKINNOVA = {
  addToCart,
  removeFromCart,
  toggleWishlist,
  openModal,
  closeModal,
  showToast
};
