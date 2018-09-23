chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if (sender.url !== "http://localhost:3000/") {
    console.log('Not a valid host');
    alert('Not a valid host : ' + sender.url);
    sendResponse(false);
    return;
  }
  // Remove existing key value
  chrome.storage.sync.remove('current-csr', function(){
    var obj = {}
    obj['current-csr'] = request.record;
    chrome.storage.sync.set(obj, function(){
      console.log('csr-request saved');
      alert('CSR attribute data has been saved, please click BSSN PKI Playground extension icon to continue.');
      sendResponse(true);
    });
  });
});
