const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const EC = require('elliptic').ec;

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

// Create and initialize EC context
// (better do it once and reuse it)
var ec = new EC('secp256k1');

// Generate keys
var key1 = ec.genKeyPair();
var key2 = ec.genKeyPair();
var key3 = ec.genKeyPair();

const pub1 = key1.getPublic().encode('hex').slice(-40);
const pub2 = key2.getPublic().encode('hex').slice(-40);
const pub3 = key3.getPublic().encode('hex').slice(-40);

console.log({
  address: pub1.toString(),
  privateKey: key1.getPrivate().toString(16),
  publicX: key1.getPublic().x.toString(16),
  publicY: key1.getPublic().y.toString(16),
});
console.log({
  address: pub2.toString(16),
  privateKey: key2.getPrivate().toString(16),
  publicX: key2.getPublic().x.toString(16),
  publicY: key2.getPublic().y.toString(16),
});
console.log({
  address: pub3.toString(16),
  privateKey: key3.getPrivate().toString(16),
  publicX: key3.getPublic().x.toString(16),
  publicY: key3.getPublic().y.toString(16),
});

const balances = {
  [pub1]: 101,
  [pub2]: 102,
  [pub3]: 103,
}

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const {sender, amount, recipient, signature} = req.body;
  // here is where we need to check that the message is signed with the private key of the msg sender.
  if (
    sender.verify(`${sender}${amount}${recipient}`)
  ) {
      balances[sender] -= amount;
      balances[recipient] = (balances[recipient] || 0) + +amount;
      res.send({ balance: balances[sender] });
    }
  else { res.send("some kind of error message") }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
