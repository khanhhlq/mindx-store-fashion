// Cart and wishlist storage management
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// Update badges
function updateBadges() {
    const cartBadge = document.querySelector('a[href="cart.html"] .badge');
    const wishlistBadge = document.querySelector('a[href="wishlist.html"] .badge');
    
    if (cartBadge) cartBadge.textContent = cart.length;
    if (wishlistBadge) wishlistBadge.textContent = wishlist.length;
}

// Create toast function
function createToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container') || (() => {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(container);
        return container;
    })();

    const toastElement = document.createElement('div');
    toastElement.className = 'toast';
    toastElement.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">${type === 'success' ? 'Thành công' : 'Thông báo'}</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body bg-${type} text-white">
            ${message}
        </div>
    `;

    toastContainer.appendChild(toastElement);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();

    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Add to cart function
function addToCart(productId) {
    try {
        // Check if product already exists in cart
        const existingProduct = cart.find(item => item === productId);
        
        if (!existingProduct) {
            cart.push(productId);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateBadges();
            createToast('Đã thêm vào giỏ hàng!');
        } else {
            createToast('Sản phẩm đã có trong giỏ hàng!', 'warning');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        createToast('Có lỗi xảy ra khi thêm vào giỏ hàng!', 'danger');
    }
}

// Add to wishlist function
function addToWishlist(productId) {
    try {
        if (!wishlist.includes(productId)) {
            wishlist.push(productId);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            updateBadges();
            createToast('Đã thêm vào danh sách yêu thích!');
        } else {
            createToast('Sản phẩm đã có trong danh sách yêu thích!', 'warning');
        }
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        createToast('Có lỗi xảy ra khi thêm vào danh sách yêu thích!', 'danger');
    }
}

// Initialize badges on page load
document.addEventListener('DOMContentLoaded', () => {
    updateBadges();
});