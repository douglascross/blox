var BLOX = new function() {

    var DEGRESS_TO_RADIANS = Math.PI / 180;
    var DEFAULT_COLOR = 0xff8800;

    // Internal helper for tiny errors.
    var reportError = function(info) {
        console.error('BLOX: ' + info);
    };

    // Convert a BLOX CSG definition into a THREE Geometry.
    this.toMesh = function(csg) {
        var mesh;
        if (csg.shape) {
            var geometry = ({
                sphere: function() { return new THREE.SphereGeometry( csg.radius, 16, 12 ); },
                box: function() { return new THREE.BoxGeometry( csg.x, csg.y, csg.z ); },
                cylinder: function() { return new THREE.CylinderGeometry( csg.top, csg.bottom, csg.height, 16 ); }
            }[csg.shape]||(function(){
                reportError('Shape "' + csg.shape + '" not supported, use sphere, box or cylinder.');
            }))();
        }
        if (geometry) {
            var material = new THREE.MeshPhongMaterial({
                color: csg.color || DEFAULT_COLOR,
                vertexColors: THREE.VertexColors
            });
            mesh = new THREE.Mesh(geometry, material);
        }
        if (csg.subtract) {
            var csgs = [];
            csg.subtract.forEach(function(csg) {
                var mesh = BLOX.toMesh(csg);
                if (mesh) {
                    csgs.push(new CSG(mesh));
                }
            });
            var firstCsg = mesh ? new CSG(mesh) : null,
                unionCsg;
            if (!firstCsg) {
                firstCsg = csgs.shift();
            }
            if (csgs.length) {
                csgs.forEach(function (csg, index) {
                    if (!unionCsg) {
                        unionCsg = csg;
                    } else {
                        unionCsg = unionCsg.union(csg);
                    }
                });
                var subtractCsg = firstCsg.subtract(unionCsg);
                mesh = subtractCsg.toMesh();
            } else {
                mesh = firstCsg ? firstCsg.toMesh() : mesh;
            }
        } else if (csg.union) {
            var csgs = [];
            csg.union.forEach(function(csg) {
                var mesh = BLOX.toMesh(csg);
                if (mesh) {
                    csgs.push(new CSG(mesh));
                }
            });
            var firstCsg = mesh ? new CSG(mesh) : null,
                unionCsg = firstCsg;
            csgs.forEach(function (csg, index) {
                if (!unionCsg) {
                    unionCsg = csg;
                } else {
                    unionCsg = unionCsg.union(csg);
                }
            });
            mesh = unionCsg.toMesh();
        } else if (csg.intersect) {
            var csgs = [];
            csg.intersect.forEach(function(csg) {
                var mesh = BLOX.toMesh(csg);
                if (mesh) {
                    csgs.push(new CSG(mesh));
                }
            });
            var firstCsg = mesh ? new CSG(mesh) : null,
                intersectCsg = firstCsg;
            csgs.forEach(function (csg) {
                if (!intersectCsg) {
                    intersectCsg = csg;
                } else {
                    intersectCsg = intersectCsg.intersect(csg);
                }
            });
            mesh = intersectCsg.toMesh();
        }
        if (mesh && csg.ops) {
            csg.ops.forEach(function(op) {
                if (op.scale) {
                    mesh.geometry.scale.apply(mesh.geometry, op.scale);
                }
                if (op.rotate) {
                    var r = op.rotate;
                    r[0] && mesh.geometry.rotateX(r[0] * DEGRESS_TO_RADIANS);
                    r[1] && mesh.geometry.rotateY(r[1] * DEGRESS_TO_RADIANS);
                    r[2] && mesh.geometry.rotateZ(r[2] * DEGRESS_TO_RADIANS);
                }
                if (op.translate) {
                    mesh.geometry.translate.apply(mesh.geometry, op.translate);
                }
            });
        }
        return mesh;
    };

    this.toGeometry = function(csg) {
        return this.toMesh(csg).geometry;
    }
}
