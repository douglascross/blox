var BLOX = new function() {

    // Internal helper for tiny errors.
    var reportError = function(info) {
        console.error('BLOX: ' + info);
    };

    // Convert a BLOX CSG definition into a THREE Geometry.
    this.toGeometry = function(csg) {
        var geometry;
        if (csg.shape) {
            geometry = ({
                sphere: function() { return new THREE.SphereGeometry( csg.radius, 32, 32 ); },
                box: function() { return new THREE.BoxGeometry( csg.x, csg.y, csg.z ); }
            }[csg.shape]||(function(){
                reportError('Shape "' + csg.shape + '" not supported, use sphere or box.');
            }))();
        }
        if (csg.subtract) {
            var bsps = [];
            csg.subtract.forEach(function(csg) {
                var geometry = BLOX.toGeometry(csg);
                if (geometry) {
                    bsps.push(new ThreeBSP(geometry));
                }
            });
            var firstBsp = geometry ? new ThreeBSP(geometry) : null,
                unionBsp;
            if (!firstBsp) {
                firstBsp = bsps.shift();
            }
            if (bsps.length) {
                bsps.forEach(function (bsp, index) {
                    if (index || geometry) {
                        if (!unionBsp) {
                            unionBsp = bsp;
                        } else {
                            unionBsp.union(bsp);
                        }
                    }
                });
                var subtractBsp = firstBsp.subtract(unionBsp);
                geometry = subtractBsp.toGeometry();
            } else {
                geometry = firstBsp ? firstBsp.toGeometry() : geometry;
            }
        } else if (csg.union) {

        }
        if (geometry && csg.ops) {
            csg.ops.forEach(function(op) {
                if (op.scale) {
                    geometry.scale.apply(geometry, op.scale);
                }
                if (op.rotate) {
                    var r = op.rotate;
                    r[0] && geometry.rotateX(r[0]);
                    r[1] && geometry.rotateY(r[1]);
                    r[2] && geometry.rotateZ(r[2]);
                }
                if (op.translate) {
                    geometry.translate.apply(geometry, op.translate);
                }
            });
        }
        return geometry;
    }
}
