import * as THREE from "three";

import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { useRef, useState } from "react";
import gsap from "gsap";
import StartModal from "./StartModal.jsx";
import GameOverModal from "./GameOverModal.jsx";
import GameUI from "./GameUI.jsx";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import TWEEN, { Tween } from "@tweenjs/tween.js";

const Game = () => {
  let actorMesh, boulder1, boulder2, plant, floor;
  let actorBody, boulder1Body, boulder2Body, obstacleBody;
  const mountRef = useRef(null);
  let obstacles = [];
  const [gameStart, isGameStart] = useState(false);
  const clock = new THREE.Clock();
  const [showModal, setShowModal] = useState(false);

  //TODO : obstacles constants

  let currentObstacleOne = null;
  let currentObstacleTwo = null;

  const playerBox = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshPhongMaterial({ color: 0x0000ff })
  );

  const playerBoxCollider = new THREE.Box3(
    new THREE.Vector3(),
    new THREE.Vector3()
  );

  const obstacleBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

  const obstacleBox2 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

  const coinObject = new THREE.Object3D();

  const coinsArray = [];

  let activeCoinsGroup = new THREE.Group();

  const coinBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

  let coins = 0;

  const obstacleArray = [];
  const obstaclePhysicsBodies = [];
  let activeObstacles = [];
  let obstaclesLoaded = 0;
  const totalObstacleTypes = 3; // e.g., you're loading 3 obstacles
  let canSpawnObstacles = false;

  const speed = 220;
  const delta = 0;

  //TODO :ref
  // Use refs for Three.js objects that need to persist
  const actorMeshRef = useRef(null);
  const obstaclesRef = useRef([]);
  const sceneRef = useRef(null);
  const worldRef = useRef(null);
  const noOfCollisionsRef = useRef(0);
  const currentDistanceRef = useRef(0);
  let timeRef = useRef("");
  let actorLifeRef = useRef(0);
  const floorsRef = useRef([]);
  const maxCollisions = 20;

  let day = true;
  let lastDayNightChange = 0;
  const floors = [];

  let floorCounter = 0;
  // let mileCounter = 0;

  let targetFov = 75;
  let isJumping = false;
  //TODO:  Initialize the scene
  const scene = new THREE.Scene();

  //TODO Physics world setup
  const world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);

  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.FogExp2(0xf0fff0, 0.03);
  const loader = new GLTFLoader();
  //Canvas
  const canvas = document.querySelector("canvas.webgl");

  //TODO Initialize the camera
  const camera = new THREE.PerspectiveCamera(
    30, //90
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  //TODO jump camera
  // const jumpCamera = new THREE.PerspectiveCamera(
  //   75,
  //   window.innerWidth / window.innerHeight,
  //   0.1,
  //   1000
  // );

  //TODO : Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 10, 7.5);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 6;
  dirLight.shadow.camera.top = 2;
  dirLight.shadow.camera.bottom = -2;
  dirLight.shadow.camera.right = 2;
  dirLight.shadow.camera.left = -2;
  scene.add(dirLight);
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3); // NEW light

  // Setup fillLight position (so it fills the shadows nicely)
  fillLight.position.set(-5, 5, -5);
  scene.add(fillLight); // Add to scene

  //TODO : HDR
  // const rgbeLoader = new RGBELoader();
  // rgbeLoader.load("/textures/environmentMap/meadow_2_4k.hdr", (texture) => {
  //   texture.mapping = THREE.EquirectangularReflectionMapping; // Very important!

  //   scene.environment = texture; // 👈 This will give objects realistic reflections
  //   scene.background = texture; // 👈 Optional: If you want the skybox to show the forest
  // });

  //TODO : Obstacles loader
  loader.load("/textures/boulder1/namaqualand_boulder_02_2k.gltf", (gltf) => {
    boulder1 = gltf.scene;

    boulder1.position.y = 0.1;

    // Create physics body for boulder1
    const shape = new CANNON.Box(new CANNON.Vec3(0.8, 0.8, 0.8)); // simple box around it
    boulder1Body = new CANNON.Body({
      //material: defaultMaterial,
      mass: 0, // static object
      shape: shape,
      position: new CANNON.Vec3(0, 0.1, 0),
    });
    boulder1Body.castShadow = true;
    world.addBody(boulder1Body);
  });

  loader.load("/textures/boulder2/namaqualand_boulder_03_2k.gltf", (gltf) => {
    boulder2 = gltf.scene;
    boulder2.position.y = 0.1;

    // // Create physics body for boulder2
    const shape = new CANNON.Box(new CANNON.Vec3(0.8, 0.8, 0.8));
    boulder2Body = new CANNON.Body({
      //material: defaultMaterial,
      mass: 0,
      shape: shape,
      position: new CANNON.Vec3(0, 0.1, 0),
    });
    boulder2Body.castShadow = true;
    world.addBody(boulder2Body);
  });

  loader.load("/textures/plant/didelta_spinosa_2k.gltf", (gltf) => {
    plant = gltf.scene;
  });

  // Replace the GLTF loader with a simple cube creation
  const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32); // Sphere with radius 0.5
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x00aaff, // Blue color
    metalness: 0.3,
    roughness: 0.7,
  });

  actorMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  actorMesh.position.y = 0.5; // Raised above the ground
  actorMesh.scale.set(1, 1, 1); // Scale the sphere to keep it 1x1x1
  scene.add(actorMesh);

  // Change physics body to match cube shape
  const actorShape = new CANNON.Sphere(0.5); // Sphere-shaped physics body with radius 0.5
  actorBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 0.5, 0), // Position the physics body the same as the mesh
    linearDamping: 0.99,
    angularDamping: 0.99,
    fixedRotation: false, // Allow rotation naturally
  });

  actorBody.addShape(actorShape); // Add the sphere shape to the physics body

  actorBody.velocity.set(0, 0, 0);
  actorBody.angularVelocity.set(0, 0, 0);
  world.addBody(actorBody);
  actorMesh.position.copy(actorBody.position);

  //TODO :Update day and night
  const updateDayNightCycle = () => {
    if (currentDistanceRef.current - lastDayNightChange >= 1000) {
      lastDayNightChange = currentDistanceRef.current;
      day = !day;

      console.log("Toggling Day/Night:", day);

      if (day) {
        // Smoothly transition to DAY
        gsap.to(ambientLight, { intensity: 1, duration: 2 });
        gsap.to(dirLight, { intensity: 1, duration: 2 });
        gsap.to(fillLight, { intensity: 0.3, duration: 2 });
        fillLight.visible = true; // Show fill light

        // Change background color smoothly
        gsap.to(scene.background, {
          r: 0x87 / 255,
          g: 0xce / 255,
          b: 0xeb / 255,
          duration: 2,
        });

        // Immediately set direct light color
        dirLight.color.set(0x87ceeb);
      } else {
        // Smoothly transition to NIGHT
        gsap.to(ambientLight, { intensity: 0.2, duration: 2 });
        gsap.to(dirLight, { intensity: 0.5, duration: 2 });

        // Change background color smoothly
        gsap.to(scene.background, {
          r: 0x00,
          g: 0x00,
          b: 0x00,
          duration: 2,
        });

        dirLight.color.set(0x1e1e1e);
      }
    }
  };

  //TODO :texture Loader
  const textureLoader = new THREE.TextureLoader();

  const floorTextures = [textureLoader.load("/textures/grass/color.jpg")];

  const grassAOTexture = textureLoader.load(
    "/textures/grass/ambientOcclusion.jpg"
  );
  const grassNormalTexture = textureLoader.load("/textures/grass/normal.jpg");
  const grassRoughnessTexture = textureLoader.load(
    "/textures/grass/roughness.jpg"
  );
  [grassAOTexture, grassNormalTexture, grassRoughnessTexture].forEach(
    (texture) => {
      texture.repeat.set(8, 8);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    }
  );

  //Set repeat settings for all textures
  floorTextures.forEach((tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
  });

  //TODO : Floors
  const generateFloor = (z, type) => {
    const texture = floorTextures[type % floorTextures.length];
    const geometry = new THREE.BoxGeometry(20, 0.1, 20, 50, 50, 50); // Add more subdivisions
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      aoMap: grassAOTexture,
      normalMap: grassNormalTexture,
      roughnessMap: grassRoughnessTexture,
      roughness: 1,
      metalness: 0.1,
    });

    material.envMapIntensity = 1.5;

    floor = new THREE.Mesh(geometry, material);
    floor.receiveShadow = true;
    floor.castShadow = false;
    floor.position.y = 0;

    floor.position.z = z;
    scene.add(floor);
    floors.push(floor); // 👈 Add floor to array

    floorsRef.current.push(floor);

    //TODO :Floor Physics Body
    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body();
    //floorBody.material = defaultMaterial;
    floorBody.mass = 0; //static at origin
    floorBody.addShape(floorShape);
    floorBody.position.set(0, 1, 0);
    floorBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(-1, 0, 0),
      Math.PI * 0.5
    );
    world.addBody(floorBody);

    // //new obstacle spawn
    // Spawn obstacles only if models are loaded
    if (type >= 5 && boulder1 && boulder2 && plant) {
      const obstacleOptions = [
        // { mesh: boulder1, size: new CANNON.Vec3(0, 0, 0) },
        // { mesh: boulder2, size: new CANNON.Vec3(0, 0, 0) },
        { mesh: plant, size: new CANNON.Vec3(1, 1, 1) }, // Smaller collision for plant
      ];

      // Add 2-3 obstacles per floor
      const numObstacles = 1;

      const usedPositions = new Set();

      for (let i = 0; i < numObstacles; i++) {
        const { mesh: originalObstacle, size } =
          obstacleOptions[Math.floor(Math.random() * obstacleOptions.length)];

        // Generate unique position
        let x, obstacleZ;
        do {
          x = Math.random() * 14 - 7; // Random X (-7 to +7)
          obstacleZ = z + Math.random() * 8 - 4; // Random Z within floor
        } while (usedPositions.has(`${x.toFixed(1)},${obstacleZ.toFixed(1)}`));

        usedPositions.add(`${x.toFixed(1)},${obstacleZ.toFixed(1)}`);

        const obstacle = originalObstacle.clone(true);
        const scale = 1.5 + Math.random() * 0.5;
        //const randomPosZ = 0.1 + Math.random() * 3;

        obstacle.scale.set(scale, scale, scale);
        obstacle.position.set(x, 0.2, obstacleZ);
        obstacle.visible = true;
        obstacle.castShadow = true;
        scene.add(obstacle);

        // Create physics body for obstacle
        const obstacleShape = new CANNON.Box(size);
        obstacleBody = new CANNON.Body({
          mass: 0,
          shape: obstacleShape,
          position: new CANNON.Vec3(x, 0.1, obstacleZ),
        });

        obstacleBody.castShadow = true;
        world.addBody(obstacleBody);

        obstacles.push({
          mesh: obstacle,
          body: obstacleBody,
          collided: false,
        });

        obstaclesRef.current.push({
          mesh: obstacle,
          body: obstacleBody,
          collided: false,
        });
      }
    }
  };

  //clean up floors
  const cleanUpFloors = () => {
    for (let i = floors.length - 1; i >= 0; i--) {
      const floor = floors[i];
      if (floor.position.z < actorMesh.position.z - 50) {
        scene.remove(floor);
        floor.geometry.dispose();
        floor.material.dispose();
        floors.splice(i, 1);
      }
    }
  };

  //Audio
  const audioListener = new THREE.AudioListener();
  camera.add(audioListener);
  const ambientSound = new THREE.Audio(audioListener);
  const jumpAudio = new Audio("/sounds/jump.mp3");
  // const slideAudio = new Audio(slideSound);
  //const pickupAudio = new Audio(pickupSound);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/sounds/background.mp3", (buffer) => {
    ambientSound.setBuffer(buffer);
    ambientSound.setLoop(true);
    ambientSound.setVolume(0.2);
  });

  window.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
      isJumping = false;
    }
  });

  //key presses  for laptop users
  const handleKey = (e) => {
    if (!actorBody) return;

    let moveDistance = 2; // 👈 How far you want actor glide left or right 6.67

    if (e.code === "Space" || e.keyCode === 38) {
      jump();
      isJumping = true;
    }

    // Move Left (A)
    if (e.key === "a" || e.key === "A" || e.keyCode === 37) {
      gsap.to(actorBody.position, {
        x: actorBody.position.x + moveDistance, // 👈 Move left (minus x)
        duration: 0.2, // Faster glide
        ease: "sine.inOut",
      });
    }

    // Move Right (D)
    if (e.key === "d" || e.key === "D" || e.keyCode === 39) {
      gsap.to(actorBody.position, {
        x: actorBody.position.x - moveDistance, // 👈 Move right (plus x)
        duration: 0.2, // Faster glide
        ease: "sine.inOut",
      });
    }
  };

  // Add a keydown event for the M key to play/stop audio
  const handleKeyDown = (e) => {
    if (e.key === "m" || e.key === "M") {
      // Resume audio context if suspended
      if (audioListener.context.state === "suspended") {
        audioListener.context.resume();
      }

      // Toggle play/stop audio
      if (ambientSound.isPlaying) {
        ambientSound.stop();
      } else {
        ambientSound.setVolume(0.1);
        ambientSound.play();
      }
    }
  };

  // Listen for 'M' keydown
  document.addEventListener("keydown", handleKeyDown);

  // Event listener for key presses
  document.addEventListener("keydown", handleKey);

  //OrbitControl
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  //Example trigger to change FOV
  window.addEventListener("keydown", (event) => {
    if (event.key === "z" || event.key === "Z") {
      targetFov = 45; // Zoom in on 'z' key
    }
    if (event.key === "x" || event.key === "X") {
      targetFov = 75; // Zoom out on 'x' key
    }
  });

  // Initialize the renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const handleStart = () => {
    console.log("Game Started!");
    isGameStart(true);

    // Reset physics when game starts
    if (actorBody) {
      actorBody.position.set(0, 0.1, 0);
      actorBody.velocity.set(0, 0, 0);
      actorBody.angularVelocity.set(0, 0, 0);
    }
  };

  const handleStop = () => {
    setShowModal(true);
    isGameStart(false);
  };

  //check collision detection
  // More precise collision detection
  const checkCollisions = (obstacle) => {
    if (!obstacle?.mesh || !actorMesh) return;

    checkGroundContact();

    // Only check obstacles within a reasonable distance
    const distance = Math.abs(obstacle.mesh.position.z - actorMesh.position.z);
    if (distance > 0.05) return; // Skip obstacles too far away

    // Create bounding boxes with proper size
    const actorBox = new THREE.Box3().setFromObject(actorMesh);
    const obstacleBox = new THREE.Box3().setFromObject(obstacle.mesh);

    // Adjust bounding box sizes for more precise collision
    actorBox.min.y += 0.1; // Adjust collision box height
    actorBox.max.y -= 0.1;

    // Check for intersection
    if (actorBox.intersectsBox(obstacleBox)) {
      handleCollision();
    }
  };

  const checkGroundContact = () => {
    if (!actorBody) return;

    // Raycast downward to check ground contact
    const rayStart = new CANNON.Vec3(
      actorBody.position.x,
      actorBody.position.y,
      actorBody.position.z
    );
    const rayEnd = new CANNON.Vec3(
      actorBody.position.x,
      actorBody.position.y - 0.2, // Slightly more than radius
      actorBody.position.z
    );

    const raycastResult = new CANNON.RaycastResult();
    const ray = new CANNON.Ray(rayStart, rayEnd);

    // Perform the raycast
    world.raycastClosest(ray, {}, raycastResult);

    // Check if we hit something close enough
    const isOnGround =
      raycastResult.hasHit &&
      actorBody.position.y - raycastResult.hitPointWorld.y < 0.2;

    // You can use this for jump logic
    if (isOnGround) {
      isJumping = false;
      // Reset any jump-related states here
    }
  };

  const handleCollision = () => {
    noOfCollisionsRef.current += 1;
    console.log("Collision! Total:", noOfCollisionsRef.current);

    // Update UI immediately
    const collisionsElement = document.getElementById("collisions");
    if (collisionsElement) {
      collisionsElement.innerText = `${noOfCollisionsRef.current}`;
    }

    // Flash effect
    const hitFlash = document.getElementById("hit-flash");
    if (hitFlash) {
      hitFlash.style.display = "block";
      hitFlash.style.opacity = "0.7";

      gsap.to(hitFlash, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          hitFlash.style.display = "none";
        },
      });
    }
  };

  const cleanupObstacles = () => {
    if (!sceneRef.current || !worldRef.current || !actorMeshRef.current) return;

    const cleanupThreshold = 20; // Reduced threshold for faster cleanup

    obstaclesRef.current = obstaclesRef.current.filter((obstacle) => {
      if (!obstacle?.mesh) return false;

      // Check if the obstacle is behind the actor within the cleanup threshold
      const isBehindActor =
        obstacle.mesh.position.z <
        actorMeshRef.current.position.z - cleanupThreshold;

      if (isBehindActor) {
        console.log(
          `Cleaning up obstacle at position: ${obstacle.mesh.position.z}`
        );

        // Remove from the scene
        sceneRef.current.remove(obstacle.mesh);
        console.log(
          `Obstacle removed from scene at position: ${obstacle.mesh.position.z}`
        );

        // Remove the obstacle body from the physics world
        if (obstacle.body) {
          worldRef.current.removeBody(obstacle.body);
          console.log(`Obstacle body removed from physics world`);
        }

        // Dispose of geometry and materials to free up memory
        if (obstacle.mesh.geometry) {
          obstacle.mesh.geometry.dispose();
          console.log(
            `Obstacle geometry disposed at position: ${obstacle.mesh.position.z}`
          );
        }

        if (obstacle.mesh.material) {
          if (Array.isArray(obstacle.mesh.material)) {
            obstacle.mesh.material.forEach((m) => {
              m.dispose();
              console.log(
                `Obstacle material disposed at position: ${obstacle.mesh.position.z}`
              );
            });
          } else {
            obstacle.mesh.material.dispose();
            console.log(
              `Obstacle material disposed at position: ${obstacle.mesh.position.z}`
            );
          }
        }

        return false; // Remove this obstacle from the list
      }

      return true; // Keep this obstacle in the list
    });
  };

  //End collision detection
  let oldElapsedTime = 0;

  //jump
  const jump = () => {
    if (!gameStart || isJumping) return;

    isJumping = true;
    jumpAudio.play();

    const maxJumpHeight = 10; // Max Y position
    const jumpDuration = 0.3; // How fast to go up or down

    // Smooth jump up
    gsap.to(actorBody.position, {
      y: maxJumpHeight,
      duration: jumpDuration,
      ease: "power2.out", // Smooth acceleration
      onComplete: () => {
        // Smooth land back down
        gsap.to(actorBody.position, {
          y: 0,
          duration: 0.5,
          ease: "power2.out", // Fast drop
          onComplete: () => {
            isJumping = false;
          },
        });
      },
    });
  };

  let animationId;

  const animate = () => {
    if (!gameStart) return;
    controls.update();

    animationId = window.requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime;

    // Calculate hours, minutes and seconds
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = Math.floor(elapsedTime % 60);

    // Format am to always get 2 digits
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    timeRef.current = formattedTime;

    // Update time display
    const timeElement = document.getElementById("time");
    if (timeElement) {
      timeElement.innerText = `${timeRef.current}`;
    }

    if (actorBody && actorMesh) {
      if (camera.fov !== targetFov) {
        camera.fov += (targetFov - camera.fov) * 0.05;
        camera.updateProjectionMatrix();
      }

      /////////////////////////////////
      // // Update position with acceleration
      const baseSpeed = 0.5;
      const distanceScale = currentDistanceRef.current / 50;
      const acceleration = Math.min(1 + Math.log(distanceScale + 1), 4);
      const currentSpeed = baseSpeed * acceleration;

      gsap.to(actorBody.position, {
        z: actorBody.position.z + currentSpeed,
        duration: 0.2,
        ease: "power1.out",
      });

      // Clean up and check collisions
      cleanupObstacles();

      // Only check nearby obstacles
      obstaclesRef.current.forEach((obstacle) => {
        checkCollisions(obstacle);
      });

      //update Actor life
      const currentCollisions = noOfCollisionsRef.current;
      const actorLifePercent = Math.max(
        0,
        100 * (1 - currentCollisions / maxCollisions)
      );
      actorLifeRef.current = actorLifePercent;

      // You can maybe update a health bar
      const healthBar = document.getElementById("player-life");
      if (healthBar) {
        healthBar.innerText = `${Math.floor(actorLifeRef.current)}%`;
      }

      // Check if actor is dead
      if (actorLifePercent <= 0) {
        cancelAnimationFrame(animationId);
        handleStop();
      }

      // Update distance counter
      const currentZ = actorBody.position.z;
      const threshold = 1;

      if (currentZ >= currentDistanceRef.current + threshold) {
        currentDistanceRef.current += threshold;

        // Update distance display
        const distanceDiv = document.getElementById("distance");
        if (distanceDiv) {
          distanceDiv.innerText = `${Math.floor(currentDistanceRef.current)}m`;
        }
      }

      //update day and night
      updateDayNightCycle();

      while (currentZ + 50 >= floorCounter * 10) {
        const nextFloorZ = floorCounter * 10;
        generateFloor(nextFloorZ, floorCounter);
        floorCounter++;
      }

      // Update physics world
      world.step(1 / 60, deltaTime, 3);

      // Sync actorMesh with physics body
      if (actorMesh && actorBody) {
        //actorBody.angularVelocity.set(1, 0, 0);
        actorMesh.position.copy(actorBody.position);
        actorMesh.quaternion.copy(actorBody.quaternion);
      }

      // Update camera position with smooth follow
      const idealCameraPos = new THREE.Vector3(
        actorMesh.position.x,
        actorMesh.position.y + 2.9,
        actorMesh.position.z - 7
      );

      camera.position.lerp(idealCameraPos, 1);
      camera.lookAt(actorMesh.position);

      // No need to move obstacles manually if actor is moving
      obstacles.forEach((obstacle) => {
        if (obstacle.mesh.position.z < actorBody.position.z - 10) {
          scene.remove(obstacle.mesh);
        }
      });
    }

    if (noOfCollisionsRef.current === 20) {
      cancelAnimationFrame(animationId);
      handleStop();
    }

    cleanUpFloors();

    const floorLimitX = 10; // Half the width of your visible floor. Example if floor width = 20
    if (actorMesh && actorBody) {
      if (Math.abs(actorMesh.position.x) > floorLimitX) {
        actorBody.applyForce(
          new CANNON.Vec3(0, -100, 0), // Apply strong downward force
          actorBody.position
        );
        setInterval(() => {
          cancelAnimationFrame(animationId);
          handleStop();
        }, 1200);
      }
    }

    renderer.render(scene, camera);
  };

  const restartGame = () => {
    setShowModal(false);
    isGameStart(true);
    currentDistanceRef.current = 0;
    noOfCollisionsRef.current = 0;

    // Reset distance display
    const distanceDiv = document.getElementById("distance");
    if (distanceDiv) {
      distanceDiv.innerText = "0";
    }

    // Clean up all obstacles
    obstacles.forEach((obstacle) => {
      scene.remove(obstacle.mesh);
      world.removeBody(obstacle.body);
    });
    obstacles = [];

    window.location.reload();
  };

  animate();

  const simulateKey = (key) => {
    console.log(key);
    window.dispatchEvent(new KeyboardEvent("keydown", { key }));

    if (!actorBody) return;

    let moveDistance = 2; // 👈 How far you want actor glide left or right

    if (key === "Space") {
      jump();
    }

    // Move Left (A)
    if (key === "a" || key === "A") {
      gsap.to(actorBody.position, {
        x: actorBody.position.x + moveDistance, // 👈 Move left (minus x)
        duration: 0.2, // Faster glide
        ease: "sine.inOut",
      });
    }

    // Move Right (D)
    if (key === "d" || key === "D") {
      gsap.to(actorBody.position, {
        x: actorBody.position.x - moveDistance, // 👈 Move right (plus x)
        duration: 0.2, // Faster glide
        ease: "sine.inOut",
      });
    }
    // Move Right (D)
    if (key === "m" || key === "M") {
      // Resume audio context if suspended
      if (audioListener.context.state === "suspended") {
        audioListener.context.resume();
      }

      // Toggle play/stop audio
      if (ambientSound.isPlaying) {
        ambientSound.stop();
      } else {
        ambientSound.play();
      }
    }
  };

  document.addEventListener("keydown", simulateKey);
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div id="app" ref={mountRef} className="absolute inset-0" />
      <div
        id="hit-flash"
        className="fixed top-0 left-0 w-full h-full bg-red-500 pointer-events-none"
        style={{ display: "none", zIndex: 1000 }}
      />

      <GameUI
        actorLife={actorLifeRef.current}
        distance={currentDistanceRef.current}
        time={timeRef.current}
      />

      {!gameStart && !showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center">
          <StartModal onStart={handleStart} />
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center">
          <GameOverModal
            distance={currentDistanceRef.current}
            time={timeRef.current}
            collisions={noOfCollisionsRef.current}
            restartGame={restartGame}
          />
        </div>
      )}

      {/* touch presses zone for andriod users */}
      {/* Tap Controls - visible only on small screens */}
      <div className="fixed inset-0 z-50 pointer-events-auto block md:hidden">
        {/* Left Tap Zone */}
        <div
          onClick={() => simulateKey("a")}
          className="absolute left-0 top-0 w-1/5 h-full bg-black bg-opacity-20 flex items-center justify-center text-white text-xl"
        >
          👈A - Left
        </div>

        {/* Right Tap Zone */}
        <div
          onClick={() => simulateKey("d")}
          className="absolute right-0 top-0 w-1/5 h-full bg-black bg-opacity-20 flex items-center justify-center text-white text-xl"
        >
          D - Right 👉
        </div>

        {/* Jump Tap Zone */}
        <div
          onClick={() => simulateKey("Space")}
          className="absolute bottom-0 left-1/3 w-1/3 h-1/6 bg-black bg-opacity-20 flex items-center justify-center text-white text-xl"
        >
          ⬆️ Space - Jump
        </div>

        <div
          onClick={() => simulateKey("m")}
          className="absolute top-0 left-1/3 w-1/3 h-1/6 bg-black bg-opacity-20 flex items-center justify-center text-white text-xl"
        >
          ⬆️ M - Music
        </div>
      </div>
    </div>
  );
};

export default Game;
