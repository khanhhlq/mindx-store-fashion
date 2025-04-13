const auth = {
    currentUser: null,

    init() {
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.updateUI();
        } else {
            // Only redirect to login if we're not already on login or register page
            const currentPath = window.location.pathname.toLowerCase();
            if (!currentPath.includes('login.html') && !currentPath.includes('register.html')) {
                window.location.href = 'login.html';
            }
        }
    },

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const profileDropdown = document.querySelector('.profile-dropdown');
        const userEmail = document.querySelector('.user-email');

        if (this.currentUser) {
            loginBtn?.classList.add('d-none');
            profileDropdown?.classList.remove('d-none');
            if (userEmail) {
                userEmail.textContent = this.currentUser.email;
            }
        } else {
            loginBtn?.classList.remove('d-none');
            profileDropdown?.classList.add('d-none');
        }
    },

    login(email, password) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const user = users[email];

        if (!user || user.password !== password) {
            throw new Error('Email hoặc mật khẩu không đúng');
        }

        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'index.html';
    },

    register(email, password) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');

        if (users[email]) {
            throw new Error('Email đã tồn tại');
        }

        const user = { email, password };
        users[email] = user;
        localStorage.setItem('users', JSON.stringify(users));

        // Remove auto-login after registration
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        
        // Redirect to login page instead of index
        window.location.href = 'login.html';
    },

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        window.location.href = 'login.html';
    },

    changePassword(currentPassword, newPassword) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const user = users[this.currentUser.email];

        if (!user || user.password !== currentPassword) {
            throw new Error('Mật khẩu hiện tại không đúng');
        }

        user.password = newPassword;
        users[this.currentUser.email] = user;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
};

// Handle logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        auth.logout();
    });
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    auth.init();
});