var colorExample = {
    spherePart: {
        shape: 'sphere',
        radius: 135,
        color: 0x0000ff
    },
    boxPart: {
        shape: 'box',
        x: 200, y: 200, z:200,
        color: 0xff0000
    },
    cylinderPart: {
        shape: 'cylinder',
        top: 70,
        bottom: 70,
        height: 200,
        color: 0x00ff00
    }
};
colorExample.sphereWithBox = {
    intersect: [
        colorExample.spherePart,
        colorExample.boxPart
    ]
};
colorExample.cylindersPart = {
    union: [
        {shape: 'cylinder', top: 70, bottom: 70, height: 200, color: 0x00ff00},
        {shape: 'cylinder', top: 70, bottom: 70, height: 200, color: 0x00ff00, ops: [{rotate: [90, 0, 0]}]},
        {shape: 'cylinder', top: 70, bottom: 70, height: 200, color: 0x00ff00, ops: [{rotate: [90, 90, 0]}]}
    ],
    color: 0x00ff00
};
colorExample.finalStandard = {
    subtract: [
        colorExample.sphereWithBox,
        colorExample.cylindersPart
    ]
};
