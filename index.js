chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeBackgroundColor({ color: '#ff4500' });
});

async function toggle(tab) {
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['censor.js'],
    });
    await chrome.action.setBadgeText({ tabId: tab.id, text: result ? 'ON' : '' });
  } catch {
    // Pages Chrome won't let extensions touch, like chrome:// and the Web Store.
  }
}

chrome.action.onClicked.addListener(toggle);
