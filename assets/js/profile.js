document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!auth.currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Update profile information
    const userEmail = document.querySelector('.user-email');
    const userName = document.querySelector('.user-name');
    if (userEmail) userEmail.textContent = auth.currentUser.email;
    if (userName) userName.textContent = auth.currentUser.fullName || 'Tên người dùng';

    // Fill form with user data
    const emailInput = document.getElementById('email');
    const fullNameInput = document.getElementById('fullName');
    const phoneInput = document.getElementById('phone');
    const dobInput = document.getElementById('dob');
    const addressInput = document.getElementById('address');

    if (emailInput) emailInput.value = auth.currentUser.email;
    if (fullNameInput) fullNameInput.value = auth.currentUser.fullName || '';
    if (phoneInput) phoneInput.value = auth.currentUser.phone || '';
    if (dobInput) dobInput.value = auth.currentUser.dob || '';
    if (addressInput) addressInput.value = auth.currentUser.address || '';

    // Handle profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            try {
                // Get user data
                const users = JSON.parse(localStorage.getItem('users') || '{}');
                const user = users[auth.currentUser.email];

                // Update user data
                user.fullName = fullNameInput.value;
                user.phone = phoneInput.value;
                user.dob = dobInput.value;
                user.address = addressInput.value;

                // Save to localStorage
                users[auth.currentUser.email] = user;
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('currentUser', JSON.stringify(user));

                // Update UI
                if (userName) userName.textContent = user.fullName || 'Tên người dùng';

                showToast('Cập nhật thông tin thành công!', 'success');
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }

    // Handle password form submission
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            try {
                // Validate passwords
                if (!currentPassword || !newPassword || !confirmPassword) {
                    throw new Error('Vui lòng điền đầy đủ thông tin');
                }

                if (newPassword !== confirmPassword) {
                    throw new Error('Mật khẩu mới không khớp');
                }

                if (newPassword.length < 6) {
                    throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
                }

                // Change password
                auth.changePassword(currentPassword, newPassword);
                
                // Clear form
                passwordForm.reset();
                
                showToast('Đổi mật khẩu thành công!', 'success');
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }
});