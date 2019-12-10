
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
    if (typeof(player) != "undefined")
        player.initialize();
});

socket.on('update', function(newServerData) {
    //get the new data from the server
    serverData = newServerData;

});

socket.on('playerLost', function(lostPlayerId) {
    otherPlayers[lostPlayerId].destroy();
    delete(otherPlayers[lostPlayerId]);
});

///////////////////////////////////////////////////////////////////////////

function setup() {
    world = new World('VRScene');
    world.camera.holder.setAttribute('wasd-controls', "enabled: false;");
    player = new Player();

    var ground = new Plane({
        width: 20, height: 20,
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
}

function mousePressed() {
	Tone.context.resume;
}

function processServerData()
{
    for (otherPlayerId in serverData.playerData)
    {
        if (otherPlayerId == myId) continue;
        var idExists = otherPlayerId in otherPlayers;
        if (idExists == false)
        {
            otherPlayers[otherPlayerId] = new OtherPlayer(otherPlayerId);
            //console.log("Found new player...need to add");
        }

        else
        {
            otherPlayers[otherPlayerId].setPositionAndRotation(serverData.playerData[otherPlayerId].position, serverData.playerData[otherPlayerId].rotation);
        }
    }

    // console.log("flowerdata", serverData.flowerData);

    for (flowerId in serverData.flowerData)
    {
        // console.log(flowerId);
        player.flowerCollection.addIfNotPresent(serverData.flowerData[flowerId]);
    }

}

function keyPressed() {
    player.keyPressed(keyCode);
    player.sendDataToServer();
}


class Player {
    constructor() {
        // keep track of player's rotation and position to send to the server
        this.position = new Vector3(random(-10, 10), 1, random(-10, 10));
        this.rotation = new Vector3(world.getUserRotation());

        this.container = new Container3D({x: 0, y: 1.6, z: 5});
        world.add(this.container);

        this.flowerCollection = new FlowerCollection(myId);

        world.setUserPosition(this.position.x, this.position.y, this.position.z);
    }

    initialize()
    {
        this.flowerCollection.id = myId
    }

    move() {
        console.log(this.position.x);

        if (this.position.x > -9 && this.position.x < 9 && this.position.z > -9 && this.position.z < 9)
        {
            if (keyIsDown(87)) // w key
                world.moveUserForward(.01);
            if (keyIsDown(83))  // s key
                world.moveUserForward(-.01);
        }

        else {
            world.moveUserForward(-.01);
        }

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

    keyPressed(key) {
        if (keyCode == 32){
            // plant the selected flower
            this.flowerCollection.add(new Flower('rose', this.position.get(), world))
            console.log(this.flowerCollection.flowers);
        }
    }

    sendDataToServer() {
        socket.emit("clientData", {
            playerData : {
                position: this.position.get(),
                rotation: this.rotation.get()
            },
            flowerData: this.flowerCollection.flowers

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
            radius: 0.1
        });

        this.shadow = new Cylinder({
            x: this.position.x, y: .001, z: this.position.z,
            red: 0, green: 0, blue: 0,
            scaleX: .1, scaleY: .01, scaleZ: .1
        });

    }

    setPositionAndRotation(position, rotation) {
        //make sure setup has run FIRST
        if (this.initialized == false && typeof(world) != "undefined") {
            world.add(this.avatar);
            world.add(this.shadow);
            this.initialized = true;
        }
        this.position.set(position);
        this.rotation.set(rotation);

        this.avatar.setPosition(this.position.x, this.position.y, this.position.z);
        this.avatar.setRotation(this.rotation.x, this.rotation.y, this.rotation.z);

        this.shadow.setPosition(this.position.x, .00001, this.position.z);
    }

    destroy(){
        world.remove(this.avatar);
        world.remove(this.shadow);
    }
}
