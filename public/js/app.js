const API_URL = '/api';

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadDashboardData();
    setupEventListeners();
});

function getToken() {
    return localStorage.getItem('smart_token');
}

function checkAuth() {
    const token = getToken();
    const user = JSON.parse(localStorage.getItem('smart_user') || '{}');
    
    if (token) {
        document.getElementById('loggedInUserName').innerText = user.name || 'Authorized Member';
        document.getElementById('logoutBtn').classList.remove('hidden');
        document.getElementById('secretLoginTrigger').classList.add('hidden');
        if (user.role === 'admin') {
            document.getElementById('memberNavBtn').classList.remove('hidden');
        }
    } else {
        document.getElementById('loggedInUserName').innerText = 'Public View (Restricted)';
        document.getElementById('logoutBtn').classList.add('hidden');
        document.getElementById('secretLoginTrigger').classList.remove('hidden');
        document.getElementById('memberNavBtn').classList.add('hidden');
    }
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.nav-links li').forEach(item => {
        item.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-links li').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            
            item.classList.add('active');
            const target = item.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
            document.getElementById('pageTitle').innerText = item.innerText.trim();

            // Load data based on tab
            if (target === 'investorsTab') loadInvestors();
            if (target === 'productsTab') loadProducts();
            if (target === 'ordersTab') { loadProductsForDropdown(); loadOrders(); }
            if (target === 'auditTab') loadAuditLogs();
        });
    });

    // Secret Login Modal Triggers
    document.getElementById('secretLoginTrigger').addEventListener('click', () => {
        document.getElementById('loginOverlay').classList.remove('hidden');
    });
    document.getElementById('closeLoginBtn').addEventListener('click', () => {
        document.getElementById('loginOverlay').classList.add('hidden');
    });

    // Login Form Submit
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('smart_token', data.token);
                localStorage.setItem('smart_user', JSON.stringify(data.user));
                alert('Login Successful!');
                document.getElementById('loginOverlay').classList.add('hidden');
                checkAuth();
                loadDashboardData();
            } else {
                alert(data.error || 'Login failed!');
            }
        } catch (err) {
            alert('Server error during login.');
        }
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('smart_token');
        localStorage.removeItem('smart_user');
        checkAuth();
        alert('Logged out successfully.');
        location.reload();
    });

    // Add Investor Form
    document.getElementById('investorForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('investorName').value;
        const amount = document.getElementById('investorAmount').value;

        const res = await fetch(`${API_URL}/investors/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ name, amount })
        });
        if (res.ok) {
            alert('Investment saved!');
            document.getElementById('investorForm').reset();
            loadInvestors();
            loadDashboardData();
        } else {
            alert('Failed to save investment (Are you logged in?).');
        }
    });

    // Add Product Form
    document.getElementById('productForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('productName').value;
        const quantity = document.getElementById('productQty').value;
        const buyingPrice = document.getElementById('productBuyingPrice').value;
        const extraCost = document.getElementById('productExtraCost').value || 0;

        const res = await fetch(`${API_URL}/products/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ name, quantity, buyingPrice, extraCost })
        });
        if (res.ok) {
            alert('Product stock updated!');
            document.getElementById('productForm').reset();
            loadProducts();
            loadDashboardData();
        } else {
            alert('Failed to update product (Are you logged in?).');
        }
    });

    // Create Order Form
    document.getElementById('orderForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            customerName: document.getElementById('custName').value,
            customerPhone: document.getElementById('custPhone').value,
            productName: document.getElementById('orderProductName').value,
            quantity: document.getElementById('orderQty').value,
            sellingPrice: document.getElementById('orderSellingPrice').value,
            courierCharge: document.getElementById('orderCourierCharge').value
        };

        const res = await fetch(`${API_URL}/orders/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
            alert('Order placed successfully!');
            document.getElementById('orderForm').reset();
            loadOrders();
            loadDashboardData();
        } else {
            alert(data.error || 'Failed to place order.');
        }
    });

    // Add New Member Form
    document.getElementById('memberForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('newMemberName').value;
        const email = document.getElementById('newMemberEmail').value;
        const password = document.getElementById('newMemberPassword').value;

        const res = await fetch(`${API_URL}/auth/add-member`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (res.ok) {
            alert('New member created successfully!');
            document.getElementById('memberForm').reset();
        } else {
            alert(data.error || 'Failed to create member.');
        }
    });
}

// Data Fetching Functions
async function loadDashboardData() {
    try {
        const [invRes, prodRes, ordRes] = await Promise.all([
            fetch(`${API_URL}/investors`, { headers: { 'Authorization': `Bearer ${getToken()}` } }),
            fetch(`${API_URL}/products`, { headers: { 'Authorization': `Bearer ${getToken()}` } }),
            fetch(`${API_URL}/orders`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
        ]);

        const invData = invRes.ok ? await invRes.json() : { totalInvestment: 0 };
        const prodList = prodRes.ok ? await prodRes.json() : [];
        const ordList = ordRes.ok ? await ordRes.json() : [];

        let totalExpense = prodList.reduce((sum, p) => sum + ((p.buyingPrice + (p.extraCost || 0)) * p.quantity), 0);
        let totalProfit = ordList.reduce((sum, o) => sum + o.profit, 0);
        let totalBalance = (invData.totalInvestment + totalProfit) - totalExpense;

        document.getElementById('totalInvestmentVal').innerText = `BDT ${invData.totalInvestment}`;
        document.getElementById('totalExpenseVal').innerText = `BDT ${totalExpense}`;
        document.getElementById('totalProfitVal').innerText = `BDT ${totalProfit}`;
        document.getElementById('totalBalanceVal').innerText = `BDT ${totalBalance}`;
    } catch (err) {
        console.error('Error loading dashboard stats', err);
    }
}

async function loadInvestors() {
    const res = await fetch(`${API_URL}/investors`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
    if (!res.ok) return;
    const data = await res.json();
    
    // Calculate total net profit for share distribution
    const ordRes = await fetch(`${API_URL}/orders`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
    const ordList = ordRes.ok ? await ordRes.json() : [];
    let totalProfit = ordList.reduce((sum, o) => sum + o.profit, 0);

    const tbody = document.querySelector('#investorTable tbody');
    tbody.innerHTML = '';

    data.investors.forEach(inv => {
        let sharePercent = data.totalInvestment > 0 ? ((inv.totalInvestment / data.totalInvestment) * 100).toFixed(2) : 0;
        let estimatedReturn = ((sharePercent / 100) * totalProfit).toFixed(2);

        tbody.innerHTML += `
            <tr>
                <td>${inv.name}</td>
                <td>BDT ${inv.totalInvestment}</td>
                <td>${sharePercent}%</td>
                <td>BDT ${estimatedReturn}</td>
            </tr>
        `;
    });
}

async function loadProducts() {
    const res = await fetch(`${API_URL}/products`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
    if (!res.ok) return;
    const products = await res.json();

    const tbody = document.querySelector('#productTable tbody');
    tbody.innerHTML = '';
    products.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td>${p.name}</td>
                <td>${p.quantity}</td>
                <td>BDT ${p.buyingPrice}</td>
                <td>BDT ${p.extraCost || 0}</td>
            </tr>
        `;
    });
}

async function loadProductsForDropdown() {
    const res = await fetch(`${API_URL}/products`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
    if (!res.ok) return;
    const products = await res.json();

    const datalist = document.getElementById('productListOptions');
    datalist.innerHTML = '';
    products.forEach(p => {
        datalist.innerHTML += `<option value="${p.name}">Stock: ${p.quantity} | Price: ${p.buyingPrice}</option>`;
    });
}

async function loadOrders() {
    const res = await fetch(`${API_URL}/orders`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
    if (!res.ok) return;
    const orders = await res.json();

    const tbody = document.querySelector('#orderTable tbody');
    tbody.innerHTML = '';
    orders.setup = orders.forEach(o => {
        tbody.innerHTML += `
            <tr>
                <td>${o.customerName}</td>
                <td>${o.customerPhone}</td>
                <td>${o.productName}</td>
                <td>${o.quantity}</td>
                <td>BDT ${o.sellingPrice}</td>
                <td>BDT ${o.profit}</td>
                <td>BDT ${o.courierCharge}</td>
                <td>${o.status}</td>
            </tr>
        `;
    });
}

async function loadAuditLogs() {
    const res = await fetch(`${API_URL}/reports/audit-logs`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
    if (!res.ok) return;
    const logs = await res.json();

    const tbody = document.querySelector('#auditTable tbody');
    tbody.innerHTML = '';
    logs.forEach(l => {
        tbody.innerHTML += `
            <tr>
                <td>${l.userName}</td>
                <td>${l.action}</td>
                <td>${l.details}</td>
                <td>${new Date(l.timestamp).toLocaleString()}</td>
            </tr>
        `;
    });
}