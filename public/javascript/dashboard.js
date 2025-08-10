const socket = io();

if (localStorage.loggedin == "true") {
  sessionStorage = localStorage;
}

function ge(id) {
  return document.getElementById(id);
}

window.onload = () => {
  fetch("/user", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json(); 
      } else if (response.status === 500) {
        return response.text().then((text) => {
          alert(text);
        });
      } else if (response.status === 401) {
        sessionStorage.clear();
        window.location.href = "/login.html";
      } else {
        console.error("Unexpected response status:", response.status);
        throw new Error("Unexpected response status");
      }
    })
    .then((data) => {
      document.getElementById("tokens").innerHTML = data.tokens;
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
};

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

const username = ge("username");
const tokens = ge("tokens");
const sent = ge("messages");
const spin = ge("spin");
const packsOpened = ge("packs");

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
      usernameElement.style.color = "black";
      ge("role").style.color = "black";
    }
    if (user.role === "Tester") {
      usernameElement.style.color = "#24e2d8";
      ge("role").style.color = "#24e2d8";

    }
    if (user.role === "Helper") {
      usernameElement.style.color = "#1973a0";
      ge("role").style.color = "#1973a0";

    }
    if (user.role === "Moderator") {
      usernameElement.style.color = "#5e046e";
      ge("role").style.color = "#5e046e";

    }
    if (user.role === "Admin") {
      usernameElement.style.color = "#bd0404";
      ge("role").style.color = "#bd0404";

    }
    if (user.role === "Developer") {
      usernameElement.style.color = "#064e13";
      ge("role").style.color = "#064e13";
      
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

socket.on("tokens", (tokensr, sentr, messagesCount) => { 
    document.getElementById('tokens').textContent = formatNumber(tokensr);
    document.getElementById('messages').textContent = formatNumber(sentr);
    const messagesElement = document.getElementById('messages');
    messagesElement.textContent = formatNumber(messagesCount); 
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