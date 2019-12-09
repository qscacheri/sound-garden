class Flower {
    constructor(type, position, world) {
        // which constructor do we want to call (stupid js)
        if (typeof(position)!="undefined")
        {
            console.log("new flower from scratch");
            this.fromScratch(type, position, world);

        }
        else
        {
            // console.log("new flower from pre existing");
            this.fromPreExisting(type); // actually a json representation of flower
        }
    }

    fromScratch(type, position, world)
    {
        this.type = type;
        this.position = new Vector3(position);

        var container = new Container3D({x:position.x, y:position.y, z:position.z});
        this.obj = new OBJ({
            scaleX: random(.001, .005), scaleY: random(.001, .005), scaleZ: random(.001, .005),
            x: 0, y: 0, z: -.01,
            asset: type+"Obj",
            mtl: type+"Mtl"
        });

        world.add(container);

        container.addChild(this.obj);
        container.spinY(world.getUserRotation().y)
        console.log(world.getUserRotation().y);

        var oscillatorType = "";

        if (type=="rose"){
            oscillatorType = "sine"
        }

        this.pitch = MAJOR_FREQUENCIES[Math.floor(random(14))][Math.floor(random(3))];
        this.oscillator = new Tone.Oscillator(this.pitch, oscillatorType);
        this.panner = new Tone.Panner3D (this.position.x, this.position.y, this.position.z);
        this.oscillator.connect(this.panner);
        this.oscillator.start();
        // this.panner.toMaster();
    }

    fromPreExisting(flower)
    {
        // debugger;
        this.type = flower.type;
        this.position = new Vector3(flower.position);

        this.obj = new OBJ({
            scaleX: flower.scale.x, scaleY: flower.scale.y, scaleZ: flower.scale.z,
            x: flower.position.x, y: flower.position.y, z: flower.position.z,
            asset: flower.type+"Obj",
            mtl: flower.type+"Mtl"
        });
        this.pitch = flower.pitch;

    }

    toJSON(identifier)
    {
        var jsonFlower= {
            type: this.type,
            position: this.position.get(),
            scale: this.obj.getScale(),
            pitch: this.pitch,
            id: identifier
        };

        return jsonFlower;
    }
}

class FlowerCollection
{
    constructor(id)
    {
        this.id = id;
        this.flowers = {};
        this.size = 0;
    }

    add(newFlower){
        var flowerId = this.id + this.size;
        this.flowers[flowerId] = newFlower;
        this.flowers[flowerId].id = flowerId; // flower collection object handles giving the flower an id
        this.size++;
    }

    get(i)
    {
        return this.flowers[i];
    }

    addIfNotPresent(flowerAsJSON)
    {
        var flowerId = flowerAsJSON.id;
        var flowerExists = flowerId in this.flowers;
        if (flowerExists == false)
        {
            debugger;
            this.add(new Flower(flowerAsJSON));
        }
    }
}
