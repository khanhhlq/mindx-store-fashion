function renderProduct(product) {
    const discountedPrice = product.discount ? Math.round(product.price / (1 - product.discount / 100)) : null;
    
    return `
        <div class="col">
            <div class="card h-100" data-product-id="${product.id}">
                <a href="product.html?id=${product.id}" class="text-decoration-none">
                    <div class="position-relative">
                        <img src="${product.image}" class="card-img-top p-3" alt="${product.title}" style="height: 200px; object-fit: contain;">
                        ${product.discount ? `
                            <div class="position-absolute top-0 start-0 m-3">
                                <span class="badge bg-danger">-${product.discount}%</span>
                            </div>
                        ` : ''}
                        ${product.isNew ? `
                            <div class="position-absolute top-0 end-0 m-3">
                                <span class="badge bg-success">Mới</span>
                            </div>
                        ` : ''}
                    </div>
                </a>
                <div class="card-body d-flex flex-column">
                    <a href="product.html?id=${product.id}" class="text-decoration-none text-dark">
                        <h5 class="card-title text-truncate">${product.title}</h5>
                    </a>
                    <div class="mb-2">
                        <div class="text-warning">
                            ${Array(Math.floor(product.rating)).fill('<i class="fas fa-star"></i>').join('')}
                        </div>
                        <small class="text-muted">(${product.reviews} đánh giá)</small>
                    </div>
                    <div class="mt-auto">
                        <div class="d-flex align-items-center gap-2 mb-3">
                            <span class="h5 text-danger m-0">${new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(product.price)}</span>
                            ${discountedPrice ? `
                                <span class="text-muted text-decoration-line-through">${new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(discountedPrice)}</span>
                            ` : ''}
                        </div>
                        <div class="d-flex justify-content-between gap-2">
                            <button class="btn btn-danger flex-grow-1 add-to-cart-btn" data-product-id="${product.id}">
                                <i class="fas fa-shopping-cart me-2"></i>Thêm vào giỏ
                            </button>
                            <button class="btn btn-outline-secondary add-to-wishlist-btn" data-product-id="${product.id}">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function updateButtonStates() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const addToWishlistButtons = document.querySelectorAll('.add-to-wishlist-btn');

    addToCartButtons.forEach(button => {
        const productId = button.dataset.productId;
        const existingInCart = cart.includes(productId);
        if (existingInCart) {
            button.innerHTML = '<i class="fas fa-shopping-cart me-2"></i>Đã thêm vào giỏ';
            button.classList.replace('btn-danger', 'btn-secondary');
            button.disabled = true;
        }
    });

    addToWishlistButtons.forEach(button => {
        const productId = button.dataset.productId;
        const existingInWishlist = wishlist.includes(productId);
        if (existingInWishlist) {
            button.classList.replace('btn-outline-secondary', 'btn-danger');
            button.disabled = true;
        }
    });
}

function addProductEventListeners() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const addToWishlistButtons = document.querySelectorAll('.add-to-wishlist-btn');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            addToCart(productId);
            updateButtonStates();
        });
    });

    addToWishlistButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            addToWishlist(productId);
            updateButtonStates();
        });
    });
}