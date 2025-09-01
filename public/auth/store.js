async function fetchUser() {
  try {
    const res = await fetch('/user');
    if (!res.ok) throw new Error('Not logged in');
    const userdata = await res.json();
    document.getElementById('username').textContent = `Logged in as ${userdata.username}`;
    document.getElementById('checkout-button').disabled = false;
    document.getElementById('checkout-button').classList.remove('disabled');
    return userdata.username;
  } catch {
    document.getElementById('username').textContent = 'You must be logged in to buy something!';
    document.getElementById('checkout-button').disabled = true;
    document.getElementById('checkout-button').classList.add('disabled');
    return null;
  }
}

let currentUsername = null;

window.addEventListener('DOMContentLoaded', async () => {
  currentUsername = await fetchUser();
});

document.getElementById('checkout-button').addEventListener('click', async () => {
if (!currentUsername) {
    window.location.href = '/login.html';
    return;
}
  try {
    const res = await fetch('/storeCheckout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: currentUsername })
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('Could not start checkout.');
    }
  } catch {
    alert('Could not start checkout.');
  }
});