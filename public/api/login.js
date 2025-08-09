const socket = io();

function ge(id) {
  return document.getElementById(id);
}

const uname = ge("uname");
const psw = ge("psw");
const submit = ge("submit");
const rem = ge("remember");
const errorMsg = ge("error-message");

window.onload = () => {
  if (sessionStorage["username"] && sessionStorage["password"] && sessionStorage.rem == "true") {
    uname.value = sessionStorage["username"];
    psw.value = sessionStorage["password"];
  } else {
    rem.checked = false;
  }
}

function login(event) {
  event.preventDefault();
  const uv = uname.value;
  const pv = psw.value;
  const requestBody = {
    username: uv,
    password: pv,
  };

  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })
  .then(response => {
    const contentType = response.headers.get("content-type");
    return response.text().then(text => {
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return { status: response.status, body: JSON.parse(text) };
      } else {
        return { status: response.status, body: text };
      }
    });
  })
  .then(({ status, body }) => {
    if (status === 200) {
      errorMsg.style.color = "lightgreen";
      errorMsg.textContent = "Login successful! Redirecting...";
      let dots = '';
      const intervalId = setInterval(() => {
        dots = dots.length < 3 ? dots + '.' : '';
        errorMsg.textContent = "Login successful! Redirecting" + dots;
      }, 500);

      setTimeout(() => {
        window.location.href = '/dashboard.html'; 
      }, 2000);
    } else if (status === 401 || status === 403) {
      errorMsg.style.color = "red";
      errorMsg.textContent = body.message || "Invalid username or password.";
    } else if (status === 500) {
      errorMsg.style.color = "red";
      errorMsg.textContent = 'Account does not exist.';
    } else {
      errorMsg.style.color = "red";
      errorMsg.textContent = 'Unexpected response status: ' + status;
    }
  })
  .catch(error => {
    errorMsg.style.color = "red";
    errorMsg.textContent = 'There was a problem with the fetch operation: ' + error;
  });
}

submit.addEventListener('click', login);