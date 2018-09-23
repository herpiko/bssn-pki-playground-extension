var pki = require('../forge/pki.js');
var downloadjs = require('downloadjs');
var currentPkcs8 = '';

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
      console.log(isCSRQueued);
	  if (isCSRQueued) {
        chrome.storage.sync.get('current-csr', function(data){
          console.log(data);
          var element = document.getElementById("csr-request");
          element.classList.remove("hide");
          element = document.getElementById("csr-data");
          element.innerHTML = '<span>' + JSON.stringify(data) + '</span>'
        });
	  } else {
        var element = document.getElementById("certificate-request");
        element.classList.remove("hide");
	  }
    } else {
      var element = document.getElementById("certificate-request");
      element.classList.remove("hide");
    }
  });
}

function reset() {
  chrome.storage.sync.get(function(objs){
    var keys = Object.keys(objs);
    for (var i in keys) {
      chrome.storage.sync.remove(keys[i]);
    }
  });
}

function createCSR() {
  var password = document.getElementById("csr-challenge-passphrase").value;
  if (!password || (password && password.length < 1)) {
    alert('Challenge passphrase is required');
    return;
  }
  var keys = forge.pki.rsa.generateKeyPair(2048);
  chrome.storage.sync.get('current-csr', function(data){
    console.log(data);
    var csr = pki.createCSR(keys, data['current-csr'], password);
    var csrb64 = forge.util.encode64(forge.pki.certificationRequestToPem(csr));
    console.log(csrb64);

    var rsaPrivateKey = forge.pki.privateKeyToAsn1(keys.privateKey);
    var privateKeyInfo = forge.pki.wrapRsaPrivateKey(rsaPrivateKey);
    var encryptedPrivateKeyInfo = forge.pki.encryptPrivateKeyInfo(privateKeyInfo, password, {algorithm : "aes256"});
    var pkcs8pem = forge.pki.encryptedPrivateKeyToPem(encryptedPrivateKeyInfo);

    var element = document.getElementById("csr-pem");
    element.innerHTML = '<hr><div>Your PKCS8 private key has been downloaded. This is your CSR in b64 string :<br>' + csrb64 + '</div>';
    keys = {};
    downloadjs(pkcs8pem, 'privatekey.pem', 'text/plain');
    reset();
    var element = document.getElementById("csr-request-form");
    element.classList.add("hide");
  });
}

function handlePKCS8() {
  var files = evt.target.files;
  var reader = new FileReader();
  reader.onload = function(e){
    console.log(reader.result);
    currentPkcs8 = reader.result;
  }
  reader.readAsText(files[0]);
}

function createP12() {
  if (currentPkcs8.length < 1) {
    var pemstr = document.getElementById("pkcs8-string-input").value;
    if (pemstr.length > 0) {
      currentPkcs8 = pemstr;
    } else {
      alert('Please pick a PKCS8 file or paste the PEM string');
      return;
    }
  }
  var pkcs8password = document.getElementById("pkcs8-passphrase").value;
  var password = document.getElementById("p12-challenge-passphrase").value;
  if (!password || (password && password.length < 1)) {
    alert('P12 passphrase is required');
    return;
  }
  var privateKey = forge.pki.decryptRsaPrivateKey(currentPkcs8, pkcs8password);
  if (privateKey === null) {
    alert('Invalid PKCS8 passphrase');
    return;
  }
  var p12b64 = pki.p12Wrap(null, privateKey, password);
  downloadjs(forge.util.decode64(p12b64), 'cred.p12', 'application/octet-stream');

}

document.getElementById("create-csr").addEventListener("click", createCSR);
document.getElementById("create-p12").addEventListener("click", createP12);
document.getElementById('pkcs8-file-input').addEventListener('click', handlePKCS8, false);
loadStore();

chrome.runtime.onMessage.addListener(function (msg) {
    console.log(msg);
    if (msg.action === 'pickedPKCS8') {
        alert(msg.pem);
    }
});
