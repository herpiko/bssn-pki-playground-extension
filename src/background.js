var pki = require('./pki.js');
var axios = require('axios');
var downloadjs = require('downloadjs');
var aes256 = require('aes256');

var generateAndSendCSR = function(tokenAccess, tokenCSR, passphrase) {
  console.log('generateAndSendCSR');
  console.log(tokenAccess);
  console.log(tokenCSR);
  console.log(passphrase);
  // Fetch subject DN
  var subjectData;
  var keys;
  axios.get('http://localhost:3000/rest/client_toolkit/subject_dn/' + tokenCSR,
  {headers:{authorization:tokenAccess}})
  .then(function(result){
    console.log('result : ');
    console.log(result.data);
    subjectData = result.data.data;
    subjectData.key_length = parseInt(subjectData.key_length[0], 10);

    // Generate key
    keys = forge.pki.rsa.generateKeyPair(subjectData.key_length);

    // Mapping the record
    var record = {
      notAfter : new Date(),
      notBefore : new Date(),
      subject : {
        commonName : subjectData.common_name,
        countryName : subjectData.country,
        stateName : subjectData.state,
        localityName : subjectData.locality,
        organizationName : subjectData.organization,
        organizationUnit : subjectData.organization_unit
      }
    }
    record.notBefore.setFullYear(record.notBefore.getFullYear() + 1); // TODO caution with this value
    console.log(record);

   // Create CSR
   var csr = pki.createCSR(keys,record,passphrase);
   var csrB64 = forge.util.encode64(forge.pki.certificationRequestToPem(csr))
   console.log(csrB64);

    // Send CSR to API
    return axios.post('http://localhost:3000/rest/client_toolkit/csr/' + tokenCSR,
    { crs : csrB64 },
    {headers:{authorization:tokenAccess}})
  })
  .then(function(result){
    console.log(result.data);
    // All operation has been succeeded, store tokenCSR and privateKey to chrome.storage

    // Private key to PKCS8
    var rsaPrivateKey = forge.pki.privateKeyToAsn1(keys.privateKey);
    var privateKeyInfo = forge.pki.wrapRsaPrivateKey(rsaPrivateKey);
    var encryptedPrivateKeyInfo = forge.pki.encryptPrivateKeyInfo(privateKeyInfo, 
                                  passphrase, 
                                  { 
                                    algorithm : 'aes256'
                                  });
    var pkcs8pem = forge.pki.encryptedPrivateKeyToPem(encryptedPrivateKeyInfo);
    keys.privateKey = {} // flush

    // tokenCSR to be encrypted
    var tokenCSREncrypted = aes256.encrypt(passphrase, tokenCSR);
    tokenCSR = ''; // flush
    chrome.storage.local.set({privateKey : pkcs8pem, tokenCSREncrypted : tokenCSREncrypted}, function(){
      //alert('CSR has been generated and sent');
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action : 'CSRDone'});
      });
    });
  })
  .catch(function(err){
    console.log(err);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action : 'CSRFailed', message : err});
    });
  });
}

var downloadCertAndPackP12 = function(tokenAccess, passphrase) {
  console.log('downloadCertAndPackP12');
  console.log(tokenAccess);
  console.log(tokenCSR);
  console.log(passphrase);
  var tokenCSR, privateKey
  // Fetch tokenCSR (encrypted) from storage
  chrome.storage.local.get('tokenCSREncrypted', function(result) {
    if (!result || (result && !result.tokenCSREncrypted)) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action : 'P12Failed', message : 'No tokenCSR saved'});
      });
    }
    tokenCSR = aes256.decrypt(passphrase, result.tokenCSREncrypted);
    console.log(tokenCSR);
    // Fetch privateKey from storage
    chrome.storage.local.get('privateKey', function(result){
      if (!result || (result && !result.privateKey)) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {action : 'P12Failed', message : 'No privateKey saved'});
        });
      }
      console.log(result);
      // Decrypt private key
      privateKey = forge.pki.decryptRsaPrivateKey(result.privateKey, passphrase);
      // Download cert
      axios.get('http://localhost:3000/rest/client_toolkit/cert/' + tokenCSR,
      {headers:{authorization:tokenAccess}})
      .then(function(result){
        console.log('result : ');
        console.log(result.data);
        var cert = forge.pki.certificateFromPem(atob(result.data.cert));
        // Wrapr to P12
        var p12Der = pki.p12Wrap(cert, privateKey, passphrase);
        // Download it
        downloadjs(p12Der, "p12.der", "application/octet-stream");
        // Cleanup
        chrome.storage.local.clear();
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {action : 'P12Done'});h
        });
      })
      .catch(function(err){
        console.log(err);
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {action : 'P12Failed', message : err});
        });
       }); 
    });
  });
}

chrome.runtime.onMessageExternal.addListener(function(msg, sender, sendResponse) {
  if (sender.url !== "http://localhost:3000/") {
    console.log('Not a valid host');
    alert('Not a valid host : ' + sender.url);
    sendResponse({success : false, message : 'Not a valid host'});
    return;
  }
  var result;
  if (msg.action === 'generateAndSendCSR') {
    generateAndSendCSR(msg.tokenAccess, msg.tokenCSR, msg.passphrase, function(){
      sendResponse({success : result, message : 'Success'});
    });
  } else if (msg.action === 'downloadCertAndPackP12') {
    downloadCertAndPackP12(msg.tokenAccess, msg.passphrase, function(){
      sendResponse({success : result, message : 'Success'});
    });
  }
});
