
var camera, scene, renderer;
var shapes = [];
init();
animate();

function init() {

    // CAMERA
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 100000 );
    camera.position.z = 1000;
    camera.position.x = 0;
    camera.position.y = 0;
    camera.lookAt({
        x: 0,
        y: 0,
        z: 0
    });

    // SCENE
    scene = new THREE.Scene();

    // RENDERER
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );

    // RENDERER: SHADOW
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.soft = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // LIGHT
    var spotLight = new THREE.DirectionalLight( 0xcccccc, 1);
    spotLight.position.set( 0, 0, 1200 );

    // LIGHT: SHADOW
    spotLight.castShadow = true;
    spotLight.shadow.darkness = 0.2;
    spotLight.shadow.mapSize.width = 512;
    spotLight.shadow.mapSize.height = 512;
    spotLight.shadow.camera.near = 200;
    spotLight.shadow.camera.far = 2000;
    var d = 800;
    spotLight.shadow.camera.left = -d;
    spotLight.shadow.camera.right = d;
    spotLight.shadow.camera.top = d;
    spotLight.shadow.camera.bottom = -d;

    // LIGHT: SHADOW: HELPER
    var cameraHelper = new THREE.CameraHelper( spotLight.shadow.camera );
    //scene.add(cameraHelper);

    scene.add( spotLight );

    // LIGHT: AMBIENT
    var light = new THREE.AmbientLight(0x333333); // soft white light
    scene.add( light );

    // TEXTURE
    var texture = new THREE.TextureLoader().load('images/Cliffs0193_2_S.jpg');
    var material = new THREE.MeshPhongMaterial({
        color: 0xff8800
        //map: texture
    });

    // PLANE
    var groundMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0x999999
    });
    var plane = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), groundMaterial);
    plane.position.z = -240;
    plane.receiveShadow = true;
    scene.add(plane);

    // BLOX: CSG
    var csgs = [
        //subtract1,
        //subtract2,
        //subtract3,
        //subtract4,
        //boxPart,
        sphereWithBox,
        //cylindersPart,
        { object: classicExample, color: 0xff8800 },
        classicExample.subtract[0],
        //classicExample.subtract[1],
        classicExample,
        //axe.edge,
        //axe.complete,
        { object: axe.stone, stopX: true, ops: [{translate: [0, 40]}, {scale:[0.7, 0.7, 0.7]}]},
        //sword.blade,
        { object: sword.stone, stopX: true, ops: [{translate: [0, 40]}, {scale:[0.7, 0.7, 0.7]}]},
        { object: shield.complete, stopX: true, ops: [{rotate: [0, 180]}]},
        { object: shield.completeDragon, stopX: true},
        { object: helmet.complete},
        { object: armor.complete, stopX: true, ops: [{rotate: [0, 180]}]},
        { object: armor.completeDragon, stopX: true}
    ];

    // BLOX: CSG: ADD
    var cntItems = csgs.length,
        cellDepth = Math.ceil(Math.pow(cntItems, 0.5)),
        cellSize = 1000 / cellDepth,
        cellSizeOffset = cellSize * (cellDepth / 2 - 0.5),
        scale = cellSize / 300;
    csgs.forEach(function(csg, index) {
        csg = _.cloneDeep(csg);
        var cellY = Math.floor(index / cellDepth),
            cellX = index % cellDepth;
        var shape = BLOX.toMesh(csg);
        if (!shape) {
            shape = new THREE.Mesh( BLOX.toGeometry(csg), material );
        }
        shape.stopX = csg.stopX;
        shapes.push(shape);
        shape.castShadow = true;
        shape.scale.x  = scale;
        shape.scale.y  = scale;
        shape.scale.z  = scale;
        shape.position.x = -cellSizeOffset + cellX * cellSize;
        shape.position.y = cellSizeOffset - cellY * cellSize;
        scene.add(shape);
    });
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
function animate() {
    requestAnimationFrame( animate );
    shapes.forEach(function(shape) {
        if (!shape.stopX) {
            shape.rotation.x += 0.005;
        }
        shape.rotation.y += 0.01;
    });
    renderer.render( scene, camera );
}
