const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const EC = require("elliptic").ec;
const { SHA256 } = require("crypto-js");

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

// Create and initialize EC context
// (better do it once and reuse it)
var ec = new EC("secp256k1");

// Generate keys
const key1 = ec.genKeyPair();
const key2 = ec.genKeyPair();
const key3 = ec.genKeyPair();

// public keys
const pubKey1 = key1.getPublic().encode("hex");
const pubKey2 = key2.getPublic().encode("hex");
const pubKey3 = key3.getPublic().encode("hex");

// private keys
const privKey1 = key1.getPrivate().toString(16);
const privKey2 = key2.getPrivate().toString(16);
const privKey3 = key3.getPrivate().toString(16);

const balances = {
  [pubKey1]: 100,
  [pubKey2]: 100,
  [pubKey3]: 567,
};

app.get('/balance/:address', (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const {sender, recipient, amount, payload} = req.body;
  const receivedPubKey = sender;
  const decodedKey = ec.keyFromPublic(receivedPubKey, "hex");
  const msg = payload.msg;
  const msgHash = SHA256(msg).toString();
  const signature = {
    r: payload.signature.r,
    s: payload.signature.s,
  };

  if (decodedKey.verify(msgHash, signature)){
    console.log(`Great job! You put in the correct key, and you sent ${amount}`)
    balances[sender] -= amount;
    balances[recipient] = (balances[recipient] || 0) + +amount;
    res.send({ balance: balances[sender] });

  }
  else{
    console.log("error, your private key isn't verified!");
  }

});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  console.log(
    `
    =====================
    Public Address (and balances)
    =====================

    ${JSON.stringify(balances, null, 2)}
    =====================
    Private Keys
    =====================
    (0) ${privKey1}
    (1) ${privKey2}
    (2) ${privKey3}
    `
  );


});
