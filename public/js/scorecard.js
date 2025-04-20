// Scorecard.js - Handles all scorecard-related functionality

/**
 * Initialize the Scorecard Module
 */
async function initializeScorecard() {
     const scorecardDetails = document.getElementById('scorecardDetails');
    if (scorecardDetails) {
        scorecardDetails.innerHTML = `
            <div class="scorecard-card">
                <div class="scorecard-card-header">
                    <div>
                        <h3 class="scorecard-card-title">Your Scorecard</h3>
                        <p class="scorecard-card-subtitle">Welcome to your sports activity and performance tracker!</p>
                    </div>
                </div>
                <p>Your scorecard is ready to track your sports activity. As you join events and log performances, you'll see statistics and charts here.</p>
                <p>Try joining some events or logging your first performance to get started!</p>
            </div>
        `;
    }
    try {
        // Render the scorecard content
        await renderScorecard();
        
        // Set up event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing scorecard:', error);
        document.getElementById('scorecardDetails').innerHTML = 
            '<div class="error-message">Error loading scorecard data. Please try again later.</div>';
    }
}

/**
 * Render the scorecard content
 */
/**
 * Render the scorecard content
 */
async function renderScorecard() {
    const scorecardDetails = document.getElementById('scorecardDetails');
    
    if (!scorecardDetails) {
        console.error('Scorecard container not found');
        return;
    }
    
    scorecardDetails.innerHTML = '<div class="loading-message">Loading scorecard data...</div>';
    
    try {
        // Fetch user data
        const userData = await DataModel.getCurrentUser();
        
        // Fetch user's events data
        const joinedEvents = await DataModel.getJoinedEvents();
        const createdEvents = await DataModel.getMyEvents();
        
        // Fetch user's teams data
        const userTeams = await DataModel.getMyTeams();
        
        // Initialize empty performance data array
        let performanceData = [];
        
        // Only try to fetch performance data if the endpoint is implemented
        try {
            performanceData = await DataModel.getUserPerformance();
        } catch (error) {
            console.warn('No performance data yet:', error);
            performanceData = [];
        }
        
        // Generate stats based on the retrieved data
        const stats = generateStats(joinedEvents, createdEvents, userTeams, performanceData);
        
        // Generate achievements based on stats
        const achievements = generateAchievements(stats);
        
        // Render the scorecard UI with a welcome message for first-time users
        const isFirstTime = joinedEvents.length === 0 && performanceData.length === 0;
        
        if (isFirstTime) {
            // Show a welcome message for first-time users
            scorecardDetails.innerHTML = createWelcomeScorecardHTML(userData);
        } else {
            // Show the full scorecard for returning users
            scorecardDetails.innerHTML = createScorecardHTML(userData, stats, achievements, performanceData, joinedEvents);
        }
        
        // Initialize charts after the DOM is ready (only if we have data to show)
        if (!isFirstTime && Object.keys(stats.sportBreakdown).length > 0) {
            initializeCharts(stats);
        }
    } catch (error) {
        console.error('Error rendering scorecard:', error);
        // Show a friendly message instead of an error
        scorecardDetails.innerHTML = `
            <div class="scorecard-card">
                <div class="scorecard-card-header">
                    <div>
                        <h3 class="scorecard-card-title">Welcome to Your Scorecard</h3>
                        <p class="scorecard-card-subtitle">Track your sports activity and performance</p>
                    </div>
                </div>
                <p>Your scorecard is being set up. As you join events and log your performances, you'll see your statistics and achievements here.</p>
                
                <!-- Log Performance Form -->
                <div class="performance-form-container">
                    <div class="performance-form-header">
                        <h3 class="performance-form-title">Track Your Performance</h3>
                        <button id="togglePerformanceForm" class="form-toggle-button">Log New Performance</button>
                    </div>
                    
                    <form id="performanceForm" class="performance-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="performanceDate">Date</label>
                                <input type="date" id="performanceDate" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="performanceSport">Sport</label>
                                <select id="performanceSport" required>
                                    <option value="">Select a sport</option>
                                    <option value="Basketball">Basketball</option>
                                    <option value="Football">Football</option>
                                    <option value="Soccer">Soccer</option>
                                    <option value="Tennis">Tennis</option>
                                    <option value="Volleyball">Volleyball</option>
                                    <option value="Running">Running</option>
                                    <option value="Swimming">Swimming</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="metric1Name">Metric 1 Name</label>
                                <input type="text" id="metric1Name" placeholder="e.g., Points, Goals, Time">
                            </div>
                            
                            <div class="form-group">
                                <label for="metric1Value">Metric 1 Value</label>
                                <input type="text" id="metric1Value" placeholder="e.g., 10, 3, 25:30">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="metric2Name">Metric 2 Name</label>
                                <input type="text" id="metric2Name" placeholder="e.g., Assists, Saves, Distance">
                            </div>
                            
                            <div class="form-group">
                                <label for="metric2Value">Metric 2 Value</label>
                                <input type="text" id="metric2Value" placeholder="e.g., 5, 2, 5.2km">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="performanceNotes">Notes</label>
                            <textarea id="performanceNotes" rows="3" placeholder="Add any comments or notes about your performance"></textarea>
                        </div>
                        
                        <div class="form-buttons">
                            <button type="button" id="cancelPerformanceButton" class="form-cancel-button">Cancel</button>
                            <button type="submit" class="form-submit-button">Save Performance</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Set up the form event listeners
        setupEventListeners();
    }
}

/**
 * Create welcome HTML for first-time users
 */
function createWelcomeScorecardHTML(userData) {
    return `
        <div class="scorecard-container">
            <div class="scorecard-card">
                <div class="scorecard-card-header">
                    <div>
                        <h3 class="scorecard-card-title">Welcome to Your Scorecard, ${userData.fullName || userData.username}!</h3>
                        <p class="scorecard-card-subtitle">Start tracking your sports activity and performance</p>
                    </div>
                </div>
                
                <p>Your scorecard is ready! Here's how to get started:</p>
                <ul>
                    <li><strong>Join Events</strong> - Participate in sports events to track your activity</li>
                    <li><strong>Log Performance</strong> - Record your sports metrics using the form below</li>
                    <li><strong>Earn Achievements</strong> - Unlock achievements as you participate more</li>
                </ul>
                
                <p>Once you have joined events or logged performances, you'll see your statistics and charts here.</p>
            </div>
            
            <!-- Log Performance Form -->
            <div class="performance-form-container">
                <div class="performance-form-header">
                    <h3 class="performance-form-title">Track Your Performance</h3>
                    <button id="togglePerformanceForm" class="form-toggle-button">Log New Performance</button>
                </div>
                
                <form id="performanceForm" class="performance-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="performanceDate">Date</label>
                            <input type="date" id="performanceDate" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="performanceSport">Sport</label>
                            <select id="performanceSport" required>
                                <option value="">Select a sport</option>
                                <option value="Basketball">Basketball</option>
                                <option value="Football">Football</option>
                                <option value="Soccer">Soccer</option>
                                <option value="Tennis">Tennis</option>
                                <option value="Volleyball">Volleyball</option>
                                <option value="Running">Running</option>
                                <option value="Swimming">Swimming</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="metric1Name">Metric 1 Name</label>
                            <input type="text" id="metric1Name" placeholder="e.g., Points, Goals, Time">
                        </div>
                        
                        <div class="form-group">
                            <label for="metric1Value">Metric 1 Value</label>
                            <input type="text" id="metric1Value" placeholder="e.g., 10, 3, 25:30">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="metric2Name">Metric 2 Name</label>
                            <input type="text" id="metric2Name" placeholder="e.g., Assists, Saves, Distance">
                        </div>
                        
                        <div class="form-group">
                            <label for="metric2Value">Metric 2 Value</label>
                            <input type="text" id="metric2Value" placeholder="e.g., 5, 2, 5.2km">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="performanceNotes">Notes</label>
                        <textarea id="performanceNotes" rows="3" placeholder="Add any comments or notes about your performance"></textarea>
                    </div>
                    
                    <div class="form-buttons">
                        <button type="button" id="cancelPerformanceButton" class="form-cancel-button">Cancel</button>
                        <button type="submit" class="form-submit-button">Save Performance</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

/**
 * Generate stats based on user data
 */
function generateStats(joinedEvents, createdEvents, userTeams, performanceData) {
    // Base stats object
    const stats = {
        totalEventsAttended: joinedEvents.length,
        totalEventsCreated: createdEvents.length,
        totalTeamsJoined: userTeams.length,
        sportBreakdown: {},
        eventsPerMonth: {},
        recentActivity: [],
        teamRoles: {
            admin: 0,
            member: 0
        }
    };
    
    // Process joined events
    joinedEvents.forEach(event => {
        const eventDate = new Date(event.event_date);
        const month = eventDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        // Count events by sport type
        if (!stats.sportBreakdown[event.sport_type]) {
            stats.sportBreakdown[event.sport_type] = 0;
        }
        stats.sportBreakdown[event.sport_type]++;
        
        // Count events by month
        if (!stats.eventsPerMonth[month]) {
            stats.eventsPerMonth[month] = 0;
        }
        stats.eventsPerMonth[month]++;
        
        // Add to recent activity (last 5 events)
        if (stats.recentActivity.length < 5) {
            stats.recentActivity.push({
                type: 'event',
                name: event.event_name,
                sport: event.sport_type,
                date: eventDate
            });
        }
    });
    
    // Process team roles
    userTeams.forEach(team => {
        if (team.user_role === 'admin') {
            stats.teamRoles.admin++;
        } else {
            stats.teamRoles.member++;
        }
    });
    
    // Sort recent activity by date (newest first)
    stats.recentActivity.sort((a, b) => b.date - a.date);
    
    return stats;
}

/**
 * Generate achievements based on stats
 */
function generateAchievements(stats) {
    const achievements = [];
    
    // Participant achievement (attended at least one event)
    achievements.push({
        name: 'Participant',
        description: 'Attended your first event',
        icon: 'fa-solid fa-check-circle',
        unlocked: stats.totalEventsAttended > 0,
        date: stats.totalEventsAttended > 0 ? new Date().toLocaleDateString() : null
    });
    
    // Regular achievement (attended at least 5 events)
    achievements.push({
        name: 'Regular Athlete',
        description: 'Attended 5 or more events',
        icon: 'fa-solid fa-calendar-check',
        unlocked: stats.totalEventsAttended >= 5,
        date: stats.totalEventsAttended >= 5 ? new Date().toLocaleDateString() : null
    });
    
    // Sports Explorer (participated in at least 3 different sports)
    const sportCount = Object.keys(stats.sportBreakdown).length;
    achievements.push({
        name: 'Sports Explorer',
        description: 'Participated in 3 different sports',
        icon: 'fa-solid fa-compass',
        unlocked: sportCount >= 3,
        date: sportCount >= 3 ? new Date().toLocaleDateString() : null
    });
    
    // Event Organizer (created at least one event)
    achievements.push({
        name: 'Event Organizer',
        description: 'Created your first event',
        icon: 'fa-solid fa-bullhorn',
        unlocked: stats.totalEventsCreated > 0,
        date: stats.totalEventsCreated > 0 ? new Date().toLocaleDateString() : null
    });
    
    // Team Captain (admin of at least one team)
    achievements.push({
        name: 'Team Captain',
        description: 'Became admin of a team',
        icon: 'fa-solid fa-crown',
        unlocked: stats.teamRoles.admin > 0,
        date: stats.teamRoles.admin > 0 ? new Date().toLocaleDateString() : null
    });
    
    // Team Player (joined at least 2 teams)
    achievements.push({
        name: 'Team Player',
        description: 'Joined 2 or more teams',
        icon: 'fa-solid fa-users',
        unlocked: stats.totalTeamsJoined >= 2,
        date: stats.totalTeamsJoined >= 2 ? new Date().toLocaleDateString() : null
    });
    
    return achievements;
}

/**
 * Create the HTML for the scorecard
 */
function createScorecardHTML(userData, stats, achievements, performanceData, joinedEvents) {
    return `
        <div class="scorecard-container">
            <!-- User Overview Card -->
            <div class="scorecard-card">
                <div class="scorecard-card-header">
                    <div>
                        <h3 class="scorecard-card-title">Scorecard for ${userData.fullName || userData.username}</h3>
                        <p class="scorecard-card-subtitle">Track your sports activity and performance</p>
                    </div>
                </div>
                
                <!-- Stats Overview -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalEventsAttended}</div>
                        <div class="stat-label">Events Joined</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalEventsCreated}</div>
                        <div class="stat-label">Events Created</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalTeamsJoined}</div>
                        <div class="stat-label">Teams Joined</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-value">${Object.keys(stats.sportBreakdown).length}</div>
                        <div class="stat-label">Sports Joined</div>
                    </div>
                </div>
            </div>
            
            <!-- Charts Section -->
            <div class="charts-container">
                <div class="chart-wrapper">
                    <h4 class="chart-title">Sports Breakdown</h4>
                    <canvas id="sportsChart"></canvas>
                </div>
                
                <div class="chart-wrapper">
                    <h4 class="chart-title">Monthly Activity</h4>
                    <canvas id="activityChart"></canvas>
                </div>
            </div>
            
            <!-- Achievements Section -->
            <div class="scorecard-card achievements-container">
                <div class="achievements-header">
                    <h3 class="achievements-title">Your Achievements</h3>
                </div>
                
                <div class="achievements-grid">
                    ${achievements.map(achievement => `
                        <div class="achievement-card ${achievement.unlocked ? '' : 'locked-achievement'}">
                            <div class="achievement-icon">
                                <i class="${achievement.icon}"></i>
                            </div>
                            <div class="achievement-name">${achievement.name}</div>
                            <div class="achievement-description">${achievement.description}</div>
                            ${achievement.unlocked ? 
                                `<div class="achievement-date">Unlocked: ${achievement.date}</div>` : 
                                '<div class="achievement-date">Locked</div>'
                            }
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Log Performance Form -->
             <div class="performance-form-container">
                <div class="performance-form-header">
                    <h3 class="performance-form-title">Track Your Performance</h3>
                    <button id="togglePerformanceForm" class="form-toggle-button">Log New Performance</button>
                </div>
                
                <form id="performanceForm" class="performance-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="performanceEvent">Event</label>
                            <select id="performanceEvent" required>
                                <option value="">Select an event</option>
                                ${joinedEvents.map(event => {
                                    const eventDate = new Date(event.event_date);
                                    const isFuture = eventDate > new Date();
                                    return `
                                        <option value="${event.event_id}" 
                                            data-sport="${event.sport_type}" 
                                            data-date="${event.event_date}"
                                            ${isFuture ? 'disabled' : ''}>
                                            ${event.event_name} 
                                            ${isFuture ? '(Future Event)' : `(${new Date(event.event_date).toLocaleDateString()})`}
                                        </option>
                                    `;
                                }).join('')}
                                <option value="custom">Add Custom Performance</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="performanceSport">Sport</label>
                            <select id="performanceSport" required>
                                <option value="">Select a sport</option>
                                <option value="Basketball">Basketball</option>
                                <option value="Football">Football</option>
                                <option value="Soccer">Soccer</option>
                                <option value="Tennis">Tennis</option>
                                <option value="Volleyball">Volleyball</option>
                                <option value="Running">Running</option>
                                <option value="Swimming">Swimming</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="performanceDate">Date</label>
                            <input type="date" id="performanceDate" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="metric1Name">Metric 1 Name</label>
                            <input type="text" id="metric1Name" placeholder="e.g., Points, Goals, Time">
                        </div>
                        
                        <div class="form-group">
                            <label for="metric1Value">Metric 1 Value</label>
                            <input type="text" id="metric1Value" placeholder="e.g., 10, 3, 25:30">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="metric2Name">Metric 2 Name</label>
                            <input type="text" id="metric2Name" placeholder="e.g., Assists, Saves, Distance">
                        </div>
                        
                        <div class="form-group">
                            <label for="metric2Value">Metric 2 Value</label>
                            <input type="text" id="metric2Value" placeholder="e.g., 5, 2, 5.2km">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="performanceNotes">Notes</label>
                        <textarea id="performanceNotes" rows="3" placeholder="Add any comments or notes about your performance"></textarea>
                    </div>
                    
                    <div class="form-buttons">
                        <button type="button" id="cancelPerformanceButton" class="form-cancel-button">Cancel</button>
                        <button type="submit" class="form-submit-button">Save Performance</button>
                    </div>
                </form>
            </div>
            
            <!-- Performance History Table -->
            <div class="scorecard-card performance-history">
                <div class="performance-history-header">
                    <h3 class="performance-history-title">Performance History</h3>
                </div>
                
                <div id="performanceHistoryContainer">
                    ${performanceData && performanceData.length > 0 ? `
                        <table class="performance-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Sport</th>
                                    <th>Event</th>
                                    <th>Metrics</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${performanceData.map(entry => `
                                    <tr>
                                        <td>${new Date(entry.performance_date).toLocaleDateString()}</td>
                                        <td>${entry.sport_type}</td>
                                        <td>${entry.event_name || 'N/A'}</td>
                                        <td>
                                            <div class="custom-metrics">
                                                ${Object.entries(entry.metrics).map(([key, value]) => `
                                                    <div class="metric-item">
                                                        <span class="metric-name">${key}:</span>
                                                        <span class="metric-value">${value}</span>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </td>
                                        <td>${entry.notes || 'N/A'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p>No performance data recorded yet. Use the form above to log your first performance.</p>'}
                </div>
            </div>
        </div>
    `;
}

/**
 * Set up event listeners for the scorecard page
 */
function setupEventListeners() {
    console.log('Setting up event listeners for scorecard');
    
    setTimeout(() => {
        // Toggle performance form visibility
        const toggleButton = document.getElementById('togglePerformanceForm');
        const performanceForm = document.getElementById('performanceForm');
        const cancelButton = document.getElementById('cancelPerformanceButton');
        
        console.log('Toggle button found:', !!toggleButton);
        console.log('Performance form found:', !!performanceForm);
        
        if (toggleButton && performanceForm) {
            toggleButton.onclick = function() {
                console.log('Toggle button clicked');
                performanceForm.classList.toggle('active');
                this.textContent = performanceForm.classList.contains('active') 
                    ? 'Cancel' 
                    : 'Log New Performance';
            };
        }
        
        if (cancelButton && performanceForm) {
            cancelButton.onclick = function() {
                performanceForm.classList.remove('active');
                if (toggleButton) {
                    toggleButton.textContent = 'Log New Performance';
                }
                performanceForm.reset();
            };
        }
        
        // Handle performance form submission
        if (performanceForm) {
            performanceForm.onsubmit = handlePerformanceSubmit;
        }
        
        // Handle event selection change to auto-populate sport and date
        const eventSelect = document.getElementById('performanceEvent');
        const sportSelect = document.getElementById('performanceSport');
        const dateInput = document.getElementById('performanceDate');
        
        if (eventSelect && sportSelect && dateInput) {
            eventSelect.onchange = function() {
                const selectedOption = this.options[this.selectedIndex];
                
                if (this.value === 'custom') {
                    // For custom performances, enable sport and date fields
                    sportSelect.value = '';
                    sportSelect.disabled = false;
                    dateInput.value = '';
                    dateInput.disabled = false;
                } else if (this.value !== '') {
                    // For event-based performances, set sport and date from the event
                    const sport = selectedOption.getAttribute('data-sport');
                    const date = selectedOption.getAttribute('data-date');
                    
                    sportSelect.value = sport;
                    sportSelect.disabled = true; // Lock the sport field
                    
                    // Format the date for the input (YYYY-MM-DD)
                    const eventDate = new Date(date);
                    const formattedDate = eventDate.toISOString().split('T')[0];
                    dateInput.value = formattedDate;
                    dateInput.disabled = true; // Lock the date field
                    
                    // Also update metrics based on sport
                    updateMetricFieldsForSport({ target: { value: sport } });
                }
            };
        }
        
        // Handle sport selection change for custom performances
        if (sportSelect) {
            sportSelect.onchange = updateMetricFieldsForSport;
        }
    }, 100);
}

/**
 * Handle performance form submission
 */
async function handlePerformanceSubmit(e) {
    e.preventDefault();
    console.log('Form submitted');
    
    // Get the form element and all form inputs directly from the form that triggered the event
    const form = e.target;
    
    // Get form values directly from the form that was submitted
    const performanceDate = form.querySelector('#performanceDate').value;
    const sport = form.querySelector('#performanceSport').value;
    const eventId = form.querySelector('#performanceEvent')?.value || '';
    const notes = form.querySelector('#performanceNotes').value;
    
    // Get metrics
    const metric1Name = form.querySelector('#metric1Name').value;
    const metric1Value = form.querySelector('#metric1Value').value;
    const metric2Name = form.querySelector('#metric2Name').value;
    const metric2Value = form.querySelector('#metric2Value').value;
    
    console.log('Form data:', { performanceDate, sport, eventId, notes, metric1Name, metric1Value, metric2Name, metric2Value });
    
    // Create metrics object
    const metrics = {};
    if (metric1Name && metric1Value) {
        metrics[metric1Name] = metric1Value;
    }
    if (metric2Name && metric2Value) {
        metrics[metric2Name] = metric2Value;
    }
    
    // Create performance data object
    const performanceData = {
        performance_date: performanceDate,
        sport_type: sport,
        event_id: eventId || null,
        metrics: metrics,
        notes: notes
    };
    
    try {
        // This endpoint doesn't exist yet but we're preparing for it
        const result = await DataModel.logPerformance(performanceData);
        
        if (result && result.success) {
            alert('Performance data saved successfully!');
            
            // Reset form and hide it - use the form from the event
            form.reset();
            form.classList.remove('active');
            
            // Find the toggle button
            const toggleButton = document.getElementById('togglePerformanceForm');
            if (toggleButton) {
                toggleButton.textContent = 'Log New Performance';
            }
            
            // Refresh the scorecard to show the new data
            await renderScorecard();
        } else {
            alert('Failed to save performance data. Please try again.');
        }
    } catch (error) {
        console.error('Error logging performance:', error);
        
        // Since we know this endpoint doesn't exist yet, show a special message
        if (error.message && error.message.includes('not implemented')) {
            alert('This feature is not fully implemented yet. Your performance data would be saved in a real application.');
            
            // Reset form and hide it for better UX - use the form from the event
            form.reset();
            form.classList.remove('active');
            
            // Find the toggle button
            const toggleButton = document.getElementById('togglePerformanceForm');
            if (toggleButton) {
                toggleButton.textContent = 'Log New Performance';
            }
        } else {
            alert('Failed to save performance data. Please try again.');
        }
    }
}

/**
 * Update metric fields based on selected sport
 */
function updateMetricFieldsForSport(e) {
    const sport = e.target.value;
    const metric1Name = document.getElementById('metric1Name');
    const metric2Name = document.getElementById('metric2Name');
    
    // Set default metrics based on sport
    switch(sport) {
        case 'Basketball':
            metric1Name.value = 'Points';
            metric2Name.value = 'Rebounds';
            break;
        case 'Football':
            metric1Name.value = 'Touchdowns';
            metric2Name.value = 'Yards';
            break;
        case 'Soccer':
            metric1Name.value = 'Goals';
            metric2Name.value = 'Assists';
            break;
        case 'Tennis':
            metric1Name.value = 'Sets Won';
            metric2Name.value = 'Aces';
            break;
        case 'Volleyball':
            metric1Name.value = 'Points';
            metric2Name.value = 'Blocks';
            break;
        case 'Running':
            metric1Name.value = 'Distance (km)';
            metric2Name.value = 'Time';
            break;
        case 'Swimming':
            metric1Name.value = 'Distance (m)';
            metric2Name.value = 'Time';
            break;
        default:
            // Clear fields for other sports
            metric1Name.value = '';
            metric2Name.value = '';
    }
}

/**
 * Initialize charts using Chart.js
 */
function initializeCharts(stats) {
    initializeSportsChart(stats);
    initializeActivityChart(stats);
}

/**
 * Initialize the sports breakdown chart
 */
function initializeSportsChart(stats) {
    const ctx = document.getElementById('sportsChart');
    if (!ctx) return;
    
    const sportLabels = Object.keys(stats.sportBreakdown);
    const sportData = Object.values(stats.sportBreakdown);
    
    // Generate contrasting colors for each sport
    const backgroundColors = [
        'rgba(76, 175, 80, 0.9)',   // Main green
        'rgba(38, 166, 154, 0.9)',   // Teal
        'rgba(129, 199, 132, 0.9)',  // Light green
        'rgba(46, 125, 50, 0.9)',    // Dark green
        'rgba(156, 204, 101, 0.9)',  // Lime green
        'rgba(0, 150, 136, 0.9)',    // Different teal
        'rgba(200, 230, 201, 0.9)'   // Very light green
    ];
    
    // Border colors slightly darker than the fill
    const borderColors = backgroundColors.map(color => color.replace('0.9', '1'));
    
    // Don't modify the chart container layout, just make sure titles are properly positioned
    const titleElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (titleElements) {
        titleElements.forEach(title => {
            title.style.textAlign = 'left';
            title.style.marginBottom = '1.5rem';
        });
    }
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: sportLabels,
            datasets: [{
                data: sportData,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 2,
                hoverOffset: 15,
                spacing: 4, // Add space between slices
                borderRadius: 5 // Add rounded borders to slices
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '75%',
            layout: {
                padding: {
                    top: 10,
                    bottom: 10
                }
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            family: 'Urbanist',
                            size: 14,
                            weight: '600'
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#000',
                    bodyColor: '#333',
                    bodyFont: {
                        family: 'Urbanist'
                    },
                    borderColor: '#e0e0e0',
                    borderWidth: 0,
                    cornerRadius: 4,
                    padding: 10,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} events (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function initializeActivityChart(stats) {
    const ctx = document.getElementById('activityChart');
    if (!ctx) return;
    
    // Sort months chronologically
    const months = Object.keys(stats.eventsPerMonth).sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA - dateB;
    });
    
    const activityData = months.map(month => stats.eventsPerMonth[month]);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Events Registered',
                data: activityData,
                backgroundColor: 'rgba(76, 175, 80, 0.7)',
                borderColor: '#3d8b40',
                borderWidth: 1,
                borderRadius: 8,
                hoverBackgroundColor: '#4caf50',
                barThickness: 40 // Increase bar width
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true, // Keep chart within container
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: {
                            family: 'Urbanist',
                            weight: '500'
                        },
                        color: '#888'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.03)',
                        drawBorder: false
                    },
                    border: {
                        display: false
                    }
                },
                x: {
                    ticks: {
                        font: {
                            family: 'Urbanist',
                            weight: '500'
                        },
                        color: '#888'
                    },
                    grid: {
                        display: false
                    },
                    border: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#000',
                    bodyColor: '#333',
                    bodyFont: {
                        family: 'Urbanist'
                    },
                    borderColor: '#e0e0e0',
                    borderWidth: 0,
                    cornerRadius: 4,
                    padding: 10
                }
            }
        }
    });
}

// Export the initialization function for use in dashboard.js
window.loadScorecard = initializeScorecard;