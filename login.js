/**
 * VR Music - Authentication Logic (Login & Registration Flow)
 * Integrates with mock-backend.js local persistent database.
 */
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginTabBtn = document.getElementById('tab-login');
    const signupTabBtn = document.getElementById('tab-signup');
    const signupName = document.getElementById('signup-name');
    const signupEmail = document.getElementById('signup-email');
    const signupPassword = document.getElementById('signup-password');

    // Create Alert Banner dynamically
    const alertBanner = document.createElement('div');
    alertBanner.className = 'alert-banner';
    alertBanner.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <span class="alert-msg"></span>`;
    document.body.appendChild(alertBanner);

    function showAlert(message, isSuccess = false) {
        alertBanner.classList.remove('success');
        if (isSuccess) alertBanner.classList.add('success');
        
        alertBanner.querySelector('.alert-msg').textContent = message;
        alertBanner.querySelector('i').className = isSuccess ? "fa-solid fa-circle-check" : "fa-solid fa-circle-exclamation";
        alertBanner.classList.add('show');

        setTimeout(() => {
            alertBanner.classList.remove('show');
        }, 4000);
    }

    // Toggle Login / Signup Tabs
    if (loginTabBtn && signupTabBtn) {
        loginTabBtn.addEventListener('click', () => {
            loginTabBtn.classList.add('active');
            signupTabBtn.classList.remove('active');
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
        });

        signupTabBtn.addEventListener('click', () => {
            signupTabBtn.classList.add('active');
            loginTabBtn.classList.remove('active');
            signupForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        });
    }

    // Handle Login Submission
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            if (!email || !password) {
                showAlert('Please enter both email and password');
                return;
            }

            const btn = loginForm.querySelector('.login-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';
            btn.style.opacity = '0.7';
            btn.style.pointerEvents = 'none';

            // Connect to Mock Backend
            setTimeout(() => {
                const response = window.MockBackend.login(email, password);
                if (response.success) {
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> Success!';
                    btn.style.background = 'linear-gradient(90deg, #22C55E, #10B981)';
                    showAlert('Access Granted! Redirecting...', true);
                    
                    setTimeout(() => {
                        window.location.href = 'redesign.html';
                    }, 1000);
                } else {
                    btn.innerHTML = originalText;
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                    showAlert(response.error || 'Authentication failed');
                }
            }, 1000);
        });
    }

    // Handle Signup Submission
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = signupName.value.trim();
            const email = signupEmail.value.trim();
            const password = signupPassword.value;

            if (!name || !email || !password) {
                showAlert('Please fill in all registration fields');
                return;
            }

            const btn = signupForm.querySelector('.login-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';
            btn.style.opacity = '0.7';
            btn.style.pointerEvents = 'none';

            // Connect to Mock Backend Signup
            setTimeout(() => {
                const response = window.MockBackend.signup(name, email, password);
                if (response.success) {
                    showAlert('Account created successfully! Switching to Login...', true);
                    
                    // Switch to login tab
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.style.opacity = '1';
                        btn.style.pointerEvents = 'auto';
                        signupName.value = '';
                        signupEmail.value = '';
                        signupPassword.value = '';
                        
                        // Switch tab visually
                        loginTabBtn.click();
                        // Autofill login email
                        document.getElementById('email').value = email;
                    }, 1200);
                } else {
                    btn.innerHTML = originalText;
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                    showAlert(response.error || 'Registration failed');
                }
            }, 1000);
        });
    }
});

// Google Sign-In Simulation
function openGoogleLogin() {
    const width = 500;
    const height = 600;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    const popup = window.open('google-signin.html', 'GoogleSignIn',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=no,resizable=no`);

    const timer = setInterval(() => {
        if (popup && popup.closed) {
            clearInterval(timer);
            const loggedInEmail = localStorage.getItem('userEmail');
            if (loggedInEmail) {
                // Autoregister Google user if they don't exist
                const user = window.MockBackend.getCurrentUser();
                if (!user) {
                    const name = loggedInEmail.split('@')[0];
                    window.MockBackend.signup(name, loggedInEmail, "googleauth_bypasstoken123");
                }
                
                // Set mock JWT
                const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + btoa(JSON.stringify({ email: loggedInEmail, role: "user" })) + ".signature";
                localStorage.setItem("userToken", mockToken);

                // Show visual feedback and redirect
                const activeForm = document.querySelector('form:not(.hidden)');
                const btn = activeForm.querySelector('.login-btn');
                if (btn) {
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> Connected via Google';
                    btn.style.background = 'linear-gradient(90deg, #22C55E, #10B981)';
                }
                
                setTimeout(() => {
                    window.location.href = 'redesign.html';
                }, 1000);
            }
        }
    }, 500);
}

// Global hook
window.openGoogleLogin = openGoogleLogin;
