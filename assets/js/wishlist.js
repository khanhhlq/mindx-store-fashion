document.addEventListener('DOMContentLoaded', () => {
    const wishlist = {
        items: [],

        async init() {
            await this.loadWishlist();
            this.setupEventListeners();
            this.renderWishlist();
            this.updateBadges();
        },

        async loadWishlist() {
            try {
                const wishlistItems = JSON.parse(localStorage.getItem('wishlist')) || [];
                const productPromises = wishlistItems.map(async (id) => {
                    try {
                        const response = await fetch(`https://fakestoreapi.com/products/${id}`);
                        if (!response.ok) throw new Error('Product not found');
                        
                        const product = await response.json();
                        return {
                            id: product.id,
                            title: product.title,
                            price: Math.round(product.price * 23000),
                            image: product.image,
                            rating: product.rating.rate,
                            reviews: product.rating.count
                        };
                    } catch (error) {
                        console.error(`Error loading product ${id}:`, error);
                        return null;
                    }
                });
                this.items = (await Promise.all(productPromises)).filter(item => item !== null);
            } catch (error) {
                console.error('Error loading wishlist:', error);
                this.items = [];
            }
        },

        setupEventListeners() {
            const clearWishlistBtn = document.getElementById('clearWishlist');
            if (clearWishlistBtn) {
                clearWishlistBtn.addEventListener('click', () => {
                    if (confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?')) {
                        this.clearWishlist();
                    }
                });
            }

            const productGrid = document.getElementById('productGrid');
            if (productGrid) {
                productGrid.addEventListener('click', (e) => {
                    const target = e.target.closest('button');
                    if (!target) return;

                    if (target.classList.contains('btn-danger')) {
                        const productId = parseInt(target.getAttribute('data-product-id'));
                        if (productId) {
                            if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách yêu thích?')) {
                                this.removeItem(productId);
                            }
                        }
                    }
                });
            }
        },

        renderWishlist() {
            const productGrid = document.getElementById('productGrid');
            if (!productGrid) return;

            if (this.items.length === 0) {
                productGrid.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <h3>Danh sách yêu thích trống</h3>
                        <a href="index.html" class="btn btn-primary mt-3">Tiếp tục mua sắm</a>
                    </div>`;
                return;
            }

            productGrid.innerHTML = this.items.map(item => {
                const card = createProductCard(item);
                return `
                    <div class="col">
                        <div class="card h-100">
                            ${card}
                            <div class="card-footer bg-white border-top-0">
                                <div class="d-flex justify-content-end">
                                    <button class="btn btn-danger btn-sm" data-product-id="${item.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>`;
            }).join('');
        },

        removeItem(productId) {
            const product = this.items.find(item => item.id === productId);
            this.items = this.items.filter(item => item.id !== productId);
            this.saveWishlist();
            this.renderWishlist();
            this.updateBadges();
            
            // Show toast notification
            const toast = document.querySelector('.toast');
            const toastBody = toast.querySelector('.toast-body');
            toastBody.textContent = `Đã xóa ${product.title} khỏi danh sách yêu thích`;
            const bsToast = new bootstrap.Toast(toast);
            bsToast.show();
        },

        clearWishlist() {
            this.items = [];
            this.saveWishlist();
            this.renderWishlist();
            this.updateBadges();
            
            // Show toast notification
            const toast = document.querySelector('.toast');
            const toastBody = toast.querySelector('.toast-body');
            toastBody.textContent = 'Đã xóa tất cả sản phẩm khỏi danh sách yêu thích';
            const bsToast = new bootstrap.Toast(toast);
            bsToast.show();
        },

        saveWishlist() {
            localStorage.setItem('wishlist', JSON.stringify(this.items.map(item => item.id)));
        },

        updateBadges() {
            const wishlistBadge = document.querySelector('a[href="wishlist.html"] .badge');
            if (wishlistBadge) {
                wishlistBadge.textContent = this.items.length;
            }
        }
    };

    window.wishlist = wishlist;
    wishlist.init();
});