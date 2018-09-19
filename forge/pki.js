window.forge = require('node-forge');
/*
window.crypto.subtle.generateKey({name: "RSASSA-PKCS1-v1_5", modulusLength:2048,publicExponent: new Uint8Array([1,0,1]), hash: {name : "SHA-256"}}, true, ["sign", "verify"])
.then((keypair) => {
  console.log('\n\n\n================================== Generate keypair using cryptosubtle');
  console.log(keypair);
});
 * */

/*
console.log('\n\n\n================================== Generate keypair using forge');
var keys = forge.pki.rsa.generateKeyPair(1024);
console.log(keys);

console.log('\n\n\n================================== Key object to pem');
var pem = forge.pki.publicKeyToPem(keys.publicKey);
console.log(pem);
pem = forge.pki.privateKeyToPem(keys.privateKey);
console.log(pem);

console.log('\n\n\n================================== Pem to key object');
var obj = forge.pki.privateKeyFromPem(pem);
console.log(obj);

console.log('\n\n\n================================== PKCS8');
var password = '123456';
var rsaPrivateKey = forge.pki.privateKeyToAsn1(keys.privateKey);
var privateKeyInfo = forge.pki.wrapRsaPrivateKey(rsaPrivateKey);
var encryptedPrivateKeyInfo = forge.pki.encryptPrivateKeyInfo(privateKeyInfo, password, {algorithm : "aes256"});
var pkcs8pem = forge.pki.encryptedPrivateKeyToPem(encryptedPrivateKeyInfo);
console.log(pkcs8pem);

console.log('\n\n\n================================== Selfsigned certificate');
var record = {
  notAfter : new Date(),
  notBefore : new Date(),
  subject : {
    commonName : 'Herpiko',
    countryName : 'ID',
    stateName : 'ID',
    localityName : 'Jakarta',
    organizationName : 'BlanKon',
    organizationUnit : 'Riset',
  }
}
record.notBefore.setFullYear(record.notBefore.getFullYear() + 1);

 * */
var createCertificate = function(keys, record){
  
  var cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  if (record.notBefore) {
    cert.validity.notBefore = record.notBefore;
  } else {
    cert.validity.notBefore = new Date();
  }
  if (record.notAfter) {
    cert.validity.notAfter = record.notAfter;
  } else {
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  }
  var issuerAttrs = [{
    name: 'commonName',
    value: record.subject.commonName,
  }, {
    name: 'countryName',
    value: record.subject.countryName
  }, {
    shortName: 'ST',
    value: record.subject.stateName
  }, {
    name: 'localityName',
    value: record.subject.localityName
  }, {
    name: 'organizationName',
    value: record.subject.organizationName
  }, {
    shortName: 'OU',
    value: record.subject.organizationUnit
  }];
  var subjectAttrs = [{
    name: 'commonName',
    value: record.subject.commonName,
  }, {
    name: 'countryName',
    value: record.subject.countryName
  }, {
    shortName: 'ST',
    value: record.subject.stateName
  }, {
    name: 'localityName',
    value: record.subject.localityName
  }, {
    name: 'organizationName',
    value: record.subject.organizationName
  }, {
    shortName: 'OU',
    value: record.subject.organizationUnit
  }];
  cert.setSubject(subjectAttrs);
  cert.setIssuer(issuerAttrs);
  cert.setExtensions([{
    name: 'basicConstraints',
    cA: true
  }, {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  }, {
    name: 'extKeyUsage',
    serverAuth: true,
    clientAuth: true,
    codeSigning: true,
    emailProtection: true,
    timeStamping: true
  }, {
    name: 'nsCertType',
    client: true,
    server: true,
    email: true,
    objsign: true,
    sslCA: true,
    emailCA: true,
    objCA: true
  }, {
    name: 'subjectKeyIdentifier'
  }]);
  cert.sign(keys.privateKey);
  return cert
}
//var cert = createCertificate(record);
//pem = forge.pki.certificateToPem(cert);
//console.log(pem);

//console.log('\n\n\n================================== Certificate and private key to PKCS12');
var p12Wrap = function(cert, privateKey) {
  var p12Asn1 = forge.pkcs12.toPkcs12Asn1(privateKey, cert, password);
  var p12Der = forge.asn1.toDer(p12Asn1).getBytes();
  return forge.util.encode64(p12Der);
}
//var p12b64 = p12Wrap(cert, keys.privateKey, "123456");
//console.log(p12b64);
//p12b64 = p12Wrap(null, keys.privateKey, "123456");
//console.log(p12b64);


//console.log('\n\n\n================================== Certificate Signing Request');
//var csrPassword = "123456";
var createCSR = function(keys, record, challengePassword) {
  var csr = forge.pki.createCertificationRequest();
  csr.publicKey = keys.publicKey;
  csr.setSubject([{
    name : "commonName",
    value : record.subject.commonName
  }, {
    name : "countryName",
    value : record.subject.countryName
  }, {
    shortName : "ST",
    value : record.subject.stateName
  }, {
    name : "localityName",
    value : record.subject.localityName
  }, {
    name : "organizationName",
    value : record.subject.organizationName
  }, {
    shortName : "OU",
    value : record.subject.organizationUnit
  }]);
  var csrAttrs = [{
    name: 'challengePassword',
    value: challengePassword,
  }]
  csr.setAttributes(csrAttrs);
  csr.sign(keys.privateKey);
  return csr;
}
//pem = forge.pki.certificationRequestToPem(createCSR(publicKey, record, "123456"));
//console.log(pem);

module.exports = {
  createCertificate : createCertificate,
  createCSR : createCSR,
  p12Wrap : p12Wrap,
}
