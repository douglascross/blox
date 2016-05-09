var helmet = {};
helmet.bowl = {
    subtract: [
        {shape: 'sphere', radius: 80, color: 0x777777, shininess: 60},
        {shape: 'sphere', radius: 75, color: 0x444444, shininess: 30},
        {shape: 'box', x: 400, y: 400, z: 400, color: 0x444444, ops: [{translate: [0, -200, 0]}]}
    ]
};
helmet.rim = {
    subtract: [
        {shape: 'cylinder', top:84, bottom: 84, height: 30, color: 0x777777, shininess: 60},
        {shape: 'cylinder', top:79, bottom: 79, height: 30, color: 0x444444, shininess: 30}
    ]
};
helmet.crest = {
    subtract: [
        {shape: 'cylinder', top:82, bottom: 82, height: 30, color: 0x777777, shininess: 60, ops: [{rotate: [0, 0, 90]}]},
        {shape: 'cylinder', top:77, bottom: 77, height: 30, color: 0x444444, shininess: 30, ops: [{rotate: [0, 0, 90]}]},
        {shape: 'box', x: 400, y: 400, z: 400, color: 0x444444, ops: [{translate: [0, -200, 0]}]}
    ]
};
helmet.complete = {
    union: [
        {
            object: helmet.bowl,
            color: 0x664411,
            texture: 'images/Cliffs0193_2_S.jpg',
            roughness: 5,
            shininess: 0
        },
        helmet.rim,
        helmet.crest
    ],
    ops: [{scale: [1, 1, 1.1 ]}]
};
