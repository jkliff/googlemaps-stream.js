googlemaps-stream.js
====================

Node.js app that pushes google maps updates to clients from a arbitrary source

Dependencies:
npm install socket.io
npm install tail

Usage:

node app.js [FILE TO BE WATCHED]

This starts a server on port 7777 (hardcoded).
Whenever a new line is added to FILE TO BE WATCHED, it is treated as an address, its location is queried in google and the result shown on map.


TODO:
- control how many last addresses are to be shown.
    * quantity
    * time
