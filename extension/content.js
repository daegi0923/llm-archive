function injectArchiveButton() {
  if (document.getElementById('brain-sync-archive-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'brain-sync-archive-btn';
  btn.className = 'brain-sync-archive-btn';
  btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Archive`;
  
  btn.addEventListener('click', handleArchiveClick);
  document.body.appendChild(btn);
}

function extractConversation() {
  // Gemini's DOM changes, so try to find main content or fallback to body text
  let conversationContent = "";
  
  // Gemini uses tags like message-content, user-query, or just generic tags inside main.
  const elements = document.querySelectorAll('message-content, .model-response-text, .user-query, .query-text');
  
  if (elements.length > 0) {
    elements.forEach(el => {
      conversationContent += el.innerText + "\n\n";
    });
  } else {
    // Fallback: mostly main tag has the chats
    const mainEl = document.querySelector('main');
    if (mainEl) {
      conversationContent = mainEl.innerText;
    } else {
      conversationContent = document.body.innerText;
    }
  }

  // Use URL as unique identifier or base it on timestamp
  const conversationId = "gemini_" + Date.now().toString();
  const url = window.location.href;
  const title = document.title || "Gemini Conversation";

  return {
    conversation_id: conversationId,
    title: title,
    url: url,
    content: conversationContent
  };
}

function handleArchiveClick() {
  const btn = document.getElementById('brain-sync-archive-btn');
  btn.classList.add('loading');
  btn.innerHTML = 'Archiving...';
  
  const data = extractConversation();
  
  chrome.runtime.sendMessage({
    action: "save_conversation",
    data: data
  }, (response) => {
    btn.classList.remove('loading');
    
    if (response && response.status === "success") {
      btn.classList.add('success');
      btn.innerHTML = 'Archived \u2713';
      setTimeout(() => {
        btn.classList.remove('success');
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Archive`;
      }, 3000);
    } else {
      btn.classList.add('error');
      btn.innerHTML = 'Failed \u2717';
      setTimeout(() => {
        btn.classList.remove('error');
        btn.innerHTML = 'Retry';
      }, 3000);
    }
  });
}

// Observe DOM to ensure button stays injected (SPA friendly)
const observer = new MutationObserver(() => {
  injectArchiveButton();
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial injection
injectArchiveButton();
