document.addEventListener('DOMContentLoaded', async function() {
    const categoryTitle = document.getElementById('categoryTitle');
    const productGrid = document.getElementById('productGrid');
    const categoryParam = new URLSearchParams(window.location.search).get('category');

    let allProducts = [];

    async function fetchProducts() {
        try {
            const response = await fetch('https://fakestoreapi.com/products');
            let products = await response.json();
            
            products = products.map(product => ({
                id: product.id,
                title: product.title,
                price: Math.round(product.price * 23000),
                image: product.image,
                rating: product.rating.rate,
                reviews: product.rating.count,
                category: product.category,
                isNew: Math.random() < 0.3,
                discount: Math.random() < 0.4 ? Math.floor(Math.random() * 30) + 5 : 0
            }));

            return products;
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }

    function renderProducts(productsToRender) {
        if (!productGrid) return;
        
        if (productsToRender.length === 0) {
            productGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                    <h4 class="text-muted">Không tìm thấy sản phẩm nào</h4>
                </div>
            `;
            return;
        }
        
        productGrid.innerHTML = productsToRender.map(product => {
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
        }).join('');

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

        updateButtonStates();
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

    async function initialize() {
        allProducts = await fetchProducts();
        
        if (categoryParam) {
            const decodedCategory = decodeURIComponent(categoryParam);
            const filteredProducts = allProducts.filter(p => p.category === decodedCategory);
            if (categoryTitle) {
                categoryTitle.textContent = decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1);
            }
            renderProducts(filteredProducts);
        } else {
            const categories = [...new Set(allProducts.map(p => p.category))];
            renderCategories(categories);
        }
    }

    function renderCategories(categories) {
        if (!productGrid) return;

        productGrid.innerHTML = categories.map(category => `
            <div class="col">
                <a href="category.html?category=${encodeURIComponent(category)}" class="text-decoration-none">
                    <div class="card h-100 text-center">
                        <div class="card-body">
                            <i class="fas fa-${getCategoryIcon(category)} fa-3x mb-3"></i>
                            <h5 class="card-title">${category.charAt(0).toUpperCase() + category.slice(1)}</h5>
                            <p class="text-muted mb-0">${allProducts.filter(p => p.category === category).length} sản phẩm</p>
                        </div>
                    </div>
                </a>
            </div>
        `).join('');
    }

    function getCategoryIcon(category) {
        const icons = {
            "men's clothing": 'tshirt',
            "women's clothing": 'female',
            'jewelery': 'gem',
            'electronics': 'laptop'
        };
        return icons[category] || 'box';
    }

    initialize();
});