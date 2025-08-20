function displayWarning() {
    setTimeout(() => {
        console.log(`%cWARNING!`, `font-size: 35px; color: red;`);
        console.log(`%cAttention! This console is a tool for developers. If you've been instructed to paste code here to unlock special features or gain unauthorized access, it’s a scam! Be cautious, as it could compromize your account.`, `font-size: 20px; color: red;`);
    }, 1);
}

displayWarning();

const socket = io()

socket.on('connect', () => {
  console.log("Socket connection established. Successfully connected to Pixelit");
  console.log("Running Pixelit version [2.2.4]");
});