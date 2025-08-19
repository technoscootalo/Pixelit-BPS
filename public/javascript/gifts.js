document.addEventListener("DOMContentLoaded", () => {
    fetchUserPacks();
});

async function fetchUserPacks() {
    try {
        const response = await fetch('/packs');
        if (!response.ok) {
            throw new Error('Failed to fetch packs');
        }

        const packs = await response.json();
        const blooksContainer = document.getElementById("blooks");

        blooksContainer.innerHTML = ''; 

        packs.forEach(pack => {
            pack.blooks.forEach(blook => {
                if (blook.owned > 0) {
                    const blookDiv = document.createElement('div');

                    const blookImage = document.createElement('img');
                    blookImage.src = blook.imageUrl || 'https://izumiihd.github.io/pixelitcdn/assets/img/blooks/logo.png';
                    blookImage.alt = blook.name || 'Blook';
                    blookImage.style.width = '100px';
                    blookImage.style.height = '100px'; 

                    blookDiv.appendChild(blookImage);
                    blooksContainer.appendChild(blookDiv); 
                }
            });
        });
    } catch (error) {
        console.error("Error fetching packs:", error);
    }
}