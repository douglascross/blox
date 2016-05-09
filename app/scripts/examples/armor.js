var armor = {};
armor.main = {
    subtract: [
        {shape: 'sphere', radius: 120, ops: [{scale: [1.1, 1, 0.8]}]},
        {shape: 'sphere', radius: 120, ops: [{scale: [1.05, 0.95, 0.75]}]},
        {shape: 'box', x: 300, y: 300, z: 300, ops: [{translate: [0, 0, 150]}]},
        {shape: 'cylinder', top: 60, bottom: 60, height: 300, ops: [{translate: [0, 150, 0]}]},
        {shape: 'cylinder', top: 50, bottom: 50, height: 300, ops: [{translate: [0, 150, 0]}, {rotate: [0, 0, 70]}]},
        {shape: 'cylinder', top: 50, bottom: 50, height: 300, ops: [{translate: [0, 150, 0]}, {rotate: [0, 0, -70]}]},
        {shape: 'sphere', radius: 120, ops: [{scale: [1, 1, 0.8]}, {translate: [0, -70, 0]}]}
    ]
};
armor.complete = {
    union: [
        armor.main
    ],
    ops:[{scale: [1.3, 1.3, 1.3]}],
    color: 0x777777,
    shininess: 70
};
armor.dragon = {
    object: {shape: 'sphere', radius: 120, ops: [{rotate: [0, 90, 0]}, {rotate: [15, 0, 0]}, {scale: [1.1, 1, 0.8]}]},
    color: 0xff0000,
    texture: 'images/dragon-texture.png',
    roughness: 5,
    shininess: 70
};
armor.completeDragon = {
    subtract: [
        {
            shape: 'sphere', radius: 120, ops: [{rotate: [0, 90, 0]}, {rotate: [15, 0, 0]}, {scale: [1.1, 1, 0.8]}],
            color: 0x990000,
            texture: 'images/dragon-texture.png',
            image: 'images/dragon-image.png',
            roughness: 3,
            shininess: 10
        },
        {
            union: [
                {shape: 'sphere', radius: 120, ops: [{scale: [1.05, 0.95, 0.75]}]},
                {shape: 'box', x: 300, y: 300, z: 300, ops: [{translate: [0, 0, 150]}]},
                {shape: 'cylinder', top: 60, bottom: 60, height: 300, ops: [{translate: [0, 150, 0]}]},
                {shape: 'cylinder', top: 50, bottom: 50, height: 300, ops: [{translate: [0, 150, 0]}, {rotate: [0, 0, 70]}]},
                {shape: 'cylinder', top: 50, bottom: 50, height: 300, ops: [{translate: [0, 150, 0]}, {rotate: [0, 0, -70]}]},
                {shape: 'sphere', radius: 120, ops: [{scale: [1, 1, 0.8]}, {translate: [0, -70, 0]}]}
            ],
            color: 0x777777
        }
    ],
    ops:[{scale: [1.3, 1.3, 1.3]}]
};
