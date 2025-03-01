// Tab switching
document.addEventListener('DOMContentLoaded', () => {
    const loginTab = document.getElementById('login-tab');
    const createAccountTab = document.getElementById('create-account-tab');
    const logonForm = document.getElementById('logon-form');
    const createAccountForm = document.getElementById('create-account-form');
    const messageEl = document.getElementById('message');

    // Check if we're already logged in
    const token = localStorage.getItem('jwtToken');
    if (token) {
        window.location.href = '/dashboard';
    }

    loginTab.addEventListener('click', () => {
        logonForm.classList.add('active-form');
        createAccountForm.classList.remove('active-form');
        loginTab.classList.add('active');
        createAccountTab.classList.remove('active');
        messageEl.textContent = '';
        messageEl.className = 'message';
    });

    createAccountTab.addEventListener('click', () => {
        createAccountForm.classList.add('active-form');
        logonForm.classList.remove('active-form');
        createAccountTab.classList.add('active');
        loginTab.classList.remove('active');
        messageEl.textContent = '';
        messageEl.className = 'message';
    });

    // Logon form submission
    logonForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();
            if (response.ok) {
                localStorage.setItem('jwtToken', result.token);
                window.location.href = '/dashboard';
            } else {
                messageEl.textContent = result.message;
                messageEl.classList.add('error');
            }
        } catch (error) {
            console.error('Error:', error);
            messageEl.textContent = 'An error occurred. Please try again later.';
            messageEl.classList.add('error');
        }
    });

    // Create account form submission
    createAccountForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('create-email').value;
        const password = document.getElementById('create-password').value;
        const fullName = document.getElementById('create-fullname')?.value || 'User';
        const username = document.getElementById('create-username')?.value || email;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username, 
                    email, 
                    password, 
                    full_name: fullName 
                }),
            });

            const result = await response.json();
            if (response.ok) {
                messageEl.textContent = 'Account created successfully! You can now log in.';
                messageEl.classList.add('success');
                document.getElementById('login-email').value = username;
                document.getElementById('login-password').value = password;
                logonForm.classList.add('active-form');
                createAccountForm.classList.remove('active-form');
                loginTab.classList.add('active');
                createAccountTab.classList.remove('active');
            } else {
                messageEl.textContent = result.message;
                messageEl.classList.add('error');
            }
        } catch (error) {
            console.error('Error:', error);
            messageEl.textContent = 'An error occurred. Please try again later.';
            messageEl.classList.add('error');
        }
    });
});