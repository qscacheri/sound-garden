class Flower {
    constructor(type, position, world) {

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

        var freq = MAJOR_FREQUENCIES[Math.floor(random(14))][Math.floor(random(3))];
        this.oscillator = new Tone.Oscillator(freq, oscillatorType);
        this.panner = new Tone.Panner3D (this.position.x, this.position.y, this.position.z);
        this.oscillator.connect(this.panner);
        this.oscillator.start();
        this.panner.toMaster();

    }

    toJSON()
    {
        var jsonFlower= {
            type: this.type,
            position: this.position.get(),
            scale: this.obj.getScale()
        };
    }
}
