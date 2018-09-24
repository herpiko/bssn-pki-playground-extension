window.forge = require('node-forge');

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

var p12Wrap = function(cert, privateKey, password) {
  var p12Asn1 = forge.pkcs12.toPkcs12Asn1(privateKey, cert, password);
  var p12Der = forge.asn1.toDer(p12Asn1).getBytes();
  return p12Der;
}

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

var ab2Str = function (buffer) {
  var binary = '';
  var bytes = new Uint8Array( buffer );
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
      binary += String.fromCharCode( bytes[ i ] );
  }
  return binary;
}

module.exports = {
  createCertificate : createCertificate,
  createCSR : createCSR,
  p12Wrap : p12Wrap,
}
