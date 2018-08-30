/*
	Desc: Produces realistic snowfall 
	Author: Allison Regna
	Date: August 2018
 */

  var scene, camera, renderer;
  var light1, light2, light3;
  var snowflake, snowSystem;

  init();
  animate();

  function init() {
    initRenderer();
    initScene();
    addCamera();
    initLights();
    addSnowSystem();
    addSnowflakes();
    window.addEventListener('resize', onWindowResize, false);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onDocumentMouseMove(event) {
    mouseX = ( event.clientX - windowHalfX );
    mouseY = ( event.clientY - windowHalfY ) * 0.3;
  }

  function initScene(){
    scene = new THREE.Scene();
  }

  function initRenderer(){
    renderer = new THREE.WebGLRenderer( {alpha: true} );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  function initLights(){
    var ambientLight = new THREE.AmbientLight(0x999999 );
    scene.add(ambientLight);

    light1 = new THREE.DirectionalLight( 0xffffff, 1 );
    light1.position.set( 0, 10, 0 );
    scene.add(light1);
    light2 = new THREE.DirectionalLight( 0x11E8BB, 1 );
    light2.position.set( 2, 1, 1 );
    scene.add(light2);
    light3 = new THREE.DirectionalLight( 0x11E8BB, 1 );
    light3.position.set(-2, 1, 1 );
    scene.add(light3);
  }

  function addCamera(){
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z= 400;
    camera.lookAt(0,0,0);
    return camera;
  }

  function addSnowSystem() {
    snowSystem = new THREE.Object3D();
    scene.add(snowSystem);
  }

  function addSnowflakes(){
    var snowflakeGeom = new THREE.SphereBufferGeometry( .8, 0 );
    var snowflakeMat = new THREE.MeshLambertMaterial( { color: 0xffffff } );

    for (var i = 0; i < 2000; i++) {
      var snowflake = new THREE.Mesh( snowflakeGeom, snowflakeMat );
      snowSystem.add( snowflake );
      snowflake.position.set((Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800, (Math.random() - 0.5) * 500)
    }
  }

  function moveSnowflakes(){
    for (i = 0; i < snowSystem.children.length / 2; i++) {
      snowSystem.children[i].position.y -= .5;
      if (snowSystem.children[i].position.y < -400) {
        snowSystem.children[i].position.y += 1000;
      }
    }
    for (i = snowSystem.children.length / 2; i < snowSystem.children.length; i++) {
      snowSystem.children[i].position.y -= .8;
      if (snowSystem.children[i].position.y < -400) {
        snowSystem.children[i].position.y += 500;
      }
    snowSystem.rotation.x -= 0.0000002;
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    renderer.render( scene, camera )
    moveSnowflakes();
  };
