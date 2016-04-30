// square minus circle
var subtract1 = {
    shape: 'box', x: 200, y: 200, z: 200,
    subtract: [
        {
            shape: 'sphere', radius: 120,
            ops: [{scale: [2, 1, 1]}]
        }
    ],
    ops: [
        {scale: [0.5, 1, 1]}
    ]
};

// circle minus square
var subtract2 = {
    shape: 'sphere', radius: 120,
    subtract: [
        {
            shape: 'box', x: 200, y: 200, z: 200,
            ops: [{scale: [2, 1, 1]}]
        }
    ],
    ops: [
        {scale: [0.5, 1, 1]}
    ]
};

// square minus square
var subtract3 = {
    shape: 'box', x: 200, y: 200, z: 200,
    subtract: [
        {
            shape: 'box', x: 120, y: 120, z: 120,
            ops: [{scale: [2, 1, 1]}]
        }
    ],
    ops: [
        {scale: [0.5, 1, 1]}
    ]
};

// bowl: circle minus circle
var subtract4 = {
    shape: 'sphere', radius: 120,
    subtract: [
        {
            shape: 'sphere', radius: 110,
            ops: [{translate: [50, 0, 0]}]
        }
    ],
    ops: [
        {scale: [0.5, 1, 1]}
    ]
};
