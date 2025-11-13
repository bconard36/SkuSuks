// Event Listener for Hamburger Menu Display 
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  navToggle.addEventListener('click', () => {
    const isHidden = navMenu.hasAttribute('hidden');
    navMenu.toggleAttribute('hidden');
    navToggle.setAttribute('aria-expanded', !isHidden);
  });
});

// Opens and closes product modals in Apparel and Accessories 
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("order-modal");
  const modalImg = document.getElementById("modal-product-image");
  const modalName = document.getElementById("modal-product-name");
  const modalPrice = document.getElementById("modal-product-price");
  const closeButton = document.querySelector(".close-button");

  // Exit early if there is no modal on this page 
  if (!modal || !closeButton) return;

  document.querySelectorAll(".order-button").forEach(button => {
    button.addEventListener("click", (event) => {
      const productCard = event.target.closest(".product"); // Container above the button 
      const productName = productCard.querySelector("h3").textContent;
      const productImg = productCard.querySelector("img").src || "";
      const price = productCard.dataset.price || "XX.xx";

      openModal({name: productName, img: productImg, price});
    });
  });

  // Universal Modal Function 
  function openModal({name, img, price}) {
    modalName.textContent = name;
    modalImg.src = img;
    modalPrice.textContent = price;

    modal.hidden = false;
  }

  // Close Button Logic 
  closeButton.addEventListener("click", () => (modal.hidden = true));
  window.addEventListener("click", (event) => {
    if (event.target === modal) modal.hidden = true;
  });
});

// Add and Update Cart Count Badge over Cart Icon 
document.addEventListener("DOMContentLoaded", () => {
  const cartCountBadge = document.getElementById("cart-count");

    // Only run if the cart badge exists on this page 
    if (!cartCountBadge) return;

    // Update the badge number in nav bar 
  function updateCartBadge() {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalQty = storedCart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountBadge.textContent = totalQty;
    cartCountBadge.hidden = totalQty === 0;
  }

  updateCartBadge();

  // Add or replace the quantity for an item 
  function addToCart(product) {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = existingCart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += product.quantity;
    } else {
      existingCart.push(product);
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    updateCartBadge();
  }


  // Add to Cart Button Handler 
  const addToCartButton = document.getElementById("add-to-cart-button");
  if (addToCartButton) {
    addToCartButton.addEventListener("click", () => {
      const quantity = Number(document.getElementById("modal-product-quantity").value) || 1;
      const productName = document.getElementById("modal-product-name").textContent;
      const price = document.getElementById("modal-product-price").textContent;
      const size = document.getElementById("modal-product-size")?.value || "default";
      const productId = `${productName.toLowerCase().replace(/\s+/g, "-")}-${size}`; 
      const productImg = document.getElementById("modal-product-image").src;

      addToCart({id: productId, name: productName, price, quantity, size, img: productImg});

      document.getElementById("modal-product-quantity").value = "1";
    });
  }
})

// Cart Page Logic and Functionality (robust remove handler)
document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.pathname.includes('cart.html')) return;

  const cartContainer = document.getElementById('cart-container');
  const template = document.getElementById('cart-item-template');
  const cartCountBadge = document.getElementById('cart-count');

  // Use let so we can mutate
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  function updateLocalCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
  }

  function updateCartBadge() {
    if (!cartCountBadge) return;
    const totalQty = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    cartCountBadge.textContent = totalQty;
    cartCountBadge.hidden = totalQty === 0;
  }

  function renderCart() {
    cartContainer.innerHTML = '';

    if (cart.length === 0) {
      cartContainer.innerHTML = '<div class="empty-cart-message-container"><p class="empty-cart-message">Your cart is empty.</p></div>';
      updateCartBadge();
      return;
    }

    cart.forEach(item => {
      const clone = template.content.cloneNode(true);
      const card = clone.querySelector('.cart-item-modal');

      // Attach the item id to the rendered card so handlers know what to act on
      card.dataset.itemId = item.id;

      clone.querySelector('.cart-item-image').src = item.img || 'images/product-placeholder.png';
      clone.querySelector('.cart-item-name').textContent = item.name;
      clone.querySelector('.cart-item-price').textContent = item.price;
      clone.querySelector('.cart-item-size').value = item.size || 'small';
      clone.querySelector('.cart-item-quantity').value = item.quantity || 1;

      // Quantity change => update only this item
      clone.querySelector('.cart-item-quantity').addEventListener('change', (event) => {
        const id = card.dataset.itemId;
        const found = cart.find(ci => ci.id === id);
        if (found) {
          found.quantity = parseInt(event.target.value, 10) || 1;
          updateLocalCart();
        }
      });

      // Size change => update only this item
      clone.querySelector('.cart-item-size').addEventListener('change', (event) => {
        const id = card.dataset.itemId;
        const found = cart.find(ci => ci.id === id);
        if (found) {
          found.size = event.target.value;
          updateLocalCart();
        }
      });

      // REMOVE: remove exactly the item with this card's id (splice only that index)
      clone.querySelector('.cart-remove-button').addEventListener('click', () => {
        const id = card.dataset.itemId;
        const idx = cart.findIndex(ci => ci.id === id);
        if (idx !== -1) {
          cart.splice(idx, 1);       // remove one item at that exact index
          updateLocalCart();
          renderCart();             // re-render to refresh UI
        }
      });

      cartContainer.appendChild(clone);
    });

    updateCartBadge();
  }

  // initial render
  renderCart();

  // Continue shopping button (if present)
  const continueBtn = document.getElementById('continue-shopping');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      // change target page if your shop page isn't index.html
      window.location.href = 'apparel.html';
    });
  }
});

// Contact Form Algorithms 
// Event Listener for Contact Form Submission (Temporary FrontEnd Behavior)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent page reload for now 
    // Use an alert for now. Change to a different screen eventually 
    alert('Thanks for reaching out! We will get back to you shortly.');

    form.reset(); // Clear the fields after submission 
  });
});

// Auto-format phone number in contact form 
document.addEventListener('DOMContentLoaded', () => {
  const phoneInput = document.getElementById('phone');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', (event) => {
  let value = event.target.value.replace(/\D/g, ''); // Only digits 
  if (value.length > 3 && value.length <= 6) {
    value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
  } else if (value.length >= 6) {
    value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
  }
  event.target.value = value;
  });
})
