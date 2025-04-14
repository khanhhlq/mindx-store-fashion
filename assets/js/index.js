document.addEventListener('DOMContentLoaded', async function() {
    const productGrid = document.getElementById('productGrid');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

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

    async function initialize() {
        const products = await fetchProducts();
        const featuredProducts = products.slice(0, 8);
        
        if (productGrid) {
            productGrid.innerHTML = featuredProducts.map(renderProduct).join('');
            addProductEventListeners();
            updateButtonStates();
        }
    }

    initialize();

    // Search functionality
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
        });

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
                }
            }
        });
    }
});