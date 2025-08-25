import emojiMap from './emojiMap.js';

function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function parseMessage(str) {

    Object.keys(emojiMap).forEach(shortcode => {
        const regex = new RegExp(shortcode, 'g');
        str = str.replace(regex, emojiMap[shortcode]);
    });
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
        muteText.textContent = "You are currently serving a mute and players will not be able to see your messages. Mute duration: " + (data.muteDuration) + " minutes. Mute reason: " + (data.muteReason || "No reason provided.");
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

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();

    const options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    };

    const formattedDate = date.toLocaleString(undefined, options).replace(',', '');

    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === new Date(now.setDate(now.getDate()-1)).toDateString()) {
        return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
        return formattedDate;
    }
}

function createMessageHTML(message) {
    const username = escapeHTML(message.sender);
    const badgesHTML = (message.badges || []).map(
        badge => `<img src="${escapeHTML(badge.image)}" draggable="false" class="badge" />`
    ).join("");
    const mediaUrlPattern = /(https?:\/\/[^\s]+\.(gif|jpeg|jpg|png|bmp|webp|svg|tiff|tif|ico)|data:image\/[a-zA-Z]+;base64,[^\s]+)/i;
    let messageContent;
    if (mediaUrlPattern.test(message.msg) && isValidUrl(message.msg)) {
        messageContent = `
            <img 
                src="${escapeHTML(message.msg)}" 
                class="chatImages" 
                style="margin-top: 10px;" 
                onclick="openModal('${escapeHTML(message.msg)}')" />
            <br>`;
    } else {
        messageContent = parseMessage(message.msg);
    }
    messageContent = twemoji.parse(messageContent);
    const formattedTime = formatTimestamp(message.timestamp);
    const timestampHTML = formattedTime ? 
        `<span class="timestamp" style="font-size: 10px;">${formattedTime}</span>` : 
        `<span class="timestamp" style="font-size: 10px;">Invalid Date</span>`;
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
                <div class="username">${username} ${timestampHTML}</div>
                <br>
                <div class="badges">${badgesHTML}</div>
            </div>
            <div class="messageText">${messageContent}</div>
        </div>
    </div>
    <br>
    <br>`;
}


function openModal(imageSrc) {
    const modal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");
    modal.style.display = "flex";
    modalImage.src = imageSrc;
}

function closeModal() {
    const modal = document.getElementById("imageModal");
    modal.style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById("imageModal");
    if (event.target === modal) {
        closeModal();
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;  
    }
}

document.addEventListener("paste", (event) => {
    const items = event.clipboardData.items;
    for (const item of items) {
        if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            const reader = new FileReader();
            reader.onload = function (event) {
                const imageUrl = event.target.result; 
                const timestamp = Date.now(); 
                const chatMessage = { sender: username, msg: imageUrl, badges, pfp, timestamp }; 
                const messageHTML = createMessageHTML(chatMessage);
                const messagesContainer = ge("chatContainer");
                messagesContainer.innerHTML += messageHTML;
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                socket.emit("message", chatMessage); 
            };
            reader.readAsDataURL(file); 
            break; 
        }
    }
});


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

}

const byte = (str) => new Blob([str]).size;

document.addEventListener('DOMContentLoaded', function() {
    const socket = io();
    console.info("Chat service initialized and connection established.");
    const sendInput = ge("send"); 
    const filteredWords = ["nigger", "nigga", "chink", "tranny", "faggot", "nga"];
    let lastMessageTime = 0; 

    sendInput.addEventListener("keydown", (e) => {
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

            const currentTime = Date.now();
            if (currentTime - lastMessageTime < 2000) {
                return;
            }

            const timestamp = currentTime;
            const chatMessage = { sender: username, msg, badges, pfp, timestamp };
            const lowerCaseMessage = msg.toLowerCase();
            const containsFilteredWord = filteredWords.some(word => lowerCaseMessage.includes(word));
            if (containsFilteredWord) {
                alert("Your message has been flagged for inappropriate content and has been logged in the audit logs for staff to review.");
                socket.emit("logFilteredMessage", {
                    username: username,
                    message: msg,
                    timestamp: timestamp
                });
                e.target.value = ""; 
                return; 
            }

            const messageHTML = createMessageHTML(chatMessage); 
            const messagesContainer = ge("chatContainer");
            messagesContainer.innerHTML += messageHTML;
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            socket.emit("message", chatMessage);
            e.target.value = "";
            lastMessageTime = currentTime;
        }
    });

    socket.on("chatupdate", (data) => {
        if (Array.isArray(data) && data.length > 0) {
            messages = data;
            updateMessages(messages);
            twemoji.parse(document.body); 
            const messagesContainer = ge("chatContainer");
            messagesContainer.scrollTop = messagesContainer.scrollHeight;  
        }
    });

    function adjustInputHeight(input) {
        input.style.height = '30%'; 
        const maxWidth = window.innerWidth * 0.9; 
        const currentWidth = Math.min(maxWidth, input.value.length * 10); 
        input.style.width = `100%`;
    }

    socket.emit("getChat");
});


document.addEventListener('DOMContentLoaded', function() {
    const messagesContainer = document.querySelector('.chatContainer');

    messagesContainer.addEventListener('mouseover', function(event) {
        if (event.target.classList.contains('messageText')) {
            event.target.style.wordBreak = 'break-word';
            event.target.style.whiteSpace = 'normal'; 
            event.target.style.overflowWrap = 'break-word'; 
        }
    });

    messagesContainer.addEventListener('mouseout', function(event) {
        if (event.target.classList.contains('messageText')) {
            event.target.style.whiteSpace = 'normal'; 
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