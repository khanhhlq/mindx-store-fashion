class ProductPage {
    constructor() {
        this.productId = new URLSearchParams(window.location.search).get('id');
        this.currentProduct = null;
        this.init();
    }

    async init() {
        if (!this.productId) {
            window.location.href = 'index.html';
            return;
        }

        await this.loadProduct();
        this.setupEventListeners();
        updateBadges();
        this.updateButtonStates();
    }

    async loadProduct() {
        try {
            const response = await fetch(`https://fakestoreapi.com/products/${this.productId}`);
            if (!response.ok) throw new Error('Product not found');
            
            const product = await response.json();
            this.currentProduct = this.transformProduct(product);
            this.displayProduct(this.currentProduct);
        } catch (error) {
            console.error('Error loading product:', error);
            this.showError();
        }
    }

    transformProduct(product) {
        return {
            id: product.id,
            title: product.title,
            price: Math.round(product.price * 23000),
            image: product.image,
            rating: product.rating.rate,
            reviews: product.rating.count,
            category: product.category,
            description: product.description,
            isNew: Math.random() < 0.3,
            discount: Math.random() < 0.4 ? Math.floor(Math.random() * 30) + 5 : 0
        };
    }

    displayProduct(product) {
        document.title = `${product.title} - MindX Store`;
        
        document.getElementById('mainImage').src = product.image;
        document.getElementById('productTitle').textContent = product.title;
        document.getElementById('productRating').textContent = product.rating;
        document.getElementById('productReviews').textContent = `${product.reviews} đánh giá`;
        document.getElementById('productDescription').textContent = product.description;
        document.getElementById('productBreadcrumb').textContent = product.title;

        const ratingStars = document.createElement('div');
        ratingStars.className = 'rating-stars d-inline-block';
        ratingStars.innerHTML = Array(5).fill('').map((_, index) => 
            `<i class="fas fa-star ${index < Math.floor(product.rating) ? 'text-warning' : 'text-muted'}"></i>`
        ).join('');
        document.querySelector('.rating').innerHTML = ratingStars.innerHTML;

        const formattedPrice = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(product.price);

        if (product.discount) {
            const originalPrice = Math.round(product.price / (1 - product.discount / 100));
            document.getElementById('productDiscount').textContent = `-${product.discount}%`;
            document.getElementById('originalPrice').textContent = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(originalPrice);
            document.getElementById('productDiscount').style.display = 'inline-block';
            document.getElementById('originalPrice').style.display = 'inline-block';
        }

        document.getElementById('productPrice').textContent = formattedPrice;

        const categoryLink = document.querySelector('.breadcrumb-item.category a');
        if (categoryLink) {
            categoryLink.textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1);
            categoryLink.href = `category.html?category=${encodeURIComponent(product.category)}`;
        }
    }

    updateButtonStates() {
        const addToCartBtn = document.getElementById('addToCartBtn');
        const addToWishlistBtn = document.getElementById('addToWishlistBtn');
        
        if (addToCartBtn && this.currentProduct) {
            const existingInCart = cart.find(item => item === this.currentProduct.id);
            if (existingInCart) {
                addToCartBtn.textContent = 'Đã thêm vào giỏ hàng';
                addToCartBtn.classList.remove('btn-danger');
                addToCartBtn.classList.add('btn-secondary');
                addToCartBtn.disabled = true;
            } else {
                addToCartBtn.textContent = 'Thêm vào giỏ hàng';
                addToCartBtn.classList.add('btn-danger');
                addToCartBtn.classList.remove('btn-secondary');
                addToCartBtn.disabled = false;
            }
        }

        if (addToWishlistBtn && this.currentProduct) {
            const existingInWishlist = wishlist.includes(this.currentProduct.id);
            if (existingInWishlist) {
                addToWishlistBtn.classList.add('btn-danger');
                addToWishlistBtn.classList.remove('btn-outline-secondary');
                addToWishlistBtn.disabled = true;
            } else {
                addToWishlistBtn.classList.remove('btn-danger');
                addToWishlistBtn.classList.add('btn-outline-secondary');
                addToWishlistBtn.disabled = false;
            }
        }
    }

    setupEventListeners() {
        const quantityInput = document.getElementById('quantity');
        const decreaseBtn = document.getElementById('decreaseQuantity');
        const increaseBtn = document.getElementById('increaseQuantity');

        if (quantityInput && decreaseBtn && increaseBtn) {
            decreaseBtn.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value);
                if (currentValue > 1) {
                    quantityInput.value = currentValue - 1;
                }
            });

            increaseBtn.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value);
                quantityInput.value = currentValue + 1;
            });

            quantityInput.addEventListener('change', () => {
                let value = parseInt(quantityInput.value);
                if (isNaN(value) || value < 1) {
                    value = 1;
                }
                quantityInput.value = value;
            });
        }

        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                if (!this.currentProduct) return;
                addToCart(this.currentProduct.id);
                this.updateButtonStates();
            });
        }

        const addToWishlistBtn = document.getElementById('addToWishlistBtn');
        if (addToWishlistBtn) {
            addToWishlistBtn.addEventListener('click', () => {
                if (!this.currentProduct) return;
                addToWishlist(this.currentProduct.id);
                this.updateButtonStates();
            });
        }
    }

    showError() {
        const productDetail = document.getElementById('productDetail');
        if (productDetail) {
            productDetail.innerHTML = `
                <div class="col-12 text-center py-5">
                    <h2>Không tìm thấy sản phẩm</h2>
                    <p class="text-muted">Sản phẩm không tồn tại hoặc đã bị xóa.</p>
                    <a href="index.html" class="btn btn-primary mt-3">Quay lại trang chủ</a>
                </div>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ProductPage();
});