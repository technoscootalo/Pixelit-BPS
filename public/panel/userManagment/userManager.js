function muteBanUser(action) {
  console.log("Action triggered:", action); 
  const username = document.getElementById("username-input").value;
  const reason = document.getElementById("reason-input").value; 
  if (!username) {
    alert("Please enter a username.");
    return;
  }
  const requestBody = {
    username: username,
    action: action,
    reason: reason,
  };
  fetch(`/muteBanUser`, {  
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })
  .then(response => {
    if (response.ok) {
      return response.text().then(text => {
        alert(text); 
      });
    }
    return response.text().then(text => {
      throw new Error(text);
    });
  })
  .catch(error => {
    alert("Error: " + error.message);
  });
}

function unmuteUnbanUser(action) {
    console.log("Unmute/Ban action triggered:", action);
    const username = prompt("Who do you want to lift the punishment from?");
    if (!username) {
        alert("Please enter a username.");
        return;
    }

    const requestBody = {
        username: username,
        action: action,
    };

    fetch(`/unmuteUnbanUser`, {  
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    })
    .then(response => {
        if (response.ok) {
            return response.text().then(text => {
                alert(text);
            });
        }
        return response.text().then(text => {
            throw new Error(text);
        });
    })
    .catch(error => {
        alert("Error: " + error.message);
    });
}