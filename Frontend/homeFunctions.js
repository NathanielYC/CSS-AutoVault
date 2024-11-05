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
