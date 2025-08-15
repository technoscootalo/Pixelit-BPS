function muteBanUser(action) {
    console.log("Action triggered:", action); 
    const username = document.getElementById("username-input").value;
    const reason = document.getElementById("reason-input").value; 
    const duration = prompt("Enter the duration in minutes (0 for permanent):");

    if (!username || isNaN(duration) || duration < 0) {
        alert("Please enter a valid username and a non-negative duration.");
        return;
    }

    const durationInt = parseInt(duration, 10);

    const requestBody = {
        username: username,
        action: action,
        reason: reason,
        duration: durationInt  
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