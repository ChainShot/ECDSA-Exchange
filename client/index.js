const EC = require("elliptic").ec;
const SHA256 = require("crypto-js/sha256");
const ec = new EC("secp256k1");

import "./index.scss";

const server = "http://localhost:3042";

document.getElementById("exchange-address").addEventListener('input', ({ target: {value} }) => {
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    return;
  }

  fetch(`${server}/balance/${value}`).then((response) => {
      return response.json();
    })
  .then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});

document.getElementById("transfer-amount").addEventListener('click', () => {
  const sender = document.getElementById("exchange-address").value;
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;
  const yourKey = document.getElementById("private-key").value;


  // set up the signing with the private key
  const key = ec.keyFromPrivate(yourKey.toString(16));
  const msg = "This is me sending you some fake money";
  const msgHash = SHA256(msg);
  const signature = key.sign(msgHash.toString());

  const payload = {
    msg,
    signature: {
      r: signature.r.toString(16),
      s: signature.s.toString(16),
    },
  }

  console.log(payload);

  const body = JSON.stringify({
    sender, amount, recipient, payload
  });

  const request = new Request(`${server}/send`, { method: 'POST', body });

  fetch(request, { headers: { "Content-Type": "application/json" }}).then(response => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});
