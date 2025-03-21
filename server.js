const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(express.static(__dirname)); // Phục vụ file tĩnh từ thư mục gốc
app.use(cors());

// Đường dẫn tới file JSON
const productsFile = path.join(__dirname, 'products.json');
const usersFile = path.join(__dirname, 'users.json');

// Hàm khởi tạo file nếu không tồn tại hoặc trống
function initializeFile(filePath, initialData) {
    if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf8').trim() === '') {
        fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
    }
}

// Dữ liệu mẫu
const initialProducts = [
    { id: 1, name: "Áo thun trắng", price: 150000, image: "https://via.placeholder.com/150/ffffff/000000?text=Ao+Thun" },
    { id: 2, name: "Quần jeans rách", price: 300000, image: "https://via.placeholder.com/150/0000ff/ffffff?text=Quan+Jeans" },
    { id: 3, name: "Giày thể thao đen", price: 500000, image: "https://via.placeholder.com/150/000000/ffffff?text=Giay+The+Thao" }
];
const initialUsers = [
    { id: 1, username: "admin", password: "admin123", role: "admin" },
    { id: 2, username: "user", password: "user123", role: "user" }
];

// Khởi tạo file
initializeFile(productsFile, initialProducts);
initializeFile(usersFile, initialUsers);

// API đăng ký
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync(usersFile));
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ success: false, message: "Tên người dùng đã tồn tại!" });
    }
    const newUser = { id: users.length + 1, username, password, role: "user" };
    users.push(newUser);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    res.json({ success: true, message: "Đăng ký thành công!" });
});

// API đăng nhập
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync(usersFile));
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } else {
        res.status(401).json({ success: false, message: "Sai tên người dùng hoặc mật khẩu!" });
    }
});

// API lấy danh sách sản phẩm
app.get('/api/products', (req, res) => {
    try {
        const products = JSON.parse(fs.readFileSync(productsFile));
        res.json(products);
    } catch (error) {
        console.error('Lỗi khi đọc products.json:', error);
        res.status(500).json({ success: false, message: "Lỗi server khi tải sản phẩm!" });
    }
});

// API thêm sản phẩm
app.post('/api/products', (req, res) => {
    const { name, price, image } = req.body;
    const products = JSON.parse(fs.readFileSync(productsFile));
    const newProduct = { id: products.length + 1, name, price, image };
    products.push(newProduct);
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
    res.json({ success: true, product: newProduct });
});

// API chỉnh sửa sản phẩm
app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, price, image } = req.body;
    const products = JSON.parse(fs.readFileSync(productsFile));
    const productIndex = products.findIndex(p => p.id === parseInt(id));
    if (productIndex !== -1) {
        products[productIndex] = { id: parseInt(id), name, price, image };
        fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
        res.json({ success: true, product: products[productIndex] });
    } else {
        res.status(404).json({ success: false, message: "Sản phẩm không tồn tại!" });
    }
});

// API xóa sản phẩm
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const products = JSON.parse(fs.readFileSync(productsFile));
    const newProducts = products.filter(p => p.id !== parseInt(id));
    if (newProducts.length !== products.length) {
        fs.writeFileSync(productsFile, JSON.stringify(newProducts, null, 2));
        res.json({ success: true, message: "Xóa sản phẩm thành công!" });
    } else {
        res.status(404).json({ success: false, message: "Sản phẩm không tồn tại!" });
    }
});

// API lấy danh sách người dùng (cho admin)
app.get('/api/users', (req, res) => {
    const users = JSON.parse(fs.readFileSync(usersFile));
    res.json(users);
});

// API thêm vào giỏ hàng (giả lập)
app.post('/api/cart', (req, res) => {
    const { id } = req.body;
    const products = JSON.parse(fs.readFileSync(productsFile));
    if (products.find(p => p.id === id)) {
        res.json({ success: true, message: "Đã thêm vào giỏ hàng!" });
    } else {
        res.status(404).json({ success: false, message: "Sản phẩm không tồn tại!" });
    }
});

// Chạy server
app.listen(3000, () => {
    console.log('Server đang chạy trên cổng 3000. Mở file index.html để sử dụng.');
});