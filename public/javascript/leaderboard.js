function displayLeaderboard(users) {
  const leaderboardContainer = document.getElementById('leaderboardContainer');
  leaderboardContainer.innerHTML = '';

  users.forEach((user, index) => {
      const userElement = document.createElement('div');
      userElement.className = 'leaderboard-item';

      const colorMap = {
          Owner: '#020202',
          Admin: '#dc6dc1',
          Moderator: '#ab53c4',
          Tester: '#80a1d3',
          Helper: '#4b69c3',
          Developer: '#6a76c7',
          Artist: '#ca964c',
          Verified: '#5ab65b',
          Veteran: '#969a5c'
      };

      const roleColor = colorMap[user.role] || 'white';
      const usernameColor = roleColor;

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

      const colorMap = {
          Owner: '#020202',
          Admin: '#dc6dc1',
          Moderator: '#ab53c4',
          Tester: '#80a1d3',
          Helper: '#4b69c3',
          Developer: '#6a76c7',
          Artist: '#ca964c',
          Verified: '#5ab65b',
          Veteran: '#969a5c'
      };

      const roleColor = colorMap[sender.role] || 'white';
      const usernameColor = roleColor;

      senderElement.innerHTML = `${index + 1}. <span style="color: ${roleColor}">[${sender.role || 'Unknown'}]</span> <span style="color: ${usernameColor}; cursor: pointer;">${sender.username || 'Unknown'}</span> - Messages: <strong style="color: gold;">${sender.sent}</strong>`;
      leaderboardContainer.appendChild(senderElement);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fetchLeaderboardData();

  const backButton = document.getElementById('leaderboard-messages');
  backButton.addEventListener('click', handleBackButtonClick);

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
  }, 100);
}

async function fetchLeaderboardData() {
  try {
      const response = await fetch('/leaderboard');

      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error(`Expected JSON but got: ${text}`);
      }

      const data = await response.json();
      displayLeaderboard(data);
  } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      showErrorMessage("Failed to load leaderboard data.");
  }
}

async function fetchTopSenders() {
  try {
      const response = await fetch('/top-senders');

      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error(`Expected JSON but got: ${text}`);
      }

      const topSenders = await response.json();
      displayTopSenders(topSenders);
  } catch (error) {
      console.error('Error fetching top senders:', error);
      showErrorMessage("Failed to load top senders.");
  }
}

function showErrorMessage(message) {
  const leaderboardContainer = document.getElementById('leaderboardContainer');
  leaderboardContainer.innerHTML = `<div style="color: red; text-align: center;">${message}</div>`;
}

function logout() {
  fetch('/logout', { method: 'POST' })
      .then(response => {
          if (response.ok) {
              sessionStorage.clear();
              localStorage.removeItem('loggedIn');
              window.location.href = '/';
          } else {
              console.error('Logout failed');
          }
      })
      .catch(error => console.error('Error:', error));
}
