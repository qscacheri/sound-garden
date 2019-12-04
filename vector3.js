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
