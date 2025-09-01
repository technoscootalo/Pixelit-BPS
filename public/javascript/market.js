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
    const visiblePacks = packs.filter(pack => pack.visible)
    displayPacks(visiblePacks);
  } catch (error) {
    console.error('Error fetching packs:', error);
  }
}

function displayPacks(packs) {
  const packContainer = document.getElementById('packContainer');
  packContainer.innerHTML = '';

  packs.forEach((pack, index) => {
    const packElement = createPackElement(pack);
    packContainer.appendChild(packElement);

    if ((index + 1) % 1 === 0) {
      const br = document.createElement('br'); 
      packContainer.appendChild(br); 
    }
  });
}

function createPackElement(pack) {
  const divBox = document.createElement('div');
  divBox.className = 'box';
  divBox.setAttribute('data-pack-name', pack.name);

  if (pack.name === "OG Pack") {
    divBox.style.background = "radial-gradient(circle, #ADD8E6, #335494)";
    divBox.style.boxShadow = "inset 0 -0.365vw #335494, 3px 3px 15px rgba(0, 0, 0, 0.6)";
  }

  if (pack.name === "Color Pack") {
    divBox.style.background = "radial-gradient(circle, #FFFF00, #8B8000)";
    divBox.style.boxShadow = "inset 0 -0.365vw #8B8000, 3px 3px 15px rgba(0, 0, 0, 0.6)";
  }

  if (pack.name === "Fall Pack") {
    divBox.style.background = "radial-gradient(circle, #DEB887, #8B4513)";
    divBox.style.boxShadow = "inset 0 -0.365vw #8B4513, 3px 3px 15px rgba(0, 0, 0, 0.6)";
  }

  if (pack.name === "Halloween Pack") {
    divBox.style.background = "radial-gradient(circle, #39272d, #67433e)";
    divBox.style.boxShadow = "inset 0 -0.365vw #39272d, 3px 3px 15px rgba(0, 0, 0, 0.6)";
  }
  
  if (pack.name === "Space Pack") {
    divBox.style.background = "radial-gradient(circle, #808080, #00008B)";
    divBox.style.boxShadow = "inset 0 -0.365vw #00008B, 3px 3px 15px rgba(0, 0, 0, 0.6)";
  }

  if (pack.name === "Technology Pack") {
    divBox.style.background = "radial-gradient(circle, #346136, #2faa34)";
    divBox.style.boxShadow = "inset 0 -0.365vw #346136, 3px 3px 15px rgba(0, 0, 0, 0.6)";
  }

  if (pack.name === "School Pack") {
    divBox.style.background = "radial-gradient(circle, #836048, #66423a)";
    divBox.style.boxShadow = "inset 0 -0.365vw #66423a, 3px 3px 15px rgba(0, 0, 0, 0.6)";
  }

  if (pack.name === "Miscellaneous") {
    divBox.style.background = "linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)";
    divBox.style.boxShadow = "inset 0 -0.365vw rgba(0, 0, 0, 0.6), 3px 3px 15px rgba(0, 0, 0, 0.6)";
  }
  
  const packImage = document.createElement('img');
  packImage.src = `${pack.image}`;
  packImage.alt = pack.name;
  packImage.style.width = '145px';
  packImage.style.height = '145px';
  packImage.style.filter = 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.5))';
  packImage.style.transform = 'rotate(8deg)';

  const packCost = document.createElement('p');
  packCost.innerHTML = `<img src="https://izumiihd.github.io/pixelitcdn/assets/img/icons/token.png" alt="Token" style="width: 20px; height: 20px; vertical-align: middle; filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5));"> ${pack.cost}`;
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
  const instantOpen = localStorage.getItem('instantOpen') === 'On';
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
  const packName = blook.packName;
  const pack = { name: packName };

  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.background = 'radial-gradient(circle, #330838, #4a034f)';
  overlay.style.zIndex = '999';

  const modal = document.createElement('div');
  modal.className = 'resultBox';
  modal.style.position = 'fixed';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.zIndex = '1000';
  modal.style.textAlign = 'center';
  modal.style.height = '375px';
  modal.style.width = '360px';
  modal.style.borderRadius = '10px';
  modal.style.boxShadow = "inset 0 -0.365vw #330838, 3px 3px 15px rgba(0, 0, 0, 0.6)";
  modal.style.background = 'radial-gradient(circle, #6f057a, #4a034f)';

  const blookName = document.createElement('p');
  blookName.textContent = `${blook.name || 'Unknown Blook'}`;
  blookName.style.fontSize = '42px';
  blookName.style.padding = '0px';
  blookName.style.fontWeight = 'bold';
  
  if (blookName.textContent.length > 15) {
    modal.style.width = '360px';
    modal.style.height = '420px';
  }

  const breakLine = document.createElement('br');
  modal.appendChild(breakLine);
  
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
  const rarity = blook.rarity || 'Unknown';
  const formattedRarity = rarity.charAt(0).toUpperCase() + rarity.slice(1);
  blookInfo.textContent = `${formattedRarity}`;
  blookInfo.style.margin = '5px 0';
  blookInfo.style.fontSize = '28px';
  blookInfo.style.fontWeight = 'bold';
  blookInfo.style.color = rarityColor;


  
  const breakLine2 = document.createElement('br');
  modal.appendChild(breakLine2);
  
  const blookImage = document.createElement('img');
  blookImage.src = `${blook.imageUrl}`;
  blookImage.alt = blook.name || 'Unknown Blook';
  blookImage.style.width = '160px';
  blookImage.style.height = '160px';
  blookImage.style.borderRadius = '5px';
  blookImage.style.filter = 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.5))';
  blookImage.onerror = function() {
    console.error("Failed to load image:", this.src);
    this.src = 'https://izumiihd.github.io/pixelitcdn/assets/img/blooks/logo.png';
  };
  
  const br = document.createElement('br');
  modal.appendChild(br);
  
  const blookChance = document.createElement('p');
  blookChance.textContent = `${blook.chance}%`;
  blookChance.style.margin = '5px 0';
  blookChance.style.fontSize = '28px';
  blookChance.style.fontWeight = 'bold';
  blookChance.style.color = 'white';
  
  modal.appendChild(blookName);
  modal.appendChild(br);
  modal.appendChild(blookInfo);
  modal.appendChild(blookImage);
  modal.appendChild(br);
  modal.appendChild(blookChance);
  overlay.appendChild(modal);

  overlay.onclick = () => document.body.removeChild(overlay);

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
    background-color: #6f057a;
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

const RARITY_COLORS = {
  uncommon: "#4bc22e",
  rare: "blue",
  epic: "#be0000",
  legendary: "#ff910f",
  chroma: "#00ccff",
  mystical: "#9935dd"
};

document.getElementById('displayRarity').addEventListener('click', async function() {
  const response = await fetch('/packs');
  const packs = await response.json();

  const visiblePacks = packs.filter(pack => pack.visible);

  const modal = document.createElement('div');
  modal.classList.add('modal');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;

  const modalContent = document.createElement('div');
  modalContent.classList.add('modal-content');
  modalContent.style.cssText = `
    background-color: #6f057a;
    box-shadow: inset 0 -0.365vw #61056b, 3px 3px 15px rgba(0, 0, 0, 0.6);
    padding: 20px;
    border-radius: 5px;
    text-align: center;
    color: white;
    max-width: 90%;
    overflow-y: auto;
    max-height: 80%;
  `;

  const title = document.createElement('h1');
  title.textContent = 'Pack Rarities';
  modalContent.appendChild(title);

  visiblePacks.forEach(pack => {
    const packHeader = document.createElement('h2');
    packHeader.textContent = pack.name;
    modalContent.appendChild(packHeader);

    pack.blooks.forEach(blook => {
      const blookContainer = document.createElement('div');
      blookContainer.style.marginBottom = '10px';

      const blookImage = document.createElement('img');
      blookImage.src = blook.imageUrl;
      blookImage.alt = blook.name;
      blookImage.style.filter = 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.5))';
      blookImage.style.width = '100px';
      blookImage.style.height = '100px';
      blookImage.onerror = function() {
        this.src = 'https://izumiihd.github.io/pixelitcdn/assets/img/blooks/logo.png';
      };

      const blookInfo = document.createElement('p');
      blookInfo.textContent = `(${blook.name}: `;
      const raritySpan = document.createElement('span');
      raritySpan.textContent = blook.rarity;
      raritySpan.style.color = RARITY_COLORS[blook.rarity.toLowerCase()] || 'white';
      blookInfo.appendChild(raritySpan);
      blookInfo.appendChild(document.createTextNode(` ${blook.chance}%)`));

      modalContent.onclick = (event) => {
        if (event.target === modalContent) {
          document.body.removeChild(modalContent);
        }
      };

      blookContainer.appendChild(blookImage);
      blookContainer.appendChild(blookInfo);
      modalContent.appendChild(blookContainer);
    });
  });

  const closeModal = document.createElement('button');
  closeModal.textContent = 'Close';
  closeModal.style.marginTop = '20px';
  closeModal.style.backgroundColor = 'red';
  closeModal.style.cursor = 'pointer';
  closeModal.style.color = 'white';
  closeModal.style.fontFamily = 'Pixelify Sans';
  closeModal.style.boxShadow = 'inset 0 -0.365vw #b30000, 3px 3px 15px rgba(0, 0, 0, 0.6)';
  closeModal.style.border = 'none';
  closeModal.style.width = '80px';
  closeModal.style.height = '50px';
  closeModal.style.borderRadius = '5px';
  closeModal.style.transition = 'box-shadow 0.3s ease';
  closeModal.addEventListener('mouseover', function() {
    this.style.boxShadow = 'inset 0 -0.5vw #b30000, 3px 3px 15px rgba(0, 0, 0, 0.6)';
  });
  closeModal.addEventListener('mouseout', function() {
    this.style.boxShadow = 'inset 0 -0.365vw #b30000, 3px 3px 15px rgba(0, 0, 0, 0.6)';
  });
  closeModal.onclick = () => {
    document.body.removeChild(modal);
  };
  modal.onclick = (event) => {
    if (event.target === modal) {
      document.body.removeChild(modal);
    }
  };
  modalContent.appendChild(closeModal);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
});

document.head.appendChild(style);

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