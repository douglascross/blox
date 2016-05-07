var sword = {};
sword.bladeBlock = {
    union: [
        {
            shape: 'cylinder',
            top: 0, bottom: 40, height: 10,
            color: 0x777777,
            ops: [{rotate: [90]}, {scale: [1, 2, 1]}, {translate: [-10, 50, 5]}]
        },
        {
            shape: 'box',
            x: 30, y: 100, z: 10,
            color: 0x777777,
            ops: [{translate:[15, 0, 5]}]
        }
    ]
};
sword.bladeQuarter = {
    subtract: [
        sword.bladeBlock,
        {
            shape: 'box',
            x: 100, y: 200, z: 100,
            color: 0x777777,
            ops: [{translate: [-50, 0, 50]}, {rotate: [0, 12]}, {translate: [30, 0, 0]}]
        },
        {
            shape: 'box',
            x: 100, y: 300, z: 100,
            color: 0x777777,
            ops: [{translate: [-50, 0, 0]}]
        }
    ],
    ops: [{scale: [1.5, 2, 3]}]
};
sword.bladeHalf = {
    union: [
        sword.bladeQuarter,
        {
            object: sword.bladeQuarter,
            ops: [{scale:[-1, 1, 1]}]
        }
    ]
};
sword.blade = {
    union: [
        sword.bladeHalf,
        {
            object: sword.bladeHalf,
            ops: [{scale:[1, 1, -1]}]
        }
    ]
};
sword.hilt = {
    union: [
        {
            shape: 'box',
            x: 150, y: 10, z: 60,
            color: 0x777777,
            ops: [{translate:[0, -100, 0]}]
        },
        {
            shape: 'cylinder',
            top: 30, bottom: 30, height: 140,
            color: 0x664411,
            ops: [{scale:[1, 1, 0.8]}, {translate:[0, -170, 0]}]
        },
        {
            shape: 'sphere',
            radius: 35,
            color: 0x777777,
            ops: [{scale:[1, 0.4, 0.8]}, {translate:[0, -240, 0]}]
        }
    ]
};
sword.complete = {
    union: [
        sword.blade,
        sword.hilt
    ]
};
sword.stone = {
    union: [
        {
            object: sword.blade,
            color: 0x99999f,
            texture: 'images/Cliffs0193_2_S.jpg',
            roughness: 0,
            shininess: 70
        },
        {
            object: sword.hilt.union[0],
            color: 0x88888d,
            texture: 'images/Cliffs0193_2_S.jpg',
            roughness: 1,
            shininess: 70
        },
        {
            object: sword.hilt.union[1],
            color: 0x886622,
            texture: 'images/Cliffs0193_2_S.jpg',
            roughness: 2,
            shininess: 0
        },
        {
            object: sword.hilt.union[2],
            color: 0x777777,
            texture: 'images/Cliffs0193_2_S.jpg',
            roughness: 1,
            shininess: 70
        }
    ],
    ops: [{scale:[0.7,0.8,0.7]}, {translate: [0, -50, 0]}]
};
