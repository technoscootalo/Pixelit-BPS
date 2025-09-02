const username = ge("username");
const tokens = ge("tokens");
const sent = ge("messages");
const spin = ge("spin");
const packsOpened = ge("packs");

if (localStorage.loggedin == "true") {
  sessionStorage = localStorage;
}

function ge(id) {
  return document.getElementById(id);
}

document.addEventListener('DOMContentLoaded', function() {
    fetch("/user", {
        method: 'GET',
        credentials: 'include', 
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then((response) => {
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = "/login"; 
            } else {
                return response.text().then(text => {
                    throw new Error(`Network response was not ok: ${response.status} - ${text}`);
                });
            }
        }
        return response.json();
    })
    .then((data) => {
        const badgesContainer = document.getElementById("badges");
        const badgesContainerParent = document.getElementById("badges-container");
        badgesContainer.innerHTML = ""; 

        if (!data.badges || data.badges.length === 0) {
            badgesContainerParent.style.display = 'none'; 
        } else {
            badgesContainerParent.style.display = 'block';
            data.badges.forEach(badge => {
                const badgeHTML = `<img src="${badge.image}" alt="${badge.name}" class="badge" />`;
                badgesContainer.innerHTML += badgeHTML;
            });
        }
    })
    .catch((error) => {
        console.error("Error fetching user badges:", error);
    });
});

const user = {
  username: "username",
  id: 0,
  tokens: 0,
  packs: [],
  pfp: "https://izumiihd.github.io/pixelitcdn/assets/img/blooks/logo.png",
  banner: "https://izumiihd.github.io/pixelitcdn/assets/img/banner/pixelitBanner.png",
  badges: [],
  role: "Player",
  instantOpen: false,
  claimed: false,
  stats: { sent: 0, packsOpened: 0 },
};

fetch("/user")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    return response.json();
  })
  .then((data) => {
    user.username = data.username;
    user.id = data.id;
    user.tokens = data.tokens;
    user.packs = data.packs;
    user.pfp = data.pfp;
    user.banner = data.banner;
    user.badges = data.badges;
    user.role = data.role;
    user.claimed = data.claimed;
    user.instantOpen = data.instantOpen;
    user.spinned = data.spinned;
    user.stats = data.stats;
    username.innerHTML = user.username;
    tokens.innerHTML = user.tokens;
    sent.innerHTML = user.stats.sent;
    packsOpened.innerHTML = user.stats.packsOpened;
    ge("pfp").src = `${user.pfp}`;
    ge("pfp").onerror = function () { this.src = "https:izumiihd.github.io/pixelitcdn/assets/img/blooks/logo.png"; }
    ge("banner").src = `${user.banner}`;
    ge("role").innerHTML = user.role;
    const usernameElement = ge("username");
    usernameElement.innerHTML = user.username;
    
    if (user.role === "Owner") {
      usernameElement.style.color = "#020202";
      ge("role").style.color = "#020202";
    }
    if (user.role === "Veteran") {
      usernameElement.style.color = "#969a5c";
      ge("role").style.color = "#969a5c";

    }
    if (user.role === "Verified") {
      usernameElement.style.color = "#5ab65b";
      ge("role").style.color = "#5ab65b";

    }
    if (user.role === "Plus") {
      usernameElement.style.color = "#5657d3";
      ge("role").style.color = "#5657d3";
    }
    if (user.role === "Tester") {
      usernameElement.style.color = "#80a1d3";
      ge("role").style.color = "#80a1d3";

    }
    if (user.role === "Helper") {
      usernameElement.style.color = "#4b69c3";
      ge("role").style.color = "#4b69c3";

    }
    if (user.role === "Moderator") {
      usernameElement.style.color = "#ab53c4";
      ge("role").style.color = "#ab53c4";

    }
    if (user.role === "Admin") {
      usernameElement.style.color = "#dc6dc1";
      ge("role").style.color = "#dc6dc1";

    }
    if (user.role === "Developer") {
      usernameElement.style.color = "#6a76c7";
      ge("role").style.color = "#6a76c7";
      
    }
    if (user.role === "Artist") {
      usernameElement.style.color = "#ca964c";
      ge("role").style.color = "#ca964c";

    }
  })

if (sessionStorage.loggedin == "true") {
  username.innerHTML = " " + sessionStorage.username;
  updateTokens();
} else {
}

function updateTokens() {
  socket.emit("getTokens", sessionStorage.username);
}

socket.on("tokens", (tokensr, sentr, messagesCount, packsOpenedr) => { 
    document.getElementById('tokens').textContent = formatNumber(tokensr);
    document.getElementById('messages').textContent = formatNumber(sentr);
    const messagesElement = document.getElementById('messages');
    messagesElement.textContent = formatNumber(messagesCount); 
    document.getElementById('packs').textContent = formatNumber(packsOpenedr);
});

function formatNumber(num) {
  if (num === null || num === undefined || num === '0') return '0';
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
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