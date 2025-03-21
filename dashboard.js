document.addEventListener('DOMContentLoaded', () => {
    const userList = document.getElementById('user-list');
    const productList = document.getElementById('admin-product-list');
    const logoutLink = document.getElementById('logout-link');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    logoutLink.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // Lấy danh sách người dùng
    fetch('http://localhost:3000/api/users')
        .then(response => response.json())
        .then(users => {
            users.forEach(user => {
                const userItem = document.createElement('div');
                userItem.classList.add('user-item');
                userItem.innerHTML = `${user.username} (${user.role})`;
                userList.appendChild(userItem);
            });
        });

    // Lấy danh sách sản phẩm
    fetch('http://localhost:3000/api/products')
        .then(response => response.json())
        .then(products => {
            products.forEach(product => {
                const productItem = document.createElement('div');
                productItem.classList.add('admin-product-item');
                productItem.innerHTML = `
                    <span>${product.name} - ${product.price.toLocaleString('vi-VN')} VNĐ</span>
                    <div>
                        <button onclick="editProduct(${product.id})">Sửa</button>
                        <button onclick="deleteProduct(${product.id})">Xóa</button>
                    </div>
                `;
                productList.appendChild(productItem);
            });
        });

    window.addProduct = function() {
        const name = document.getElementById('product-name').value;
        const price = parseInt(document.getElementById('product-price').value);
        const image = document.getElementById('product-image').value;
        fetch('http://localhost:3000/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price, image })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            }
        });
    };

    window.editProduct = function(id) {
        const name = prompt('Nhập tên mới:');
        const price = parseInt(prompt('Nhập giá mới:'));
        const image = prompt('Nhập URL hình ảnh mới:');
        fetch(`http://localhost:3000/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price, image })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            }
        });
    };

    window.deleteProduct = function(id) {
        if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
            fetch(`http://localhost:3000/api/products/${id}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                }
            });
        }
    };
});