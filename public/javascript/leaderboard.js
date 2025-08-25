function displayLeaderboard(users) {
    const leaderboardContainer = document.getElementById('leaderboardContainer');
    leaderboardContainer.innerHTML = '';

    users.forEach((user, index) => {
        const userElement = document.createElement('div');
        userElement.className = 'leaderboard-item';

        const roleColor = (user.role === 'Owner') ? '#020202' :
              (user.role === 'Admin') ? '#dc6dc1' :
              (user.role === 'Moderator') ? '#ab53c4' :
              (user.role === 'Tester') ? '#80a1d3' :
              (user.role === 'Helper') ? '#4b69c3' :
              (user.role === 'Developer') ? '#6a76c7' :
              (user.role === 'Artist') ? '#ca964c' :
              (user.role === 'Verified') ? '#5ab65b' :
              (user.role === 'Veteran') ? '#969a5c' : 'white';

        const usernameColor = (user.role === 'Owner') ? '#020202' :
                  (user.role === 'Admin') ? '#dc6dc1' :
                  (user.role === 'Moderator') ? '#ab53c4' :
                  (user.role === 'Tester') ? '#80a1d3' :
                  (user.role === 'Helper') ? '#4b69c3' :
                  (user.role === 'Developer') ? '#6a76c7' :
                  (user.role === 'Artist') ? '#ca964c' :
                  (user.role === 'Verified') ? '#5ab65b' :
                  (user.role === 'Veteran') ? '#969a5c' : 'white';

        userElement.innerHTML = `${index + 1}. <span style="color: ${roleColor}">[${user.role || 'Unknown'}]</span> <span style="color: ${usernameColor}; cursor: pointer;">${user.username || 'Unknown'}</span> - Tokens: <strong style="color: gold;">${user.tokens}</strong>`;
        leaderboardContainer.appendChild(userElement);
    });
}

function displayTopSenders(topSenders) {
    const leaderboardContainer = document.getElementById('leaderboardContainer');
    leaderboardContainer.innerHTML = '';

    topSenders.forEach((sender, index) => {
        const senderElement = document.createElement('div');
        senderElement.className = 'top-sender-item';

        const roleColor = (sender.role === 'Owner') ? '#020202' :
              (sender.role === 'Admin') ? '#dc6dc1' :
              (sender.role === 'Moderator') ? '#ab53c4' :
              (sender.role === 'Tester') ? '#80a1d3' :
              (sender.role === 'Helper') ? '#4b69c3' :
              (sender.role === 'Developer') ? '#6a76c7' :
              (sender.role === 'Artist') ? '#ca964c' :
              (sender.role === 'Verified') ? '#5ab65b' :
              (sender.role === 'Veteran') ? '#969a5c' : 'white';

        const usernameColor = (sender.role === 'Owner') ? '#020202' :
                  (sender.role === 'Admin') ? '#dc6dc1' :
                  (sender.role === 'Moderator') ? '#ab53c4' :
                  (sender.role === 'Tester') ? '#80a1d3' :
                  (sender.role === 'Helper') ? '#4b69c3' :
                  (sender.role === 'Developer') ? '#6a76c7' :
                  (sender.role === 'Artist') ? '#ca964c' :
                  (sender.role === 'Verified') ? '#5ab65b' :
                  (sender.role === 'Veteran') ? '#969a5c' : 'white';

        senderElement.innerHTML = `${index + 1}. <span style="color: ${roleColor}">[${sender.role || 'Unknown'}]</span> <span style="color: ${usernameColor}; cursor: pointer;">${sender.username || 'Unknown'}</span> - Messages: <strong style="color: gold;">${sender.sent}</strong>`;
        leaderboardContainer.appendChild(senderElement);
    });
}

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
      backButton.style.textAlign = 'center';
      await fetchTopSenders();
  } else {
      backButton.innerText = 'Tokens';
      backButton.style.textAlign = 'center';
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