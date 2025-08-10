const blookName = document.getElementById("blook-name");
const blookImage = document.getElementById("blook-image");
const blookRarity = document.getElementById("blook-rarity");
const blookOwned = document.getElementById("blook-owned");
const sellButton = document.getElementById("sell-blook");
const container = document.querySelector(".container");
const setPfpButton = document.getElementById("set-pfp");

const RARITY_COLORS = {
  uncommon: "#4bc22e",
  rare: "blue",
  epic: "#be0000",
  legendary: "#ff910f",
  chroma: "#00ccff",
  mystical: "#9935dd"
};

const RARITY_VALUES = {
  uncommon: 5,
  rare: 20,
  epic: 75,
  legendary: 200,
  chroma: 300 
};

function getRaritySpan(rarity) {
  const color = RARITY_COLORS[rarity.toLowerCase()] || "black";
  return `<span style='color: ${color};'>${rarity.charAt(0).toUpperCase() + rarity.slice(1)}</span>`;
}

function fetchJSON(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  }).then(response => {
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
  });
}

function updateBlookInfo(blook, packName) {
  const { name = "Unknown Blook", imageUrl, rarity = "Unknown", owned = 0 } = blook;

  blookName.textContent = name;
  blookImage.src = owned > 0 ? `${imageUrl}` : "";
  blookImage.style.display = owned > 0 ? "block" : "none";
  blookRarity.innerHTML = getRaritySpan(rarity);
  blookOwned.textContent = `Owned: ${owned}`;
  setPfpButton.style.display = "block";
  sellButton.style.display = owned > 0 ? "block" : "none";

  let quantityInput = document.getElementById("sell-quantity");
  if (!quantityInput) {
 quantityInput = document.createElement("input");
   quantityInput.id = "sell-quantity";

    const blookInfoElement = document.getElementById("blook-info");
    if (blookInfoElement) {
      blookInfoElement.appendChild(quantityInput);
    } else {
      document.body.appendChild(quantityInput);
    }
  }
  quantityInput.type = "number";
  quantityInput.min = "1";
  quantityInput.max = owned.toString();
  quantityInput.value = "1";
  quantityInput.placeholder = "Enter an amount of blooks to sell";

  setPfpButton.onclick = () => changeProfilePicture(name, imageUrl, packName);
}

function generatePacksHTML(packsData) {
  container.innerHTML = "";

  packsData.forEach(pack => {
    const packDiv = document.createElement("div");
    packDiv.classList.add("pack");

    const packTitle = document.createElement("h2");
    packTitle.textContent = pack.name;
    packTitle.style.borderBottom = "3px solid white";
    packTitle.style.borderRadius = "2px";
    packTitle.style.fontSize = "26px";
    packDiv.appendChild(packTitle);

    const itemsDiv = document.createElement("div");
    itemsDiv.classList.add("items");

    pack.blooks.forEach(blook => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("item");

      if (blook.owned > 0) {
        const img = document.createElement("img");
        img.src = `${blook.imageUrl}`;
        img.alt = blook.name;
        itemDiv.appendChild(img);

        const badge = document.createElement("div");
        badge.classList.add("badge");
        badge.textContent = blook.owned;
        badge.style.textShadow = "1px 1px 2px black";
        badge.style.backgroundColor = RARITY_COLORS[blook.rarity.toLowerCase()];
        itemDiv.appendChild(badge);

        itemDiv.addEventListener("click", () => updateBlookInfo(blook, pack.name));
      } else {
        const lockIcon = document.createElement("i");
        lockIcon.classList.add("fa-solid", "fa-lock", "fa-2xl");
        itemDiv.style.cursor = 'pointer';
        itemDiv.appendChild(lockIcon);
      }

      itemsDiv.appendChild(itemDiv);
    });

    packDiv.appendChild(itemsDiv);
    container.appendChild(packDiv);
  });
}

function sellBlook() {
  const name = blookName.textContent;
  const rarity = blookRarity.textContent.toLowerCase();
  const owned = parseInt(blookOwned.textContent.split(": ")[1], 10);


  const modal = document.createElement('div');
  modal.classList.add('modal');
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
  modalContent.classList.add('modal-content');
  modalContent.style.cssText = `
    background-color: #6f057a;
    box-shadow: inset 0 -0.365vw #61056b, 3px 3px 15px rgba(0, 0, 0, 0.6);
    padding: 20px;
    border-radius: 5px;
    text-align: center;
    font-size: 32px;
    width: 420px;
  `;

  const message = document.createElement('p');
  const pixelsAmount = RARITY_VALUES[rarity] || 0;
  message.textContent = `Sell ${name} Pixel for ${pixelsAmount} tokens each:`;
  message.style.textAlign = 'center';
  modalContent.appendChild(message);

  const quantityInput = document.createElement('input');
  quantityInput.type = 'number';
  quantityInput.min = '1';
  quantityInput.max = owned.toString();
  quantityInput.value = '1';
    quantityInput.style.cssText = `
    width: 70px;
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
  
  const inputLabel = document.createElement('label');
  inputLabel.textContent = ` / ${owned} `;
  inputLabel.style.display = 'inline';
  inputLabel.style.textAlign = 'center';
  inputLabel.style.marginBottom = '5px';

  const containerDiv = document.createElement('div');
  containerDiv.style.cssText = `
    display: flex;
    justify-content: center;
    align-items: center;
  `;
  containerDiv.appendChild(quantityInput);
  containerDiv.appendChild(inputLabel);
  modalContent.appendChild(containerDiv);

  
  const breakEl = document.createElement('br');
  modalContent.appendChild(breakEl);

  const sellButtonModal = document.createElement('button');
  sellButtonModal.textContent = 'Sell';
    sellButtonModal.style.cssText = `
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
  `;

  sellButtonModal.onmouseover = () => {
    sellButtonModal.style.boxShadow = 'inset 0 -0.5vw #006400, 3px 3px 15px rgba(0, 0, 0, 0.6)';
  };

  sellButtonModal.onmouseout = () => {
    sellButtonModal.style.boxShadow = 'inset 0 -0.365vw #006400, 3px 3px 15px rgba(0, 0, 0, 0.6)';
  };
    const spaceEl = document.createElement('span');
    spaceEl.innerHTML = '&nbsp;';
    spaceEl.style.marginLeft = '10px';
    spaceEl.style.marginRight = '10px';
  const cancelButtonModal = document.createElement('button');
  cancelButtonModal.textContent = 'Cancel';
      cancelButtonModal.style.cssText = `
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
  `;

  cancelButtonModal.onmouseover = () => {
    cancelButtonModal.style.boxShadow = 'inset 0 -0.5vw #b30000, 3px 3px 15px rgba(0, 0, 0, 0.6)';
  };

  cancelButtonModal.onmouseout = () => {
    cancelButtonModal.style.boxShadow = 'inset 0 -0.365vw #b30000, 3px 3px 15px rgba(0, 0, 0, 0.6)';
  };

  
  const errorMessage = document.createElement('div');
  errorMessage.style.cssText = `
    color: red;
    font-size: 16px;
    margin-top: 10px;
  `;
  modalContent.appendChild(errorMessage);
  
  modalContent.appendChild(sellButtonModal);
  modalContent.appendChild(cancelButtonModal);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  sellButtonModal.onclick = () => {
    const quantityToSell = quantityInput.value;
    const quantityNumber = parseInt(quantityToSell, 10);

    if (isNaN(quantityNumber) || quantityNumber <= 0 || quantityNumber > owned) {
      errorMessage.textContent = "Please enter a valid quantity to sell.";
      setTimeout(() => {
        errorMessage.textContent = "";
      }, 2000);
      return;
    }

    const tokensToAdd = (RARITY_VALUES[rarity] || 0) * quantityNumber;

    fetchJSON("/sellBlook", {
      method: "POST",
      body: JSON.stringify({ name, rarity, tokensToAdd, quantity: quantityNumber })
    })
    .then(data => {
      if (data.success) {
        const newOwned = owned - quantityNumber;
        blookOwned.textContent = `Owned: ${newOwned}`;
        sellButton.style.display = newOwned <= 0 ? "none" : "block";

        if (newOwned <= 0) {
          let quantityInputEl = document.getElementById("sell-quantity");
            if (quantityInputEl) {
              quantityInputEl.remove();
            }
        } else {
          let quantityInputEl = document.getElementById("sell-quantity");
            if (quantityInputEl) {
              quantityInputEl.max = newOwned.toString();
            }
        }

        const itemDivs = document.querySelectorAll(".item");
        itemDivs.forEach(itemDiv => {
          if (itemDiv.querySelector("img")?.alt === name) {
            const badge = itemDiv.querySelector(".badge");
            if (badge) {
              badge.textContent = newOwned;
            }
            if (newOwned === 0) {
              itemDiv.innerHTML = "";
              const lockIcon = document.createElement("i");
              lockIcon.classList.add("fa-solid", "fa-lock");
              itemDiv.appendChild(lockIcon);
            }
          }
        });
        document.body.removeChild(modal);
      } else {
        errorMessage.textContent = data.message || "Failed to sell blook.";
      }
    })
    .catch(error => {
      console.error("Error selling blook:", error);
      errorMessage.textContent = "An error occurred while selling the blook.";
      document.body.removeChild(modal);
    });
  };

  cancelButtonModal.onclick = () => {
    document.body.removeChild(modal);
  };
}

sellButton.addEventListener('click', sellBlook);

function checkUserRole() {
  fetchJSON('/user')
    .then(data => {
      const allowedRoles = ['Owner', 'Admin', 'Moderator', 'Helper', 'Developer'];
      if (allowedRoles.includes(data.role)) {
        document.getElementById('wrench-icon').style.display = 'inline';
      }
    })
    .catch(error => console.error('Error fetching user role:', error));
}

window.onload = () => {
  if (localStorage.loggedin === "true") {
    Object.assign(sessionStorage, localStorage);
  }

  fetchJSON("/user")
    .then(data => generatePacksHTML(data.packs))
    .catch(error => console.error("Error fetching user data:", error));

  checkUserRole();
};

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

function changeProfilePicture(blookName, imageUrl, packName) {
  const modal = document.createElement('div');
  modal.classList.add('modal');
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
  modalContent.classList.add('modal-content');
  modalContent.style.cssText = `
    background-color: #6f057a;
    box-shadow: inset 0 -0.365vw #61056b, 3px 3px 15px rgba(0, 0, 0, 0.6);
    padding: 20px;
    border-radius: 5px;
    text-align: center;
    width: 300px;
    height: 300px;
  `;

  const message = document.createElement('p');
  message.textContent = `Are you sure you want to change your profile picture to ${blookName}?`;
  message.style.textAlign = 'center';
  modalContent.appendChild(message);

  const blookImageEl = document.createElement('img');
  blookImageEl.src = `${imageUrl}`;
  blookImageEl.alt = blookName || 'Unknown Blook';
  blookImageEl.style.width = '130px';
  blookImageEl.style.height = '130px';
  blookImageEl.style.borderRadius = '5px';

  blookImageEl.style.display = 'block';
  blookImageEl.style.marginLeft = 'auto';
  blookImageEl.style.marginRight = 'auto';
  blookImageEl.onerror = function() {
    console.error("Failed to load image:", this.src);
    this.src = 'https://izumiihd.github.io/pixelitcdn/assets/img/blooks/logo.png';
  };
  modalContent.appendChild(blookImageEl);

  const breakEl = document.createElement('br');
  modalContent.appendChild(breakEl);  

  const yesButton = document.createElement('button');
  yesButton.textContent = 'Yes';
  yesButton.style.cssText = `
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
  `;

  yesButton.onmouseover = () => {
    yesButton.style.boxShadow = 'inset 0 -0.5vw #006400, 3px 3px 15px rgba(0, 0, 0, 0.6)';
  };

  yesButton.onmouseout = () => {
    yesButton.style.boxShadow = 'inset 0 -0.365vw #006400, 3px 3px 15px rgba(0, 0, 0, 0.6)';
  };

  const noButton = document.createElement('button');
  noButton.textContent = 'No';
  noButton.style.cssText = `
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
  `;

  noButton.onmouseover = () => {
    noButton.style.boxShadow = 'inset 0 -0.5vw #b30000, 3px 3px 15px rgba(0, 0, 0, 0.6)';
  };

  noButton.onmouseout = () => {
    noButton.style.boxShadow = 'inset 0 -0.365vw #b30000, 3px 3px 15px rgba(0, 0, 0, 0.6)';
  };

  modalContent.appendChild(yesButton);
  modalContent.appendChild(noButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  yesButton.onclick = () => {
    fetchJSON("/changePfp", {
      method: "POST",
      body: JSON.stringify({ name: blookName, parent: packName })
    })
    .then(data => {
      if (data.success) {
        document.body.removeChild(modal);
        window.location.href = '/dashboard.html'; 
      } else {
        window.location.href = '/dashboard.html?error=' + encodeURIComponent(data.message || "Failed to change profile picture.");
      }
    })
    .catch(error => {
      console.error("Error changing profile picture:", error);
      window.location.href = '/dashboard.html?error=' + encodeURIComponent("An error occurred while changing the profile picture. Please try again.");
      document.body.removeChild(modal);
    });
  };

  noButton.onclick = () => {
    document.body.removeChild(modal);
  };
}
