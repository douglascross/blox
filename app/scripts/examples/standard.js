var spherePart = {
    shape: 'sphere',
    radius: 135
};
var boxPart = {
    shape: 'box',
    x: 200, y: 200, z:200
};
var sphereWithBox = {
    intersect: [
        spherePart,
        boxPart
    ]
};
var cylinderPart = {
    shape: 'cylinder',
    top: 70,
    bottom: 70,
    height: 240
};
var cylindersPart = {
    union: [
        {shape: 'cylinder', top: 70, bottom: 70, height: 200},
        {shape: 'cylinder', top: 70, bottom: 70, height: 200, ops: [{rotate: [90, 0, 0]}]},
        {shape: 'cylinder', top: 70, bottom: 70, height: 200, ops: [{rotate: [90, 90, 0]}]}
    ]
};
var finalStandard = {
    subtract: [
        sphereWithBox,
        cylindersPart
    ]
};
