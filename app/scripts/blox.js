var BLOX = new function() {

    var DEGRESS_TO_RADIANS = Math.PI / 180;
    var DEFAULT_COLOR = 0xff8800;
    var DEFAULT_DETAIL = 3;

    var textureCache = {};

    // Internal helper for tiny errors.
    var reportError = function(info) {
        console.error('BLOX: ' + info);
    };

    // Convert a BLOX CSG definition into a THREE Geometry.
    this.toMesh = function(csg) {
        csg = JSON.parse(JSON.stringify(csg));
        var mesh, geometry, material;
        csg = BLOX.correctForNegativeScale(csg);
        if (csg.shape) {
            geometry = ({
                sphere: function() { return new THREE.SphereGeometry( csg.radius || 50, 8 * DEFAULT_DETAIL, 6 * DEFAULT_DETAIL ); },
                box: function() { return new THREE.BoxGeometry( csg.x || 100, csg.y || 100, csg.z || 100 ); },
                cylinder: function() {
                    return new THREE.CylinderGeometry(
                        csg.top >= 0 ? csg.top : 100,
                        csg.bottom >= 0 ? csg.bottom : 100,
                        csg.height || 100,
                        8 * DEFAULT_DETAIL
                    );
                }
            }[csg.shape]||(function(){
                reportError('Shape "' + csg.shape + '" not supported, use sphere, box or cylinder.');
            }))();
            if (geometry) {
                material = new THREE.MeshPhongMaterial({color: DEFAULT_COLOR});
                mesh = new THREE.Mesh(geometry, material);
            }
        } else if (csg.object) {
            mesh = BLOX.toMesh(csg.object);
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
        if (!mesh) {
            mesh = BLOX.toMesh({shape: 'box'});
        }
        if (csg.ops) {
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
        if (csg.color || csg.texture || csg.mesh) {
            var materialCfg = {};
            materialCfg.color = csg.color || DEFAULT_COLOR;
            if (csg.texture) {
                var texture = textureCache[csg.texture] = textureCache[csg.texture] ||
                        new THREE.TextureLoader().load(csg.texture);
                materialCfg.bumpMap = texture;
                materialCfg.bumpScale = csg.roughness || 1;
            }
            materialCfg.shininess = csg.shininess >= 0 ? csg.shininess : 30;
            if (csg.mesh) {
                materialCfg.wireframe = csg.mesh;
            }
            material = new THREE.MeshPhongMaterial(materialCfg);
            mesh = new THREE.Mesh(mesh.geometry, material);
        }
        return mesh;
    };

    this.toGeometry = function(csg) {
        var mesh = this.toMesh(csg);
        return mesh ? mesh.geometry : null;
    }
}
