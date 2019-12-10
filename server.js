// to start server, cd into directory and type 'npm start' or 'node server.js' (no difference)

var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var users = {};
var flowerData = {};

app.set('port', 5941);

/* Giveuser access to files...
   If you were going to do this *not* on github you wouldn't want to allow them to see server.js (just saying)
   */
app.use('/', express.static(__dirname + '/'));

// What file to send users
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});

// Star listening on port 80 for web stuff
server.listen(3000, function() {
    console.log('starting webserver');
});

io.sockets.on('connect', function(socket) {
    var sessionid = socket.id;
});

///////////////////////////////////////////////////

io.on("connection", (socket) => {

    console.log(`Someone connected! Their id is: ${socket.id}`);

    users[socket.id] = {
        position: new Vector3(0, 0, 0),
        rotation: new Vector3(0, 0, 0)
    };

    io.sockets.emit("newPlayer", socket.id);
    io.sockets.emit("update", users);

    socket.on('clientData', (data) =>
    {
        users[socket.id] = data.playerData;
        for (var flowerId in data.flowerData)
        {
            flowerData[flowerId] = data.flowerData[flowerId]
        }

    })

    socket.on("disconnect", () => {
        console.log(`Someone disconnected... ${socket.id}`);
        delete(users[socket.id]);
        for (var flowerId in flowerData){
            if (flowerId.includes(socket.id))
            delete(flowerData[flowerId]);
            console.log("flower deleted");
        }
        console.log(flowerData);
        io.sockets.emit("playerLost", socket.id);
    });

})

setInterval(() => {
    io.sockets.emit("update", {playerData: users, flowerData: flowerData});
    // console.log(users);

}, 1000 / 60);


class Vector3 {
    constructor(x, y, z) {
        if (typeof(x.x) === "undefined") {
            this.x = x;
            this.y = y;
            this.z = z;
        } else {
            this.x = x.x
            this.y = x.y
            this.z = x.z
        }
    }

    get() {
        var m = {
            x: this.x,
            y: this.y,
            z: this.z
        };
        return m;

    }

    set(newValue)
    {
        this.x = newValue.x;
        this.y = newValue.y;
        this.z = newValue.z;
    }

    copy(vector3ToCopy) {
        this.x = vector3ToCopy.x;
        this.y = vector3ToCopy.y;
        this.z = vector3ToCopy.z;
    }
}
