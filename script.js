document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');
    const cartCount = document.getElementById('cart-count');
    const loading = document.getElementById('loading');
    const authSection = document.getElementById('auth');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');
    const dashboardLink = document.getElementById('dashboard-link');
    let cart = 0;

    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    updateAuthUI();

    loading.style.display = 'block';
    fetch('http://localhost:3000/api/products')
        .then(response => response.json())
        .then(products => {
            loading.style.display = 'none';
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.classList.add('product-card');
                productCard.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>${product.price.toLocaleString('vi-VN')} VNĐ</p>
                    <button onclick="addToCart(${product.id})">Thêm vào giỏ</button>
                `;
                productList.appendChild(productCard);
            });
        })
        .catch(error => {
            loading.style.display = 'none';
            productList.innerHTML = '<p>Không thể tải sản phẩm. Vui lòng kiểm tra server!</p>';
        });

    loginLink.addEventListener('click', () => {
        authSection.style.display = 'block';
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });

    registerLink.addEventListener('click', () => {
        authSection.style.display = 'block';
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });

    logoutLink.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        currentUser = null;
        updateAuthUI();
    });

    window.login = function() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentUser = data.user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                updateAuthUI();
                authSection.style.display = 'none';
                alert('Đăng nhập thành công!');
            } else {
                alert(data.message);
            }
        });
    };

    window.register = function() {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.success) {
                authSection.style.display = 'none';
            }
        });
    };

    window.addToCart = function(id) {
        fetch('http://localhost:3000/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                cart++;
                cartCount.textContent = cart;
                alert(data.message);
            }
        });
    };

    function updateAuthUI() {
        if (currentUser) {
            loginLink.style.display = 'none';
            registerLink.style.display = 'none';
            logoutLink.style.display = 'inline';
            dashboardLink.style.display = currentUser.role === 'admin' ? 'inline' : 'none';
        } else {
            loginLink.style.display = 'inline';
            registerLink.style.display = 'inline';
            logoutLink.style.display = 'none';
            dashboardLink.style.display = 'none';
        }
    }
});