import "./index.scss";
var EC = require('elliptic').ec;
var ec = new EC('secp256k1');
const SHA256 = require('crypto-js/sha256');
const server = "http://localhost:3042";

document.getElementById("exchange-address").addEventListener('input', ({ target: {value} }) => {
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    return;
  }

  fetch(`${server}/balance/${value}`).then((response) => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("errorMsg").style.display = 'none';
    document.getElementById("balance").style.display = 'block';
    document.getElementById("balance").innerHTML = balance;
  });
});

document.getElementById("transfer-amount").addEventListener('click', () => {
  const sender = document.getElementById("exchange-address").value;
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;
  const privateKey = document.getElementById("private-key").value;

  const key = ec.keyFromPrivate(privateKey);

  const message = {
    sender:sender,
    amount:amount,
    recipient:recipient,
    key:key
  }

  const msgHash = SHA256(message).toString();

  const signature = key.sign(msgHash)
  const body = JSON.stringify({
    sender, amount, recipient,signature, msgHash
  });

  const request = new Request(`${server}/send`, { method: 'POST', body });

  fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
    return response.json();
  }).then(({ balance,error }) => {
    if(error){
      document.getElementById("errorMsg").style.display = 'block';
      document.getElementById("balance").style.display = 'none';
      document.getElementById("errorMsg").innerHTML = error;
    }else{
      document.getElementById("balance").style.display = 'block';
      document.getElementById("errorMsg").style.display = 'none';
      document.getElementById("balance").innerHTML = balance;
    }

  });
});
