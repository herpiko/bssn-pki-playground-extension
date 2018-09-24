var qs = require('qs');

console.log('Login and fetch token from header');
var payload = { username : 'admin', passsword : 'admin'}
fetch('https://ams-dev.bssn.go.id/oauth/token?grant_type=password&client_id=15177411&client_secret=fdv2-eats-g31i-cedt&scope=read%20write&username=lock_postman&password=qwerty',
  {
    method : 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body : qs.stringify(payload),
  },
)
.then(function(res){
  console.log(res.headers['Token']);

  console.log('Create new object');
  var lastInsertId;
  var payload = { name : 'ayu' }
  return fetch('http://localhost:3000/api/objects',
    {
      method : 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body : qs.stringify(payload),
    },
  )
})
.then(function(res){
  return res.json();
})
.then(function(json){
  console.log(json);

  console.log('Fetch the object');
  return fetch('http://localhost:3000/api/object/' + json.lastInsertId)
})
.then(function(res){
  return res.json();
})
.then(function(json){
  console.log(json);

  console.log('Create new object');
  var payload = { name : 'ani' }
  return fetch('http://localhost:3000/api/objects',
    {
      method : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body : JSON.stringify(payload),
    },
  )
})
.then(function(res){
  return res.json();
})
.then(function(json){
  console.log(json);
  lastInsertId = json.lastInsertId;

  console.log('Fetch the object');
  return fetch('http://localhost:3000/api/object/' + json.lastInsertId)
})
.then(function(res){
  return res.json();
})
.then(function(json){
  console.log(json);

  console.log('Fetching list');
  return fetch('http://localhost:3000/api/objects')
})
.then(function(res){
  return res.json();
})
.then(function(json){
  console.log(json);
  var payload = { name : 'adi' }

  console.log('Updating existing item');
  return fetch('http://localhost:3000/api/object/' + lastInsertId, {
    method : 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body : JSON.stringify(payload),
  })
})
.then(function(res){
  return res.json();
})
.then(function(json){
  console.log(json);

  console.log('Deleting existing item');
  return fetch('http://localhost:3000/api/object/' + lastInsertId, {
    method : 'DELETE',
  })
})
.then(function(res){
  return res.json();
})
.then(function(json){
  console.log(json);
})
.catch(function(err){
  console.log(err);
});
