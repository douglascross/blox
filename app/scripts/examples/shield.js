var shield = {};
shield.rim = {
    subtract: [
        {shape: 'cylinder', top: 140, bottom: 140, height: 20},
        {shape: 'cylinder', top: 130, bottom: 130, height: 20}
    ],
    color: 0x777777,
    shininess: 70,
    ops: [{rotate: [90]}]
};
shield.surface = {
    shape: 'cylinder', top: 130, bottom: 130, height: 16,
    color: 0x664411,
    texture: 'images/Cliffs0193_2_S.jpg',
    roughness: 5,
    shininess: 0,
    ops: [{rotate: [90]}]
};
shield.handle = {
    subtract: [
        {shape: 'cylinder', top: 50, bottom: 50, height: 20},
        {shape: 'cylinder', top: 45, bottom: 45, height: 20},
        {shape: 'box', x: 100, y: 100, z: 100, ops: [{translate: [50,0,0]}]}
    ],
    color: 0x999977,
    shininess: 70,
    ops: [{rotate: [0, 90, 90]}]
};
shield.dragon = {
    object: {shape: 'box', x: 1000, y: 500, z: 500},
    color: 0x990000,
    texture: 'images/dragon-texture.png',
    image: 'images/dragon-image.png',
    roughness: 3,
    shininess: 10
};
shield.complete = {
    union: [
        shield.rim,
        shield.surface,
        {object: shield.handle, ops:[{translate:[-40]}]},
        {object: shield.handle, ops:[{translate:[40]}]}
    ]
};
shield.completeDragon = {
    union: [
        shield.rim,
        {
            intersect: [
                shield.surface,
                {object: shield.dragon, ops: [{translate: [0, 0, 245]}]}
            ]
        },
        {object: shield.handle, ops:[{translate:[-40]}]},
        {object: shield.handle, ops:[{translate:[40]}]}
    ]
};
