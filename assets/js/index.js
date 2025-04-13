document.addEventListener('DOMContentLoaded', async function() {
    // Fetch featured products
    async function fetchProducts() {
        try {
            const response = await fetch('https://fakestoreapi.com/products?limit=8');
            let products = await response.json();
            
            // Format the products
            products = products.map(product => ({
                id: product.id,
                title: product.title,
                price: Math.round(product.price * 23000), // Convert to VND
                image: product.image,
                rating: product.rating.rate,
                reviews: product.rating.count
            }));

            const productGrid = document.getElementById('productGrid');
            if (productGrid) {
                productGrid.innerHTML = products.map(product => createProductCard(product)).join('');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            const productGrid = document.getElementById('productGrid');
            if (productGrid) {
                productGrid.innerHTML = `
                    <div class="col-12 text-center">
                        <p>Không thể tải sản phẩm. Vui lòng thử lại sau.</p>
                    </div>`;
            }
        }
    }

    await fetchProducts();
});