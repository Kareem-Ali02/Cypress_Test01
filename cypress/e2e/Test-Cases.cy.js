describe('Sauce Demo Tests', () => {
  beforeEach(() => {
    cy.visit('https://www.saucedemo.com/');
  });

  afterEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  // Test Case 1: Successful Login
  it('should log in successfully with valid credentials', () => {
    cy.fixture('users.json').then((users) => {
      cy.login(users.standard_user.username, users.standard_user.password);
    });
    cy.url().should('include', '/inventory.html');
    cy.get('.title').should('contain', 'Products');
    cy.get('.shopping_cart_link').should('be.visible');
  });

  // Test Case 2: Failed Login with Invalid Username
  it('should display error message with invalid username', () => {
    cy.login('invalid_user', 'secret_sauce');
    cy.get('[data-test="error"]').should('be.visible');
    cy.get('[data-test="error"]').should('contain', 'Username and password do not match any user in this service');
    cy.url().should('not.include', '/inventory.html');
  });

  // Test Case 3: Failed Login with Invalid Password
  it('should display error message with invalid password', () => {
    cy.fixture('users.json').then((users) => {
      cy.login(users.standard_user.username, 'invalid_password');
    });
    cy.get('[data-test="error"]').should('be.visible');
    cy.get('[data-test="error"]').should('contain', 'Username and password do not match any user in this service');
    cy.url().should('not.include', '/inventory.html');
  });

  // Test Case 4: Locked Out User Login
  it('should display error message for locked out user', () => {
    cy.fixture('users.json').then((users) => {
      cy.login(users.locked_out_user.username, users.locked_out_user.password);
    });
    cy.get('[data-test="error"]').should('be.visible');
    cy.get('[data-test="error"]').should('contain', 'Sorry, this user has been locked out.');
    cy.url().should('not.include', '/inventory.html');
  });

  // Test Case 5: Problem User Login
  it('should log in successfully with problem user', () => {
    cy.fixture('users.json').then((users) => {
      cy.login(users.problem_user.username, users.problem_user.password);
    });
    cy.url().should('include', '/inventory.html');
    cy.get('.title').should('contain', 'Products');
    cy.get('.shopping_cart_link').should('be.visible');
  });

  // Test Case 6: Performance Glitch User Login
  it('should log in successfully with performance glitch user', () => {
    cy.fixture('users.json').then((users) => {
      cy.login(users.performance_glitch_user.username, users.performance_glitch_user.password);
    });
    cy.url().should('include', '/inventory.html');
    cy.get('.title').should('contain', 'Products');
    cy.get('.shopping_cart_link').should('be.visible');
  });

  // Test Case 7: Add Item to Cart
  it('should add an item to the cart', () => {
    cy.fixture('users.json').then((users) => {
      cy.login(users.standard_user.username, users.standard_user.password);
    });
    cy.get('.inventory_item').first().find('button').click();
    cy.get('.shopping_cart_badge').should('contain', '1');
    cy.get('.inventory_item').first().find('button').should('contain', 'Remove');
  });

  // Test Case 8: Navigate to Cart
  it('should navigate to the cart page', () => {
    cy.fixture('users.json').then((users) => {
      cy.login(users.standard_user.username, users.standard_user.password);
    });
    cy.get('.shopping_cart_link').click();
    cy.url().should('include', '/cart.html');
    cy.get('.title').should('contain', 'Your Cart');
    cy.get('.cart_item').should('not.exist');
  });

  // Test Case 9: Complete Checkout
  it('should complete the checkout process', () => {
    cy.fixture('users.json').then((users) => {
      cy.login(users.standard_user.username, users.standard_user.password);
    });
    cy.get('.inventory_item').first().find('button').click();
    cy.get('.shopping_cart_link').click();
    cy.get('#checkout').click();
    cy.get('#first-name').type('Kareem');
    cy.get('#last-name').type('Ali');
    cy.get('#postal-code').type('12345');
    cy.get('#continue').click();
    cy.url().should('include', '/checkout-step-two.html');
    cy.get('.title').should('contain', 'Checkout: Overview');
    cy.get('#finish').click();
    cy.url().should('include', '/checkout-complete.html');
    cy.get('.title').should('contain', 'Checkout: Complete!');
    cy.get('.complete-header').should('contain', 'Thank you for your order!');
  });

  // Test Case 10: Cancel Checkout
  it('should cancel the checkout process', () => {
    cy.fixture('users.json').then((users) => {
      cy.login(users.standard_user.username, users.standard_user.password);
    });
    cy.get('.inventory_item').first().find('button').click();
    cy.get('.shopping_cart_link').click();
    cy.get('#checkout').click();
    cy.get('#cancel').click();
    cy.url().should('include', '/cart.html');
    cy.get('.title').should('contain', 'Your Cart');
    cy.get('.cart_item').should('be.visible');
  });

  // Test Case 11: Sort Products by Price (Low to High)
  it('should sort products by price low to high', () => {
    cy.fixture('users.json').then((users) => {
      cy.login(users.standard_user.username, users.standard_user.password);
    });
    cy.get('.product_sort_container').select('lohi');
    cy.get('.inventory_item_price').then((prices) => {
      const priceValues = prices.map((index, el) => parseFloat(el.innerText.replace('$', ''))).get();
      const sortedPrices = [...priceValues].sort((a, b) => a - b);
      expect(priceValues).to.deep.equal(sortedPrices);
    });
  });

  // Test Case 12: Sort Products by Price (High to Low)
  it('should sort products by price high to low', () => {
    cy.fixture('users.json').then((users) => {
      cy.login(users.standard_user.username, users.standard_user.password);
    });
    cy.get('.product_sort_container').select('hilo');
    cy.get('.inventory_item_price').then((prices) => {
      const priceValues = prices.map((index, el) => parseFloat(el.innerText.replace('$', ''))).get();
      const sortedPrices = [...priceValues].sort((a, b) => b - a);
      expect(priceValues).to.deep.equal(sortedPrices);
    });
  });

  // Test Case 13: Logout
  it('should logout successfully', () => {
    cy.fixture('users.json').then((users) => {
      cy.login(users.standard_user.username, users.standard_user.password);
    });
    cy.get('#react-burger-menu-btn').click();
    cy.get('#logout_sidebar_link').click();
    cy.url().should('include', 'https://www.saucedemo.com/');
    cy.get('#login-button').should('be.visible');
    cy.get('#user-name').should('be.visible');
  });
});