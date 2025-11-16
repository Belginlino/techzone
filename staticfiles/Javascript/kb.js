// Search functionality
const searchBox = document.getElementById('searchBox');
const searchIcon = document.getElementById('searchIcon');
const searchContainer = document.querySelector('.search-container');
const productCards = document.querySelectorAll('.product-card');
const productsGrid = document.getElementById('productsGrid');

function handleSearch() {
    const query = searchBox.value.toLowerCase().trim();
    let visibleCount = 0;
    
    productCards.forEach(card => {
        const productName = card.getAttribute('data-product');
        const title = card.querySelector('.product-title').textContent.toLowerCase();
        
        if (title.includes(query) || productName.includes(query) || query === "") {
            card.style.display = "block";
            card.classList.add('fade-in');
            visibleCount++;
        } else {
            card.style.display = "none";
            card.classList.remove('fade-in');
        }
    });

    // Show "No products found" message if no matches
    if (visibleCount === 0 && query !== "") {
        showNoResultsMessage();
    } else {
        hideNoResultsMessage();
    }
}

function showNoResultsMessage() {
    let noResultsMsg = document.getElementById('no-results');
    if (!noResultsMsg) {
        noResultsMsg = document.createElement('div');
        noResultsMsg.id = 'no-results';
        noResultsMsg.className = 'no-results-message';
        noResultsMsg.innerHTML = `
            <div>
                <i class="fa-solid fa-search"></i>
                <p>No smartwatches found matching your search.</p>
                <small>Try searching for "Samsung", "Apple", "GPS" or "Military"</small>
            </div>
        `;
        productsGrid.appendChild(noResultsMsg);
    }
    noResultsMsg.style.display = 'block';
}

function hideNoResultsMessage() {
    const noResultsMsg = document.getElementById('no-results');
    if (noResultsMsg) {
        noResultsMsg.style.display = 'none';
    }
}

// Add to cart functionality
function addToCart(productId) {
    const button = event.target.closest('.add-btn');
    const originalHTML = button.innerHTML;
    
    // Show loading state
    button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Adding...';
    button.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Show success state
        button.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
        button.style.background = '#28a745';
        
        // Reset after 2 seconds
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = '#6c42f5';
            button.disabled = false;
        }, 2000);
    }, 500);
    
    console.log('Added to cart:', productId);
}

// Search event listeners
searchBox.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleSearch();
    }
});

searchBox.addEventListener('input', handleSearch);
searchIcon.addEventListener('click', handleSearch);

// Search focus effects
searchBox.addEventListener('focus', function() {
    searchContainer.classList.add('active');
});

searchBox.addEventListener('blur', function() {
    searchContainer.classList.remove('active');
});

// Add hover effects to product cards
productCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Initialize search on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add fade-in animation to all cards initially
    productCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * 100);
    });
});