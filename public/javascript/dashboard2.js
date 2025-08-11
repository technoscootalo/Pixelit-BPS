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

function showModal(message) {
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
  modalContent.style.cssText = `
    background-color: #6f057a;
    box-shadow: inset 0 -0.365vw #61056b, 3px 3px 15px rgba(0, 0, 0, 0.6);
    padding: 20px;
    border-radius: 5px;
    text-align: center;
    width: 300px;
    height: 150px;
  `;

  const messageText = document.createElement('p');
  messageText.textContent = message;
  modalContent.appendChild(messageText);
  
  const br = document.createElement('br');
  modalContent.appendChild(br);

  const okButton = document.createElement('button');
  okButton.textContent = 'OK';
  okButton.style.cssText = `
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

  okButton.onmouseover = () => {
    okButton.style.boxShadow = 'inset 0 -0.5vw #006400, 3px 3px 15px rgba(0, 0, 0, 0.6)';
  };

  okButton.onmouseout = () => {
    okButton.style.boxShadow = 'inset 0 -0.365vw #006400, 3px 3px 15px rgba(0, 0, 0, 0.6)';
  };

  okButton.onclick = () => {
    document.body.removeChild(modal);
  };

  modalContent.appendChild(okButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

function addSpinClickListener() {
    const spinButton = document.getElementById('spin');
    const tokensDisplay = document.getElementById('tokens');
    const EIGHT_HOURS = 8 * 3600000; // 8 hours in milliseconds 

    let lastSpinTime = parseInt(sessionStorage.getItem('lastSpinTime')) || 0;
    if (sessionStorage.getItem('spinButtonHidden') === 'true') {
        spinButton.style.display = 'none';
    }

    spinButton.addEventListener('click', async () => {
        const currentTime = Date.now();
        if (currentTime - lastSpinTime < EIGHT_HOURS) {
            showModal('You can only claim tokens every 8 hours.');
            return;
        }
        spinButton.disabled = true;

        try {
            const userResponse = await fetch('/user');
            const userData = await userResponse.json();
            if (userData.claimed) {
                showModal('Tokens have already been claimed. Please wait for the next 8 hours.');
                return;
            }

            const spinResponse = await fetch('/spin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            const data = await spinResponse.json();
            if (data.message === "Spin successful") {
                const newTokens = parseInt(tokensDisplay.textContent) + data.tokensWon;
                tokensDisplay.textContent = newTokens;
                showModal('Congratulations! You won ' + data.tokensWon + ' tokens!');
                sessionStorage.setItem('spinButtonHidden', 'true');
                spinButton.style.display = 'none';
                setTimeout(() => {
                    sessionStorage.removeItem('spinButtonHidden');
                }, EIGHT_HOURS);
            } else {
                showModal('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            showModal('An error occurred while spinning.');
        } finally {
            spinButton.disabled = false;
        }
    });
}

addSpinClickListener();