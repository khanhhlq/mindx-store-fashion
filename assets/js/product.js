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
        this.setupActionButtons();
        updateBadges();
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

        const ratingStars = Array(5).fill('').map((_, index) => 
            `<i class="fas fa-star ${index < Math.floor(product.rating) ? 'text-warning' : 'text-muted'}"></i>`
        ).join('');
        document.querySelector('.rating').innerHTML = ratingStars;

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

        this.updateButtonStates();
    }

    setupActionButtons() {
        const addToCartBtn = document.getElementById('addToCartBtn');
        const addToWishlistBtn = document.getElementById('addToWishlistBtn');
        
        if (addToCartBtn) {
            addToCartBtn.onclick = () => {
                addToCart(this.productId);
                this.updateButtonStates();
            };
        }
        
        if (addToWishlistBtn) {
            addToWishlistBtn.onclick = () => {
                addToWishlist(this.productId);
                this.updateButtonStates();
            };
        }
    }

    updateButtonStates() {
        const addToCartBtn = document.getElementById('addToCartBtn');
        const addToWishlistBtn = document.getElementById('addToWishlistBtn');
        
        if (addToCartBtn) {
            const existingInCart = cart.includes(this.productId);
            addToCartBtn.textContent = existingInCart ? 'Đã thêm vào giỏ hàng' : 'Thêm vào giỏ hàng';
            addToCartBtn.classList.toggle('btn-secondary', existingInCart);
            addToCartBtn.classList.toggle('btn-danger', !existingInCart);
            addToCartBtn.disabled = existingInCart;
        }
        
        if (addToWishlistBtn) {
            const existingInWishlist = wishlist.includes(this.productId);
            addToWishlistBtn.classList.toggle('btn-danger', existingInWishlist);
            addToWishlistBtn.classList.toggle('btn-outline-secondary', !existingInWishlist);
            addToWishlistBtn.disabled = existingInWishlist;
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