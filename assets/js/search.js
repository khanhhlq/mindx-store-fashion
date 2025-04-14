document.addEventListener('DOMContentLoaded', async function() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    const productGrid = document.getElementById('productGrid');
    const noResults = document.querySelector('.no-results');
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    const sortFilter = document.getElementById('sortFilter');

    let currentProducts = [];

    await loadInitialProducts();

    searchButton.addEventListener('click', handleSearch);
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    });

    [categoryFilter, priceFilter, sortFilter].forEach(filter => {
        filter.addEventListener('change', () => {
            if (currentProducts.length === 0) {
                loadInitialProducts();
            } else {
                applyFilters();
            }
        });
    });

    productGrid.addEventListener('click', function(e) {
        const productLink = e.target.closest('a');
        if (productLink && !e.target.closest('button')) {
            e.preventDefault();
            const card = productLink.closest('.card');
            if (card && card.dataset.productId) {
                window.location.href = `product.html?id=${card.dataset.productId}`;
            }
        }
    });

    async function loadInitialProducts() {
        try {
            showLoadingState();
            const response = await fetch('https://fakestoreapi.com/products');
            const products = await response.json();
            currentProducts = transformProducts(products);
            searchResults.style.display = 'block';
            applyFilters();
        } catch (error) {
            showError();
        }
    }

    async function handleSearch() {
        const query = searchInput.value.trim();
        if (!query) return;

        if (currentProducts.length === 0) {
            await loadInitialProducts();
        }
        applyFilters();
    }

    function transformProducts(products) {
        return products.map(product => ({
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
    }

    function applyFilters() {
        let filtered = [...currentProducts];
        const query = searchInput.value.trim().toLowerCase();
        const category = categoryFilter.value;
        const priceRange = priceFilter.value;
        const sortBy = sortFilter.value;

        if (query) {
            filtered = filtered.filter(product => 
                product.title.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query)
            );
        }

        if (category) {
            filtered = filtered.filter(product => 
                product.category === category
            );
        }

        if (priceRange) {
            filtered = filtered.filter(product => {
                if (priceRange === 'Trên 500.000đ') {
                    return product.price > 500000;
                }
                
                const [min, max] = priceRange.split('-').map(Number);
                if (max) {
                    return product.price >= min * 1000 && product.price <= max * 1000;
                }
                return product.price >= min * 1000;
            });
        }

        if (sortBy) {
            const sortFunctions = {
                'price-asc': (a, b) => a.price - b.price,
                'price-desc': (a, b) => b.price - a.price,
                'name-asc': (a, b) => a.title.localeCompare(b.title),
                'name-desc': (a, b) => b.title.localeCompare(a.title)
            };
            filtered.sort(sortFunctions[sortBy]);
        }

        displayProducts(filtered);
    }

    function displayProducts(products) {
        if (products.length === 0) {
            noResults.style.display = 'block';
            productGrid.innerHTML = '';
            return;
        }

        noResults.style.display = 'none';
        productGrid.innerHTML = products.map(product => {
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
                button.innerHTML = 'Đã thêm vào giỏ';
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

    function showLoadingState() {
        productGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Đang tìm kiếm...</span>
                </div>
            </div>
        `;
    }

    function showError() {
        productGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger" role="alert">
                    Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.
                </div>
            </div>
        `;
    }
});