var camera, scene, renderer;
var cube, torus;
init();
animate();
function init() {
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 400;

    scene = new THREE.Scene();

    // texture on cube
    var texture = new THREE.TextureLoader().load( 'images/lemming-obese.png' );
    var geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );
    var material = new THREE.MeshBasicMaterial( { map: texture } );
    cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    // texture on cube
    var torusGeometry = new THREE.TorusGeometry( 240, 60, 32, 64 );
    material = new THREE.MeshBasicMaterial( { map: texture } );
    torus = new THREE.Mesh( torusGeometry, material );
    scene.add( torus );

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
function animate() {
    requestAnimationFrame( animate );
    cube.rotation.x += 0.005;
    cube.rotation.y += 0.01;
    torus.rotation.x += 0.005;
    torus.rotation.y += 0.01;
    renderer.render( scene, camera );
}
