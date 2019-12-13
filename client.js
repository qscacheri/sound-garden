const socket = io.connect(origin)
var myId;
var serverData = {};
var otherPlayers = {};
var flowers = [];
var player;
var processor;
var world;
var initialized = false;
var rainSystem;
var rainSound;
var liveValue;
var textHolder;
var signContainer;
var sky;

// document.getElementById("live").onchange = function(){
//     liveValue = document.getElementById("live").value;
//     console.log(liveValue);
//     textHolder.setZ(liveValue);
//     console.log(textHolder);
// }

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
    flowerCollection.destroy(lostPlayerId);
});

///////////////////////////////////////////////////////////////////////////
function preload() {
    rainSound = loadSound("assets/audio_files/rain_short.wav");
}

function setup() {
    $("#loadingMsg").hide();

    world = new World('VRScene');
    world.camera.holder.setAttribute('wasd-controls', "enabled: false;");
    player = new Player();
    rainSound.loop();
    rainSystem = new RainSystem();
    var garden = new OBJ({
        asset: "gardenObj",
        mtl: "gardenMtl"

    })

    world.add(garden);

    var ground = new Plane({
        width: 20,
        height: 20,
        red: 59,
        green: 133,
        blue: 13,
        rotationX: -90
    });
    world.add(ground);

    sky = new Sphere({
        radius: 100,
        asset: "sky",
        side: "back",
        y: -80
    });
    world.add(sky);

    signContainer = new Container3D({
        x: 0,
        y: 0,
        z: 0,
    });
    world.add(signContainer);

    textHolder = new Plane({
        x: 0, y: 1.6, z: .05,
        width: .0001, height: .0001,
        red: 0, green: 0, blue: 0
    });
    signContainer.addChild(textHolder);

    textHolder2 = new Plane({
        x: 0, y: 1.4, z: .05,
        width: .0001, height: .0001,
        red: 0, green: 0, blue: 0
    });
    signContainer.addChild(textHolder2);

    var sign = new OBJ({
        x: 0,
        y: 1.5,
        z: 0,
        rotationY: 180,
        asset: "signObj",
        mtl: "signMtl"
    });
    signContainer.addChild(sign);
    // world.add(sign);
    console.log(textHolder);
    textHolder.tag.setAttribute('text', 'value: Sound Garden; color: rgb(255,255,255); align: center; width: 3.4em; font: "fantasy";');
    textHolder2.tag.setAttribute('text', 'value: press "spacebar"\nto plant flowers; color: rgb(255,255,255); align: center; width: 2.0em; font:"fantasy";');

    // console.log(textHolder.tag);

    // used for boundary testing
    // var xNeg = new Box({
    //     x: -5, y: .5, z: 0,
    //     red: 0, green: 0, blue: 255
    // })
    // world.add(xNeg);
    //
    // var xPos = new Box({
    //     x: 5, y: .5, z: 0,
    //     red: 100, green: 0, blue: 255
    // })
    // world.add(xPos);
    //
    // var zNeg = new Box({
    //     x: 0, y: .5, z: -5,
    //     red: 200, green: 100, blue: 255
    // })
    // world.add(zNeg);
    //
    // var zPos = new Box({
    //     x: 0, y: .5, z: 5,
    //     red: 200, green: 0, blue: 0
    // })
    // world.add(zPos);



    initialized = true;
}

function draw() {
    sky.spinY(.01);
    processServerData();
    player.move();
    rainSystem.render();
    // player.hover();
    signContainer.spinY(.1);
}

function mousePressed() {
    Tone.context.resume;
    getAudioContext().resume()
}

function processServerData() {
    for (otherPlayerId in serverData.playerData) {
        if (otherPlayerId == myId) continue;
        var idExists = otherPlayerId in otherPlayers;
        if (idExists == false) {
            otherPlayers[otherPlayerId] = new OtherPlayer(otherPlayerId);
            //console.log("Found new player...need to add");
        } else {
            otherPlayers[otherPlayerId].setPositionAndRotation(serverData.playerData[otherPlayerId].position, serverData.playerData[otherPlayerId].rotation);
        }
    }

    for (flowerId in serverData.flowerData) {
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
        this.position = new Vector3(random(-8, 8), 1, random(-8, 8));
        this.rotation = new Vector3(world.getUserRotation());
        this.direction = -1;

        this.container = new Container3D({
            x: 0,
            y: 1.6,
            z: 5
        });
        world.add(this.container);

        this.flowerCollection = new FlowerCollection(myId);

        world.setUserPosition(this.position.x, this.position.y, this.position.z);
    }

    initialize() {
        this.flowerCollection.id = myId
    }

    move() {
        // console.log(this.position.x, ",", this.position.z);

        if (keyIsDown(87)) // w key
            world.moveUserForward(.05);
        if (keyIsDown(83)) // s key
            world.moveUserForward(-.05);

        this.position.x = world.getUserPosition().x;
        this.position.z = world.getUserPosition().z;
        this.rotation.set(world.getUserRotation());
        this.container.setRotation(this.rotation.x, this.rotation.y, this.rotation.z);
        this.sendDataToServer();

        if (this.position.x <= -8) {
            this.position.x = -7;
            world.setUserPosition(this.position.x, this.position.y, this.position.z)
        }

        if (this.position.x >= 8) {
            this.position.x = 7;
            world.setUserPosition(this.position.x, this.position.y, this.position.z)
        }

        if (this.position.z <= -6) {
            this.position.z = -5;
            world.setUserPosition(this.position.x, this.position.y, this.position.z)
        }

        if (this.position.z >= 8) {
            this.position.z = 7;
            world.setUserPosition(this.position.x, this.position.y, this.position.z)
        }

        Tone.Listener.setPosition(this.position.x, this.position.y, this.position.z);
        Tone.Listener.setOrientation(this.rotation.x, this.rotation.y, this.rotation.z, 0, 0, 1);

        //console.log(Tone.Listener.positionX, ",", Tone.Listener.positionZ);
    }

    // hover() {
    // 	if (this.position.y > 2.0)
    // 		this.direction = -1;
    //     if (this.position.y <= 1.0)
    //         this.direction = 1;
    //     this.position.y += 0.1 * this.direction;
    // }

    keyPressed(key) {
        if (keyCode == 32) {

            var type = Flower.types[Math.floor(random(Flower.types.length))];

            // plant the selected flower
            this.flowerCollection.add(new Flower(type, {
                x: this.position.x,
                y: 1,
                z: this.position.z
            }, world))
            console.log(this.flowerCollection.flowers);
        }
    }

    sendDataToServer() {
        socket.emit("clientData", {
            playerData: {
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
            x: this.position.x,
            y: this.position.y,
            z: this.position.z,
            red: random(255),
            green: random(255),
            blue: random(255),
            radius: 0.1
        });

        this.shadow = new Cylinder({
            x: this.position.x,
            y: .001,
            z: this.position.z,
            red: 0,
            green: 0,
            blue: 0,
            scaleX: .1,
            scaleY: .01,
            scaleZ: .1
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

    destroy() {
        world.remove(this.avatar);
        world.remove(this.shadow);
    }
}

class RainDrop {
    constructor() {
        this.sphere = new Sphere({
            radius: .01,
            red: 255,
            green: 255,
            blue: 255,
            opacity: .3,
            x: random(player.position.x - 3, player.position.x + 3),
            y: random(20, 30),
            z: random(player.position.z - 3, player.position.z + 3),
        })
        // this.speedX = random(-.5, .5);
        this.speedY = random(-.5, -.8);
        world.add(this.sphere);
    }
    move() {
        this.sphere.nudge(0, this.speedY, 0);
        if (this.sphere.getY() <= 0)
            return true;
        else return false;
    }
    reset() {
        this.sphere.setPosition(random(player.position.x - 3, player.position.x + 3), random(20, 30), random(player.position.z - 3, player.position.z + 3));
        this.speedY = random(-.1, -.5);
    }
}

class RainSystem {
    constructor() {
        this.rainDrops = [];
        for (var i = 0; i < 1000; i++) {
            this.rainDrops.push(new RainDrop());
        }
    }

    render() {
        for (var i = 0; i < this.rainDrops.length; i++) {
            var shouldDelete = this.rainDrops[i].move();
            if (shouldDelete) {
                this.rainDrops[i].reset();
            }
        }

    }
}
