function createProductCard(product) {
    const formattedPrice = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(product.price);

    return `
    <div class="col">
        <div class="card h-100">
            <div class="position-relative">
                ${product.discount ? `<div class="badge bg-danger position-absolute top-0 start-0 m-2">-${product.discount}%</div>` : ''}
                ${product.isNew ? '<div class="badge bg-success position-absolute top-0 end-0 m-2">New</div>' : ''}
                <img src="${product.image}" class="card-img-top p-3" alt="${product.title}" style="height: 200px; object-fit: contain;">
            </div>
            <div class="card-body d-flex flex-column">
                <h5 class="card-title text-truncate">${product.title}</h5>
                <div class="mb-2">
                    <div class="text-warning">
                        ${Array(Math.floor(product.rating)).fill('<i class="fas fa-star"></i>').join('')}
                    </div>
                    <small class="text-muted">(${product.reviews} đánh giá)</small>
                </div>
                <div class="mt-auto">
                    <div class="h5 mb-3 text-danger">${formattedPrice}</div>
                    <div class="d-grid gap-2">
                        <button class="btn btn-danger" onclick="addToCart('${product.id}')">
                            <i class="fas fa-shopping-cart me-2"></i>Thêm vào giỏ
                        </button>
                        <button class="btn btn-outline-danger" onclick="addToWishlist('${product.id}')">
                            <i class="fas fa-heart me-2"></i>Yêu thích
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}