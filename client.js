
const socket = io.connect(origin)
var myId;
var serverData = {};
var otherPlayers = {};
var flowers = [];
var player;
var processor;
var world;
var initialized = false;

socket.on('connect', function() {
    myId = socket.id;

});

socket.on('update', function(otherPlayerInfo) {
    //get the new data from the server
    serverData = otherPlayerInfo;

});

socket.on('playerLost', function(lostPlayerId) {
    delete(otherPlayers[lostPlayerId]);
});

///////////////////////////////////////////////////////////////////////////

function setup() {
    world = new World('VRScene');

    player = new Player();

    var ground = new Plane({
        width: 50, height: 50,
        red: 59, green: 133, blue: 13,
        rotationX: -90
    });
    world.add(ground);

    var sky = new Sphere({
        radius: 100,
        asset: "sky",
        side: "back"
    });
    world.add(sky);

    var box = new Box({
    	x: 0, y: 1, z: 5,
    	width: 1, height: 1, depth: 1
    });
    world.add(box);

    initialized = true;
}

function draw() {
    processServerData();
    player.move();
    player.hover();
    console.log(player.position.y);
}

function mousePressed() {
	Tone.context.resume;
}

function processServerData()
{
    // console.log("Id exists?", idExists);
    for (otherPlayerId in serverData)
    {
        if (otherPlayerId == myId) continue;
        var idExists = otherPlayerId in otherPlayers;
        if (idExists == false)
        {
            otherPlayers[otherPlayerId] = new OtherPlayer(otherPlayerId);
            //console.log("Found new player...need to add");
        }

        else {
            otherPlayers[otherPlayerId].setPositionAndRotation(serverData[otherPlayerId].position, serverData[otherPlayerId].rotation);
        }
    }
}

function keyPressed() {
    if (keyCode== 32)
        player.onClick();
    player.sendDataToServer();
}


class Player {
    constructor() {
        // keep track of player's rotation and position to send to the server
        this.position = new Vector3(random(25), 1.0, random(25));
        world.setUserPosition(this.position.x, this.position.y,this.position.z);
        this.rotation = new Vector3(world.getUserRotation());

        this.container = new Container3D({x: 0, y: 1.6, z: 5});
        world.add(this.container);
    }

    move() {
        if (keyIsDown(87)) // w key
            world.moveUserForward(.01);
        if (keyIsDown(83))  // s key
            world.moveUserForward(-.01);

        this.position.x = world.getUserPosition().x;
        this.position.z = world.getUserPosition().z;
        this.rotation.set(world.getUserRotation());
        this.container.setRotation(this.rotation.x, this.rotation.y, this.rotation.z);
        this.sendDataToServer();

        Tone.Listener.setPosition(this.position.x, this.position.y, this.position.z);
        //console.log(Tone.Listener.positionX, ",", Tone.Listener.positionZ);
    }

    hover() {
    	if (this.position.y > 10.0)
    		this.position.y -= 0.1;
    	if (this.position.y <= 1.0)
    		this.position.y += 0.1;


    }

    onClick() {
        // plant the selected flower
        flowers.push(new Flower('rose', this.position.get(), world));
    }

    sendDataToServer() {
    	// console.log(this.position.get());
        socket.emit("newPosition", {
            position: this.position.get(),
            rotation: this.rotation.get()
        });
    }
}


class OtherPlayer {
    constructor(id) {
        this.id = id;
        this.initialized = false;
        // keep track of other players' rotation and position to send to the server
        this.position = new Vector3(0, 1, 0);
        this.rotation = new Vector3(0, 0, 0);

        this.avatar = new Sphere({
            x: this.position.x, y: this.position.y, z: this.position.z,
            red: random(255), green: random(255), blue: random(255),
            radius: 0.5
        });
    }

    setPositionAndRotation(position, rotation) {
        //make sure setup has run FIRST
        if (this.initialized == false && typeof(world) != "undefined") {
            world.add(this.avatar);
            this.initialized = true;
        }
        this.position.set(position);
        this.rotation.set(rotation);

        this.avatar.setPosition(this.position.x, this.position.y, this.position.z);
        this.avatar.setRotation(this.rotation.x, this.rotation.y, this.rotation.z)
    }
}
