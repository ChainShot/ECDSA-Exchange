# ECDSA-Exchange
A Simple Exchange

Installing the Dependencies

To install the dependencies, simply navigate to the folder you cloned the ECDSA-Exchange into and use either yarn or npm to install the dependencies listed in the package.json.

Running the Server

To run the server, navigate to the /server folder in a terminal window and run 'node index'. Alternatively, use 'nodemon index' to restart the server any time your server code changes.

Running the Client

To run the client, go to the /client folder in the repository and use parceljs on the index.html:

'npx parcel index.html' and copy this url on any browser: http://localhost:1234

Run a Simple Simulations

In the server terminal, there will be 3 public & private address generated and each of these public address will have a separate funds to commit a transactions.

Each of these transactions will require it's own private key for authentications. Each sender will need to insert their own private key in the Password field before clicking the Submit button.

