var BLOX = new function() {

    var DEGRESS_TO_RADIANS = Math.PI / 180;

    // Internal helper for tiny errors.
    var reportError = function(info) {
        console.error('BLOX: ' + info);
    };

    // Convert a BLOX CSG definition into a THREE Geometry.
    this.toGeometry = function(csg) {
        var geometry;
        if (csg.shape) {
            geometry = ({
                sphere: function() { return new THREE.SphereGeometry( csg.radius, 28, 20 ); },
                box: function() { return new THREE.BoxGeometry( csg.x, csg.y, csg.z ); },
                cylinder: function() { return new THREE.CylinderGeometry( csg.top, csg.bottom, csg.height, 28 ); }
            }[csg.shape]||(function(){
                reportError('Shape "' + csg.shape + '" not supported, use sphere, box or cylinder.');
            }))();
        }
        if (csg.subtract) {
            var bsps = [];
            csg.subtract.forEach(function(csg) {
                var geometry = BLOX.toGeometry(csg);
                if (geometry) {
                    bsps.push(new CSG(geometry));
                }
            });
            var firstBsp = geometry ? new CSG(geometry) : null,
                unionBsp;
            if (!firstBsp) {
                firstBsp = bsps.shift();
            }
            if (bsps.length) {
                bsps.forEach(function (bsp, index) {
                    if (!unionBsp) {
                        unionBsp = bsp;
                    } else {
                        unionBsp = unionBsp.union(bsp);
                    }
                });
                var subtractBsp = firstBsp.subtract(unionBsp);
                geometry = subtractBsp.toGeometry();
            } else {
                geometry = firstBsp ? firstBsp.toGeometry() : geometry;
            }
        } else if (csg.union) {
            var bsps = [];
            csg.union.forEach(function(csg) {
                var geometry = BLOX.toGeometry(csg);
                if (geometry) {
                    bsps.push(new CSG(geometry));
                }
            });
            var firstBsp = geometry ? new CSG(geometry) : null,
                unionBsp = firstBsp;
            bsps.forEach(function (bsp, index) {
                if (!unionBsp) {
                    unionBsp = bsp;
                } else {
                    unionBsp = unionBsp.union(bsp);
                }
            });
            geometry = unionBsp.toGeometry();
        } else if (csg.intersect) {
            var bsps = [];
            csg.intersect.forEach(function(csg) {
                var geometry = BLOX.toGeometry(csg);
                if (geometry) {
                    bsps.push(new CSG(geometry));
                }
            });
            var firstBsp = geometry ? new CSG(geometry) : null,
                intersectBsp = firstBsp;
            bsps.forEach(function (bsp) {
                if (!intersectBsp) {
                    intersectBsp = bsp;
                } else {
                    intersectBsp = intersectBsp.intersect(bsp);
                }
            });
            geometry = intersectBsp.toGeometry();
        }
        if (geometry && csg.ops) {
            csg.ops.forEach(function(op) {
                if (op.scale) {
                    geometry.scale.apply(geometry, op.scale);
                }
                if (op.rotate) {
                    var r = op.rotate;
                    r[0] && geometry.rotateX(r[0] * DEGRESS_TO_RADIANS);
                    r[1] && geometry.rotateY(r[1] * DEGRESS_TO_RADIANS);
                    r[2] && geometry.rotateZ(r[2] * DEGRESS_TO_RADIANS);
                }
                if (op.translate) {
                    geometry.translate.apply(geometry, op.translate);
                }
            });
        }
        return geometry;
    }
}
