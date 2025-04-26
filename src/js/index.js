const log = (message) => {

    const logElement = document.getElementById("log");
    const newElement = document.createElement("div");
    newElement.textContent = message;
    logElement.appendChild(newElement);
};

const scanButton = document.getElementById("scan-button");
const writeButton = document.getElementById("write-button");

scanButton.addEventListener("click", async () => {
    log("User clicked scan button");
  
    try {
      const ndef = new NDEFReader();
      await ndef.scan();
      log("> Scan started");
  
      ndef.addEventListener("readingerror", () => {
        log("Argh! Cannot read data from the NFC tag. Try another one?");
      });
  
      ndef.addEventListener("reading", ({ message, serialNumber }) => {
        log(`> Serial Number: ${serialNumber}`);
        log(`> Records: (${message.records.length})`);
      });
    } catch (error) {
      log("Argh! " + error);
    }
  });
  
  writeButton.addEventListener("click", async () => {
    log("User clicked write button");

    const messageTextarea = document.getElementById("message");
  
    try {
      
      const ndef = new NDEFReader();
      await ndef.write(messageTextarea.value);
      log("> Message written");
    } catch (error) {
      log("Argh! " + error);
    }
  });
