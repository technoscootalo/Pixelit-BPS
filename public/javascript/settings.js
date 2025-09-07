if (localStorage.loggedin == "true") {
  sessionStorage = localStorage;
}

document.addEventListener('DOMContentLoaded', function() {
  fetch('/user') 
    .then(response => response.json())
    .then(data => {
      const userRole = data.role;
      const allowedRoles = ['Owner', 'Admin', 'Moderator', 'Helper', 'Developer', 'Community Manager'];
      if (allowedRoles.includes(userRole)) {
        document.getElementById('wrench-icon').style.display = 'inline';
      }
    })
  .catch(error => {
   console.error('Error fetching user role:', error);
    });
});

if (localStorage.loggedin == "true") {
    sessionStorage = localStorage;
}

document.addEventListener('DOMContentLoaded', function () {
    const instantOpenElement = document.getElementById("instantOpen");
    let instantOpen = localStorage.getItem('instantOpen') === 'On';
    instantOpenElement.textContent = `Instant Open: ${instantOpen ? 'On' : 'Off'}`;
    instantOpenElement.addEventListener('click', function () {
        instantOpen = !instantOpen;
        localStorage.setItem('instantOpen', instantOpen ? 'On' : 'Off');
        instantOpenElement.textContent = `Instant Open: ${instantOpen ? 'On' : 'Off'}`;
    });
});

function formatJoinDate(isoString) {
  if (!isoString) return 'Unknown';
  const date = new Date(isoString);
  const options = {
    year: "numeric",
    month: "long", 
    day: "numeric"
  };
  return date.toLocaleDateString("en-US", options);
}
async function fetchUserData() {
  try {
    const response = await fetch('/user');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}
document.addEventListener("DOMContentLoaded", async function() {
  const usernameElement = document.getElementById("username");
  const roleElement = document.getElementById("role");
  const uidElement = document.getElementById("uid");
  const tokensElement = document.getElementById("tokens");
  const joinDateElement = document.getElementById("date");
  const userData = await fetchUserData();
  if (userData) {
    if (usernameElement) {
      usernameElement.textContent = `Username: ${userData.username}`;
    }
    if (roleElement) {
      roleElement.textContent = `Role: ${userData.role}`;
    }
///    if (joinDateElement) {
///      joinDateElement.innerHTML = `Joined: ${formatJoinDate(userData.joinDate)}`;
///    }
    if (uidElement) {
      uidElement.textContent = `UID: ${userData.uid}`;
    }
  } else {
    if (usernameElement) {
      usernameElement.textContent = `Username: Unavailable`;
    }
    if (roleElement) {
      roleElement.textContent = `Role: Unavailable`;
    }
    if (joinDateElement) {
      joinDateElement.innerHTML = `Joined: Unknown`;
    }
    if (uidElement) {
      uidElement.textContent = `UID: Unavailable`;
    }
  }
});

/* 
document.getElementById('changePassword').addEventListener('click', function() {
    const modal = createPasswordChangeModal();
    document.body.appendChild(modal);
});
*/

function createPasswordChangeModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    const modalContent = document.createElement('div');
    modalContent.className = 'password-change-modal-content';
    modalContent.style.cssText = `
        background-color: #6f057a;
        box-shadow: inset 0 -0.365vw #61056b, 3px 3px 15px rgba(0, 0, 0, 0.6);
        padding: 20px;
        border-radius: 5px;
        text-align: center;
        font-size: 26px;
        width: 420px;
    `
    const title = document.createElement('h2');
    title.textContent = "Change Password";
    modalContent.appendChild(title);
    
    const currentPasswordInput = document.createElement('input');
    currentPasswordInput.type = 'password';
    currentPasswordInput.placeholder = 'Old Password';
    currentPasswordInput.style.cssText = `
    width: 60%;
    height: 50px;
    margin-bottom: 10px;
    display: inline;
    font-family: 'pixelify sans';
    font-size: 28px;
    text-align: center;
    border: 3px solid #5e046e;
    border-radius: 4px;
    box-sizing: border-box;
    background-color: transparent;
    color: white;
    margin-right: 5px;
    appearance: textfield;
    -webkit-appearance: none;
    `;
    modalContent.appendChild(currentPasswordInput);
    
    const newPasswordInput = document.createElement('input');
    newPasswordInput.type = 'password';
    newPasswordInput.placeholder = 'New Password';
    newPasswordInput.style.cssText = `
    width: 60%;
    height: 50px;
    margin-bottom: 10px;
    display: inline;
    font-family: 'pixelify sans';
    font-size: 28px;
    text-align: center;
    border: 3px solid #5e046e;
    border-radius: 4px;
    box-sizing: border-box;
    background-color: transparent;
    color: white;
    margin-right: 5px;
    appearance: textfield;
    -webkit-appearance: none;
    `;
    modalContent.appendChild(newPasswordInput);

    const warningText = document.createElement('div');
    warningText.id = 'error-message';
    warningText.innerHTML = "If you change your username, someone else can snipe your old password.";
    warningText.style.cssText = `
        color: red;
        font-size: 16px;
        margin-bottom: 10px;
        font-weight: bold;
    `;
    modalContent.appendChild(warningText);

    const changeButton = document.createElement('button');
    changeButton.textContent = 'Change';
    changeButton.style.cssText = `
        background-color: green;
        box-shadow: inset 0 -0.365vw #006400, 3px 3px 15px rgba(0, 0, 0, 0.6);
        font-family: 'pixelify sans';
        color: white;
        padding: 10px 20px;
        margin: 10px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: box-shadow 0.3s ease;
        margin-left: 60px;
    `;

    changeButton.onmouseover = () => {
        changeButton.style.boxShadow = 'inset 0 -0.5vw #006400, 3px 3px 15px rgba(0, 0, 0, 0.6)';
    };

    changeButton.onmouseout = () => {
        changeButton.style.boxShadow = 'inset 0 -0.365vw #006400, 3px 3px 15px rgba(0, 0, 0, 0.6)';
    };
    modalContent.appendChild(changeButton);

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.cssText = `
        background-color: red;
        box-shadow: inset 0 -0.365vw #b30000, 3px 3px 15px rgba(0, 0, 0, 0.6);
        font-family: 'pixelify sans';
        color: white;
        padding: 10px 20px;
        margin: 10px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: box-shadow 0.3s ease;
        margin-right: 60px;
    `;

    cancelButton.onmouseover = () => {
        cancelButton.style.boxShadow = 'inset 0 -0.5vw #b30000, 3px 3px 15px rgba(0, 0, 0, 0.6)';
    };

    cancelButton.onmouseout = () => {
        cancelButton.style.boxShadow = 'inset 0 -0.365vw #b30000, 3px 3px 15px rgba(0, 0, 0, 0.6)';
    };

    cancelButton.onclick = () => {
        document.body.removeChild(modal);
    };

    modalContent.appendChild(cancelButton);
    
    changeButton.onclick = async () => {
        const currentPassword = currentPasswordInput.value.trim();
        const newPassword = newPasswordInput.value.trim();

        if (!currentPassword || !newPassword) {
            warningText.textContent = "Please fill in all fields.";
            setTimeout(() => {
                warningText.textContent = "If you change your username, someone else can snipe your old password.";
            }, 2000);
            return;
        }

        const forbiddenChars = /[^a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;
        if (forbiddenChars.test(newPassword) || newPassword.length < 8 || newPassword.length > 32) {
            warningText.textContent = "New password must be 8-32 characters long and contain only letters, numbers, and common symbols.";
            setTimeout(() => {
                warningText.textContent = "If you change your username, someone else can snipe your old password.";
            }, 2000);
            return;
        }

        const response = await fetch('/changePassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        if (response.ok) {
            window.location.href = '../login.html';
        } else {
            const errorText = await response.text();
            document.getElementById('error-message').textContent = `Error: ${errorText}`; 
        }
    };

    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    modalContent.appendChild(changeButton);
    modal.appendChild(modalContent);
    return modal;
}

document.getElementById('changeUsername').addEventListener('click', function() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background-color: #6f057a;
        box-shadow: inset 0 -0.365vw #61056b, 3px 3px 15px rgba(0, 0, 0, 0.6);
        padding: 20px;
        border-radius: 5px;
        text-align: center;
        font-size: 26px;
        width: 420px;
    `;

    const title = document.createElement('h2');
    title.textContent = "Change Username";
    modalContent.appendChild(title);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'New Username';
    input.style.cssText = `
    width: 60%;
    height: 50px;
    margin-bottom: 10px;
    display: inline;
    font-family: 'pixelify sans';
    font-size: 28px;
    text-align: center;
    border: 3px solid #5e046e;
    border-radius: 4px;
    box-sizing: border-box;
    background-color: transparent;
    color: white;
    margin-right: 5px;
    appearance: textfield;
    -webkit-appearance: none;
    `;

    modalContent.appendChild(input);

    
    const br = document.createElement('br');
    modalContent.appendChild(br);

    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.placeholder = 'Confirm Password';
    passwordInput.style.cssText = `
    width: 60%;
    height: 50px;
    margin-bottom: 10px;
    display: inline;
    font-family: 'pixelify sans';
    font-size: 28px;
    text-align: center;
    border: 3px solid #5e046e;
    border-radius: 4px;
    box-sizing: border-box;
    background-color: transparent;
    color: white;
    margin-right: 5px;
    appearance: textfield;
    -webkit-appearance: none;
    `;
    modalContent.appendChild(passwordInput); 

    
    const br2 = document.createElement('br');
    modalContent.appendChild(br2);

    
    const warningText = document.createElement('div');
    warningText.id = 'error-message';
    warningText.innerHTML = "If you change your username, someone else can snipe your old username.";
    warningText.style.cssText = `
        color: red;
        font-size: 16px;
        margin-bottom: 10px;
        font-weight: bold;
    `;
    modalContent.appendChild(warningText);
    
    const changeButton = document.createElement('button');
    changeButton.textContent = 'Change';
    changeButton.style.cssText = `
        background-color: green;
        box-shadow: inset 0 -0.365vw #006400, 3px 3px 15px rgba(0, 0, 0, 0.6);
        font-family: 'pixelify sans';
        color: white;
        padding: 10px 20px;
        margin: 10px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: box-shadow 0.3s ease;
        margin-right: 60px;
    `;

    changeButton.onmouseover = () => {
        changeButton.style.boxShadow = 'inset 0 -0.5vw #006400, 3px 3px 15px rgba(0, 0, 0, 0.6)';
    };

    changeButton.onmouseout = () => {
        changeButton.style.boxShadow = 'inset 0 -0.365vw #006400, 3px 3px 15px rgba(0, 0, 0, 0.6)';
    };
    modalContent.appendChild(changeButton);

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.cssText = `
        background-color: red;
        box-shadow: inset 0 -0.365vw #b30000, 3px 3px 15px rgba(0, 0, 0, 0.6);
        font-family: 'pixelify sans';
        color: white;
        padding: 10px 20px;
        margin: 10px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: box-shadow 0.3s ease;
        margin-left: 60px;
    `;

    cancelButton.onmouseover = () => {
        cancelButton.style.boxShadow = 'inset 0 -0.5vw #b30000, 3px 3px 15px rgba(0, 0, 0, 0.6)';
    };

    cancelButton.onmouseout = () => {
        cancelButton.style.boxShadow = 'inset 0 -0.365vw #b30000, 3px 3px 15px rgba(0, 0, 0, 0.6)';
    };
    modalContent.appendChild(cancelButton);



    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    cancelButton.onclick = () => {
        document.body.removeChild(modal);
    };

    changeButton.onclick = async () => {
        const newUsername = input.value.trim();
        const password = passwordInput.value.trim();

        const forbiddenChars = /[^a-zA-Z0-9_]/;
        if (!newUsername || !password) {
            document.getElementById('error-message').textContent = "Please fill out all fields.";
            setTimeout(() => {
                document.getElementById('error-message').textContent = "If you change your username, someone else can snipe your old username.";
            }, 2000);
            return;
        }

        if (forbiddenChars.test(newUsername) || newUsername.length < 3 || newUsername.length > 20) {
            document.getElementById('error-message').textContent = "Username must be 3-20 characters long and contain only letters, numbers, and underscores.";
            setTimeout(() => {
                document.getElementById('error-message').textContent = "If you change your username, someone else can snipe your old username.";
            }, 2000);
            return;
        }

        const existingUserResponse = await fetch('/allUsers');
        const existingUsers = await existingUserResponse.json();

        const existingUsernames = existingUsers.map(user => user.username.toLowerCase());
        if (existingUsernames.includes(newUsername.toLowerCase())) {
            document.getElementById('error-message').textContent = "Username already exists.";
            setTimeout(() => {
                document.getElementById('error-message').textContent = "If you change your username, someone else can snipe your old username.";
            }, 2000);
            return;
        }

        const response = await fetch('/changeUsername', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newUsername, password })
        });

        if (response.ok) {
            window.location.href = '/login'; 
        } else {
            const errorText = await response.text();
            document.getElementById('error-message').textContent = `Error: ${errorText}`;
        }
    };

    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });

});

const today = new Date();
const dateOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
};
date.innerHTML = today.toLocaleDateString("en-US", dateOptions);

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