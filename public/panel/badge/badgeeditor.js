let users = [];
let currentUserId;

document.addEventListener('DOMContentLoaded', function() {
    fetch('/users')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched users:", data);
            users = Array.isArray(data) ? data : data.users;

            if (!Array.isArray(users)) { 
                throw new TypeError('Expected an array but got ' + typeof users);
            }

            const userList = document.getElementById('userList');
            userList.innerHTML = '';

            if (users.length === 0) {
                userList.innerHTML = '<div>No users found.</div>';
                return;
            }

            renderUserList(users);
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });
});

function renderUserList(users) {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';

    const userListFragment = document.createDocumentFragment();

    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.style.padding = '10px';
        userItem.style.marginBottom = '10px';
        userItem.style.borderRadius = '5px';

        userItem.innerHTML = `
            <strong>${user.username}</strong> (${user.role})
            <div class="badges">${(user.badges || []).map(badge => `<img src="${badge.image}" draggable="false" class="badge" style="width: 30px; height: 30px;"/>`).join('')}</div>
            <button class="add-badge-btn" onclick="fetchBadgesForUser('${user.id}')">Add Badge</button>
        `;

        userListFragment.appendChild(userItem);
    });

    userList.appendChild(userListFragment);
}

function fetchBadgesForUser(userId) {
    currentUserId = userId; 
    fetch('/badges')
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response type:', response.headers.get('Content-Type'));

            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json(); 
        })
        .then(badges => {
            console.log('Fetched badges:', badges); 
            openModal(badges);
        })
        .catch(error => {
            console.error('Error fetching badges:', error);
            alert('Failed to fetch badges. Please try again later.');
        });
}

function openModal(badges) {
    const modal = document.createElement('div');
    modal.id = 'badgeModal';
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #6f057a;
        box-shadow: inset 0 -0.365vw #61056b, 3px 3px 15px rgba(0, 0, 0, 0.6);
        padding: 20px;
        border-radius: 10px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: center;
    `;

    const badgeContainer = document.createElement('div');
    badgeContainer.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
    `;

    badges.forEach(badge => {
        const badgeImage = document.createElement('img');
        badgeImage.src = badge.image;
        badgeImage.style.cssText = `
            width: 50px;
            height: 50px;
            cursor: pointer;
        `;
        badgeImage.onclick = () => addBadgeToUser(badge.id);
        badgeContainer.appendChild(badgeImage);
    });

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.onclick = closeModal;
    closeButton.style.marginTop = '10px';

    modal.appendChild(badgeContainer);
    modal.appendChild(closeButton);
    document.body.appendChild(modal);
}

function closeModal() {
    const modal = document.getElementById('badgeModal');
    if (modal) {
        modal.remove();
    }
}


function addBadgeToUser(badgeId) {
    fetch('/add-badge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, badgeId })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to add badge');
        }
        return response.json();
    })
    .then(data => {
        console.log('Badge added:', data);
        closeModal(); 
    })
    .catch(error => {
        console.error('Error adding badge:', error);
    });
}


function levenshteinDistance(a, b) {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

function searchUsers() {
    const searchValue = document.getElementById('searchBar').value.toLowerCase();

    if (searchValue.trim() === "") {
        renderUserList(users);
        return;
    }

    const sortedUsers = users
        .map(user => ({
            ...user,
            distance: levenshteinDistance(user.username.toLowerCase(), searchValue)
        }))
        .filter(user => user.distance < 5)
        .sort((a, b) => a.distance - b.distance);

    renderUserList(sortedUsers);
}