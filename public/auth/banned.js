document.addEventListener('DOMContentLoaded', function() {
    fetch('/user', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.banned) {
            window.location.href = '/login'; 
        }
    })
    .catch(error => {
        console.error("Error fetching user data:", error);
    });
});