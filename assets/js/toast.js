function showToast(message, type = 'success') {
    const toast = document.querySelector('.toast');
    const toastBody = toast.querySelector('.toast-body');
    
    // Set message and type
    toastBody.textContent = message;
    toast.classList.remove('bg-success', 'bg-danger');
    toast.classList.add(`bg-${type === 'success' ? 'success' : 'danger'}`);
    
    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast, {
        delay: 3000
    });
    bsToast.show();
}