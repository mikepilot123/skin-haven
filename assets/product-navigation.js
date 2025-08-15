class ProductNavigation extends HTMLElement {
  constructor() {
    super();
    this.currentProductId = this.dataset.currentProductId;
    this.collectionHandle = this.dataset.collectionHandle;
    this.prevButton = this.querySelector('[data-direction="prev"]');
    this.nextButton = this.querySelector('[data-direction="next"]');
    this.products = [];
    this.currentIndex = -1;
    
    this.init();
  }

  async init() {
    await this.loadCollectionProducts();
    this.setupEventListeners();
    this.updateButtonStates();
  }

  async loadCollectionProducts() {
    try {
      // Fetch collection products
      const response = await fetch(`/collections/${this.collectionHandle}/products.json?limit=250`);
      const data = await response.json();
      
      this.products = data.products || [];
      this.currentIndex = this.products.findIndex(product => product.id.toString() === this.currentProductId);
      
      // If product not found in collection, try fetching all products
      if (this.currentIndex === -1) {
        const allProductsResponse = await fetch('/products.json?limit=250');
        const allProductsData = await allProductsResponse.json();
        this.products = allProductsData.products || [];
        this.currentIndex = this.products.findIndex(product => product.id.toString() === this.currentProductId);
      }
    } catch (error) {
      console.error('Error loading collection products:', error);
    }
  }

  setupEventListeners() {
    this.prevButton?.addEventListener('click', () => this.navigateToProduct('prev'));
    this.nextButton?.addEventListener('click', () => this.navigateToProduct('next'));
    
    // Keyboard navigation (Ctrl + Arrow keys)
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.key === 'ArrowLeft' && e.ctrlKey) {
        e.preventDefault();
        this.navigateToProduct('prev');
      } else if (e.key === 'ArrowRight' && e.ctrlKey) {
        e.preventDefault();
        this.navigateToProduct('next');
      }
    });
  }

  async navigateToProduct(direction) {
    if (this.products.length === 0) return;

    const newIndex = direction === 'prev' 
      ? this.currentIndex - 1 
      : this.currentIndex + 1;

    if (newIndex < 0 || newIndex >= this.products.length) return;

    const targetProduct = this.products[newIndex];
    if (!targetProduct) return;

    // Show loading state
    this.setLoadingState(true);

    try {
      // Fetch the new product page HTML
      const response = await fetch(`/products/${targetProduct.handle}`);
      const fullPageHtml = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(fullPageHtml, 'text/html');
      const productSection = doc.querySelector('product-info');
      
      if (!productSection) {
        throw new Error('Product section not found');
      }

      // Update the current product section
      await this.updateProductContent(productSection.outerHTML, targetProduct);
      
      // Update navigation state
      this.currentIndex = newIndex;
      this.currentProductId = targetProduct.id.toString();
      this.updateButtonStates();
      
      // Update URL without page reload
      const newUrl = `/products/${targetProduct.handle}`;
      window.history.pushState({ productHandle: targetProduct.handle }, '', newUrl);
      
      // Update page title
      document.title = `${targetProduct.title} | ${window.Shopify?.shop?.name || 'Shop'}`;
      
      // Scroll to top of product section
      document.querySelector('product-info')?.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
      console.error('Error navigating to product:', error);
      // Fallback to regular navigation
      window.location.href = `/products/${targetProduct.handle}`;
    }

    this.setLoadingState(false);
  }

  async updateProductContent(newHtml, product) {
    const currentProductInfo = document.querySelector('product-info');
    if (!currentProductInfo) return;

    // Create temporary container to parse new HTML
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = newHtml;
    const newProductInfo = tempContainer.querySelector('product-info');
    
    if (!newProductInfo) return;

    // Update data attributes
    newProductInfo.setAttribute('data-product-id', product.id);
    newProductInfo.setAttribute('data-url', `/products/${product.handle}`);
    
    // Replace the current product info with new content
    currentProductInfo.parentNode.replaceChild(newProductInfo, currentProductInfo);
    
    // Re-initialize any JavaScript components
    this.reinitializeComponents();
    
    // Update navigation data
    this.dataset.currentProductId = product.id.toString();
  }

  reinitializeComponents() {
    // Re-initialize product form
    const productForms = document.querySelectorAll('product-form');
    productForms.forEach(form => {
      if (form.connectedCallback) {
        form.connectedCallback();
      }
    });

    // Re-initialize variant selects
    const variantSelects = document.querySelectorAll('variant-selects');
    variantSelects.forEach(select => {
      if (select.connectedCallback) {
        select.connectedCallback();
      }
    });

    // Trigger any scripts that need to run
    const event = new CustomEvent('product:loaded');
    document.dispatchEvent(event);
  }

  updateButtonStates() {
    if (!this.prevButton || !this.nextButton) return;

    // Update previous button
    this.prevButton.disabled = this.currentIndex <= 0;
    
    // Update next button
    this.nextButton.disabled = this.currentIndex >= this.products.length - 1;

    // Update aria-labels with product names
    if (this.currentIndex > 0 && this.products[this.currentIndex - 1]) {
      this.prevButton.setAttribute('aria-label', `Previous: ${this.products[this.currentIndex - 1].title}`);
    }
    
    if (this.currentIndex < this.products.length - 1 && this.products[this.currentIndex + 1]) {
      this.nextButton.setAttribute('aria-label', `Next: ${this.products[this.currentIndex + 1].title}`);
    }
  }

  setLoadingState(loading) {
    [this.prevButton, this.nextButton].forEach(button => {
      if (button) {
        button.classList.toggle('loading', loading);
        button.disabled = loading;
      }
    });
  }
}

// Register the custom element
if (!customElements.get('product-navigation')) {
  customElements.define('product-navigation', ProductNavigation);
}

// Handle browser back/forward buttons
window.addEventListener('popstate', (event) => {
  if (event.state && event.state.productHandle) {
    // Reload the page for proper state restoration
    window.location.reload();
  }
}); 