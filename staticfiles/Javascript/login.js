// Optional: Add form validation and interactions
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const signInBtn = document.querySelector('.sign-in-btn');
    
    // Handle sign in button click (redirect to login page)
    if (signInBtn) {
        signInBtn.addEventListener('click', function() {
            window.location.href = '/login/';  // Update with your login URL
        });
    }
    
    // Form validation
    if (form) {
        form.addEventListener('submit', function(e) {
            const inputs = form.querySelectorAll('input[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.style.borderColor = '#dc3545';
                    isValid = false;
                } else {
                    input.style.borderColor = '#e1e5e9';
                }
            });
            
            // Password confirmation validation
            const password1 = document.getElementById('id_password1');
            const password2 = document.getElementById('id_password2');
            
            if (password1 && password2 && password1.value !== password2.value) {
                password2.style.borderColor = '#dc3545';
                isValid = false;
            }
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    }
    
    // Remove error styling on input
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            this.style.borderColor = '#e1e5e9';
        });
        
        input.addEventListener('focus', function() {
            this.style.borderColor = '#667eea';
        });
        
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.style.borderColor = '#e1e5e9';
            }
        });
    });
    
    // Real-time password confirmation validation
    const password1 = document.getElementById('id_password1');
    const password2 = document.getElementById('id_password2');
    
    if (password1 && password2) {
        function validatePasswordMatch() {
            if (password2.value !== '' && password1.value !== password2.value) {
                password2.style.borderColor = '#dc3545';
            } else {
                password2.style.borderColor = '#e1e5e9';
            }
        }
        
        password1.addEventListener('input', validatePasswordMatch);
        password2.addEventListener('input', validatePasswordMatch);
    }
});