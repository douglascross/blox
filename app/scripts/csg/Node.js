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
