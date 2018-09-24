var pki = require('../forge/pki.js');
var axios = require('axios');
var downloadjs = require('downloadjs');

var generateAndSendCSR = function(tokenAccess, tokenCSR, passphrase) {
  console.log('generateAndSendCSR');
  console.log(tokenAccess);
  console.log(tokenCSR);
  console.log(passphrase);
}

var downloadCertAndPackP12 = function(tokenAccess, tokenCSR, passphrase) {
  console.log('downloadCertAndPackP12');
  console.log(tokenAccess);
  console.log(tokenCSR);
  console.log(passphrase);
}

chrome.runtime.onMessageExternal.addListener(function(msg, sender, sendResponse) {
  if (sender.url !== "http://localhost:3000/") {
    console.log('Not a valid host');
    alert('Not a valid host : ' + sender.url);
    sendResponse(false);
    return;
  }

  if (msg === 'generateAndSendCSR') {
    generateAndSendCSR(msg.tokenAccess, msg.tokenCSR, msg.passphrase);
  } else if (msg === 'fetchCertAndPackP12') {
    downloadCertAndPackP12(msg.tokenAccess, msg.tokenCSR, msg.passphrase);
  }
});
