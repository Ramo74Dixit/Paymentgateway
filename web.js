const WebSocket = require('ws');

// create a web socket server

const wss = new WebSocket.Server({port:8080});

console.log("Web Socket is running on ws localhost : 8080");

// listen for client connections

wss.on('connection',(ws)=>{
    console.log("Client Connected");
    ws.on('message',(message)=>{
        console.log(`Recieved : ${message}`);
        wss.clients.forEach((client)=>{
            if(client.readyState === WebSocket.OPEN){
                client.send(message);
            }
        })
    })
    ws.on('close',()=>{
        console.log("Client Dissconnected");
    })
})

