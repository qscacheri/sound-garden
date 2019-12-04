class Flower
{
    constructor(type, position, world)
    {

        console.log(world.getUserPosition().z + .01);
        console.log(position);
        this.position = new Vector3(position);

        var container = new Container3D({x:position.x, y:position.y, z:position.z});
        this.obj = new OBJ({
            scaleX: .005, scaleY: .005, scaleZ: .005,
            x: 0, y: 0, z: -.01,
            asset: type+"Obj",
            mtl: type+"Mtl"
        });

        world.add(container);

        container.addChild(this.obj);
        container.spinY(world.getUserRotation().y)
        console.log(world.getUserRotation().y);
    }
}



class AudioProcessor
{
    constructor()
    {

    }
}
