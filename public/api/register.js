const socket = io();

function ge(id) {
  return document.getElementById(id);
}

let username = ge("uname");
let password = ge("psw");
let discord = ge("dsc");
let age = ge("age");
let reason = ge("rea");

function register(event) {
  event.preventDefault();

  const forbiddenChars = /[^a-zA-Z0-9_]/;
  if (forbiddenChars.test(username.value) || username.value.length < 3 || username.value.length > 20) {
    ge('error-message').textContent = 'Username must be 3-20 characters long and contain only letters, numbers, and underscores.';
    return;
  }

  const requestBody = {
    username: username.value,
    password: password.value,
    discord: discord.value,
    age: age.value,
    reason: reason.value,
  };

  fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })
  .then(response => {
    if (response.status === 200) {
      ge('error-message').textContent = 'The request has been sent to the admins. Please wait for them to review your form. May take up to 12 hours.';
      ge('error-message').style.color = 'lightgreen';
    } else if (response.status === 500) {
      return response.text().then(text => {
        ge('error-message').textContent = text;
      });
    } else if (response.status === 502) {
      ge('error-message').textContent = 'Bad Gateway. The server is temporarily unresponsive. This may be due to maintenance or server issues.';
      console.error('502 Bad Gateway: The server is down or unavailable. Check server logs for more details.');
    } else {
      console.error('Unexpected response status:', response.status);
    }
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
    ge('error-message').textContent = 'Network error: Unable to reach the server.';
  });

  socket.emit("getrequests");
}