function ge(id) {
  return document.getElementById(id);
}

const socket = io();


let accountRequests;

document.addEventListener('DOMContentLoaded', ()=>{
  document.body.style.pointerEvents = "none";
  fetch("/requests", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 500) {
        return response.text().then((text) => {
          alert(text);
        });
      } else {
        console.error("Unexpected response status:", response.status);
        throw new Error("Unexpected response status");
      }
    })
    .then((data) => {
      accountRequests = data.slice(0, 100);
      renderAccountRequests();
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
})

function renderAccountRequests() {
  const container = document.getElementById("requests");
  container.innerHTML = "";
  const header = document.createElement("h2");
  header.textContent = "Requests";
  container.appendChild(header);

  if (Object.keys(accountRequests).length === 0) {
    createNoRequestsDiv(container);
  } else {
    for (const rid in accountRequests) {
      let request = accountRequests[rid];
      const div = document.createElement("div");
      div.classList.add("account-request");

      const usernameDiv = document.createElement("div");
      usernameDiv.classList.add("attribute");
      const usernameText = document.createTextNode(`Username: ${request.username}`);
      usernameDiv.appendChild(usernameText);

      const discordDiv = document.createElement("div");
      discordDiv.classList.add("attribute");
      const discordText = document.createTextNode(`Discord: ${request.discord}`);
      discordDiv.appendChild(discordText);

      const ageDiv = document.createElement("div");
      ageDiv.classList.add("attribute");
      const ageText = document.createTextNode(`Age: ${request.age}`);
      ageDiv.appendChild(ageText);

      const reasonDiv = document.createElement("div");
      reasonDiv.classList.add("attribute");
      const reasonText = document.createTextNode(`Reason: ${request.reason}`);
      reasonDiv.appendChild(reasonText);

      const declineButton = document.createElement("button");
      declineButton.classList.add("button", "decline");
      declineButton.style.marginRight = "10px";
      declineButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      declineButton.addEventListener("click", () => {
        handleRequest({
          username: request.username,
          password: request.password,
          salt: request.salt,
        },
        false);
        socket.emit("getrequests");
      });

      const acceptButton = document.createElement("button");
      acceptButton.classList.add("button", "accept");
      acceptButton.innerHTML = '<i class="fa-solid fa-check"></i>';
      acceptButton.addEventListener("click", () => {
        handleRequest({
          username: request.username,
          password: request.password,
          salt: request.salt,
        },
        true);
        socket.emit("getrequests");
      });

      div.appendChild(usernameDiv);
      div.appendChild(discordDiv);
      div.appendChild(ageDiv);
      div.appendChild(reasonDiv);
      div.appendChild(acceptButton);
      div.appendChild(declineButton);

      container.appendChild(div);
    }
  }
}


function handleRequest(request, accepted) {
  const formBody = {'username': request.username, 'discord': request.discord, 'password': request.password, 'salt': request.salt, 'accepted': accepted}
  fetch('/addAccount', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formBody)
  })
  .then(response => {
    if (response.status === 200) {
      fetch("/requests", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          } else if (response.status === 500) {
            return response.text().then((text) => {
              alert(text);
            });
          } else {
            console.error("Unexpected response status:", response.status);
            throw new Error("Unexpected response status");
          }
        })
        .then((data) => {
          accountRequests = data.slice(0, 10); 
          renderAccountRequests();
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
        });
    } else if (response.status === 500) {
      return response.text().then(text => {
        alert(text);
      });
    } else {
      console.error('Unexpected response status:', response.status);
    }
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
}

function createNoRequestsDiv(parentDiv) {
  const noRequestsDiv = document.createElement("div");
  noRequestsDiv.textContent = "No account requests found, please come again later.";
  noRequestsDiv.classList.add("no-requests-message"); 
  parentDiv.appendChild(noRequestsDiv);
}