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

    // Load initial products
    await loadInitialProducts();

    // Event Listeners
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

    // Handle product clicks
    productGrid.addEventListener('click', function(e) {
        const productLink = e.target.closest('a');
        if (productLink && !e.target.closest('button')) {
            e.preventDefault();
            const card = productLink.closest('.card');
            if (card && card.dataset.productId) {
                window.location.href = `product-detail.html?id=${card.dataset.productId}`;
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

        // Search filter
        if (query) {
            filtered = filtered.filter(product => 
                product.title.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query)
            );
        }

        // Category filter
        if (category) {
            filtered = filtered.filter(product => 
                product.category === category
            );
        }

        // Price filter
        if (priceRange) {
            const [min, max] = priceRange.split('-').map(Number);
            filtered = filtered.filter(product => {
                const priceInThousands = product.price / 1000;
                if (max) {
                    return priceInThousands >= min && priceInThousands <= max;
                }
                return priceInThousands >= min;
            });
        }

        // Sort products
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
            const card = createProductCard(product);
            return `
                <div class="col">
                    <div class="card" data-product-id="${product.id}">
                        ${card}
                    </div>
                </div>
            `;
        }).join('');

        if (typeof initializeProductActions === 'function') {
            initializeProductActions();
        }
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