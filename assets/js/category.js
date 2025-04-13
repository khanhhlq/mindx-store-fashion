document.addEventListener('DOMContentLoaded', async function() {
    // Fetch products from API
    async function fetchProducts() {
        try {
            const response = await fetch('https://fakestoreapi.com/products');
            let products = await response.json();
            
            // Transform API data
            products = products.map(product => ({
                id: product.id,
                title: product.title,
                price: Math.round(product.price * 300000), // Convert USD to VND
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

    // Function to render products
    function renderProducts(productsToRender) {
        const productGrid = document.getElementById('productGrid');
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
        
        productGrid.innerHTML = productsToRender.map(product => createProductCard(product)).join('');
    }

    // Initialize with loading state
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
            </div>
        </div>
    `;

    // Fetch and store products
    const products = await fetchProducts();
    window.allProducts = products;

    // Initial render
    renderProducts(products);

    // Handle category filtering
    const categoryItems = document.querySelectorAll('#categoryList .list-group-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            categoryItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.dataset.category;
            const filteredProducts = category === 'all' ? 
                window.allProducts : 
                window.allProducts.filter(p => p.category === category);
            
            renderProducts(filteredProducts);
        });
    });

    // Handle price filtering
    document.getElementById('applyPriceFilter').addEventListener('click', function() {
        const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
        const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
        
        const filteredProducts = window.allProducts.filter(p => 
            p.price >= minPrice && p.price <= maxPrice
        );
        
        // Reset category selection
        categoryItems.forEach(i => i.classList.remove('active'));
        categoryItems[0].classList.add('active');
        
        renderProducts(filteredProducts);
    });

    // Handle clear filters
    document.getElementById('clearFilters').addEventListener('click', function() {
        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';
        document.getElementById('sortSelect').value = 'default';
        categoryItems.forEach(i => i.classList.remove('active'));
        categoryItems[0].classList.add('active');
        renderProducts(window.allProducts);
    });

    // Handle sorting
    document.getElementById('sortSelect').addEventListener('change', function() {
        const sortValue = this.value;
        const currentProducts = [...window.allProducts];
        
        switch(sortValue) {
            case 'price-asc':
                currentProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                currentProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                currentProducts.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'name-desc':
                currentProducts.sort((a, b) => b.title.localeCompare(a.title));
                break;
            default:
                // Keep original order
                break;
        }
        
        renderProducts(currentProducts);
    });
});