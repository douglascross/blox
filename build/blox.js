(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define('BLOX', [], function () {
      return (root['BLOX'] = factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    root['BLOX'] = factory();
  }
}(this, function () {

var Vertex = augment(Object, function(uber) {
    return {
        constructor: function (x, y, z, normal, uv, negative) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.normal = normal || new THREE.Vector3;
            this.uv = uv || new THREE.Vector2;
            this.negative = negative || 0;
        },

        clone: function () {
            return new Vertex(this.x, this.y, this.z, this.normal.clone(), this.uv.clone(), this.negative);
        },

        add: function (vertex) {
            this.x += vertex.x;
            this.y += vertex.y;
            this.z += vertex.z;
            return this;
        },

        subtract: function (vertex) {
            this.x -= vertex.x;
            this.y -= vertex.y;
            this.z -= vertex.z;
            return this;
        },

        multiplyScalar: function (scalar) {
            this.x *= scalar;
            this.y *= scalar;
            this.z *= scalar;
            return this;
        },

        cross: function (vertex) {
            var x = this.x,
                y = this.y,
                z = this.z;
            this.x = y * vertex.z - z * vertex.y;
            this.y = z * vertex.x - x * vertex.z;
            this.z = x * vertex.y - y * vertex.x;
            return this;
        },

        normalize: function () {
            var length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);

            this.x /= length;
            this.y /= length;
            this.z /= length;

            return this;
        },

        dot: function (vertex) {
            return this.x * vertex.x + this.y * vertex.y + this.z * vertex.z;
        },

        lerp: function (a, t) {
            this.add(a.clone().subtract(this).multiplyScalar(t));
            this.normal.add(a.normal.clone().sub(this.normal).multiplyScalar(t));
            this.uv.add(a.uv.clone().sub(this.uv).multiplyScalar(t));
            return this;
        },

        interpolate: function (other, t) {
            return this.clone().lerp(other, t);
        },

        applyMatrix4: function (m) {

            // input: THREE.Matrix4 affine matrix

            var x = this.x, y = this.y, z = this.z;

            var e = m.elements;

            this.x = e[0] * x + e[4] * y + e[8] * z + e[12];
            this.y = e[1] * x + e[5] * y + e[9] * z + e[13];
            this.z = e[2] * x + e[6] * y + e[10] * z + e[14];

            return this;
        },

        flagPositive: function() {
            this.negative = 1;
        },

        flagNegative: function() {
            this.negative = -1;
        },

        reportNegative: function() {
            return this.negative;
        }
    };
});

var Polygon = augment(Object, function(uber) {

    var EPSILON = 1e-5,
        COPLANAR = 0,
        FRONT = 1,
        BACK = 2,
        SPANNING = 3;

    return {
        constructor: function(vertices) {
            if ( !( vertices instanceof Array ) ) {
                vertices = [];
            }

            this.vertices = vertices;
            if ( vertices.length > 0 ) {
                this.calculateProperties();
            } else {
                this.normal = this.w = undefined;
            }

            this.negative = 0;
        },

        calculateProperties: function() {
            var a = this.vertices[0],
                b = this.vertices[1],
                c = this.vertices[2];

            this.normal = b.clone().subtract( a ).cross(
                c.clone().subtract( a )
            ).normalize();

            this.w = this.normal.clone().dot( a );

            return this;
        },

        clone: function() {
            var i, vertice_count,
                polygon = new Polygon;

            for ( i = 0, vertice_count = this.vertices.length; i < vertice_count; i++ ) {
                polygon.vertices.push( this.vertices[i].clone() );
            };
            polygon.calculateProperties();

            polygon.negative = this.negative;

            return polygon;
        },

        flip: function() {
            var i, vertices = [];

            this.normal.multiplyScalar( -1 );
            this.w *= -1;

            for ( i = this.vertices.length - 1; i >= 0; i-- ) {
                vertices.push( this.vertices[i] );
            };
            this.vertices = vertices;

            return this;
        },

        classifyVertex: function( vertex ) {
            var side_value = this.normal.dot( vertex ) - this.w;

            if ( side_value < -EPSILON ) {
                return BACK;
            } else if ( side_value > EPSILON ) {
                return FRONT;
            } else {
                return COPLANAR;
            }
        },

        classifySide: function(polygon) {
            var i, vertex, classification,
                num_positive = 0,
                num_negative = 0,
                vertice_count = polygon.vertices.length;

            for ( i = 0; i < vertice_count; i++ ) {
                vertex = polygon.vertices[i];
                classification = this.classifyVertex( vertex );
                if ( classification === FRONT ) {
                    num_positive++;
                } else if ( classification === BACK ) {
                    num_negative++;
                }
            }

            if ( num_positive > 0 && num_negative === 0 ) {
                return FRONT;
            } else if ( num_positive === 0 && num_negative > 0 ) {
                return BACK;
            } else if ( num_positive === 0 && num_negative === 0 ) {
                return COPLANAR;
            } else {
                return SPANNING;
            }
        },

        splitPolygon: function(polygon, coplanar_front, coplanar_back, front, back) {
            var classification = this.classifySide( polygon );

            if ( classification === COPLANAR ) {

                ( this.normal.dot( polygon.normal ) > 0 ? coplanar_front : coplanar_back ).push( polygon );

            } else if ( classification === FRONT ) {

                front.push( polygon );

            } else if ( classification === BACK ) {

                back.push( polygon );

            } else {

                var vertice_count,
                    i, j, ti, tj, vi, vj,
                    t, v,
                    f = [],
                    b = [];

                for ( i = 0, vertice_count = polygon.vertices.length; i < vertice_count; i++ ) {

                    j = (i + 1) % vertice_count;
                    vi = polygon.vertices[i];
                    vj = polygon.vertices[j];
                    ti = this.classifyVertex( vi );
                    tj = this.classifyVertex( vj );

                    if ( ti != BACK ) f.push( vi );
                    if ( ti != FRONT ) b.push( vi );
                    if ( (ti | tj) === SPANNING ) {
                        t = ( this.w - this.normal.dot( vi ) ) / this.normal.dot( vj.clone().subtract( vi ) );
                        v = vi.interpolate( vj, t );
                        f.push( v );
                        b.push( v );
                    }
                }


                if ( f.length >= 3 ) front.push( new Polygon( f ).calculateProperties() );
                if ( b.length >= 3 ) back.push( new Polygon( b ).calculateProperties() );
            }
        },

        flagPositive: function() {
            this.negative = 1;
            this.vertices.forEach(function(vertex) {
                vertex.flagPositive();
            });
        },

        flagNegative: function() {
            this.negative = -1;
            this.vertices.forEach(function(vertex) {
                vertex.flagNegative();
            });
        },

        reportNegative: function() {
            var report = [
                this.negative,
                0
            ];
            this.vertices.forEach(function(vertex) {
                report[1] += vertex.reportNegative();
            });
            return report[0] + report[1];
        }
    };
});

var Node = augment(Object, function(uber) {

    var BACK = 2;

    return {
        constructor: function( polygons ) {
            var i, polygon_count,
                front = [],
                back = [];

            this.polygons = [];
            this.front = this.back = undefined;

            if ( !(polygons instanceof Array) || polygons.length === 0 ) return;

            this.divider = polygons[0].clone();

            for ( i = 0, polygon_count = polygons.length; i < polygon_count; i++ ) {
                this.divider.splitPolygon( polygons[i], this.polygons, this.polygons, front, back );
            }

            if ( front.length > 0 ) {
                this.front = new Node( front );
            }

            if ( back.length > 0 ) {
                this.back = new Node( back );
            }
        },

        isConvex: function(polygons) {
            var i, j;
            for ( i = 0; i < polygons.length; i++ ) {
                for ( j = 0; j < polygons.length; j++ ) {
                    if ( i !== j && polygons[i].classifySide( polygons[j] ) !== BACK ) {
                        return false;
                    }
                }
            }
            return true;
        },

        build: function(polygons) {
            var i, polygon_count,
                front = [],
                back = [];

            if ( !this.divider ) {
                this.divider = polygons[0].clone();
            }

            for ( i = 0, polygon_count = polygons.length; i < polygon_count; i++ ) {
                this.divider.splitPolygon( polygons[i], this.polygons, this.polygons, front, back );
            }

            if ( front.length > 0 ) {
                if ( !this.front ) this.front = new Node();
                this.front.build( front );
            }

            if ( back.length > 0 ) {
                if ( !this.back ) this.back = new Node();
                this.back.build( back );
            }
        },

        allPolygons: function() {
            var polygons = this.polygons.slice();
            if ( this.front ) polygons = polygons.concat( this.front.allPolygons() );
            if ( this.back ) polygons = polygons.concat( this.back.allPolygons() );
            return polygons;
        },

        clone: function() {
            var node = new Node();

            node.divider = this.divider.clone();
            node.polygons = this.polygons.map( function( polygon ) { return polygon.clone(); } );
            node.front = this.front && this.front.clone();
            node.back = this.back && this.back.clone();
            node.negative = this.negative;

            return node;
        },

        invert: function() {
            var i, polygon_count, temp;

            for ( i = 0, polygon_count = this.polygons.length; i < polygon_count; i++ ) {
                this.polygons[i].flip();
            }

            this.divider.flip();
            if ( this.front ) this.front.invert();
            if ( this.back ) this.back.invert();

            temp = this.front;
            this.front = this.back;
            this.back = temp;

            return this;
        },

        clipPolygons: function(polygons) {
            var i, polygon_count,
                front, back;

            if ( !this.divider ) return polygons.slice();

            front = [], back = [];

            for ( i = 0, polygon_count = polygons.length; i < polygon_count; i++ ) {
                this.divider.splitPolygon( polygons[i], front, back, front, back );
            }

            if ( this.front ) front = this.front.clipPolygons( front );
            if ( this.back ) back = this.back.clipPolygons( back );
            else back = [];

            return front.concat( back );
        },

        clipTo: function( node ) {
            this.polygons = node.clipPolygons( this.polygons );
            if ( this.front ) this.front.clipTo( node );
            if ( this.back ) this.back.clipTo( node );
        },

        flagPositive: function() {
            this.allPolygons().forEach(function(polygon) {
                polygon.flagPositive();
            });
        },

        flagNegative: function() {
            this.allPolygons().forEach(function(polygon) {
                polygon.flagNegative();
            });
        },

        reportNegative: function() {
            var report = '';
            this.allPolygons().forEach(function(polygon) {
                report += (report ? '.' : '') + polygon.reportNegative();
            });
            return report;
        }
    };
});

var CSG = augment(Object, function(uber) {
    return {
        constructor: function( geometry ) {
            // Convert THREE.Geometry to CSG
            var i, _length_i,
                face, vertex, faceVertexUvs, uvs,
                polygon,
                polygons = [],
                tree;

            if ( geometry instanceof THREE.Geometry ) {
                this.matrix = new THREE.Matrix4;
            } else if ( geometry instanceof THREE.Mesh ) {
                // #todo: add hierarchy support
                geometry.updateMatrix();
                this.matrix = geometry.matrix.clone();
                geometry = geometry.geometry;
            } else if ( geometry instanceof Node ) {
                this.tree = geometry;
                this.matrix = new THREE.Matrix4;
                return this;
            } else {
                throw 'CSG: Given geometry is unsupported';
            }

            console.log(geometry);

            for ( i = 0, _length_i = geometry.faces.length; i < _length_i; i++ ) {
                face = geometry.faces[i];
                faceVertexUvs = geometry.faceVertexUvs[0][i];
                polygon = new Polygon;
                polygon.originalFace = face;

                if ( face instanceof THREE.Face3 ) {
                    vertex = geometry.vertices[ face.a ];
                    uvs = faceVertexUvs ? new THREE.Vector2( faceVertexUvs[0].x, faceVertexUvs[0].y ) : null;
                    vertex = new Vertex( vertex.x, vertex.y, vertex.z, face.vertexNormals[0], uvs );
                    vertex.applyMatrix4(this.matrix);
                    polygon.vertices.push( vertex );

                    vertex = geometry.vertices[ face.b ];
                    uvs = faceVertexUvs ? new THREE.Vector2( faceVertexUvs[1].x, faceVertexUvs[1].y ) : null;
                    vertex = new Vertex( vertex.x, vertex.y, vertex.z, face.vertexNormals[1], uvs );
                    vertex.applyMatrix4(this.matrix);
                    polygon.vertices.push( vertex );

                    vertex = geometry.vertices[ face.c ];
                    uvs = faceVertexUvs ? new THREE.Vector2( faceVertexUvs[2].x, faceVertexUvs[2].y ) : null;
                    vertex = new Vertex( vertex.x, vertex.y, vertex.z, face.vertexNormals[2], uvs );
                    vertex.applyMatrix4(this.matrix);
                    polygon.vertices.push( vertex );
                } else if ( typeof THREE.Face4 ) {
                    vertex = geometry.vertices[ face.a ];
                    uvs = faceVertexUvs ? new THREE.Vector2( faceVertexUvs[0].x, faceVertexUvs[0].y ) : null;
                    vertex = new Vertex( vertex.x, vertex.y, vertex.z, face.vertexNormals[0], uvs );
                    vertex.applyMatrix4(this.matrix);
                    polygon.vertices.push( vertex );

                    vertex = geometry.vertices[ face.b ];
                    uvs = faceVertexUvs ? new THREE.Vector2( faceVertexUvs[1].x, faceVertexUvs[1].y ) : null;
                    vertex = new Vertex( vertex.x, vertex.y, vertex.z, face.vertexNormals[1], uvs );
                    vertex.applyMatrix4(this.matrix);
                    polygon.vertices.push( vertex );

                    vertex = geometry.vertices[ face.c ];
                    uvs = faceVertexUvs ? new THREE.Vector2( faceVertexUvs[2].x, faceVertexUvs[2].y ) : null;
                    vertex = new Vertex( vertex.x, vertex.y, vertex.z, face.vertexNormals[2], uvs );
                    vertex.applyMatrix4(this.matrix);
                    polygon.vertices.push( vertex );

                    vertex = geometry.vertices[ face.d ];
                    uvs = faceVertexUvs ? new THREE.Vector2( faceVertexUvs[3].x, faceVertexUvs[3].y ) : null;
                    vertex = new Vertex( vertex.x, vertex.y, vertex.z, face.vertexNormals[3], uvs );
                    vertex.applyMatrix4(this.matrix);
                    polygon.vertices.push( vertex );
                } else {
                    throw 'Invalid face type at index ' + i;
                }

                polygon.calculateProperties();
                polygons.push( polygon );
            };

            this.tree = new Node( polygons );
        },

        subtract: function( other_tree ) {
            var a = this.tree.clone(),
                b = other_tree.tree.clone();

            a.flagPositive();
            b.flagNegative();
            console.log(a.reportNegative(), b.reportNegative());

            a.invert();
            a.clipTo( b );

            console.log(a.reportNegative(), b.reportNegative());

            b.clipTo( a );

            console.log(a.reportNegative(), b.reportNegative());

            b.invert();

            console.log(a.reportNegative(), b.reportNegative());

            b.clipTo( a );

            console.log(a.reportNegative(), b.reportNegative());
            b.invert();

            console.log(a.reportNegative(), b.reportNegative());
            a.build( b.allPolygons() );

            console.log(a.reportNegative(), b.reportNegative());
            a.invert();
            console.log(a.reportNegative());
            a = new CSG( a );
            a.matrix = this.matrix;
            return a;
        },

        union: function( other_tree ) {
            var a = this.tree.clone(),
                b = other_tree.tree.clone();

            a.clipTo( b );
            b.clipTo( a );
            b.invert();
            b.clipTo( a );
            b.invert();
            a.build( b.allPolygons() );
            a = new CSG( a );
            a.matrix = this.matrix;
            return a;
        },

        intersect: function( other_tree ) {
            var a = this.tree.clone(),
                b = other_tree.tree.clone();

            a.invert();
            b.clipTo( a );
            b.invert();
            a.clipTo( b );
            b.clipTo( a );
            a.build( b.allPolygons() );
            a.invert();
            a = new CSG( a );
            a.matrix = this.matrix;
            return a;
        },

        toGeometry: function() {
            var i, j, k,
                matrix = new THREE.Matrix4().getInverse( this.matrix ),
                geometry = new THREE.Geometry(),
                polygons = this.tree.allPolygons(),
                polygon_count = polygons.length,
                polygon, polygon_vertice_count,
                vertice_dict = {},
                vertexIdx,
                vertex, face,
                verticeUvs,
                vertexNormals;

            for ( i = 0; i < polygon_count; i++ ) {
                polygon = polygons[i];
                polygon_vertice_count = polygon.vertices.length;

                var neg = polygon.reportNegative() < 0 ? -1 : 1;

                for ( j = 2; j < polygon_vertice_count; j++ ) {
                    verticeUvs = [];
                    vertexNormals = [];
                    vertexIdx = [];

                    for ( k = 0; k < 3; k++ ) {
                        var index = [0, j-1, j][k];
                        vertex = polygon.vertices[index];
                        verticeUvs.push( new THREE.Vector2( vertex.uv.x, vertex.uv.y ) );
                        vertexNormals.push( new THREE.Vector3( vertex.normal.x * neg, vertex.normal.y * neg, vertex.normal.z * neg ) );
                        vertex = new THREE.Vector3( vertex.x, vertex.y, vertex.z );
                        vertex.applyMatrix4(matrix);
                        if ( typeof vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] !== 'undefined' ) {
                            vertexIdx[k] = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ];
                        } else {
                            geometry.vertices.push( vertex );
                            vertexIdx[k] = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] = geometry.vertices.length - 1;
                        }
                    }

                    face = new THREE.Face3(
                        vertexIdx[0],
                        vertexIdx[1],
                        vertexIdx[2],
                        new THREE.Vector3( polygon.normal.x, polygon.normal.y, polygon.normal.z )
                    );
                    face.vertexNormals = vertexNormals;

                    geometry.faces.push( face );
                    geometry.faceVertexUvs[0].push( verticeUvs );
                }

            }
            console.log(geometry);
            return geometry;
        },

        toMesh: function( material ) {
            var geometry = this.toGeometry(),
                mesh = new THREE.Mesh( geometry, material );

            mesh.position.setFromMatrixPosition( this.matrix );
            mesh.rotation.setFromRotationMatrix( this.matrix );

            return mesh;
        }
    };
});

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
                sphere: function() { return new THREE.SphereGeometry( csg.radius, 16, 12 ); },
                box: function() { return new THREE.BoxGeometry( csg.x, csg.y, csg.z ); },
                cylinder: function() { return new THREE.CylinderGeometry( csg.top, csg.bottom, csg.height, 16 ); }
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

return BLOX;

}));
