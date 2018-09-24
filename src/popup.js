function loadStore(cb){
  chrome.storage.local.get('privateKey', function(result){
    if (result && result.privateKey) {
      var element = document.getElementById("certificate-request");
      element.classList.remove("hide");
    }
  });
}

function reset() {
  chrome.storage.local.clear();
  window.close();
}

document.getElementById("reset").addEventListener("click", reset);
loadStore();
