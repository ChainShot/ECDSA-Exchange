const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const EC = require("elliptic").ec;
const { SHA256 } = require("crypto-js");
// Create and initialize EC context
const ec = new EC("secp256k1");

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());



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
  [pubKey2]: 50,
  [pubKey3]: 75,
};

console.log({
  'wallet1 privateKey': key1.getPrivate().toString(16),
  'wallet1 publicKey': key1.getPublic().encode('hex'),
  
  'wallet2 privateKey': key2.getPrivate().toString(16),
  'wallet2 publicKey': key2.getPublic().encode('hex'),

  'wallet3 privateKey': key3.getPrivate().toString(16),
  'wallet3 publicKey': key3.getPublic().encode('hex'),

  'wallet balances': JSON.stringify(balances, null, 1),
});

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const {sender, recipient, amount, transaction} = req.body;
  const signature = {
    r: transaction.signature.r,
    s: transaction.signature.s,
  };

// Verify that the message is signed with the correct key

const key = ec.keyFromPublic(sender, 'hex');
const msg = transaction.msg;
const msgHash = SHA256(msg).toString();

console.log(key.verify(msgHash, signature));

if(key.verify(msgHash, signature)){
  balances[sender] -= amount;
  balances[recipient] = (balances[recipient] || 0) + +amount;
  res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});