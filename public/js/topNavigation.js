/**
 * topNavigation.js
 * A modular component to create the top navigation bar for the Sports Social App dashboard.
 * Includes user profile information, icon links, and a static motivational quote.
 */

/**
 * Initialize the top navigation bar and inject it into the specified container
 * @param {string} selector - CSS selector for the container element
 * @param {Object} options - Configuration options
 * @returns {void}
 */
function initTopNavigation(selector, options = {}) {
    console.log('Initializing top navigation bar...');
    
    // Get the container element
    const container = document.querySelector(selector);
    if (!container) {
        console.error(`Container element not found: ${selector}`);
        return;
    }
    
    // Default options
    const defaultOptions = {
        quote: "Champions keep playing until they get it right.",
        tabSwitchFn: null, // Function to call when tabs are switched
    };
    
    // Merge default options with provided options
    const config = { ...defaultOptions, ...options };
    
    // Load user data and render navigation
    loadUserDataAndRender(container, config);
}

/**
 * Load user data from the DataModel and render the navigation
 * @param {HTMLElement} container - The container element
 * @param {Object} config - Configuration options
 */
async function loadUserDataAndRender(container, config) {
    try {
        // Get current user data from the DataModel
        const userData = await DataModel.getCurrentUser();
        console.log('User data received:', userData); // Debug log
        
        if (!userData) {
            console.error('Failed to load user data');
            renderNavWithoutUserData(container, config);
            return;
        }
        
        // Your API already returns fields in camelCase (fullName), 
        // so we can use it directly
        const currentUser = {
            fullName: userData.fullName,
            username: userData.username
        };
        
        console.log('User data for navigation:', currentUser); // Debug log
        
        renderNavigation(container, currentUser, config);
    } catch (error) {
        console.error('Error loading user data:', error);
        renderNavWithoutUserData(container, config);
    }
}

/**
 * Generate user initials from their name
 * @param {Object} user - User object with name data
 * @returns {string} - User initials (2 characters)
 */
function generateUserInitials(user) {
    // Try to use fullName if available
    if (user.fullName) {
        const nameParts = user.fullName.split(' ');
        if (nameParts.length >= 2) {
            return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
        }
        // If only one name part, use first two letters
        return user.fullName.substring(0, 2).toUpperCase();
    }
    
    // Fall back to username
    if (user.username) {
        return user.username.substring(0, 2).toUpperCase();
    }
    
    // Last resort
    return 'US';
}

/**
 * Render the navigation with user data
 * @param {HTMLElement} container - The container element
 * @param {Object} user - User data
 * @param {Object} config - Configuration options
 */
function renderNavigation(container, user, config) {
    // Generate user initials
    const initials = generateUserInitials(user);
    
    // Create the navigation HTML
    const navHTML = `
        <div class="top-nav">
            <div class="nav-left">
                <div class="motivational-quote">
                    <em>"${config.quote}"</em>
                </div>
            </div>
            
            <div class="nav-right">
                <div class="nav-icons">
                    <a href="#" class="nav-icon-link calendar-link" title="Calendar">
                        <i class="fa-solid fa-calendar-days"></i>
                    </a>
                    <a href="#" class="nav-icon-link scorecard-link" title="Scorecard">
                        <i class="fa-solid fa-chart-line"></i>
                    </a>
                </div>
                
                <div class="user-profile">
                    <div class="user-initials">${initials}</div>
                    <div class="user-info">
                        <div class="user-name">${user.fullName || user.username}</div>
                        <div class="user-username">${user.username}</div>
                    </div>
                    <a href="#" class="profile-link">Go to Profile →</a>
                </div>
            </div>
        </div>
    `;
    
    // Insert the navigation HTML
    container.innerHTML = navHTML;
    
    // Add the navigation styles
    addNavigationStyles();
    
    // Add event listeners
    addEventListeners(container, config);
}

/**
 * Render navigation without user data (fallback)
 * @param {HTMLElement} container - The container element
 * @param {Object} config - Configuration options
 */
function renderNavWithoutUserData(container, config) {
    // Create the navigation HTML with default user info
    const navHTML = `
        <div class="top-nav">
            <div class="nav-left">
                <div class="motivational-quote">
                    <em>"${config.quote}"</em>
                </div>
            </div>
            
            <div class="nav-right">
                <div class="nav-icons">
                    <a href="#" class="nav-icon-link calendar-link" title="Calendar">
                        <i class="fa-solid fa-calendar-days"></i>
                    </a>
                    <a href="#" class="nav-icon-link scorecard-link" title="Scorecard">
                        <i class="fa-solid fa-chart-line"></i>
                    </a>
                </div>
                
                <div class="user-profile">
                    <div class="user-initials">US</div>
                    <div class="user-info">
                        <div class="user-name">User</div>
                        <div class="user-username">user</div>
                    </div>
                    <a href="#" class="profile-link">Go to Profile →</a>
                </div>
            </div>
        </div>
    `;
    
    // Insert the navigation HTML
    container.innerHTML = navHTML;
    
    // Add the navigation styles
    addNavigationStyles();
    
    // Add event listeners
    addEventListeners(container, config);
}

/**
 * Add event listeners to navigation elements
 * @param {HTMLElement} container - The container element
 * @param {Object} config - Configuration options
 */
function addEventListeners(container, config) {
    // Calendar icon click event
    const calendarLink = container.querySelector('.calendar-link');
    if (calendarLink) {
        calendarLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof config.tabSwitchFn === 'function') {
                config.tabSwitchFn('calendar');
            } else {
                // Fallback: find tab button and click it
                const tabButton = document.querySelector('.tab-button[data-tab="calendar"]');
                if (tabButton) {
                    tabButton.click();
                }
            }
        });
    }
    
    // Scorecard icon click event
    const scorecardLink = container.querySelector('.scorecard-link');
    if (scorecardLink) {
        scorecardLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof config.tabSwitchFn === 'function') {
                config.tabSwitchFn('scorecard');
            } else {
                // Fallback: find tab button and click it
                const tabButton = document.querySelector('.tab-button[data-tab="scorecard"]');
                if (tabButton) {
                    tabButton.click();
                }
            }
        });
    }
    
    // Profile link click event
    const profileLink = container.querySelector('.profile-link');
    if (profileLink) {
        profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof config.tabSwitchFn === 'function') {
                config.tabSwitchFn('profile');
            } else {
                // Fallback: find tab button and click it
                const tabButton = document.querySelector('.tab-button[data-tab="profile"]');
                if (tabButton) {
                    tabButton.click();
                }
            }
        });
    }
}

/**
 * Add the navigation styles to the document
 */
function addNavigationStyles() {
    // Check if styles are already added
    if (document.getElementById('top-nav-styles')) {
        return;
    }
    
    // Create style element
    const styleElement = document.createElement('style');
    styleElement.id = 'top-nav-styles';
    
    // Define styles
    const styles = `
        .top-nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 24px;
            background-color: white;
            border-radius: 16px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            margin-bottom: 20px;
            font-family: "Urbanist", sans-serif;
        }

        .nav-left {
            flex: 1;
        }

        .motivational-quote {
            font-size: 18px;
            color: #666;
            font-style: italic;
        }

        .nav-right {
            display: flex;
            align-items: center;
            gap: 24px;
        }

        .nav-icons {
            display: flex;
            gap: 16px;
        }

        .nav-icon-link {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 40px;
            height: 40px;
            background-color: #f5f5f5;
            border-radius: 50%;
            color: #4caf50;
            text-decoration: none;
            transition: background-color 0.2s ease;
        }

        .nav-icon-link:hover {
            background-color: #e0f2e1;
        }

        .nav-icon-link i {
            font-size: 18px;
        }

        .user-profile {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .user-initials {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 40px;
            height: 40px;
            background-color: #4caf50;
            color: white;
            border-radius: 50%;
            font-weight: 600;
            font-size: 16px;
        }

        .user-info {
            display: flex;
            flex-direction: column;
        }

        .user-name {
            font-weight: 600;
            font-size: 16px;
            color: #121212;
        }

        .user-username {
            font-size: 12px;
            color: #666;
        }

        .profile-link {
            display: inline-block;
            padding: 6px 12px;
            background-color: #f5f5f5;
            color: #4caf50;
            border-radius: 6px;
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
            transition: background-color 0.2s ease;
        }

        .profile-link:hover {
            background-color: #e0f2e1;
        }

        /* Responsive styles */
        @media (max-width: 768px) {
            .top-nav {
                flex-direction: column;
                gap: 12px;
                padding: 16px;
            }
            
            .nav-left {
                width: 100%;
                text-align: center;
            }
            
            .motivational-quote {
                font-size: 16px;
            }
            
            .nav-right {
                width: 100%;
                justify-content: space-between;
            }
        }
        
        @media (max-width: 480px) {
            .user-profile {
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }
            
            .user-info {
                text-align: center;
            }
        }
    `;
    
    // Add styles to the style element
    styleElement.textContent = styles;
    
    // Append style element to the head
    document.head.appendChild(styleElement);
}

// Export the initialization function
window.initTopNavigation = initTopNavigation;