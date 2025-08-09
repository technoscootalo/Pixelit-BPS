function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function parseMessage(str) {
    const safeStr = escapeHTML(str);
    const parsed = marked.parse(safeStr);
    return DOMPurify.sanitize(parsed);
}

function ge(id) {
    return document.getElementById(id);
}

let messages = [];
let username, pfp, badges;

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
            alert("You are not logged in. Please log in to continue.");
            window.location.href = "/login.html"; 
        } else {
            return response.text().then(text => {
                throw new Error(`Network response was not ok: ${response.status} - ${text}`);
            });
        }
    }
    return response.json();
})
.then((data) => {
    username = data.username;
    pfp = data.pfp;
    badges = data.badges;
    if (data.muted) {
        const mutePopup = document.createElement('div');
        mutePopup.style.cssText = `
            display: flex;
            align-items: center;
            position: fixed;
            top: 10%;
            right: 0%;
            background-color: #6f057a;
            box-shadow: inset 0 -0.365vw #570066, 3px 3px 15px rgba(0, 0, 0, 0.6);
            color: red;
            padding: 10px 20px;
            z-index: 1000;
            width: 340px;
            height: 150x; 
            border-radius: 5px;
        `;

        const muteImage = document.createElement('img');
        muteImage.src = 'https://izumiihd.github.io/pixelitcdn/assets/img/blooks/logo.png';
        muteImage.style.width = '60px';
        muteImage.style.borderRadius = '5px';
        muteImage.onerror = function() {
            this.src = 'https://izumiihd.github.io/pixelitcdn/assets/img/blooks/blooks/logo.png';
        };

        const muteText = document.createElement('div');
        muteText.textContent = "You are currently serving a mute and players will not be able to see your messages. Mute reason: " + (data.muteReason || "No reason provided.");
        muteText.style.color = 'red';
        muteText.style.marginLeft = '10px'; 

        mutePopup.appendChild(muteImage);
        mutePopup.appendChild(muteText);
        document.body.appendChild(mutePopup);
    }
})
.catch((error) => {
    console.error("Error fetching user data:", error);
});

function createMessageHTML(message) {
    const username = escapeHTML(message.sender);
    const badgesHTML = (message.badges || []).map(
        badge => `<img src="${escapeHTML(badge.image)}" draggable="false" class="badge" />`
    ).join("");

    return `
        <div class="message">
            <div class="pfp">
                <img
                    src="${escapeHTML(message.pfp)}"
                    draggable="false"
                    style="filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5))"
                    onerror="this.src='https://izumiihd.github.io/pixelitcdn/assets/img/blooks/logo.png';"
                />
            </div>
            <div class="messageContainer">
                <div class="usernameAndBadges">
                    <div class="username">${username}</div>
                    <div class="badges">${badgesHTML}</div>
                </div>
                <div class="messageText">${parseMessage(message.msg)}</div>
            </div>
        </div>
        <br>
    `;
}

function updateMessages(newMessages) {
    const messagesContainer = ge("chatContainer");
    const fragment = document.createDocumentFragment();

    newMessages.forEach(message => {
        const messageHTML = document.createElement('div');
        messageHTML.innerHTML = createMessageHTML(message);
        fragment.appendChild(messageHTML);
    });

    messagesContainer.innerHTML = "";
    messagesContainer.appendChild(fragment);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

const byte = (str) => new Blob([str]).size;

document.addEventListener('DOMContentLoaded', function() {
    const socket = io();
    console.log("Chat has been successfully loaded!");

    ge("send").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const msg = e.target.value.trim();
            if (msg === "") {
                e.target.value = "";
                return;
            }
            if (byte(msg) > 1000) {
                alert("Message is too long!");
                e.target.value = "";
                return;
            }
            const chatMessage = { sender: username, msg, badges, pfp };

            const messageHTML = createMessageHTML(chatMessage);
            const messagesContainer = ge("chatContainer");
            messagesContainer.innerHTML += messageHTML;
            
            socket.emit("message", chatMessage);
            e.target.value = "";
        }
    });

    socket.emit("getChat");

    socket.on("chatupdate", (data) => {
        if (data === "get") {
            socket.emit("getChat");
            return;
        }

        if (Array.isArray(data) && data.length > 0) {
            const existingMessagesSet = new Set(messages.map(msg => msg._id));

            data.forEach(msg => {
                if (!existingMessagesSet.has(msg._id)) {
                    messages.push(msg);
                }
            });

            updateMessages(messages);
        }
    });
});

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
        window.location.href = '/index.html';
      } else {
        console.error('Logout failed');
      }
    })
    .catch(error => console.error('Error:', error));
}