document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch("/getNotifications");
    const data = await response.json();
    const notificationsDiv = document.getElementById("notifications");

    if (data.success && data.notifications.length > 0) {
      notificationsDiv.innerHTML = ""; 
      data.notifications.forEach(notification => {
        const notificationElement = document.createElement("div");
        notificationElement.classList.add("notifications");
        notificationElement.textContent = notification.message + " at " + new Date(notification.date).toLocaleTimeString();
        notificationsDiv.prepend(notificationElement); 
      });
    } else {
      notificationsDiv.textContent = "No notifications found.";
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
});