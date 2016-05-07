var axe = {
    edgeSide: {
        subtract: [
            {
                shape: 'cylinder',
                top: 80, bottom: 120, height: 20,
                color: 0x777777,
                ops: [{rotate: [90]}, {scale: [1, 1.2, 1]}, {translate: [0, 0, 10]}]
            },
            {
                shape: 'cylinder',
                top: 100, bottom: 100, height: 40,
                color: 0x222222,
                ops: [{rotate: [90]}, {scale: [1, 0.8, 1]}, {translate: [40, 100, 0]}]
            },
            {
                shape: 'cylinder',
                top: 100, bottom: 100, height: 40,
                color: 0x222222,
                ops: [{rotate: [90]}, {scale: [1, 0.8, 1]}, {translate: [40, -100, 0]}]
            }
        ]
    }
};
axe.edge = {
    union: [
        axe.edgeSide,
        {
            object: axe.edgeSide,
            ops: [{rotate: [180]}]
        }
    ]
};
axe.handle = {
    shape: 'cylinder',
    top: 20, bottom: 20, height: 300,
    color: 0x664411,
    ops: [{scale: [1.3, 1, 0.9]}, {translate: [30, -100, 0]}]
};
axe.complete = {
    union: [
        axe.edge,
        axe.handle
    ]
};
axe.stone = {
    union: [
        {
            object: axe.edge,
            color: 0x777777,
            texture: 'images/Cliffs0193_2_S.jpg',
            roughness: 2,
            shininess: 50
        },
        {
            object: axe.handle,
            color: 0x664411,
            texture: 'images/Cliffs0193_2_S.jpg',
            roughness: 5,
            shininess: 0
        }
    ]
};
