var pki = require('../forge/pki.js');

function loadStore(cb){
  chrome.storage.sync.get(function(objs){
    var keys = Object.keys(objs);
    if (keys.length > 0) {
	  var isCSRQueued = false;
	  for (var i in keys) {
	    if (keys[i] === 'current-csr') {
		  isCSRQueued = true;
		}
	  }
	  if (isCSRQueued) {
        chrome.storage.sync.get('current-csr', function(data){
          console.log(data);
          var element = document.getElementById("csr-request");
          element.classList.remove("hide");
          element = document.getElementById("csr-data");
          element.innerHTML = '<span>' + JSON.stringify(data) + '</span>'
        });

	  } else {
        var element = document.getElementById("keystore");
        element.classList.remove("hide");
	  }
    } 
  });
}

function reset() {
  if (!window.confirm('You are going to reset the extension data. Are you sure?')) {
    return;
  }
  chrome.storage.sync.get(function(objs){
    var keys = Object.keys(objs);
    for (var i in keys) {
      chrome.storage.sync.remove(keys[i]);
    }
    window.close();
  });
}

function createCSR() {
  var password = document.getElementById("csr-challenge-password").value;
  if (!password || (password && password.length < 1)) {
    alert('Challenge password is required');
    return;
  }
  var keys = forge.pki.rsa.generateKeyPair(2048);
  chrome.storage.sync.get('current-csr', function(data){
    console.log(data);
    var csr = pki.createCSR(keys, data['current-csr'], password);
    var pem = forge.pki.certificationRequestToPem(csr);
    console.log(pem);
    var element = document.getElementById("csr-pem");
    element.innerHTML = '<hr><div>Privatekey stored in P12 using challenge pass.<br><br>CSR pem :<br>' + pem + '</div>';
    //element = document.getElementById("create-csr");
    //element.classList.add("hide");
  });

}

document.getElementById("reset").addEventListener("click", reset);
document.getElementById("create-csr").addEventListener("click", createCSR);
loadStore();
