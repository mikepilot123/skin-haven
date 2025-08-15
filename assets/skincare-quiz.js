class SkincareQuiz {
  constructor() {
    this.currentQuestion = 1;
    this.totalQuestions = 6;
    this.answers = {};
    this.quizStarted = false;
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateProgress();
    this.updateNavigation();
    this.hideNavigation(); // Hide navigation initially
  }

  bindEvents() {
    // Get Started button
    document.getElementById('getStartedBtn').addEventListener('click', () => {
      this.startQuiz();
    });

    // Answer button clicks
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('answer-btn')) {
        this.handleAnswerClick(e.target);
      }
    });

    // Navigation buttons
    document.getElementById('backBtn').addEventListener('click', () => {
      this.goBack();
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
      this.goNext();
    });

    // Results actions
    document.getElementById('retakeQuiz').addEventListener('click', () => {
      this.retakeQuiz();
    });

    document.getElementById('shopRecommendations').addEventListener('click', () => {
      this.shopRecommendations();
    });

    // Email form
    document.getElementById('emailForm').addEventListener('submit', (e) => {
      this.handleEmailSubmit(e);
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' && this.currentQuestion > 1 && this.quizStarted) {
        this.goBack();
      } else if (e.key === 'ArrowRight' && this.canGoNext() && this.quizStarted) {
        this.goNext();
      }
    });
  }

  startQuiz() {
    this.quizStarted = true;
    this.currentQuestion = 1;
    this.answers = {};
    
    // Hide intro and show first question
    document.getElementById('quizIntro').classList.remove('active');
    this.showCurrentQuestion();
    this.updateProgress();
    this.showNavigation();
    this.updateNavigation();
  }

  hideNavigation() {
    const navigation = document.querySelector('.quiz-navigation');
    if (navigation) {
      navigation.classList.remove('show');
    }
  }

  showNavigation() {
    const navigation = document.querySelector('.quiz-navigation');
    if (navigation) {
      navigation.classList.add('show');
    }
  }

  handleAnswerClick(button) {
    const questionType = button.dataset.question;
    const value = button.dataset.value;
    const currentQuestionEl = document.querySelector(`[data-question="${this.currentQuestion}"]`);
    const isMultiSelect = currentQuestionEl.querySelector('.answer-grid').classList.contains('multi-select');

    if (isMultiSelect) {
      // Handle multi-select (concerns question)
      if (!this.answers[questionType]) {
        this.answers[questionType] = [];
      }

      if (button.classList.contains('selected')) {
        // Deselect
        button.classList.remove('selected');
        this.answers[questionType] = this.answers[questionType].filter(v => v !== value);
      } else {
        // Select
        button.classList.add('selected');
        this.answers[questionType].push(value);
      }
    } else {
      // Handle single-select
      // Remove selection from other buttons in this question
      currentQuestionEl.querySelectorAll('.answer-btn').forEach(btn => {
        btn.classList.remove('selected');
      });

      // Select current button
      button.classList.add('selected');
      this.answers[questionType] = value;
    }

    this.updateNavigation();
    
    // Auto-advance for single-select questions (except the last one)
    if (!isMultiSelect && this.currentQuestion < this.totalQuestions) {
      setTimeout(() => {
        this.goNext();
      }, 500);
    }
  }

  canGoNext() {
    const currentQuestionEl = document.querySelector(`[data-question="${this.currentQuestion}"]`);
    if (!currentQuestionEl) return false;

    const questionType = currentQuestionEl.querySelector('.answer-btn').dataset.question;
    const isMultiSelect = currentQuestionEl.querySelector('.answer-grid').classList.contains('multi-select');

    if (isMultiSelect) {
      return this.answers[questionType] && this.answers[questionType].length > 0;
    } else {
      return this.answers[questionType] !== undefined;
    }
  }

  goNext() {
    if (!this.canGoNext()) return;

    if (this.currentQuestion < this.totalQuestions) {
      this.animateQuestionTransition(() => {
        this.currentQuestion++;
        this.showCurrentQuestion();
        this.updateProgress();
        this.updateNavigation();
      });
    } else {
      // Show results
      this.showResults();
    }
  }

  goBack() {
    if (this.currentQuestion > 1) {
      this.animateQuestionTransition(() => {
        this.currentQuestion--;
        this.showCurrentQuestion();
        this.updateProgress();
        this.updateNavigation();
      });
    }
  }

  animateQuestionTransition(callback) {
    const currentQuestionEl = document.querySelector('.quiz-question.active');
    
    if (currentQuestionEl) {
      currentQuestionEl.classList.add('exiting');
      
      setTimeout(() => {
        currentQuestionEl.classList.remove('active', 'exiting');
        callback();
        
        const newQuestionEl = document.querySelector(`[data-question="${this.currentQuestion}"]`);
        if (newQuestionEl) {
          newQuestionEl.classList.add('entering');
          setTimeout(() => {
            newQuestionEl.classList.remove('entering');
          }, 500);
        }
      }, 250);
    } else {
      callback();
    }
  }

  showCurrentQuestion() {
    // Hide all questions
    document.querySelectorAll('.quiz-question').forEach(q => {
      q.classList.remove('active');
    });

    // Show current question
    const currentQuestionEl = document.querySelector(`[data-question="${this.currentQuestion}"]`);
    if (currentQuestionEl) {
      currentQuestionEl.classList.add('active');
    }
  }

  updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const currentStep = document.getElementById('currentStep');
    const percentage = (this.currentQuestion / this.totalQuestions) * 100;
    
    progressFill.style.width = `${percentage}%`;
    currentStep.textContent = this.currentQuestion;
  }

  updateNavigation() {
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Back button
    backBtn.disabled = this.currentQuestion === 1;

    // Next button
    const canAdvance = this.canGoNext();
    nextBtn.disabled = !canAdvance;
    
    if (this.currentQuestion === this.totalQuestions) {
      nextBtn.textContent = 'See Results';
    } else {
      nextBtn.innerHTML = 'Next <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
  }

  showResults() {
    // Hide quiz content
    document.getElementById('quizContent').style.display = 'none';
    document.querySelector('.quiz-navigation').style.display = 'none';
    document.querySelector('.quiz-progress').style.display = 'none';
    
    // Show results
    const resultsEl = document.getElementById('quizResults');
    resultsEl.classList.remove('hidden');
    
    // Generate and display results
    this.generateResults();
    
    // Track quiz completion for analytics
    this.trackQuizCompletion();
    
    // Scroll to results
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  trackQuizCompletion() {
    // Demo analytics tracking
    console.log('Quiz completed with answers:', this.answers);
    
    // You would integrate with your analytics service here
    if (typeof gtag !== 'undefined') {
      gtag('event', 'quiz_completed', {
        'custom_map': {
          'skin_type': this.answers['skin-type'],
          'age_range': this.answers.age,
          'concerns': this.answers.concerns?.join(','),
          'budget': this.answers.budget,
          'goals': this.answers.goals
        }
      });
    }
    
    // Shopify Analytics (if available)
    if (typeof analytics !== 'undefined') {
      analytics.track('Skincare Quiz Completed', {
        skinType: this.answers['skin-type'],
        ageRange: this.answers.age,
        concerns: this.answers.concerns,
        budget: this.answers.budget,
        goals: this.answers.goals,
        timestamp: new Date().toISOString()
      });
    }
  }

  generateResults() {
    const recommendations = this.getProductRecommendations();
    const summary = this.generateSummary();
    
    // Update results summary
    document.getElementById('resultsSummary').innerHTML = summary;
    
    // Update product recommendations
    document.getElementById('recommendedProducts').innerHTML = recommendations;
  }

  generateSummary() {
    const { age, 'skin-type': skinType, concerns, routine, budget, goals } = this.answers;
    
    let summary = '<div class="summary-section">';
    summary += '<h3>Your Skin Profile</h3>';
    
    if (age && age !== 'prefer-not') {
      const ageDisplay = age === '50+' ? '50+' : age.replace('-', '-');
      summary += `<p><strong>Age Range:</strong> ${ageDisplay}</p>`;
    }
    
    if (skinType && skinType !== 'not-sure') {
      summary += `<p><strong>Skin Type:</strong> ${this.formatSkinType(skinType)}</p>`;
    }
    
    if (concerns && concerns.length > 0) {
      summary += `<p><strong>Main Concerns:</strong> ${concerns.map(c => this.formatConcern(c)).join(', ')}</p>`;
    }
    
    if (routine) {
      summary += `<p><strong>Current Routine:</strong> ${this.formatRoutine(routine)}</p>`;
    }
    
    if (goals) {
      summary += `<p><strong>Primary Goal:</strong> ${this.formatGoal(goals)}</p>`;
    }
    
    summary += '</div>';
    
    // Add personalized message
    summary += '<div class="personalized-message">';
    summary += '<h3>Your Personalized Routine</h3>';
    summary += this.getPersonalizedMessage();
    summary += '</div>';
    
    return summary;
  }

  getPersonalizedMessage() {
    const { 'skin-type': skinType, concerns, routine, goals } = this.answers;
    
    let message = '<p>';
    
    if (skinType === 'oily') {
      message += 'For oily skin, we recommend a gentle cleanser, lightweight moisturizer, and targeted treatments for oil control. ';
    } else if (skinType === 'dry') {
      message += 'For dry skin, focus on hydrating cleansers, rich moisturizers, and nourishing serums to restore your skin barrier. ';
    } else if (skinType === 'combination') {
      message += 'Combination skin needs balanced care - gentle cleansing and targeted treatments for different areas of your face. ';
    } else if (skinType === 'sensitive') {
      message += 'Sensitive skin requires gentle, fragrance-free products with minimal ingredients to avoid irritation. ';
    }
    
    if (concerns && concerns.includes('acne')) {
      message += 'To address acne, incorporate salicylic acid or benzoyl peroxide treatments. ';
    }
    
    if (concerns && concerns.includes('aging')) {
      message += 'For anti-aging benefits, consider retinol, vitamin C, and peptide-rich products. ';
    }
    
    if (routine === 'minimal' || routine === 'none') {
      message += 'We\'ve selected a simple 3-4 step routine that\'s perfect for beginners.';
    } else if (routine === 'extensive') {
      message += 'We\'ve curated advanced products to enhance your existing routine.';
    }
    
    message += '</p>';
    return message;
  }

  getProductRecommendations() {
    const { 'skin-type': skinType, concerns, budget, routine } = this.answers;
    
    // Demo product data for testing
    const demoProducts = this.getDemoProducts();
    const productTypes = this.getRecommendedProductTypes();
    
    let products = '';
    
    productTypes.forEach((type, index) => {
      const product = demoProducts[type] || demoProducts['default'];
      const price = this.getEstimatedPrice(type, budget);
      
      products += `
        <div class="product-recommendation" data-product-type="${type}">
          <div class="product-image">
            <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;" />
          </div>
          <h4>${product.name}</h4>
          <p class="product-description">${this.getPersonalizedDescription(type, skinType, concerns)}</p>
          <div class="product-price">$${price}</div>
          <button class="view-product-btn" onclick="window.location.href='${product.url}'">
            Shop Now
          </button>
        </div>
      `;
    });
    
    return products;
  }

  getDemoProducts() {
    return {
      'cleanser': {
        name: 'PanOxyl Acne Foaming Wash',
        image: 'https://cdn.shopify.com/s/files/1/0234/5678/products/panoxyl-cleanser.jpg?v=1234567890',
        url: '/products/panoxyl-10-benzoyl-peroxide-acne-forming-cleanser',
        description: 'Maximum strength benzoyl peroxide cleanser'
      },
      'moisturizer': {
        name: 'CeraVe Daily Moisturizing Lotion',
        image: 'https://cdn.shopify.com/s/files/1/0234/5678/products/cerave-moisturizer.jpg?v=1234567890',
        url: '/collections/moisturizers',
        description: 'Essential ceramides and hyaluronic acid'
      },
      'sunscreen': {
        name: 'EltaMD UV Clear Sunscreen',
        image: 'https://cdn.shopify.com/s/files/1/0234/5678/products/eltamd-sunscreen.jpg?v=1234567890',
        url: '/collections/sunscreen',
        description: 'Broad spectrum SPF 46 protection'
      },
      'serum': {
        name: 'Youth to the People Vitamin C Serum',
        image: 'https://cdn.shopify.com/s/files/1/0234/5678/products/yttp-serum.jpg?v=1234567890',
        url: '/collections/serums',
        description: 'Brightening vitamin C treatment'
      },
      'acne-treatment': {
        name: 'Paula\'s Choice BHA Liquid Exfoliant',
        image: 'https://cdn.shopify.com/s/files/1/0234/5678/products/paulas-choice-bha.jpg?v=1234567890',
        url: '/collections/treatments',
        description: '2% BHA for clearer skin'
      },
      'hydrating-serum': {
        name: 'The Ordinary Hyaluronic Acid Serum',
        image: 'https://cdn.shopify.com/s/files/1/0234/5678/products/ordinary-hyaluronic.jpg?v=1234567890',
        url: '/collections/serums',
        description: 'Multi-weight hydration formula'
      },
      'default': {
        name: 'Skincare Essential',
        image: 'https://cdn.shopify.com/s/files/1/0234/5678/products/skincare-product.jpg?v=1234567890',
        url: '/collections/all',
        description: 'Perfect for your skincare routine'
      }
    };
  }

  getPersonalizedDescription(type, skinType, concerns) {
    const baseDescriptions = {
      'cleanser': 'Gently cleanses without stripping natural oils',
      'moisturizer': 'Hydrates and strengthens your skin barrier',
      'sunscreen': 'Daily protection against UV damage and premature aging',
      'serum': 'Concentrated treatment for targeted results',
      'acne-treatment': 'Helps clear existing breakouts and prevent new ones',
      'hydrating-serum': 'Deep hydration for plump, healthy-looking skin'
    };

    let description = baseDescriptions[type] || 'Specially formulated for your skin needs';

    // Add personalized touches based on skin type
    if (skinType === 'oily' && type === 'moisturizer') {
      description = 'Lightweight, oil-free formula that won\'t clog pores';
    } else if (skinType === 'dry' && type === 'cleanser') {
      description = 'Gentle, hydrating cleanser that won\'t leave skin tight';
    } else if (skinType === 'sensitive' && type === 'serum') {
      description = 'Gentle, fragrance-free formula safe for sensitive skin';
    }

    // Add concern-specific benefits
    if (concerns && concerns.includes('aging') && type === 'serum') {
      description += '. Contains anti-aging ingredients to reduce fine lines';
    } else if (concerns && concerns.includes('dark-spots') && type === 'serum') {
      description += '. Helps fade dark spots and even skin tone';
    }

    return description;
  }

  getRecommendedProductTypes() {
    const { 'skin-type': skinType, concerns, routine } = this.answers;
    const types = ['cleanser', 'moisturizer'];
    
    // Add sunscreen for most routines
    if (routine !== 'none') {
      types.push('sunscreen');
    }
    
    // Add treatments based on concerns
    if (concerns) {
      if (concerns.includes('acne')) {
        types.push('acne-treatment');
      }
      if (concerns.includes('aging') || concerns.includes('dark-spots')) {
        types.push('serum');
      }
      if (concerns.includes('dryness')) {
        types.push('hydrating-serum');
      }
    }
    
    return types.slice(0, 4); // Limit to 4 products
  }

  getProductEmoji(type) {
    const emojis = {
      'cleanser': '🧴',
      'moisturizer': '🧴',
      'sunscreen': '☀️',
      'serum': '💧',
      'acne-treatment': '🎯',
      'hydrating-serum': '💎'
    };
    return emojis[type] || '✨';
  }

  getProductTypeName(type) {
    const names = {
      'cleanser': 'Gentle Cleanser',
      'moisturizer': 'Daily Moisturizer',
      'sunscreen': 'SPF Protection',
      'serum': 'Treatment Serum',
      'acne-treatment': 'Acne Treatment',
      'hydrating-serum': 'Hydrating Serum'
    };
    return names[type] || 'Skincare Product';
  }

  getProductDescription(type) {
    const descriptions = {
      'cleanser': 'Perfect for your skin type, removes impurities gently',
      'moisturizer': 'Hydrates and protects your skin barrier',
      'sunscreen': 'Daily protection against UV damage',
      'serum': 'Targeted treatment for your specific concerns',
      'acne-treatment': 'Helps clear and prevent breakouts',
      'hydrating-serum': 'Deep hydration for plump, healthy skin'
    };
    return descriptions[type] || 'Specially selected for your needs';
  }

  getEstimatedPrice(type, budget) {
    const budgetRanges = {
      'under-50': { min: 15, max: 35 },
      '50-100': { min: 25, max: 60 },
      '100-200': { min: 40, max: 120 },
      '200-plus': { min: 80, max: 200 },
      'no-budget': { min: 50, max: 150 }
    };
    
    const range = budgetRanges[budget] || budgetRanges['50-100'];
    return Math.floor(Math.random() * (range.max - range.min) + range.min);
  }

  formatSkinType(type) {
    const types = {
      'oily': 'Oily',
      'dry': 'Dry', 
      'combination': 'Combination',
      'sensitive': 'Sensitive',
      'normal': 'Normal'
    };
    return types[type] || type;
  }

  formatConcern(concern) {
    const concerns = {
      'acne': 'Acne & Breakouts',
      'aging': 'Anti-Aging',
      'dark-spots': 'Dark Spots',
      'dryness': 'Dryness',
      'dullness': 'Dullness',
      'pores': 'Large Pores',
      'sensitivity': 'Sensitivity',
      'uneven-tone': 'Uneven Tone'
    };
    return concerns[concern] || concern;
  }

  formatRoutine(routine) {
    const routines = {
      'minimal': 'Minimal (Cleanser + Moisturizer)',
      'basic': 'Basic (3-4 products)',
      'moderate': 'Moderate (5-7 products)',
      'extensive': 'Extensive (10+ products)',
      'none': 'Starting from scratch'
    };
    return routines[routine] || routine;
  }

  formatGoal(goal) {
    const goals = {
      'prevention': 'Prevention & Maintenance',
      'treatment': 'Targeted Treatment',
      'glow': 'Radiant Glow',
      'anti-aging': 'Anti-Aging',
      'simplify': 'Simple & Effective'
    };
    return goals[goal] || goal;
  }

  retakeQuiz() {
    // Reset quiz state
    this.currentQuestion = 1;
    this.answers = {};
    this.quizStarted = false; // Reset quizStarted
    
    // Reset UI
    document.querySelector('.quiz-progress').style.display = 'block';
    document.getElementById('quizResults').classList.add('hidden');
    document.getElementById('quizIntro').classList.add('active'); // Show intro again
    this.hideNavigation(); // Hide navigation again
    
    // Clear all selections
    document.querySelectorAll('.answer-btn').forEach(btn => {
      btn.classList.remove('selected');
    });

    // Reset progress
    this.updateProgress();
    this.updateNavigation();
  }

  shopRecommendations() {
    // This would redirect to a filtered collection page or create a cart
    // For now, redirect to all products
    window.location.href = '/collections/all';
  }

  handleEmailSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('emailInput').value;
    
    if (email) {
      // Here you would send the email and results to your backend
      // For now, we'll just show a success message
      this.showEmailSuccess();
    }
  }

  showEmailSuccess() {
    const emailCapture = document.getElementById('emailCapture');
    emailCapture.innerHTML = `
      <div class="email-success">
        <h3>Thank You! 🎉</h3>
        <p>We've sent your personalized skincare routine to your email. Check your inbox for exclusive tips and product recommendations!</p>
      </div>
    `;
  }
}

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new SkincareQuiz();
});

// Also handle Shopify section reloads
document.addEventListener('shopify:section:load', () => {
  new SkincareQuiz();
});