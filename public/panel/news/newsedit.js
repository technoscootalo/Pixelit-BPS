const socket = io(); 

socket.on('connect', () => {
  console.log("Socket connection established");
});

async function postnews(e) {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;

  if (!title || !content) {
    document.getElementById("success-message").innerText = "Title and content are required.";
    document.getElementById("success-message").style.color = "red"; 
    return;
  }

  socket.emit('postNews', { title, content });

  socket.on('newsPosted', (result) => {
    document.getElementById("title").value = "";
    document.getElementById("content").value = "";
    document.getElementById("success-message").style.color = "green"; 
    document.getElementById("success-message").innerHTML = "News has been successfully posted.";
    console.log("New post created:", result);
  });

  socket.on('error', (errorText) => {
    document.getElementById("success-message").style.color = "red"; 
    document.getElementById("success-message").innerHTML = errorText;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', postnews);
  } else {
    console.error("Form not found");
  }
});