/*
	Desc: Dark Full of Stars is an interactive music experience with music by Volvo Physics
        Users can interact with the screen to produce a different viewing each time
	Author: Allison Regna with adapations as follows:
    (1) Video texture code adapted and modified from ThreeJS example found here:
        https://github.com/mrdoob/three.js/blob/master/examples/webgl_materials_video.html
        Licensed under MIT 2018 (see bottom of document for license*)
    (2) CSS text effect code by Tobias Ahlin, found here:
        http://tobiasahlin.com/moving-letters/#13
        Licensed under MIT 2017
	Date: August 2018
 */

  if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

  // SCENE VARIABLES
  var scene, camera, renderer, controls;
  var ambiLight, ambiLight2;
  var audio, audioStartTime;
  var clock = new THREE.Clock();
  var musicState = {scene:'title', camera:'camera'};

  // MESH & OBJECT VARIABLES
  var starMesh, starSystem, cometLight;

  // VIDEO GLOBAL VARIABLES
  var video, texture, material, mesh;
  var vidStruc = new THREE.Object3D();
  var composer;
  var mouseX = 0;
  var mouseY = 0;
  var windowHalfX = window.innerWidth / 2;
  var windowHalfY = window.innerHeight / 2;
  var cube_count, meshes = [], materials = [];
  var xgrid = 20;
  var ygrid = 10;
  var h, counter = 1;

  //FOR ANIMATIONS
  var firstVerse = true;
  var vidStrucBackwards = true;
  var alreadyInIntroScene = false;
  var alreadyAddedLight = false;
  var alreadyDim = false;
  var orbiting = false;
  var alreadyInCredits = false;

  init();
  animate();

  /***********************************************************************
                           INIT FUNCTIONS
   **********************************************************************/
  function init() {
     initRenderer();
     initScene();
     initLight();
     initCamera();
     setupSound();
     initEvents();
     initVideo();
  }

  function initScene(){
    scene = new THREE.Scene();
  }

  function initCamera(){
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z= 400;
    camera.lookAt(0,0,0);
    controls = new THREE.OrbitControls( camera );
  }

  function initRenderer(){
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight);
    document.body.appendChild( renderer.domElement );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  function initLight(){
    ambiLight = new THREE.AmbientLight( 0x141414 );
    scene.add( ambiLight );

    ambiLight2 = new THREE.AmbientLight( 0x404040 );
    scene.add( ambiLight2 );

    var light = new THREE.DirectionalLight();
    light.position.set( -200, 200, 100 );
    scene.add( light );

    var light2 = new THREE.DirectionalLight();
    light2.position.set( 200, 200, -100 );
    scene.add( light2 );

    var light3 = new THREE.DirectionalLight();
    light3.position.set( 0, 300, -50 );
    scene.add( light3 );
  }

  /***********************************************************************
                                   SOUND
  **********************************************************************/
  function setupSound(){
    var audioLoader = new THREE.AudioLoader();
    var listener = new THREE.AudioListener();
    audio = new THREE.Audio( listener );

    audioLoader.load( 'sounds/VolvoPhysics-Dark,FullofStars.mp3', function ( buffer ) {
      audio.setBuffer( buffer );
      audio.setLoop( false );
      audio.play();
      audioStartTime = clock.getElapsedTime();
    } );
  }

  /***********************************************************************
                               OBJECTS
   **********************************************************************/

   /////////////////
   //SPACE RELATED//
   /////////////////
   function addStarSystem() {
     starSystem = new THREE.Object3D();
     scene.add( starSystem );
   }

   function addStars(){
     var starGeom = new THREE.TetrahedronBufferGeometry( 1.5, 0 );
     var starMat1 = new THREE.MeshLambertMaterial( { color: 0xa6ceda, emissive: 0x614910 } );
     var starMat2 = new THREE.MeshLambertMaterial( { color: 0xd3e6e5, emissive: 0x614910 } );
     var starMat3 = new THREE.MeshLambertMaterial( { color: 0xf0dfa7, emissive: 0x614910 } );

     for (var i = 0; i < 2500; i++) {
       if(i % 10 < 3) {
         var starMesh = new THREE.Mesh( starGeom, starMat1 );
       }else if( i % 10 >= 3 && i % 10 <= 6) {
         var starMesh = new THREE.Mesh( starGeom, starMat2 );
       } else {
         var starMesh = new THREE.Mesh( starGeom, starMat3 );
       }

       starSystem.add( starMesh );

       starMesh.position.set( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.6 ).normalize();
       starMesh.position.multiplyScalar( 100 + (Math.random() * 800) );
       starMesh.rotation.set( Math.random() * 2, Math.random() * 2, Math.random() * 2 );
     }
   }

   function createComet() {
     var sphere = new THREE.SphereGeometry( 3, 16, 8 );
     cometLight = new THREE.PointLight( 0xffffff, 2, 50 );
     cometLight.add( new THREE.Mesh( sphere, new THREE.MeshPhysicalMaterial( { reflectivity: 1.0 } )));
     scene.add( cometLight );
   }

   /////////////////
   //VIDEO RELATED//
   /////////////////
   function addVideo() {
     scene.add( vidStruc );
     video.play();
  }

  function initVideoTexture() {
    video = document.getElementById( 'video' );
    texture = new THREE.VideoTexture( video );
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;
  }

  function addVideoBlocks() {
    var i, j, ux, uy, ox, oy, geometry, xsize, ysize;
    var parameters = { color: 0xffffff, map: texture, side:THREE.DoubleSide };

    ux = 1 / xgrid;
    uy = 1 / ygrid;
    xsize = 204 / xgrid;
    ysize = 204 / ygrid;
    cube_count = 0;

    for ( i = 0; i < xgrid; i ++ )
    for ( j = 0; j < ygrid; j ++ ) {
      ox = i;
      oy = j;
      geometry = new THREE.BoxBufferGeometry( xsize, ysize, xsize/4 );
      change_uvs( geometry, ux, uy, ox, oy );

      materials[ cube_count ] = new THREE.MeshLambertMaterial( parameters );
      material = materials[ cube_count ];
      material.hue = i/xgrid; // for rainbow blocks at end
      material.saturation = 1 - j/ygrid; // for rainbow blocks at end

      mesh = new THREE.Mesh( geometry, material );
      mesh.position.x = ( i - xgrid/2 ) * xsize;
      mesh.position.y = ( j - ygrid/2 ) * ysize;
      mesh.position.z = 0;
      mesh.scale.x = mesh.scale.y = mesh.scale.z = 1;
      vidStruc.add( mesh );
      mesh.dx = 0.001 * ( 0.5 - Math.random() );
      mesh.dy = 0.001 * ( 0.5 - Math.random() );
      meshes[ cube_count ] = mesh;
      cube_count += 1;
    }
  }

  function postprocessing(){
    var renderModel = new THREE.RenderPass( scene, camera );
    var effectBloom = new THREE.BloomPass( 1.3 );
    var effectCopy = new THREE.ShaderPass( THREE.CopyShader );
    effectCopy.renderToScreen = true;
    composer = new THREE.EffectComposer( renderer );
    composer.addPass( renderModel );
    composer.addPass( effectBloom );
    composer.addPass( effectCopy );
  }

  function initVideo(){
    initVideoTexture();
    addVideoBlocks();
    renderer.autoClear = false;
    postprocessing();
  }

  function initEvents(){
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    window.addEventListener( 'resize', onWindowResize, false );
  }

  /***********************************************************************
                              UPDATE FUNCTIONS
   **********************************************************************/

   function onDocumentMouseMove(event) {
     mouseX = ( event.clientX - windowHalfX );
     mouseY = ( event.clientY - windowHalfY ) * 0.3;
   }

   function onWindowResize() {
     windowHalfX = window.innerWidth / 2;
     windowHalfY = window.innerHeight / 2;
     camera.aspect = window.innerWidth / window.innerHeight;
     camera.updateProjectionMatrix();
     renderer.setSize( window.innerWidth, window.innerHeight );
     composer.reset();
   }

   function change_uvs( geometry, unitx, unity, offsetx, offsety ) {
     var uvs = geometry.attributes.uv.array;
     for ( var i = 0; i < uvs.length; i += 2 ) {
       uvs[ i ] = ( uvs[ i ] + offsetx ) * unitx;
       uvs[ i + 1 ] = ( uvs[ i + 1 ] + offsety ) * unity;
     }
   }

   function updateVideo(){
     var time = Date.now() * 0.00005;

     if(firstVerse) { //allows user movement dring first verse
       camera.position.x += ( mouseX - camera.position.x ) * 0.05;
       camera.position.y += ( - mouseY - camera.position.y ) * 0.05;
       camera.lookAt( scene.position );
     }

     if(musicState.scene == 'hot') { //changes the colors to red on "hot"
          for ( var i = 0; i < cube_count; i ++ ) {
          material = materials[ i ];
          material.hue = 204;
          material.color.setHSL( material.hue, material.saturation, 0.5 );
        }
        camera.position.x += ( mouseX - camera.position.x ) * 0.01; //to move in and out of video
        //camera.position.z += ( mouseX - camera.position.z ) * 0.01; //to move side by side
      }

      if(musicState.scene == 'bridge') {
        for ( var i = 0; i < cube_count; i ++ ) {
          material = materials[ i ];
          h = ( 306 * ( material.hue + time ) % 306 ) / 306;
          material.color.setHSL( h, material.saturation, .7 );
        }
        camera.position.z += ( mouseX - camera.position.z ) * 0.01; //to move in and out of video
      }

     if ( counter % 1000 > 300 ) { //moves blocks apart
       for ( var i = 0; i < cube_count; i ++ ) {
         mesh = meshes[ i ];
         mesh.rotation.x += 10 * mesh.dx;
         mesh.rotation.y += 10 * mesh.dy;
         mesh.position.x += 200 * mesh.dx;
         mesh.position.y += 200 * mesh.dy;
         mesh.position.z += 400 * mesh.dx;
       }
     }
     if ( counter % 1000 === 0 ) { //puts blocks back together
       for ( var i = 0; i < cube_count; i ++ ) {
         mesh = meshes[ i ];
         mesh.dx *= -1;
         mesh.dy *= -1;
       }
     }

     counter ++;
     renderer.clear();
     composer.render();
   }

  function updateStarSystem(){
    starSystem.rotation.x += 0.0010;
    starSystem.rotation.y -= 0.0001;
    starSystem.rotation.z += 0.00001;
  }

  function updateComet(){
    var counter = clock.getElapsedTime();
    if(Math.floor(counter) % 100 == 00) {
      resetCometPosition();
    }
    cometLight.translateX( 40 );
    cometLight.translateY( 4 );
  }

  function resetCometPosition() {
    cometLight.position.set( getRandomInt(-800,800), getRandomInt(-800,800), getRandomInt(-400,-200) );
  }

  /***********************************************************************
                                  SCENES
   **********************************************************************/
   function createIntro(){
     document.getElementById("songName").style.display = "none";
     document.getElementById("artistName").style.display = "none";
     addStarSystem();
     addStars();
     createComet();
     controls.enabled = false;
   }

   function createEnd(){
     document.getElementById("thanks").style.display = "block";
     document.getElementById("fb").style.display = "block";
     document.getElementById("tw").style.display = "block";
     document.getElementById("startOver").style.display = "block";
     document.getElementById("moreMusic").style.display = "block";
     document.getElementById("moreProjects").style.display = "block";
     camera.position.set(0,0,1000);
     camera.rotation.set(0,0,0);
     updateStarSystem();
   }

  function orbit(){
    firstVerse = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;
    controls.target = new THREE.Vector3( 0, 0, 0 );
    controls.update();
  }

  function zoom(){
    camera.position.z -= .09;
  }

  function dim(){
    scene.remove( ambiLight );
    scene.remove( ambiLight2 );
    scene.remove( starSystem );
  }

  /***********************************************************************
                              OTHER
   **********************************************************************/
  function getRandomInt( maxInt ) {
    return Math.floor( Math.random() * Math.floor(maxInt) );
  }

  function getRandomInt( minInt, maxInt ) {
    return Math.floor( Math.random() * (maxInt - minInt + 1) + minInt );
  }

  /* Lines 370 - 395 borrowed by Tobias Ahlin
     http://tobiasahlin.com/moving-letters/#13 */
  $('.ml13').each(function(){
    $(this).html($(this).text().replace(/([^\x00-\x80]|\w)/g, "<span class='letter'>$&</span>"));
  });

  anime.timeline({loop: false})
    .add({
    targets: '.ml13 .letter',
    translateY: [100,0],
    translateZ: 0,
    opacity: [0,1],
    easing: "easeOutExpo",
    duration: 1400,
    delay: function(el, i) {
      return 300 + 30 * i;
    }
    }).add({
    targets: '.ml13 .letter',
    translateY: [0,-100],
    opacity: [1,0],
    easing: "easeInExpo",
    duration: 1500,
    delay: function(el, i) {
      return 100 + 30 * i;
    }
    });

  /***********************************************************************
                              ANIMATION
   **********************************************************************/

  function determineSceneByTime( currTime ){
    if(currTime >= 6 && currTime <= 19.5)           musicState.scene = 'intro';
    else if(currTime >= 19.5 && currTime <= 45)     musicState.scene = 'zoom';
    else if(currTime >= 46.5 && currTime <= 47)     musicState.scene = 'dim';
    else if(currTime >= 47 && currTime <= 53)       musicState.scene = 'zoom';
    else if(currTime >= 53 && currTime <= 53.5)     musicState.scene = 'dim';
    else if(currTime >= 53.5 && currTime <= 59)     musicState.scene = 'zoom';
    else if(currTime >= 59 && currTime <= 59.5)     musicState.scene = 'dim';
    else if(currTime >= 59.5 && currTime <= 65.5)   musicState.scene = 'zoom';
    else if(currTime >= 65.5 && currTime <= 66)     musicState.scene = 'dim';
    else if(currTime >= 66 && currTime <= 85)       musicState.scene = 'zoom';
    else if(currTime >= 85 && currTime <= 104.5)    musicState.scene = 'orbit';
    else if(currTime >= 104.5 && currTime <= 132.5) musicState.scene = 'hot';
    else if(currTime >= 132.5 && currTime <= 150)   musicState.scene = 'bridge';
    else if(currTime >= 153.5 && currTime <= 159.5)   musicState.scene = 'end';
    else if(currTime > 159.5)                         musicState.scene = 'credits';
  }

  function animate() {
    requestAnimationFrame( animate );
    render();

    currTime = clock.getElapsedTime() - audioStartTime;
    determineSceneByTime(currTime);

    switch(musicState.scene) {
      case "title":
        break;

      case "intro":
        if( !alreadyInIntroScene ) {
          alreadyInIntroScene = true;
          createIntro();
        }
        updateStarSystem();
        updateComet();
        camera.position.x += ( mouseX - camera.position.x ) * 0.001;
        break;

      case "zoom":
        addVideo();
        updateVideo();
        zoom();
        if( !alreadyAddedLight ) {
          scene.add( ambiLight );
          scene.add( ambiLight2 );
          scene.add( starSystem );
          scene.background = new THREE.Color( 0x000000 );
          alreadyAddedLight = true;
        }
        alreadyDim = false; //to switch between zoom and dim
        break;

      case "dim":
        if( !alreadyDim ) {
          alreadyDim = true;
          dim();
        }
        alreadyAddedLight = false; //to switch between zoom and dim
        break;

      case "orbit":
        if( !orbiting ) {
          orbiting = true;
          camera.position.set( 0,0,200 );
        }
        orbit();
        break;

      case "hot":
        if( vidStrucBackwards ) { //reset view after orbiting
          vidStrucBackwards = false;
          vidStruc.rotateY( -Math.PI/2 );
        }
        camera.lookAt( 0, 0, 0 );
        controls.enabled = false;
        updateStarSystem();
        updateVideo();
        break;

      case "bridge":
        vidStruc.translateY( -5 );
        camera.translateY( -5 );
        updateVideo();
        updateStarSystem();
        break;

      case "end":
        updateVideo();
        vidStruc.translateZ( -7 );
        break;

      case "credits":
        if( !alreadyInCredits) {
          alreadyInCredits = true;
          scene.remove(camera);
          scene.remove(vidStruc);
          scene.add(camera);

        }
        createEnd();
        break;

      default:
        console.log( "unknown scene: "+ musicState.scene );
    }
  }

  function render() {
    renderer.render( scene, camera );
  }


  /*

  *The MIT License
  Copyright © 2010-2018 three.js authors

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

*/
