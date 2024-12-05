//////////	
// MAIN //
//////////
import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// standard global variables
var container, scene, camera, renderer, controls, stats;
var sphere;
var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();
var isJumping = false;
var rotation = 0.008;
var libroModel;

const loader = new GLTFLoader();

// Inicialización de la escena
init();
loadGLTFModels();
animate();

// Función de inicialización
function init() {
    //Escena
    scene = new THREE.Scene();

    //Camara
    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene.add(camera);
    camera.position.set(0, 150, 400);
    camera.lookAt(scene.position);

    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    container = document.getElementById('ThreeJS');
    container.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    //Events
    window.addEventListener('resize', onWindowResize, false);

    // CONTROLS
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    // STATS
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild(stats.domElement);

    // LIGHTS
    var light = new THREE.PointLight(0xffffff);
    light.position.set(0, 250, 0);
    scene.add(light);
    var ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // GEOMETRY
    var sphereGeometry = new THREE.SphereGeometry(50, 32, 16);
    var sphereTexture = new THREE.TextureLoader().load("./imagenes/futbol.jpg");
    var sphereMaterial = new THREE.MeshLambertMaterial({ map: sphereTexture});
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(-300, 50, -300);
    sphere.castShadow = true;
    scene.add(sphere);

    // FLOOR
    var floorTexture = new THREE.TextureLoader().load("./imagenes/suelo.jpeg");
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(16, 16);
    var floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
    var floorGeometry = new THREE.PlaneGeometry(2000, 2000, 1, 1);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.5;
    floor.rotation.x = Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

     // SKY
    var skyBoxGeometry = new THREE.BoxGeometry(10000, 10000, 10000);
    var skyBoxTexture = new THREE.TextureLoader().load("./imagenes/estanteria.jpg");
    skyBoxTexture.wrapS = THREE.RepeatWrapping;
    skyBoxTexture.wrapT = THREE.RepeatWrapping;
    skyBoxTexture.repeat.set(2, 2);
    var skyBoxMaterial = new THREE.MeshBasicMaterial({ map: skyBoxTexture, side: THREE.BackSide });
    var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
    scene.add(skyBox);
}

function animate() {
    requestAnimationFrame(animate);
    render();
    update();
}

function jump() {
  if (isJumping) return;

  isJumping = true;

  var initialY = sphere.position.y;
  var initialScale = sphere.scale.clone();
  var jumpHeight = 50;
  var jumpDuration = 2;
  var shrinkDuration = 0.2;

  var startTime = Date.now();

  function shrinkAnimation() {
      var currentTime = Date.now();
      var elapsedTime = (currentTime - startTime) / 1000;

      if (elapsedTime < shrinkDuration) {
          var shrinkProgress = elapsedTime / shrinkDuration;
          sphere.scale.lerp(new THREE.Vector3(1, 0.5, 1), shrinkProgress);
          requestAnimationFrame(shrinkAnimation);
      } else {
          sphere.scale.copy(initialScale);
          jumpAnimation();
      }
      render();
  }

  function jumpAnimation() {
      var currentTime = Date.now();
      var elapsedTime = (currentTime - startTime) / 1000;

      if (elapsedTime < jumpDuration) {
          var jumpProgress = elapsedTime / jumpDuration;
          var deltaY = jumpHeight * Math.sin(jumpProgress * Math.PI);
          sphere.position.y = initialY + deltaY;
          requestAnimationFrame(jumpAnimation);
      } else {  
          isJumping = false;
      }
      render();
  }

  shrinkAnimation();
}

function update() {
  var delta = clock.getDelta(); 

  if (keyboard.pressed("space")) {
      jump();
  }
  libroModel.rotation.y += rotation;
  var moveDistance = 200 * delta;
  if (keyboard.pressed("W")) {
      sphere.position.z -= moveDistance;
  }
  if (keyboard.pressed("S")) {
      sphere.position.z += moveDistance;
  }
  if (keyboard.pressed("A")) {
      sphere.position.x -= moveDistance;
  }
  if (keyboard.pressed("D")) {
      sphere.position.x += moveDistance;
  }
  if (keyboard.pressed("Q")) {
    camera.position.set(0, 100, 700);
    camera.lookAt(mesaModel.position);
}

  controls.update();
  stats.update();
}


async function loadGLTFModels() {
  var tvGltfAsset = await loader.loadAsync("./models/tv.glb");
  var tvModel = tvGltfAsset.scene;
  tvModel.position.y = 97;
  tvModel.position.x = 80;
  tvModel.position.z = -300;
  tvModel.scale.set(20, 20, 20);
  scene.add(tvModel);
    var libro = await loader.loadAsync("./models/libro2.glb");
    libroModel = libro.scene;
    libroModel.position.y = 90;
    libroModel.position.x = -50;
    libroModel.position.z = -300;
    libroModel.scale.set(3, 3, 3);
    scene.add(libroModel);
    var mesa = await loader.loadAsync("./models/table.glb");
    var mesaModel = mesa.scene;
    mesaModel.position.y = 50;
    mesaModel.position.x = 0;
    mesaModel.position.z = -300;
    mesaModel.scale.set(100, 100, 100);
    mesaModel.rotation.y = Math.PI / 2;
    scene.add(mesaModel);   
}


function render() {
    renderer.render(scene, camera);
}

function onWindowResize() {
  var SCREEN_WIDTH = window.innerWidth;
  var SCREEN_HEIGHT = window.innerHeight;
  camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
  camera.updateProjectionMatrix();
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

}