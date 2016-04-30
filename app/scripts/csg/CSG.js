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

            a.invert();
            a.clipTo( b );
            b.clipTo( a );
            b.invert();
            b.clipTo( a );
            b.invert();
            a.build( b.allPolygons() );
            a.invert();
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
