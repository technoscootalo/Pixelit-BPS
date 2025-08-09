let userTokens = 0;
let userPacks = [];

document.addEventListener('DOMContentLoaded', () => {
  fetchUserData();
  fetchPacks();
});

async function fetchUserData() {
  try {
    const response = await fetch('/user');
    const userData = await response.json();
    userTokens = userData.tokens;
    updateTokenDisplay();
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}

function updateTokenDisplay() {
  const tokenDisplay = document.getElementById('tokens');
  if (tokenDisplay) {
    tokenDisplay.textContent = userTokens;
  }
}

async function fetchPacks() {
  try {
    const response = await fetch('/packs');
    const packs = await response.json();
    displayPacks(packs);
  } catch (error) {
    console.error('Error fetching packs:', error);
  }
}

function displayPacks(packs) {
  const packContainer = document.getElementById('packContainer');
  packContainer.innerHTML = '';
  packs.forEach(pack => {
    const packElement = createPackElement(pack);
    packContainer.appendChild(packElement);
  });
}

function createPackElement(pack) {
  const divBox = document.createElement('div');
  divBox.className = 'box';
  divBox.setAttribute('data-pack-name', pack.name);

  const packImage = document.createElement('img');
  packImage.src = `${pack.image}`;
  packImage.alt = pack.name;
  packImage.style.width = '145px';
  packImage.style.height = '145px';
  packImage.style.transform = 'rotate(8deg)';

  const packCost = document.createElement('p');
  packCost.innerHTML = `<img src="https://izumiihd.github.io/pixelitcdn/assets/img/dashboard/token.png" alt="Token" style="width: 20px; height: 20px; vertical-align: middle;"> ${pack.cost}`;
  packCost.style.margin = '5px 0';

  divBox.appendChild(packImage);
  const br = document.createElement('br');
  divBox.appendChild(br);
  divBox.appendChild(packCost);

  divBox.addEventListener('click', () => openPack(pack.name, pack.cost));

  return divBox;
}

let lastPackClickTime = 0;
async function openPack(packName, packCost) {
  const currentTime = Date.now();
  const instantOpen = sessionStorage.getItem('instantOpen') === 'true';
  const delay = instantOpen ? 1000 : 4000; 

  if (currentTime - lastPackClickTime < delay) { 
    return;
  }

  lastPackClickTime = currentTime; 
  
  if (userTokens < packCost) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.zIndex = '10000';
    overlay.onclick = () => document.body.removeChild(overlay);
    const modal = document.createElement('div');
    modal.className = 'box';
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = 'white';
    modal.style.padding = '20px';
    modal.style.height = '80px';
    modal.style.width = '300px';
    modal.style.borderRadius = '5px';
    modal.style.zIndex = '10001';
    modal.style.textAlign = 'center';
    const message = document.createElement('p');
    message.textContent = 'You don\'t have enough tokens to open this pack!';
    message.style.fontSize = '1.2em';
    message.style.marginBottom = '15px';
    modal.appendChild(message);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    return;
  }
  const packElement = document.querySelector(`[data-pack-name="${packName}"]`);
  packElement.classList.add('opening');
  try {
    const response = await fetch(`/openPack?pack=${encodeURIComponent(packName)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to open pack');
    }
    const result = await response.json();
    console.log("Server response:", result);
    userTokens -= packCost;
    updateTokenDisplay();
    setTimeout(() => {
      packElement.classList.remove('opening');
      showPackContents(result.blook);
    }, 2000);
  } catch (error) {
    console.error('Error opening pack:', error);
    alert('Failed to open pack. Please try again.');
    packElement.classList.remove('opening');
  }
}

function showPackContents(result) {
  console.log("Pack contents:", result);

  const blook = result.blook || result;

  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  overlay.style.zIndex = '999';

  const modal = document.createElement('div');
  modal.className = 'box';
  modal.style.position = 'fixed';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.zIndex = '1000';
  modal.style.textAlign = 'center';

  const blookImage = document.createElement('img');
  blookImage.src = `${blook.imageUrl}`;
  blookImage.alt = blook.name || 'Unknown Blook';
  blookImage.style.width = '130px';
  blookImage.style.height = '130px';
  blookImage.style.borderRadius = '5px';
  blookImage.onerror = function() {
    console.error("Failed to load image:", this.src);
    this.src = 'https://izumiihd.github.io/pixelitcdn/assets/img/blooks/logo.png';
  };

  const blookName = document.createElement('p');
  blookName.textContent = `${blook.name || 'Unknown Blook'}`;
  blookName.style.margin = '10px 0';

  const RARITY_COLORS = {
    uncommon: "#4bc22e",
    rare: "blue",
    epic: "#be0000",
    legendary: "#ff910f",
    chroma: "#00ccff",
    mystical: "#9935dd"
  };
  
  const blookInfo = document.createElement('p');
  const rarityColor = RARITY_COLORS[blook.rarity?.toLowerCase()] || 'black';
  blookInfo.textContent = `${blook.rarity || 'Unknown'}`;
  blookInfo.style.margin = '5px 0';
  blookInfo.style.color = rarityColor;

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Proceed';
  closeButton.onclick = () => document.body.removeChild(overlay);
  closeButton.style.backgroundColor = '#6f057a';
  closeButton.style.boxShadow = 'inset 0 -0.265vw #61056b, 3px 3px 15px rgba(0, 0, 0, 0.6)';
  closeButton.style.border = 'none';
  closeButton.style.padding = '10px 20px';
  closeButton.style.borderRadius = '5px';
  closeButton.style.fontFamily = 'Pixelify Sans';
  closeButton.style.color = 'white';
  closeButton.style.cursor = 'pointer';
  closeButton.style.transform = 'scale(0.95)';
  closeButton.style.transition = 'transform 0.3s ease';
  closeButton.style.marginTop = '10px';

  modal.appendChild(blookImage);
  modal.appendChild(blookName);
  modal.appendChild(blookInfo);
  modal.appendChild(closeButton);
  overlay.appendChild(modal);

  document.body.appendChild(overlay);
}

const style = document.createElement('style');
style.textContent = `
  .pack-element {
    transition: transform 0.3s ease;
    cursor: pointer;
  }

  .pack-element:hover {
    transform: scale(1.05);
  }

  /*
  .opening {
    animation: packOpening 2s ease-in-out;
  }

  @keyframes packOpening {
    0% { transform: scale(1) rotate(0deg); }
    25% { transform: scale(1.1) rotate(-5deg); }
    50% { transform: scale(1.2) rotate(5deg); }
    75% { transform: scale(1.1) rotate(-3deg); }
    100% { transform: scale(1) rotate(0deg); }
  }
  */

  .pack-modal {
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
  }

  .pack-content {
    background-color: #6f057a;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 0 15px #ff6600;
  }

  .pack-content button {
    margin-top: 10px;
    padding: 5px 10px;
    background-color: #ff6600;
    color: #1a0005;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
`;
document.head.appendChild(style);
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