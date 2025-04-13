document.addEventListener('DOMContentLoaded', () => {
    const cart = {
        items: [],

        async init() {
            await this.loadCart();
            this.setupEventListeners();
            this.renderCart();
            this.updateTotal();
            this.updateBadges();
        },

        async loadCart() {
            try {
                const cartData = JSON.parse(localStorage.getItem('cart')) || [];
                const productPromises = cartData.map(async (cartItem) => {
                    try {
                        const id = typeof cartItem === 'object' ? cartItem.id : cartItem;
                        const quantity = typeof cartItem === 'object' ? cartItem.quantity : 1;
                        
                        const response = await fetch(`https://fakestoreapi.com/products/${id}`);
                        if (!response.ok) throw new Error('Product not found');
                        
                        const product = await response.json();
                        return {
                            id: product.id,
                            title: product.title,
                            price: Math.round(product.price * 23000),
                            image: product.image,
                            rating: product.rating.rate,
                            reviews: product.rating.count,
                            quantity: quantity
                        };
                    } catch (error) {
                        console.error('Error loading product:', error);
                        return null;
                    }
                });
                this.items = (await Promise.all(productPromises)).filter(item => item !== null);
            } catch (error) {
                console.error('Error loading cart:', error);
                this.items = [];
            }
        },

        setupEventListeners() {
            const clearCartBtn = document.getElementById('clearCart');
            if (clearCartBtn) {
                clearCartBtn.addEventListener('click', () => this.clearCart());
            }

            const productGrid = document.getElementById('productGrid');
            if (productGrid) {
                productGrid.addEventListener('click', (e) => {
                    const target = e.target.closest('button');
                    if (!target) return;

                    if (target.classList.contains('btn-danger')) {
                        const productId = parseInt(target.getAttribute('data-product-id'));
                        if (productId) this.removeItem(productId);
                    } else if (target.classList.contains('quantity-btn')) {
                        const productId = parseInt(target.getAttribute('data-product-id'));
                        const change = parseInt(target.getAttribute('data-change'));
                        if (productId && !isNaN(change)) {
                            const item = this.items.find(item => item.id === productId);
                            if (item) {
                                const newQuantity = item.quantity + change;
                                if (newQuantity >= 1) {
                                    this.updateQuantity(productId, newQuantity);
                                }
                            }
                        }
                    }
                });
            }
        },

        renderCart() {
            const productGrid = document.getElementById('productGrid');
            if (!productGrid) return;

            if (this.items.length === 0) {
                productGrid.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <h3>Giỏ hàng trống</h3>
                        <a href="index.html" class="btn btn-primary mt-3">Tiếp tục mua sắm</a>
                    </div>`;
                return;
            }

            productGrid.innerHTML = this.items.map(item => {
                const card = createProductCard(item);
                const itemTotal = item.price * item.quantity;
                return `
                    <div class="col">
                        <div class="card h-100">
                            ${card}
                            <div class="card-footer bg-white border-top-0">
                                <div class="d-flex flex-column gap-2">
                                    <div class="d-flex align-items-center justify-content-between">
                                        <div class="btn-group" role="group">
                                            <button class="btn btn-outline-secondary btn-sm quantity-btn" 
                                                data-product-id="${item.id}" 
                                                data-change="-1">-</button>
                                            <span class="btn btn-outline-secondary btn-sm disabled">${item.quantity}</span>
                                            <button class="btn btn-outline-secondary btn-sm quantity-btn" 
                                                data-product-id="${item.id}" 
                                                data-change="1">+</button>
                                        </div>
                                        <button class="btn btn-danger btn-sm" data-product-id="${item.id}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                    <div class="text-end">
                                        <strong>Tổng: ${new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(itemTotal)}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
            }).join('');
        },

        updateQuantity(productId, newQuantity) {
            if (newQuantity < 1) return;
            const item = this.items.find(item => item.id === productId);
            if (item) {
                item.quantity = newQuantity;
                this.saveCart();
                this.renderCart();
                this.updateTotal();
                showToast('Đã cập nhật số lượng');
            }
        },

        removeItem(productId) {
            this.items = this.items.filter(item => item.id !== productId);
            this.saveCart();
            this.renderCart();
            this.updateTotal();
            this.updateBadges();
            showToast('Đã xóa sản phẩm khỏi giỏ hàng');
        },

        clearCart() {
            this.items = [];
            this.saveCart();
            this.renderCart();
            this.updateTotal();
            this.updateBadges();
            showToast('Đã xóa toàn bộ giỏ hàng');
        },

        saveCart() {
            const cartData = this.items.map(item => ({
                id: item.id,
                quantity: item.quantity
            }));
            localStorage.setItem('cart', JSON.stringify(cartData));
        },

        updateTotal() {
            const totalElement = document.getElementById('cartTotal');
            if (totalElement) {
                const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                totalElement.textContent = new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                }).format(total);
            }
        },

        updateBadges() {
            const cartBadge = document.querySelector('a[href="cart.html"] .badge');
            if (cartBadge) {
                cartBadge.textContent = this.items.length;
            }
        }
    };

    window.cart = cart;
    cart.init();
});

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = 'position: fixed; top: 80px; right: 20px; z-index: 1000;';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    document.getElementById('toastContainer').appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}