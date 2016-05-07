
BLOX.correctForNegativeScale = function(csg, inv) {
    inv = inv || [1, 1, 1];
    var isInv = inv[0] + inv[1] + inv[2] < 3;
    [].concat(csg.ops || []).reverse().forEach(function (op) {
        var scale = op.scale,
            translate = op.translate,
            rotate = op.rotate;
        if (scale) {
            scale[0] = scale[0] || 1;
            scale[1] = scale[1] || 1;
            scale[2] = scale[2] || 1;
            var scaleInv = [
                (scale[0] < 0 ? -1 : 1),
                (scale[1] < 0 ? -1 : 1),
                (scale[2] < 0 ? -1 : 1)
            ];
            inv[0] *= scaleInv[0];
            inv[1] *= scaleInv[1];
            inv[2] *= scaleInv[2];
            isInv = inv[0] + inv[1] + inv[2] < 3;
            scale[0] *= scaleInv[0];
            scale[1] *= scaleInv[1];
            scale[2] *= scaleInv[2];
        }
        if (translate) {
            translate[0] = translate[0] || 0;
            translate[1] = translate[1] || 0;
            translate[2] = translate[2] || 0;
            translate[0] *= inv[0];
            translate[1] *= inv[1];
            translate[2] *= inv[2];
        }
        if (isInv && rotate) {
            rotate[0] = rotate[0] || 0;
            rotate[1] = rotate[1] || 0;
            rotate[2] = rotate[2] || 0;
            rotate[0] *= inv[2] * inv[1];
            rotate[1] *= inv[0] * inv[2];
            rotate[2] *= inv[1] * inv[0];
        }
    });
    if (isInv) {
        (csg.object ? [csg.object] : []).concat(csg.subtract || csg.union || csg.intersect || []).forEach(function (item) {
            BLOX.correctForNegativeScale(item, inv);
        });
    }
    return csg;
};
