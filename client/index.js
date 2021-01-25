import "./index.scss";
const EC = require('elliptic').ec;
var ec = new EC('secp256k1');

const server = "http://localhost:3042";

document.getElementById("exchange-address").addEventListener('input', ({ target: {value} }) => {
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    return;
  }
  fetch(`${server}/balance/${value}`).then((response) => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});

// I don't understand how this element doesn't have exactly the same behavior
// as the one above, except using a private key. I have a hunch
// this has to do with the decimal/hex export thing, maybe.
document.getElementById("exchange-key").addEventListener('input', ({ target: {value} }) => {
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    return;
  }
  const key = ec.keyFromPrivate(value);
  const addr = key.getPublic().encode('hex').slice(-40);

  fetch(`${server}/balance/${addr}`).then((response) => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});

document.getElementById("transfer-amount").addEventListener('click', () => {
  const sender = document.getElementById("exchange-key").addr;
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;
  const signature = document.getElementById("exchange-key").key.sign(`${sender}${amount}${recipient}`);

  const body = JSON.stringify({
    sender, amount, recipient, signature
  });

  const request = new Request(`${server}/send`, { method: 'POST', body });

  fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});
