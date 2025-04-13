class ProductPage {
    constructor() {
        this.productId = new URLSearchParams(window.location.search).get('id');
        this.init();
    }

    async init() {
        if (!this.productId) {
            window.location.href = 'index.html';
            return;
        }

        await this.loadProduct();
        this.attachEventListeners();
        this.loadRelatedProducts();
    }

    async loadProduct() {
        try {
            const response = await fetch(`https://fakestoreapi.com/products/${this.productId}`);
            const product = await response.json();
            this.renderProduct(product);
        } catch (error) {
            console.error('Error loading product:', error);
        }
    }

    renderProduct(product) {
        document.title = `${product.title} - Fashion Store`;
        document.getElementById('mainImage').src = product.image;
        document.getElementById('mainImage').alt = product.title;
        document.getElementById('productTitle').textContent = product.title;
        document.getElementById('productPrice').textContent = `${product.price}đ`;
        document.getElementById('productDescription').textContent = product.description;
    }

    async loadRelatedProducts() {
        try {
            const response = await fetch('https://fakestoreapi.com/products');
            const products = await response.json();
            const relatedProducts = products
                .filter(p => p.id !== Number(this.productId))
                .slice(0, 4);
            
            this.renderRelatedProducts(relatedProducts);
        } catch (error) {
            console.error('Error loading related products:', error);
        }
    }

    renderRelatedProducts(products) {
        const container = document.getElementById('relatedProducts');
        if (!container) return;

        container.innerHTML = products.map(product => `
        <div class="product-card">
                <img src="${product.image}" alt="${product.title}">
                <h3>${product.title}</h3>
                <p class="price">${formatCurrency(product.price * 23000)}</p>
                <div class="actions">
                    <button onclick="addToCart(${product.id})">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                    <button onclick="addToWishlist(${product.id})">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button onclick="window.location.href='product.html?id=${product.id}'">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    attachEventListeners() {
        const quantityInput = document.getElementById('quantity');
        
        document.getElementById('decreaseQuantity')?.addEventListener('click', () => {
            const currentValue = Number(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });

        document.getElementById('increaseQuantity')?.addEventListener('click', () => {
            const currentValue = Number(quantityInput.value);
            quantityInput.value = currentValue + 1;
        });

        document.getElementById('addToCartBtn')?.addEventListener('click', () => {
            const quantity = Number(quantityInput.value);
            addToCart(this.productId, quantity);
        });

        document.getElementById('addToWishlistBtn')?.addEventListener('click', () => {
            addToWishlist(this.productId);
        });
    }
}

const productPage = new ProductPage();