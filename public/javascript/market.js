let userTokens = 0;

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
    const visiblePacks = packs.filter(pack => pack.visible);
    displayPacks(visiblePacks);
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

  if (pack.name === "OG Pack") {
    divBox.style.background = "radial-gradient(circle, #ADD8E6, #335494)";
    divBox.style.boxShadow = "inset 0 -0.365vw #335494, 3px 3px 15px rgba(0, 0, 0, 0.6)";
  }

  if (pack.name === "Color Pack") {
    divBox.style.background = "radial-gradient(circle, #FFFF00, #8B8000)";
    divBox.style.boxShadow = "inset 0 -0.365vw #8B8000, 3px 3px 15px rgba(0, 0, 0, 0.6)";
  }

  if (pack.name === "School Pack") {
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
    divBox.style.background = "radial-gradient(circle, #D3D3D3, #6b6d6c)";
    divBox.style.boxShadow = "inset 0 -0.365vw #6b6d6c, 3px 3px 15px rgba(0, 0, 0, 0.6)";
  }
  
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
    showInsufficientTokensModal();
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

function showInsufficientTokensModal() {
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
}

function showPackContents(result) {
  const blook = result.blook || result;
  const packName = blook.packName;

  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  overlay.style.zIndex = '999';

  const modal = document.createElement('div');
  modal.className = 'resultBox';
  modal.style.position = 'fixed';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.zIndex = '1000';
  modal.style.textAlign = 'center';
  modal.style.height = '210px';
  modal.style.width = '210px';

  // Style logic for different packs
  setPackStyles(modal, packName);

  const blookImage = document.createElement('img');
  blookImage.src = `${blook.imageUrl}`;
  blookImage.alt = blook.name || 'Unknown Blook';
  blookImage.style.width = '100px';
  blookImage.style.height = '100px';
  blookImage.style.borderRadius = '5px';
  blookImage.onerror = function() {
    console.error("Failed to load image:", this.src);
    this.src = 'https://izumiihd.github.io/pixelitcdn/assets/img/blooks/logo.png';
  };

  const blookName = document.createElement('p');
  blookName.textContent = `${blook.name || 'Unknown Blook'}`;
  blookName.style.margin = '10px 0';

  const rarityColor = getRarityColor(blook.rarity);

  const blookInfo = document.createElement('p');
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

function setPackStyles(modal, packName) {
  if (packName === "OG Pack") {
    modal.style.background = "radial-gradient(circle, #ADD8E6, #335494)";
    modal.style.boxShadow = "inset 0 -0.365vw #335494, 3px 3px 15px rgba(0, 0, 0, 0.6)";
  } 
  else if (packName === "Color Pack") {
    modal.style.background = "radial-gradient(circle, #FFFF00, #8B8000)";
    modal.style.boxShadow = "inset 0 -0.365vw #8B8000, 3px 3px 15px rgba(0, 0, 0, 0.6)";
  } 
  else if (packName === "School Pack") {
    modal.style.background = "radial-gradient(circle, #DEB887, #8B4513)";
    modal.style.boxShadow = "inset 0 -0.365vw #8B4513, 3px 3px 15px rgba(0, 0, 0, 0.6)";
  } 
  else if (packName === "Halloween Pack") {
    modal.style.background = "radial-gradient(circle, #39272d, #67433e)";
    modal.style.boxShadow = "inset 0 -0.365vw #39272d, 3px 3px 15px rgba(0, 0, 0, 0.6)";
  } 
  else if (packName === "Space Pack") {
    modal.style.background = "radial-gradient(circle, #808080, #00008B)";
    modal.style.boxShadow = "inset 0 -0.365vw #00008B, 3px 3px 15px rgba(0, 0, 0, 0.6)";
  } 
  else if (packName === "Technology Pack") {
    modal.style.background = "radial-gradient(circle, #D3D3D3, #6b6d6c)";
    modal.style.boxShadow = "inset 0 -0.365vw #6b6d6c, 3px 3px 15px rgba(0, 0, 0, 0.6)";
  }
}

function getRarityColor(rarity) {
  const RARITY_COLORS = {
    uncommon: "#4bc22e",
    rare: "blue",
    epic: "#be0000",
    legendary: "#ff910f",
    chroma: "#00ccff",
    mystical: "#9935dd"
  };
  return RARITY_COLORS[rarity?.toLowerCase()] || 'black';
}