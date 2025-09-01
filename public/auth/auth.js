function checkLoggedIn() {
    fetch('/user', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login';
            }
        }
    })
    .catch(error => {
        console.error("Error checking login status:", error);
        window.location.href = '/login'; 
    });
}

document.addEventListener('DOMContentLoaded', checkLoggedIn);