function createPack() {
    const packName = document.getElementById("packName").value; 
    const packUrl = document.getElementById("packUrl").value; 
    const packCost = document.getElementById("packCost").value; 
    if (packName && packUrl && packCost) {
        const packDiv = document.createElement("div");
        packDiv.classList.add("pack");
        const packHeader = document.createElement("h2");
        packHeader.textContent = packName + " - $" + packCost;
        packDiv.appendChild(packHeader);
        const packImg = document.createElement("img");
        packImg.src = packUrl;
        packImg.alt = packName;
        packImg.style.width = "100px";
        packImg.style.height = "auto"; 
        packDiv.appendChild(packImg);
        const addBlookButton = document.createElement("button");
        addBlookButton.textContent = "Add Blook";
        addBlookButton.classList.add("button"); 
        addBlookButton.onclick = function () {
            addBlook(packDiv);
        };
        packDiv.appendChild(addBlookButton);
        const removePackButton = document.createElement("button");
        removePackButton.textContent = "Remove Pack";
        removePackButton.classList.add("button"); 
        removePackButton.onclick = function () {
            fetch("/removePack", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: packName,
                }),
            })
            .then((response) => {
                if (response.ok) {
                    packDiv.parentNode.removeChild(packDiv);
                }
            });
        };
        packDiv.appendChild(removePackButton);
        document.getElementById("packs").appendChild(packDiv); 
        fetch("/addPack", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: packName,
                image: packUrl,
                cost: packCost,
                visible: true,
            }),
        })
        .then((response) => {
            if (response.ok) {
                refreshPackDisplay(); 
            }
        })
        .catch((e) => {
            console.log(e);
        });
    } else {
        console.error("Please fill in all fields to create a pack.");
    }
}

function addBlook(packDiv, packName) {
    var containerDiv = document.createElement("div");
    containerDiv.classList.add("blook-adder");

    var createBlookText = document.createElement("h1");
    createBlookText.textContent = "Create Blook";
    createBlookText.style.color = "#FFF";
    containerDiv.appendChild(createBlookText);

    var blookNameInput = document.createElement("input");
    blookNameInput.type = "text";
    blookNameInput.placeholder = "(BLOOK NAME)";

    var imageUrlInput = document.createElement("input");
    imageUrlInput.type = "text";
    imageUrlInput.placeholder = "(e.g. OG/BLOOK.png)";

    var blookRarityInput = document.createElement("select");
    blookRarityInput.innerHTML =
        "<option value='uncommon'>Uncommon</option><option value='rare'>Rare</option><option value='epic'>Epic</option><option value='legendary'>Legendary</option><option value='chroma'>Chroma</option><option value='mystical'>Mystical</option>";
    blookRarityInput.placeholder =
        "Enter the rarity of the blook";


    var blookChanceInput = document.createElement("input");
    blookChanceInput.type = "text";
    blookChanceInput.placeholder =
        "(BLOOK PERCENTAGE NO %)";

    var blookColorInput = document.createElement("input");
    blookColorInput.type = "text";
    blookColorInput.placeholder = "BLOOK COLOR (hexadecimal)";

    var addButton = document.createElement("button");
    addButton.textContent = "Add This Blook";
    addButton.classList.add("button");
    addButton.onclick = function () {
        var blookName = blookNameInput.value;
        var imageUrl = imageUrlInput.value;
        var blookRarity = blookRarityInput.value;
        var blookChance = blookChanceInput.value;
        var blookColor = blookColorInput.value;
        if (blookName && imageUrl && blookRarity && blookChance) {
            var blookDiv = document.createElement("div");
            blookDiv.classList.add("blook");

            var blookImg = document.createElement("img");
            blookImg.src = imageUrl;
            blookImg.alt = blookName;
            blookImg.style.width = "50px"; 
            blookImg.style.height = "auto";
            blookDiv.appendChild(blookImg);

            var raritySpan = document.createElement("span");
            raritySpan.textContent =
                "Rarity: " + blookRarity + " - Chance: " + blookChance + "%";
            blookDiv.appendChild(raritySpan);

            var removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.classList.add("button"); 
            removeButton.onclick = function () {
                fetch("/removeBlook", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: blook.name,
                        parent: pack.name,
                    }),
                }).then((response) => {
                    if (response.ok) {
                        console.log("blook added successfully");
                    } else {
                        console.log(response.statusText);
                    }
                });
                packDiv.removeChild(blookDiv);
            };
            blookDiv.appendChild(removeButton);

            packDiv.appendChild(blookDiv);
            fetch("/addBlook", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: blookNameInput.value,
                    image: imageUrlInput.value,
                    rarity: blookRarityInput.value,
                    chance: blookChanceInput.value,
                    parent: packName,
                    owned: 0,
                    color: blookColor,
                    visible: true,
                }),
            }).then((response) => {
                if (response.ok) {
                    console.log(response);
                    console.log("Blook added successfully");
                } else {
                    console.log(response.statusText);
                }
            });
        }
    };
    containerDiv.appendChild(addButton);
    containerDiv.appendChild(document.createElement("br"));
    containerDiv.appendChild(blookNameInput);
    containerDiv.appendChild(document.createElement("br"));
    containerDiv.appendChild(imageUrlInput);
    containerDiv.appendChild(document.createElement("br"));
    containerDiv.appendChild(blookChanceInput);
    containerDiv.appendChild(document.createElement("br"));
    containerDiv.appendChild(blookColorInput);
    containerDiv.appendChild(document.createElement("br"));
    containerDiv.appendChild(blookRarityInput);
    containerDiv.appendChild(document.createElement("br"));
    containerDiv.appendChild(addButton);
    packDiv.appendChild(containerDiv);
}

function renderPacks(packsArray) {
    var packsContainer = document.getElementById("packs");

    packsContainer.innerHTML = "";

    packsArray.forEach(function (pack) {
        var packDiv = document.createElement("div");
        packDiv.classList.add("pack");

        var packHeader = document.createElement("h2");
        packHeader.textContent = pack.name + " - $" + pack.cost;
        packDiv.appendChild(packHeader);

        var packImg = document.createElement("img");
        packImg.src = `${pack.image}`;
        packImg.alt = pack.name;
        packDiv.appendChild(packImg);

        packImg.style.width = "100px";
        packImg.style.height = "auto";

        var removePackButton = document.createElement("button");
        removePackButton.textContent = "Delete Pack";
        removePackButton.classList.add("button"); 
        removePackButton.onclick = function () {
            fetch("/removePack", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: pack.name,
                }),
            })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        console.log(response.statusText);
                    }
                })
                .then((data) => {
                    renderPacks(data.packs);
                });
            packDiv.parentNode.removeChild(packDiv); 
        };
        packDiv.appendChild(removePackButton);

        pack.blooks.forEach(function (blook) {
            var blookDiv = document.createElement("div");
            blookDiv.classList.add("blook");

            var blookImg = document.createElement("img");
            blookImg.src = `${blook.imageUrl}`;
            blookImg.alt = blook.name;
            blookDiv.appendChild(blookImg); 

            blookImg.onerror = function() {
                console.error("Failed to load image:", this.src);
                this.src = 'https://izumiihd.github.io/pixelitcdn/assets/img/blooks/logo.png';
            };

            var raritySpan = document.createElement("span");
            raritySpan.textContent =
                "Rarity: " + blook.rarity + " - Chance: " + blook.chance + "%";
            blookDiv.appendChild(raritySpan);

            blookImg.style.width = "50px"; 
            blookImg.style.height = "auto"; 

            var removeButton = document.createElement("button");
            removeButton.textContent = "";
            removeButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            removeButton.classList.add("button");
            removeButton.onclick = function () {
                fetch("/removeBlook", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: blook.name,
                        parent: pack.name,
                    }),
                }).then((response) => {
                    if (response.ok) {
                        console.log("blook added successfully");
                    } else {
                        console.log(response.statusText);
                    }
                });
                packDiv.removeChild(blookDiv);
            };
            blookDiv.appendChild(removeButton);

            packDiv.appendChild(blookDiv);
        });

        addBlook(packDiv, pack.name);

        packsContainer.appendChild(packDiv);
    });
}

fetch("/packs", {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
    },
})
    .then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            console.log(response.statusText);
        }
    })
    .then((data) => {
        renderPacks(data);
    });
