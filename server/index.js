const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;

var EC = require('elliptic').ec;
var ec = new EC('secp256k1');

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());


// const balances = {
//   "1": 100,
//   "2": 50,
//   "3": 75,
// }
let balances ={};
let privateKeys ={}

let count =0
while (count < 3){
    const key = ec.genKeyPair();
    const publicKey = key.getPublic().encode('hex');
    balances[publicKey] =  Math.floor(Math.random() * 100);
    const privateKey = key.getPrivate().toString(16)
    privateKeys[publicKey] = privateKey
    count++
}
console.log("Available Accounts")
console.log("===================")
for (let pub_key in balances){
  console.log( "-" + pub_key + " (" + balances[pub_key] + ")")
}
console.log("Private Keys")
console.log("===================")
for (pub_key in balances){
  console.log( "-" + privateKeys[pub_key])
}

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const {sender, amount, recipient,signature, msgHash} = req.body;
  try{
    const key = ec.keyFromPublic(sender,'hex');
    if(key.verify(msgHash, signature)){
      balances[sender] -= amount;
      balances[recipient] = (balances[recipient] || 0) + +amount;
      res.send({ balance: balances[sender] });
    } else{
      res.send({error: "Incorrect Private Key!"})
    }
  } catch(e){
    res.send({error: "Invalid address"})
  }


});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
