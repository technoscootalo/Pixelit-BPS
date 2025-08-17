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

    const textColor = user.role === "Owner" ? "black" : "white";
    userElement.style.color = textColor; 

    userElement.innerHTML = `${index + 1}. ${user.username} - Tokens: ${user.tokens}`;
    leaderboardContainer.appendChild(userElement);
  });
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