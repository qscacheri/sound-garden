class Flower {
    constructor(type, position, world, id) {
        // which constructor do we want to call (stupid js)
        if (typeof(position) != "undefined") {
            console.log("new flower from scratch");
            this.fromScratch(type, position, world, id);

        } else {
            // console.log("new flower from pre existing");
            this.fromPreExisting(type); // actually a json representation of flower
        }
    }

    fromScratch(type, position, world, id) {
        this.id = id;
        this.type = type;
        this.position = new Vector3(position);
        this.sample = Math.floor(random(8));
        var container = new Container3D({
            x: position.x,
            y: position.y,
            z: position.z
        });
        world.add(container);

        this.obj = new OBJ({
            scaleX: 1,
            scaleY: 1,
            scaleZ: 1,
            x: 0,
            y: 0,
            z: -.01,
            asset: type + "Obj",
            mtl: type + "Mtl"
        });
        container.addChild(this.obj);

        container.spinY(world.getUserRotation().y)
        //console.log(world.getUserRotation().y);
        Tone.context.resume();

        this.panner = new Tone.Panner3D (this.position.x, this.position.y, this.position.z);
        this.panner.toMaster();

        this.player = new Tone.Player("./assets/audio_files/" + this.sample + ".wav");
        this.player.autostart = true;
        this.player.loop = true;
        this.player.connect(this.panner);



    }

    fromPreExisting(flower) {
        this.id = flower.id;
        this.type = flower.type;
        this.position = new Vector3(flower.position);

        this.obj = new OBJ({
            scaleX: 1,
            scaleY: 1,
            scaleZ: 1,
            x: flower.position.x,
            y: flower.position.y,
            z: flower.position.z,
            asset: flower.type + "Obj",
            mtl: flower.type + "Mtl"
        });

        this.sample = flower.sample;
        world.add(this.obj);

        this.panner = new Tone.Panner3D (this.position.x, this.position.y, this.position.z);
        this.panner.toMaster();

        this.player = new Tone.Player("./assets/audio_files/" + this.sample + ".wav");
        this.player.autostart = true;
        this.player.loop = true;
        this.player.connect(this.panner);

    }

    toJSON(identifier) {
        var jsonFlower = {
            type: this.type,
            position: this.position.get(),
            scale: this.obj.getScale(),
            sample: this.sample,
            id: identifier
        };

        return jsonFlower;
    }
}

class FlowerCollection {
    constructor(id) {
        this.id = id;
        this.flowers = {};
        this.size = 0;
    }

    add(newFlower, alreadyHasId) {
        if (alreadyHasId == true) {
            var flowerId = newFlower.id;
            this.flowers[flowerId] = newFlower;
            this.size++;

        } else {
            var flowerId = this.id + this.size;
            this.flowers[flowerId] = newFlower;
            this.flowers[flowerId].id = flowerId; // flower collection object handles giving the flower an id
            this.size++;
        }
    }

    get(i) {
        return this.flowers[i];
    }

    addIfNotPresent(flowerAsJSON) {

        var flowerId = flowerAsJSON.id;
        var flowerExists = flowerId in this.flowers;
        if (flowerExists == false) {
            console.log("missing flower with id: ", flowerId);
            this.add(new Flower(flowerAsJSON), true);
        }
    }
}
