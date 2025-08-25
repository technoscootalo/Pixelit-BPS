const socket = io();

async function fetchAuditLogs() {
    socket.emit("getAuditLogs");
}

socket.on("auditLogs", (logs) => {
    const logsContainer = document.getElementById("logsContainer");
    logsContainer.innerHTML = '';

    if (logs.length) {
        const sortedLogs = logs.reverse(); 

        sortedLogs.forEach(log => {
            const logDiv = document.createElement('div');

            logDiv.style.background = "#5e046e";
            logDiv.style.boxShadow = "inset 0 -0.365vw #53055c, 3px 3px 15px rgba(0, 0, 0, 0.6)";
            logDiv.style.width = "80%";
            logDiv.style.maxHeight = "1500px"; 
            logDiv.style.margin = "10px 0"; 
            logDiv.style.padding = "20px"; 
            logDiv.style.color = "#fff"; 

            logDiv.innerHTML = `
                <strong>Account ${log.username} was caught by the servers flagging system
                <br>
                <br>
                Message
                <br>
                </strong> ${log.message} <br>
                <br>
                <em>${new Date(log.timestamp).toLocaleString()}</em>
            `;
            logsContainer.appendChild(logDiv); 
        });
    } else {
        logsContainer.innerHTML = "<p>No logs found.</p>"; 
    }
});

document.addEventListener('DOMContentLoaded', fetchAuditLogs);