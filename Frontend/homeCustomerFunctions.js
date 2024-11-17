//Toggle dropdown menu
const profileButton = document.getElementById('profile-button');
const dropdownMenu = document.getElementById('dropdown-menu');

profileButton.addEventListener('click', () => {
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
});

//Close the dropdown when clicking outside
window.addEventListener('click', (event) => {
    if (!profileButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.style.display = 'none';
    }
});

// Home button
function showHome(){
    hideEverything();
    document.getElementById('home-page').style.display = 'block'; // Show home page
}

// Meet the Team button
function showTeam(){
    hideEverything();
    document.getElementById('team-page').style.display = 'block'; // Show team page
}

// About button
function showAbout(){
    hideEverything();
    document.getElementById('about-page').style.display = 'block'; // Show about page
}

// Search button
function showSearch() {
    hideEverything();
    document.getElementById('main-content').style.display = 'block'; // Show search parameters
}

// Hide all content
function hideEverything() {
    document.getElementById('main-content').style.display = 'none'; // Hide search parameters
    document.getElementById('home-page').style.display = 'none'; // Hide home page
    document.getElementById('team-page').style.display = 'none'; // Hide team page
    document.getElementById('about-page').style.display = 'none'; // Hide about page
}

// Initially hide the main content and edit placeholder
hideEverything();