var classicExample = {
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
