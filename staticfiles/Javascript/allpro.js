const products = [
    {
        category: 'smartphone',
        name: 'SAMSUNG Galaxy A56 5G',
        image: "/static/images/mobile1.webp",
        rating: 4.8,
        stock: 12,
        price: 41999
    },
    {
        category: 'smartphone',
        name: 'Nothing Phone 3a',
        image: "/static/images/mobile2.webp",
        rating: 4.5,
        stock: 26,
        price: 24999
    },
    {
        category: 'smartphone',
        name: 'Motorola Edge 50 Fusion',
        image: "/static/images/mobile3.webp",
        rating: 4.4,
        stock: 30,
        price: 22999
    },
    {
        category: 'smartphone',
        name: 'Google Pixel 8a',
        image: "/static/images/mobile4.webp",
        rating: 4.3,
        stock: 18,
        price: 37999
    },
    {
        category: 'smartphone',
        name: 'Apple iPhone 15 (Black, 128 GB)',
        image: "/static/images/mobile5.webp",
        rating: 4.6,
        stock: 10,
        price: 64999
    },
    {
        category: 'smartphone',
        name: 'Apple iPhone 16 Pro Max (256 GB)',
        image: "/static/images/mobile6.webp",
        rating: 4.6,
        stock: 4,
        price: 135900
    },
    {
        category: 'smartphone',
        name: 'SAMSUNG Galaxy S25 Ultra 5G',
        image: "/static/images/mobile7.webp",
        rating: 4.8,
        stock: 8,
        price: 129999
    },
    {
        category: 'smartphone',
        name: 'vivo X200 Pro 5G',
        image: "/static/images/mobile8.webp",
        rating: 4.7,
        stock: 10,
        price: 94999
    },
    {
        category: 'laptop',
        name: 'Acer Aspire 7',
        image: "/static/images/laptop1.webp",
        rating: 4.3,
        stock: 4,
        price: 52990
    },
    {
        category: 'laptop',
        name: 'HP Victus Intel Core i5 12th Gen',
        image: "/static/images/laptop2.webp",
        rating: 4.7,
        stock: 10,
        price: 58990
    },
    {
        category: 'laptop',
        name: 'Apple MacBook AIR Apple M2',
        image: "/static/images/laptop3.webp",
        rating: 4.7,
        stock: 6,
        price: 79990
    },
    {
        category: 'laptop',
        name: 'SAMSUNG Galaxy Book5 Pro',
        image: "/static/images/laptop4.webp",
        rating: 4.7,
        stock: 2,
        price: 163990
    },
    {
        category: 'laptop',
        name: 'Lenovo IdeaPad Slim 5',
        image: "/static/images/laptop5.webp",
        rating: 4.2,
        stock: 7,
        price: 79190
    },
    {
        category: 'laptop',
        name: 'ASUS Vivobook 15',
        image: "/static/images/laptop6.webp",
        rating: 4.2,
        stock: 6,
        price: 48990
    },
    {
        category: 'laptop',
        name: 'Lenovo LOQ Intel Core i7 13th Gen',
        image: "/static/images/laptop7.webp",
        rating: 4.3,
        stock: 3,
        price: 95190
    },
    {
        category: 'laptop',
        name: 'Lenovo Yoga 7',
        image: "/static/images/laptop8.webp",
        rating: 4.5,
        stock: 3,
        price: 115390
    },
    {
        category: 'monitor',
        name: 'Lenovo (23.8 inch) Full HD Monitor',
        image: "/static/images/monitor1.webp",
        rating: 4.3,
        stock: 7,
        price: 5990
    },
    {
        category: 'monitor',
        name: 'SAMSUNG M5 (27 inch) Full HD',
        image: "/static/images/monitor2.webp",
        rating: 4.4,
        stock: 6,
        price: 14799
    },
    {
        category: 'monitor',
        name: 'Lenovo L-Series (27 inch) Full HD',
        image: "/static/images/monitor3.webp",
        rating: 4.1,
        stock: 3,
        price: 11249
    }
];

const productsGrid = document.getElementById('productsGrid');
const searchBox = document.getElementById('searchBox');
const filterButtons = document.querySelectorAll('.filter-btn');

// Asynchronous function to add product to cart (sends to backend)
async function addToCart(product) {
    // In a real app, this would be a user's unique ID from a login session.
    const cartId = 'techzone-user-cart-123'; 
    const productId = product.name.toLowerCase().replace(/[^a-z0-9]/g, '');

    const productData = {
        productId: productId,
        name: product.name,
        price: product.price,
        image: product.image
    };

    try {
        const response = await fetch(`http://localhost:3000/api/cart/${cartId}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            alert(`${product.name} has been added to your cart!`);
        } else {
            alert('Failed to add item to cart. The server may not be running or an error occurred.');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('An error occurred. The server may not be running.');
    }
}

function createProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card fade-in';
    productCard.dataset.category = product.category;
    productCard.dataset.product = product.name.toLowerCase();

    const inStockClass = product.stock > 0 ? 'stock' : 'stock out-of-stock';
    const inStockText = product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock';
    const buttonDisabled = product.stock === 0 ? 'disabled' : '';
    const buttonText = product.stock > 0 ? 'Add to Cart' : 'Out of Stock';
    
    // Format the price with a currency symbol
    const formattedPrice = `₹${product.price.toLocaleString()}`;

    productCard.innerHTML = `
        <div class="image-container">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-info">
            <div class="product-title">${product.name}</div>
            <div class="rating">
                <span class="star">★</span> ${product.rating} • <span class="${inStockClass}">${inStockText}</span>
            </div>
            <div class="price">${formattedPrice}</div>
            <button class="add-btn" ${buttonDisabled} onclick="addToCart(products.find(p => p.name === '${product.name}'))">
                <i class="fa-solid fa-cart-plus"></i> ${buttonText}
            </button>
        </div>
    `;
    return productCard;
}

function renderProducts(filteredProducts) {
    productsGrid.innerHTML = ''; // Clear existing products
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-results-message">
                <i class="fa-solid fa-box-open"></i>
                <p>No products found matching your criteria.</p>
            </div>
        `;
        productsGrid.style.display = 'block'; // Ensure it's a block to center content
    } else {
        productsGrid.style.display = 'grid'; // Set back to grid layout
        filteredProducts.forEach(product => {
            productsGrid.appendChild(createProductCard(product));
        });
    }
}

function filterProducts(category) {
    // Remove 'active' class from all buttons and add to the clicked one
    filterButtons.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.filter-btn[onclick="filterProducts('${category}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    const filtered = products.filter(product => {
        const matchesCategory = category === 'all' || product.category === category;
        return matchesCategory;
    });

    renderProducts(filtered);
}

function searchProducts() {
    const searchTerm = searchBox.value.toLowerCase();
    const activeCategory = document.querySelector('.filter-btn.active').getAttribute('onclick').match(/'([^']+)'/)[1];

    const filtered = products.filter(product => {
        const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });
    
    renderProducts(filtered);
}

// Event listeners
searchBox.addEventListener('input', searchProducts);
window.onload = () => filterProducts('all'); // Load all products on page load