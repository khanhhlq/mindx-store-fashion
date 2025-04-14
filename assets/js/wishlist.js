document.addEventListener('DOMContentLoaded', () => {
    const wishlistPage = {
        items: [],

        async init() {
            await this.loadWishlist();
            this.setupEventListeners();
            this.renderWishlist();
            this.updateBadges();
        },

        async loadWishlist() {
            try {
                const wishlistIds = JSON.parse(localStorage.getItem('wishlist')) || [];
                window.wishlist = wishlistIds;

                const productPromises = wishlistIds.map(async (id) => {
                    try {
                        const response = await fetch(`https://fakestoreapi.com/products/${id}`);
                        if (!response.ok) {
                            window.wishlist = window.wishlist.filter(wId => wId !== id);
                            localStorage.setItem('wishlist', JSON.stringify(window.wishlist));
                            throw new Error('Product not found');
                        }
                        
                        const product = await response.json();
                        return {
                            id: product.id,
                            title: product.title,
                            price: Math.round(product.price * 23000),
                            image: product.image,
                            rating: product.rating.rate,
                            reviews: product.rating.count,
                            category: product.category,
                            isNew: Math.random() < 0.3,
                            discount: Math.random() < 0.4 ? Math.floor(Math.random() * 30) + 5 : 0
                        };
                    } catch (error) {
                        console.error(`Error loading product ${id}:`, error);
                        return null;
                    }
                });

                this.items = (await Promise.all(productPromises)).filter(item => item !== null);
                this.saveWishlist();
                this.updateBadges();
            } catch (error) {
                console.error('Error loading wishlist:', error);
                this.items = [];
                this.saveWishlist();
                this.updateBadges();
            }
        },

        updateBadges() {
            const wishlistBadge = document.querySelector('a[href="wishlist.html"] .badge');
            const cartBadge = document.querySelector('a[href="cart.html"] .badge');
            
            if (wishlistBadge) {
                wishlistBadge.textContent = window.wishlist?.length || 0;
            }
            if (cartBadge) {
                const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
                cartBadge.textContent = cartItems.length;
            }
        },

        saveWishlist() {
            window.wishlist = this.items.map(item => item.id);
            localStorage.setItem('wishlist', JSON.stringify(window.wishlist));
        },

        setupEventListeners() {
            const clearWishlistBtn = document.getElementById('clearWishlist');
            if (clearWishlistBtn) {
                clearWishlistBtn.addEventListener('click', () => {
                    this.clearWishlist();
                });
            }

            const productGrid = document.getElementById('productGrid');
            if (productGrid) {
                productGrid.addEventListener('click', (e) => {
                    const deleteBtn = e.target.closest('.remove-wishlist-btn');
                    if (deleteBtn) {
                        const productId = parseInt(deleteBtn.dataset.productId);
                        if (productId) {
                            this.removeItem(productId);
                        }
                    }

                    const addToCartBtn = e.target.closest('.add-to-cart-btn');
                    if (addToCartBtn) {
                        const productId = addToCartBtn.dataset.productId;
                        addToCart(productId);
                        updateButtonStates();
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
                        <i class="fas fa-heart-broken fa-3x text-muted mb-3"></i>
                        <h3>Danh sách yêu thích trống</h3>
                        <p class="text-muted">Bạn chưa có sản phẩm nào trong danh sách yêu thích</p>
                        <a href="index.html" class="btn btn-primary mt-3">
                            <i class="fas fa-shopping-bag me-2"></i>Tiếp tục mua sắm
                        </a>
                    </div>`;
                return;
            }

            productGrid.innerHTML = this.items.map(item => {
                const discountedPrice = item.discount ? Math.round(item.price / (1 - item.discount / 100)) : null;
                
                return `
                    <div class="col">
                        <div class="card h-100" data-product-id="${item.id}">
                            <a href="product.html?id=${item.id}" class="text-decoration-none">
                                <div class="position-relative">
                                    <img src="${item.image}" class="card-img-top p-3" alt="${item.title}" style="height: 200px; object-fit: contain;">
                                    ${item.discount ? `
                                        <div class="position-absolute top-0 start-0 m-3">
                                            <span class="badge bg-danger">-${item.discount}%</span>
                                        </div>
                                    ` : ''}
                                    ${item.isNew ? `
                                        <div class="position-absolute top-0 end-0 m-3">
                                            <span class="badge bg-success">Mới</span>
                                        </div>
                                    ` : ''}
                                </div>
                            </a>
                            <div class="card-body d-flex flex-column">
                                <a href="product.html?id=${item.id}" class="text-decoration-none text-dark">
                                    <h5 class="card-title text-truncate">${item.title}</h5>
                                </a>
                                <div class="mb-2">
                                    <div class="text-warning">
                                        ${Array(Math.floor(item.rating)).fill('<i class="fas fa-star"></i>').join('')}
                                    </div>
                                    <small class="text-muted">(${item.reviews} đánh giá)</small>
                                </div>
                                <div class="mt-auto">
                                    <div class="d-flex align-items-center gap-2 mb-3">
                                        <span class="h5 text-danger m-0">${new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(item.price)}</span>
                                        ${discountedPrice ? `
                                            <span class="text-muted text-decoration-line-through">${new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND'
                                            }).format(discountedPrice)}</span>
                                        ` : ''}
                                    </div>
                                    <div class="d-flex justify-content-between gap-2">
                                        <button class="btn btn-danger flex-grow-1 add-to-cart-btn" data-product-id="${item.id}">
                                            <i class="fas fa-shopping-cart me-2"></i>Thêm vào giỏ
                                        </button>
                                        <button class="btn btn-outline-danger remove-wishlist-btn" data-product-id="${item.id}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            updateButtonStates();
        },

        removeItem(productId) {
            const product = this.items.find(item => item.id === productId);
            if (!product) return;

            this.items = this.items.filter(item => item.id !== productId);
            this.saveWishlist();
            this.renderWishlist();
            this.updateBadges();
            createToast(`Đã xóa ${product.title} khỏi danh sách yêu thích`);
        },

        clearWishlist() {
            this.items = [];
            this.saveWishlist();
            this.renderWishlist();
            this.updateBadges();
            createToast('Đã xóa tất cả sản phẩm khỏi danh sách yêu thích');
        }
    };

    window.wishlistPage = wishlistPage;
    wishlistPage.init();
});