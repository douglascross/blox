var CSG = augment(Object, function(uber) {
    return {
        constructor: function( geometry ) {
            // Convert THREE.Geometry to CSG
            var i, _length_i,
                j, _length_j, vertexRef,
                face, vertex, faceVertexUvs, uvs,
                mesh, material,
                polygon,
                polygons = [];

            if ( geometry instanceof THREE.Geometry ) {
                this.matrix = new THREE.Matrix4;
            } else if ( geometry instanceof THREE.Mesh ) {
                mesh = geometry;
                mesh.updateMatrix();
                this.matrix = mesh.matrix.clone();
                material = mesh.material;
                geometry = mesh.geometry;
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

                if (material instanceof THREE.MultiMaterial) {
                    face._material = (material.materials || [])[face.materialIndex];
                } else {
                    face._material = material;
                }

                for ( j = 0, _length_j = faceVertexUvs.length; j < 3; j += 1 ) {
                    vertexRef = face[['a', 'b', 'c', 'd'][j]];
                    vertex = geometry.vertices[vertexRef];
                    uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[j].x, faceVertexUvs[j].y) : null;
                    vertex = new Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[j], uvs);
                    vertex.applyMatrix4(this.matrix);
                    polygon.vertices.push(vertex);
                }

                polygon.calculateProperties();
                polygons.push( polygon );
            }

            this.tree = new Node( polygons );
        },

        subtract: function( other ) {
            var a = this.tree.clone(),
                b = other.tree.clone();

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

        union: function( other ) {
            var a = this.tree.clone(),
                b = other.tree.clone();

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

        intersect: function( other ) {
            var a = this.tree.clone(),
                b = other.tree.clone();

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
                facing, normal, relVertIdx,
                vertice_dict = {},
                vertexIdx,
                vertex, face,
                verticeUvs,
                vertexNormals;

            for ( i = 0; i < polygon_count; i++ ) {
                polygon = polygons[i];
                polygon_vertice_count = polygon.vertices.length;

                facing = polygon.getFacing() < 0 ? -1 : 1;

                for ( j = 2; j < polygon_vertice_count; j++ ) {
                    verticeUvs = [];
                    vertexNormals = [];
                    vertexIdx = [];

                    for ( k = 0; k < 3; k++ ) {
                        relVertIdx = [0, j-1, j][k];
                        vertex = polygon.vertices[relVertIdx];
                        verticeUvs.push( new THREE.Vector2( vertex.uv.x, vertex.uv.y ) );
                        normal = vertex.normal;
                        vertexNormals.push( new THREE.Vector3( normal.x * facing, normal.y * facing, normal.z * facing ) );
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
                    face._material = polygon.originalFace ? polygon.originalFace._material : face._material;

                    geometry.faces.push( face );
                    geometry.faceVertexUvs[0].push( verticeUvs );
                }

            }
            return geometry;
        },

        toMesh: function() {
            var geometry = this.toGeometry(),
                material = new THREE.MultiMaterial,
                mesh = new THREE.Mesh( geometry, material );

            mesh.position.setFromMatrixPosition( this.matrix );
            mesh.rotation.setFromRotationMatrix( this.matrix );

            var materials = [];
            mesh.geometry.faces.forEach(function(face) {
                var material = face._material,
                    materialIndex = materials.indexOf(material);
                if (materialIndex < 0) {
                    materialIndex = materials.length
                    materials.push(material);
                }
                face.materialIndex = materialIndex;
                delete face._material;
            });
            mesh.material.materials = materials;

            return mesh;
        }
    };
});
