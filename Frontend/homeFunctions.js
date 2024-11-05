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

//Home button display change
function showHome(){
    document.getElementById("content").innerHTML = "<p>This is the Home page</p>";
}
function showTeam(){
    document.getElementById("content").innerHTML = "<p>This is the Team page</p>";
}
function showAbout(){
    document.getElementById("content").innerHTML = "<p>This is the About page</p>";
}


function showSearch() {
    document.getElementById('main-content').style.display = 'block'; // Show search parameters
    document.getElementById('edit-placeholder').style.display = 'none'; // Hide edit placeholder
}

function showEdit() {
    document.getElementById('main-content').style.display = 'none'; // Hide search parameters
    document.getElementById('edit-placeholder').style.display = 'block'; // Show edit placeholder
}

// Initially hide the main content and edit placeholder
document.getElementById('main-content').style.display = 'none';
document.getElementById('edit-placeholder').style.display = 'none';