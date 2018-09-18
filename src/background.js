chrome.contextMenus.create({
  title: "Save emoticon",
  contexts : ["image"],
  onclick : function(content) {
    if (content.srcUrl.indexOf('https://emos.plurk.com') < 0) {
      return alert('Failed to save. The emot should be a custom plurk emot from emos.plurk.com');
    }
    try {
      var key = "plurkemot_emosplurk_" + content.srcUrl.split('com/')[1].split('.')[0];
      var obj = {};
      obj[key] = content.srcUrl; 
      chrome.storage.sync.get(key, function(existing){
        if (Object.keys(existing).length > 0) {
          return alert('The emot is already exists');
        }
        chrome.storage.sync.set(obj, function(){
          alert('Emot saved successfuly (dance)');
        });
      });
    } catch(e) {
      console.log(e);
      alert('Failed to save the emot.');
    }
  }
});

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if (sender.url !== "http://localhost:3000/") {
    console.log('Not a valid host');
    alert('Not a valid host : ' + sender.url);
    sendResponse(false);
    return;
  }
  chrome.storage.sync.get(function(objs){
    var keys = Object.keys(objs);
    var initialized = false;
    for (var i in keys) {
      if (keys[i] === 'masterpass') {
        initialized = true;
        break;
      }
    }
    if (!initialized) {
      console.log('masterpass is not initalized yet');
      alert('Masterpass has not been initialized yet');
      sendResponse(false);
      return;
    }
    // Remove existing key value
    chrome.storage.sync.remove('current-csr', function(){
      var obj = {}
      obj['current-csr'] = request.data;
      chrome.storage.sync.set(obj, function(){
        console.log('csr-request saved');
        alert('CSR attribute data has been saved, please click BSSN PKI Playground extension icon to continue.');
        sendResponse(true);
      });
    });
  });
});
