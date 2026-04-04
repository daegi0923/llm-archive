chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "save_conversation") {
    console.log("Saving conversation to Brain-Sync:", request.data);
    
    fetch("http://localhost:8000/api/v1/conversations/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request.data)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Save successful:", data);
      sendResponse({ status: "success", data: data });
    })
    .catch(error => {
      console.error("Save failed:", error);
      sendResponse({ status: "error", message: error.message });
    });

    // Return true to indicate we will send a response asynchronously
    return true; 
  }
});
