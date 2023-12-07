//chrome.webNavigation.onCompleted.addListener(async (details) => {
//  if (details.url.startsWith("https://twitter.com/")) {
//    // Send a message to popup.js to open the popup
//    chrome.runtime.sendMessage({ openPopup: true });
//}
//});

//when the extension logo on browser is clicked, send toggle message
chrome.action.onClicked.addListener(function(){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    chrome.tabs.sendMessage(tabs[0].id, { action: "must_toggle_iframe" });
  })
});

//chrome.action.onClicked.addListener((tab) => {
//  // disable the active tab
//  chrome.action.disable(tab.id);
//  // requires the "tabs" or "activeTab" permission, or host permissions for the URL
//  console.log(tab.url);
//});