document.addEventListener('DOMContentLoaded', () => {
  fetchLeaderboardData();

  const backButton = document.getElementById('leaderboard-messages');
  backButton.addEventListener('click', handleBackButtonClick);
});

let isCooldown = false;

async function handleBackButtonClick() {
  if (isCooldown) return;
  isCooldown = true;
  
  const backButton = document.getElementById('leaderboard-messages');
  const leaderboardContainer = document.getElementById('leaderboardContainer');

  leaderboardContainer.innerHTML = '<div style="text-align: center;">Loading...</div>';

  if (backButton.innerText === 'Tokens') {
    backButton.innerText = 'Messages';
    await fetchTopSenders();
  } else {
    backButton.innerText = 'Tokens';
    await fetchLeaderboardData();
  }

  setTimeout(() => {
    isCooldown = false;
  }, 100)
}

async function fetchLeaderboardData() {
  try {
    const response = await fetch('/leaderboard');
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const data = await response.json();
    displayLeaderboard(data);
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
  }
}

async function fetchTopSenders() {
  try {
    const response = await fetch('/top-senders');
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const topSenders = await response.json();
    displayTopSenders(topSenders);
  } catch (error) {
    console.error('Error fetching top senders:', error);
  }
}

function displayLeaderboard(users) {
  const leaderboardContainer = document.getElementById('leaderboardContainer');
  leaderboardContainer.innerHTML = '';

  users.forEach((user, index) => {
    const userElement = document.createElement('div');
    userElement.className = 'leaderboard-item'; 

    userElement.innerHTML = `${index + 1}. ${user.username} - Tokens: ${user.tokens}`;
    leaderboardContainer.appendChild(userElement);
  });
}

function renderUser(user) {
    const usernameElement = ge("username");
    usernameElement.innerHTML = user.username;

    const roleElement = ge("role");
    roleElement.innerHTML = user.role;

    if (user.role === "Owner") {
        usernameElement.style.color = "#020202";
        roleElement.style.color = "#020202";
    } else if (user.role === "Veteran") {
        usernameElement.style.color = "#969a5c";
        roleElement.style.color = "#969a5c";
    } else if (user.role === "Verified") {
        usernameElement.style.color = "#5ab65b";
        roleElement.style.color = "#5ab65b";
    } else if (user.role === "Tester") {
        usernameElement.style.color = "#80a1d3";
        roleElement.style.color = "#80a1d3";
    } else if (user.role === "Helper") {
        usernameElement.style.color = "#4b69c3";
        roleElement.style.color = "#4b69c3";
    } else if (user.role === "Moderator") {
        usernameElement.style.color = "#ab53c4";
        roleElement.style.color = "#ab53c4";
    } else if (user.role === "Admin") {
        usernameElement.style.color = "#dc6dc1";
        roleElement.style.color = "#dc6dc1";
    } else if (user.role === "Developer") {
        usernameElement.style.color = "#6a76c7";
        roleElement.style.color = "#6a76c7";
    } else if (user.role === "Artist") {
        usernameElement.style.color = "#ca964c";
        roleElement.style.color = "#ca964c";
    } else {
        usernameElement.style.color = "white"; 
        roleElement.style.color = "white";      
    }
}

function displayTopSenders(topSenders) {
  const leaderboardContainer = document.getElementById('leaderboardContainer');
  leaderboardContainer.innerHTML = '';

  topSenders.forEach((sender, index) => {
    const senderElement = document.createElement('div');
    senderElement.className = 'top-sender-item';
    senderElement.innerHTML = `${index + 1}. ${sender.username} - Messages: ${sender.sent}`;
    leaderboardContainer.appendChild(senderElement);
  });
}

function logout() {
  fetch('/logout', { method: 'POST' })
    .then(response => {
      if (response.ok) {
        sessionStorage.clear();
        localStorage.removeItem('loggedIn');
        window.location.href = '/index.html';
      } else {
        console.error('Logout failed');
      }
    })
    .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', function() {
  fetch('/user') 
    .then(response => response.json())
    .then(data => {
      const userRole = data.role;
      const allowedRoles = ['Owner', 'Admin', 'Moderator', 'Helper', 'Developer'];
      if (allowedRoles.includes(userRole)) {
        document.getElementById('wrench-icon').style.display = 'inline';
      }
    })
  .catch(error => {
   console.error('Error fetching user role:', error);
    });
});