class ProductTabs {
  constructor() {
    this.tabsContainer = document.querySelector('.product-tabs');
    if (!this.tabsContainer) return;

    this.tabs = this.tabsContainer.querySelectorAll('.product-tabs__tab');
    this.panels = this.tabsContainer.querySelectorAll('.product-tabs__panel');
    
    this.init();
  }

  init() {
    // Add click event listeners to tabs
    this.tabs.forEach((tab, index) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchTab(index);
      });

      // Add keyboard navigation
      tab.addEventListener('keydown', (e) => {
        this.handleKeyNavigation(e, index);
      });
    });

    // Set initial badge icons
    this.setBadgeIcons();
  }

  switchTab(activeIndex) {
    // Remove active class from all tabs and panels
    this.tabs.forEach((tab, index) => {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
      tab.setAttribute('tabindex', '-1');
    });

    this.panels.forEach(panel => {
      panel.classList.remove('active');
    });

    // Add active class to selected tab and panel
    this.tabs[activeIndex].classList.add('active');
    this.tabs[activeIndex].setAttribute('aria-selected', 'true');
    this.tabs[activeIndex].setAttribute('tabindex', '0');
    this.tabs[activeIndex].focus();

    this.panels[activeIndex].classList.add('active');
  }

  handleKeyNavigation(e, currentIndex) {
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : this.tabs.length - 1;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        newIndex = currentIndex < this.tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = this.tabs.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.switchTab(currentIndex);
        return;
    }

    if (newIndex !== currentIndex) {
      this.switchTab(newIndex);
    }
  }

  setBadgeIcons() {
    const badges = document.querySelectorAll('.product-badge__icon');
    badges.forEach(badge => {
      const iconType = badge.closest('.product-badge').querySelector('.product-badge__text')?.textContent?.toLowerCase();
      
      if (iconType) {
        if (iconType.includes('cruelty')) {
          badge.setAttribute('data-icon', 'cruelty-free');
        } else if (iconType.includes('vegan')) {
          badge.setAttribute('data-icon', 'vegan');
        } else if (iconType.includes('made')) {
          badge.setAttribute('data-icon', 'made-in');
        } else if (iconType.includes('natural')) {
          badge.setAttribute('data-icon', 'natural');
        }
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ProductTabs();
});

// Also initialize when page is loaded via AJAX (for single-page applications)
document.addEventListener('shopify:section:load', () => {
  new ProductTabs();
});