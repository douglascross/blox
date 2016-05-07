# BLOX
Covert CSG style JSON for use with THREEJS.
Constructive solid geometry is a method of constructing complex solids out of simpler ones.

I haven't completely settled on a syntax yet.
So this is not ready for commercial use.

Example
```javascript
var csg = {
    subtract: [
        {
            intersect: [
                { shape: 'sphere', radius: 135, color: 0x0000ff },
                { shape: 'box', x: 200, y: 200, z:200, color: 0xff0000 }
            ]
        },
        {
            union: [
                { shape: 'cylinder', top: 70, bottom: 70, height: 200, color: 0x00ff00 },
                { shape: 'cylinder', top: 70, bottom: 70, height: 200, color: 0x00ff00, ops: [{rotate: [90, 0, 0]}] },
                { shape: 'cylinder', top: 70, bottom: 70, height: 200, color: 0x00ff00, ops: [{rotate: [90, 90, 0]}] }
            ]
        }
    ]
};
var mesh = BLOX.toMesh(csg);
```

[See it in action here.](http://douglascross.github.io/blox/)

![alt tag](http://douglascross.github.io/blox/images/preview.png?3)
