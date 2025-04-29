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

const Game = () => {
  let actorMesh, boulder1, boulder2, plant, floor;
  let actorBody, boulder1Body, boulder2Body, obstacleBody;
  const mountRef = useRef(null);
  let obstacles = [];
  const [gameStart, isGameStart] = useState(false);
  const clock = new THREE.Clock();
  const [showModal, setShowModal] = useState(false);

  //ref
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
  // Initialize the scene
  const scene = new THREE.Scene();

  // Physics world setup
  const world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);

  scene.background = new THREE.Color(0x87ceeb);
  const loader = new GLTFLoader();
  //Canvas
  const canvas = document.querySelector("canvas.webgl");

  // Initialize the camera
  const camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  //jump camera
  const jumpCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  //Lights
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

  //Default Material
  const defaultMaterial = new CANNON.Material("default");
  const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
      friction: 0.1,
      restitution: 0.7,
    }
  );
  world.addContactMaterial(defaultContactMaterial);
  //HDR
  // const rgbeLoader = new RGBELoader();
  // rgbeLoader.load("/textures/environmentMap/meadow_2_4k.hdr", (texture) => {
  //   texture.mapping = THREE.EquirectangularReflectionMapping; // Very important!

  //   scene.environment = texture; // 👈 This will give objects realistic reflections
  //   scene.background = texture; // 👈 Optional: If you want the skybox to show the forest
  // });

  //Obstacles loader
  loader.load("/textures/boulder1/namaqualand_boulder_02_2k.gltf", (gltf) => {
    boulder1 = gltf.scene;

    boulder1.position.y = 2;

    // Create physics body for boulder1
    const shape = new CANNON.Box(new CANNON.Vec3(0.8, 0.8, 0.8)); // simple box around it
    boulder1Body = new CANNON.Body({
      material: defaultMaterial,
      mass: 0, // static object
      shape: shape,
      position: new CANNON.Vec3(
        boulder1.position.x,
        boulder1.position.y,
        boulder1.position.z
      ),
    });
    boulder1Body.castShadow = true;
    world.addBody(boulder1Body);
  });

  loader.load("/textures/boulder2/namaqualand_boulder_03_2k.gltf", (gltf) => {
    boulder2 = gltf.scene;
    boulder2.position.y = 3;

    // // Create physics body for boulder2
    const shape = new CANNON.Box(new CANNON.Vec3(0.8, 0.8, 0.8));
    boulder2Body = new CANNON.Body({
      material: defaultMaterial,
      mass: 0,
      shape: shape,
      position: new CANNON.Vec3(
        boulder2.position.x,
        boulder2.position.y,
        boulder2.position.z
      ),
    });
    boulder2Body.castShadow = true;
    world.addBody(boulder2Body);
  });

  loader.load("/textures/plant/didelta_spinosa_2k.gltf", (gltf) => {
    plant = gltf.scene;
  });

  //Actor Mesh
  // Load actor model
  loader.load("/textures/football/dirty_football_2k.gltf", (gltf) => {
    actorMesh = gltf.scene;
    actorMesh.scale.set(4, 4, 4);
    actorMesh.position.y = 0.1;

    actorMesh.envMapIntensity = 1.5;
    actorMesh.castShadow = true;
    scene.add(actorMesh);

    // Use SPHERE shape for ball
    const actorShape = new CANNON.Sphere(0.5); // 1 = radius
    actorBody = new CANNON.Body({
      mass: 1, // ball can move
      material: defaultMaterial,
      shape: actorShape,
      position: new CANNON.Vec3(0, 5, 0), // start a little higher
    });

    actorBody.castShadow = true;
    actorBody.receiveShadow = false;
    actorBody.linearDamping = 0.05; // less slow down when moving
    actorBody.angularDamping = 0.05; // less slow down when rotating
    world.addBody(actorBody);
  });

  //Update day and night
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

  //texture Loader
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

  // Set repeat settings for all textures
  floorTextures.forEach((tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
  });

  //Floors
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

    //Floor Physics Body
    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body();
    floorBody.material = defaultMaterial;
    floorBody.mass = 0; //static at origin
    floorBody.addShape(floorShape);
    floorBody.position.set(0, 1, 0);
    floorBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(-1, 0, 0),
      Math.PI * 0.5
    );
    world.addBody(floorBody);

    //new obstacle spawn
    // Spawn obstacles only if models are loaded
    if (type >= 5 && boulder1 && boulder2 && plant) {
      const obstacleOptions = [
        { mesh: boulder1, size: new CANNON.Vec3(0.5, 1, 0.5) },
        { mesh: boulder2, size: new CANNON.Vec3(0.5, 1, 0.5) },
        { mesh: plant, size: new CANNON.Vec3(0.5, 1, 0.5) }, // Smaller collision for plant
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
        const scale = 0.9 + Math.random() * 0.5;

        obstacle.scale.set(scale, scale, scale);
        obstacle.position.set(x, 0.2, obstacleZ);
        obstacle.castShadow = true;
        scene.add(obstacle);

        // Create physics body for obstacle
        const obstacleShape = new CANNON.Box(size);
        obstacleBody = new CANNON.Body({
          mass: 0,
          shape: obstacleShape,
          position: new CANNON.Vec3(x, size.y + 0.2, obstacleZ),
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
      // Loop from end to start
      const floor = floors[i];
      if (floor.position.z < actorMesh.position.z - 50) {
        // 👈 if floor is far behind
        scene.remove(floor); // remove from scene
        floor.geometry.dispose(); // free memory
        floor.material.dispose(); // free material
        floors.splice(i, 1); // remove from array
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
    ambientSound.setVolume(0.5);
  });

  window.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
      isJumping = false;
    }
  });

  //key presses
  const handleKey = (e) => {
    if (!actorBody) return;

    let moveDistance = 2; // 👈 How far you want actor glide left or right

    if (e.code === "Space") {
      jump();
      isJumping = true;
    }

    // Move Left (A)
    if (e.key === "a" || e.key === "A") {
      gsap.to(actorBody.position, {
        x: actorBody.position.x + moveDistance, // 👈 Move left (minus x)
        duration: 0.2, // Faster glide
        ease: "power2.out",
      });
    }

    // Move Right (D)
    if (e.key === "d" || e.key === "D") {
      gsap.to(actorBody.position, {
        x: actorBody.position.x - moveDistance, // 👈 Move right (plus x)
        duration: 0.2, // Faster glide
        ease: "power2.out",
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
  };

  const handleStop = () => {
    setShowModal(true);
    isGameStart(false);
  };

  //check collision detection
  // More precise collision detection
  const checkCollision = (obstacle) => {
    if (!obstacle?.mesh || !actorMesh) return;

    // Only check obstacles within a reasonable distance
    const distance = Math.abs(obstacle.mesh.position.z - actorMesh.position.z);
    if (distance > 0.05) return; // Skip obstacles too far away

    // Create bounding boxes with proper size
    const actorBox = new THREE.Box3().setFromObject(actorMesh);
    const obstacleBox = new THREE.Box3().setFromObject(obstacle.mesh);

    // Adjust bounding box sizes for more precise collision
    actorBox.min.y += 0.2; // Adjust collision box height
    actorBox.max.y -= 0.2;

    // Check for intersection
    if (actorBox.intersectsBox(obstacleBox)) {
      handleCollision();
    }
  };

  const handleCollision = () => {
    noOfCollisionsRef.current += 1;

    const collisions = document.getElementById("collisions");
    if (collisions) {
      collisions.innerText = `Collisions: ${Math.floor(
        noOfCollisionsRef.current
      )}`;
    }

    //Visual feedback
    const hitFlash = document.getElementById("hit-flash");
    if (hitFlash) {
      hitFlash.style.opacity = "0.5";
      setTimeout(() => {
        hitFlash.style.opacity = "0";
      }, 200);
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
    // Only allow jump if actor is standing on something (y-velocity is almost 0)
    if (Math.abs(actorBody.velocity.y) < 0.1) {
      actorBody.velocity.y = 10; // You can tweak this 8 to make the jump higher or smaller
    }

    // Play the jump sound
    jumpAudio.volume = 0.5; // Half the original volume
    jumpAudio.play();
  };

  let animationId;

  const animate = () => {
    if (!gameStart) return;
    controls.update();

    animationId = window.requestAnimationFrame(animate);

    //

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
      timeElement.innerText = `Time: ${timeRef.current}`;
    }

    if (actorBody && actorMesh) {
      if (camera.fov !== targetFov) {
        camera.fov += (targetFov - camera.fov) * 0.05;
        camera.updateProjectionMatrix();
      }

      /////////////////////////////////
      // // Update position with acceleration
      const baseSpeed = 0.7;
      const distanceScale = currentDistanceRef.current / 50;
      const acceleration = Math.min(1 + Math.log(distanceScale + 1), 4);
      const currentSpeed = baseSpeed * acceleration;

      gsap.to(actorBody.position, {
        z: actorBody.position.z + currentSpeed,
        duration: 0.2,
        ease: "bounce.out",
      });

      // Clean up and check collisions
      cleanupObstacles();

      // Only check nearby obstacles
      obstaclesRef.current.forEach((obstacle) => {
        checkCollision(obstacle);
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
        healthBar.innerText = `Health: ${Math.floor(actorLifeRef.current)} %`;
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
          distanceDiv.innerText = `Distance: ${Math.floor(
            currentDistanceRef.current
          )} meters`;
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
        actorBody.angularVelocity.set(5, 0, 0);
        actorMesh.position.copy(actorBody.position);
        actorMesh.quaternion.copy(actorBody.quaternion); // If you allow rotation
      }

      // Update camera position with smooth follow
      const idealCameraPos = new THREE.Vector3(
        actorMesh.position.x,
        actorMesh.position.y + 5,
        actorMesh.position.z - 10
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

    // Update jumpCamera to always look at actor from side
    if (actorBody && actorMesh) {
      if (isJumping) {
        if (actorBody.position.y > 0.1) {
          jumpCamera.position.set(
            actorMesh.position.x - 3, // not full side (-5), slight diagonal
            actorMesh.position.y + 5, // higher view to show jump arc
            actorMesh.position.z - 6 // slight backward for depth
          );
          jumpCamera.lookAt(actorMesh.position);
        }
      }
    }

    const cameraToUse = isJumping ? jumpCamera : camera;

    renderer.render(scene, cameraToUse);
  };

  const restartGame = () => {
    setShowModal(false);
    isGameStart(true);
    currentDistanceRef.current = 0;
    noOfCollisionsRef.current = 0;

    // Reset distance display
    const distanceDiv = document.getElementById("distance");
    if (distanceDiv) {
      distanceDiv.innerText = "Distance: 0 meters";
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

  return (
    // <div className="relative w-full h-screen">
    //   <div ref={mountRef} className="absolute inset-0" />
    //   {/* Game UI */}
    //   <div
    //     id="hit-flash"
    //     className="fixed top-0 left-0 w-full h-full bg-red-500 opacity-0 pointer-events-none transition-opacity duration-300 z-[1000]"
    //   ></div>
    //   <div id="game-ui" className="absolute top-0 left-0 z-20">
    //     <div id="player-life">Health: {actorLife} %</div>
    //     <div id="distance">Distance: {currentDistanceRef.current} meters</div>
    //     <div id="collisions">Collisions: {noOfCollisionsRef.current}</div>
    //     <div id="time">Time: {timeRef.current} seconds</div>
    //   </div>
    //   {/* Start Modal */}
    //   <StartModal onStart={handleStart} />
    //   {/* Game Over Modal */}
    //   {showModal && (
    //     <div className="fixed inset-0 z-[2000]">
    //       <GameOverModal
    //         distance={currentDistanceRef.current}
    //         time={timeRef.current}
    //         restartGame={restartGame}
    //       />
    //     </div>
    //   )}
    //   ;
    //   <div
    //     id="hit-flash"
    //     className="absolute inset-0 bg-red-600 opacity-0 pointer-events-none"
    //   ></div>
    // </div>
    <div className="relative w-full h-screen overflow-hidden">
      <div ref={mountRef} className="absolute inset-0" />

      <div
        id="hit-flash"
        className="fixed top-0 left-0 w-full h-full bg-red-500 opacity-0 pointer-events-none transition-opacity duration-300 z-[1000]"
      ></div>

      <GameUI
        actorLife={actorLifeRef.current}
        distance={currentDistanceRef.current}
        time={timeRef.current}
        collisions={noOfCollisionsRef.current}
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
    </div>
  );
};

export default Game;
