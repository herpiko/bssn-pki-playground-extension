var TwinBcrypt = window.TwinBcrypt = require('twin-bcrypt');
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
    } else {
      var element = document.getElementById("set-masterpass");
      element.classList.remove("hide");
    } 
  });
}

function initiateMasterpass() {
  var pass = document.getElementById("masterpass").value;
  var passRepeat = document.getElementById("masterpass-repeat").value;
  if (!pass || (pass && pass.length < 1)) {
    alert('Masterpass should not be empty');
    return;
  }
  if (pass != passRepeat) {
    alert('Please repeat the same masterpass');
    return;
  }
  var obj = {}
  obj['masterpass'] = TwinBcrypt.hashSync(pass);
  chrome.storage.sync.set(obj, function(){
    alert('Masterpass has been successfuly setup.');
    window.close();
  });
}

function reset() {
  if (!window.confirm('You are going to reset your masterpass and all of your keystore. Are you sure?')) {
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

document.getElementById("set-masterpass-ok").addEventListener("click", initiateMasterpass);
document.getElementById("reset").addEventListener("click", reset);
loadStore();
