// Initialize all page features when DOM is fully loaded 
document.addEventListener("DOMContentLoaded", () => {
  initNavMenu();
  initProductModal();
  initCartBadge();
  initCartPage();
  initContactForm();
  initPhoneFormatter();
});

// Navigation Menu (Hamburger) Display Toggle Handler
const initNavMenu = () => {
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (!navToggle || !navMenu) return;

  navToggle.addEventListener('click', () => {
    const isHidden = navMenu.hasAttribute('hidden');
    navMenu.toggleAttribute('hidden'); // Show/hide menu 
    navToggle.setAttribute('aria-expanded', !isHidden); // Update accessibility attribute
  });
};


// Product Modal Logic for Apparel and Accessories  
const initProductModal = () => {
  const modal = document.getElementById("order-modal");
  const modalImg = document.getElementById("modal-product-image");
  const modalName = document.getElementById("modal-product-name");
  const modalPrice = document.getElementById("modal-product-price");
  const closeButton = document.querySelector(".close-button");

  // Exit early if there is no modal on this page 
  if (!modal || !closeButton) return;

  // Opens the modal with the selected product details
  const openModal = ( {name, img, price} ) => {
    modalName.textContent = name;
    modalImg.src = img;
    modalPrice.textContent = price;
    modal.hidden = false;
  }

  // Attach click handlers to all Order buttons
  document.querySelectorAll(".order-button").forEach(button => {
    button.addEventListener("click", (event) => {
      const productCard = event.target.closest(".product"); // Container above the button 
      if (!productCard) return;

      openModal({
        name: productCard.querySelector("h3")?.textContent || "",
        img: productCard.querySelector("img")?.src || "",
        price: productCard.dataset.price || "$XX.xx"
      });
    });
  });

  // Close Modal Logic 
  closeButton.addEventListener("click", () => (modal.hidden = true));
  window.addEventListener("click", (event) => {
    if (event.target === modal) modal.hidden = true;
  });
};


// Cart Utility Functions 
// Retrieve cart from localStorage or return an empty array
const getCart = () => JSON.parse(localStorage.getItem("cart")) || [];

// Update the cart count badge in nav bar 
const updateCartBadge = () => {
  const cartCountBadge = document.getElementById("cart-count");
  // Only run if the cart badge exists on this page 
  if (!cartCountBadge) return;

  const totalQty = getCart().reduce((sum, item) => sum + item.quantity, 0);
  cartCountBadge.textContent = totalQty;
  cartCountBadge.hidden = totalQty === 0;
};

// Add and Update Cart Count Badge and Add to Cart button
const initCartBadge = () => {

  updateCartBadge(); // Initialize badge count on page load

  // Add to Cart Button Handler 
  const addToCartButton = document.getElementById("add-to-cart-button");
  if (!addToCartButton) return;

  addToCartButton.addEventListener("click", () => {
    const quantity = Number(document.getElementById("modal-product-quantity")?.value) || 1;
    const productName = document.getElementById("modal-product-name")?.textContent;
    const price = document.getElementById("modal-product-price")?.textContent;
    const size = document.getElementById("modal-product-size")?.value || "default";
    if (!productName) return;
    const productId = `${productName.toLowerCase().replace(/\s+/g, "-")}-${size}`; 
    const productImg = document.getElementById("modal-product-image")?.src;

    const cart = getCart();
    const existing = cart.find(item => item.id === productId);

    if (existing) {
      existing.quantity += quantity; // Update quantity if item already in cart 
    } else {
      cart.push({ 
        id: productId, 
        name: productName, 
        price, 
        quantity, 
        size, 
        img: productImg 
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge(); // Refresh badge count
  });
};


// Cart Page Logic and Functionality 
const initCartPage = () => {
  if (!window.location.pathname.includes("cart.html")) return;

  const cartContainer = document.getElementById("cart-container");
  const template = document.getElementById("cart-item-template");
  const cartCountBadge = document.getElementById("cart-count");

  // Mutable cart array
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Persist changes to localStorage
  const updateLocalCart = () => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // Render cart items in the DOM
  const renderCart = () => {
    cartContainer.innerHTML = '';

    if (cart.length === 0) {
      cartContainer.innerHTML = '<div class="empty-cart-message-container"><p class="empty-cart-message">Your cart is empty.</p></div>';
      updateCartBadge();
      return;
    }

    cart.forEach(item => {
      const clone = template.content.cloneNode(true);
      const card = clone.querySelector(".cart-item-modal");

      // Assocaite DOM element with cart item
      card.dataset.itemId = item.id;

      clone.querySelector(".cart-item-image").src = item.img || "images/product-placeholder.png";
      clone.querySelector(".cart-item-name").textContent = item.name;
      clone.querySelector(".cart-item-price").textContent = item.price;
      clone.querySelector(".cart-item-size").value = item.size || "small";
      clone.querySelector(".cart-item-quantity").value = item.quantity || 1;

      // Quantity change handler => update only this item
      clone.querySelector(".cart-item-quantity").addEventListener("change", (event) => {
        const id = card.dataset.itemId;
        const found = cart.find(ci => ci.id === id);
        if (found) {
          found.quantity = parseInt(event.target.value, 10) || 1;
          updateLocalCart();
        }
      });

      // Size change handler => update only this item
      clone.querySelector(".cart-item-size").addEventListener("change", (event) => {
        const id = card.dataset.itemId;
        const found = cart.find(ci => ci.id === id);
        if (found) {
          found.size = event.target.value;
          updateLocalCart();
        }
      });

      cartContainer.appendChild(clone);
    });

    updateCartBadge(); // Refresh badge after rendering 
  }

  // Remove item from cart handler 
  cartContainer.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".cart-remove-button");
    if (!removeButton) return;

    event.preventDefault();

    const card = removeButton.closest(".cart-item-modal");
    if (!card) return;

    const id = card.dataset.itemId;
    const idx = cart.findIndex(item => item.id === id);

    if (idx !== -1) {
      cart.splice(idx, 1); // Remove from array
      localStorage.setItem("cart", JSON.stringify(cart)); // Save changes
      cart = JSON.parse(localStorage.getItem("cart")) || []; // Reload cart
      renderCart(); // Refresh DOM
    }
  });

  // Initial render
  renderCart();

  // Continue shopping button (if present)
  const continueBtn = document.getElementById('continue-shopping');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      window.location.href = 'apparel.html';
    });
  }
};

// Contact Form Algorithms 
// Event Listener for Contact Form Submission (Temporary FrontEnd Behavior)
const initContactForm = () => {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent page reload for now 
    // Use an alert for now. Change to a different screen eventually 
    alert('Thanks for reaching out! We will get back to you shortly.');

    form.reset(); // Clear the fields after submission 
  });
};

// Auto-format phone number in contact form 
const initPhoneFormatter = () => {
  const phoneInput = document.getElementById("phone");
  if (!phoneInput) return;

  phoneInput.addEventListener("input", (event) => {
  let value = event.target.value.replace(/\D/g, ''); // Only digits 
  if (value.length > 3 && value.length <= 6) {
    value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
  } else if (value.length >= 6) {
    value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
  }
  event.target.value = value;
  });
};
