# BLOX
Covert CSG style JSON for use with THREEJS.
Constructive solid geometry is a method of constructing complex solids out of simpler ones.

I haven't completely settled on a syntax yet.
So this is not ready for commercial use.

Example
```javascript
//...
var csg = { shape: 'circle', radius: 120,
  subtract: [
    { shape: 'box', x: 200, y: 200, z: 200 }
  ]
};
var geometry = BLOX.toGeometry(csg);
//...
```

[See it in action here.](http://douglascross.github.io/blox/)

![alt tag](http://douglascross.github.io/blox/images/preview.png)
