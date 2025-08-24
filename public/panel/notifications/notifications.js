async function sendNotification() {
  const message = document.getElementById("notification-input").value;

  if (!message) {
      alert("Please enter a notification message.");
      return;
  }

  try {
      const response = await fetch('/sendNotification', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
      });

      if (!response.ok) {
          const errorText = await response.text(); 
          throw new Error(`Server responded with status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      if (result.success) {
          alert("Notification sent successfully to all users!");
      } else {
          alert("Failed to send notification: " + result.message);
      }
  } catch (error) {
      console.error("Error sending notification:", error);
      alert("An error occurred while sending the notification: " + error.message);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('button').onclick = sendNotification;
});