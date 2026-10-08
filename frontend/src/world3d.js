import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const WIDTH = 36;
const DEPTH = 24;

function mapPosition(x, y, dimensions) {
  return { x: (x / 100 - 0.5) * dimensions.width, z: (y / 100 - 0.5) * dimensions.depth };
}

function addBox(parent, dimensions, position, color, castShadow = false) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...dimensions), new THREE.MeshStandardMaterial({ color, roughness: 0.88, flatShading: true }));
  mesh.position.set(...position);
  mesh.castShadow = castShadow;
  parent.add(mesh);
  return mesh;
}

function addBuilding(scene, location, index, dimensions) {
  const { x, z } = mapPosition(location.x, location.y, dimensions);
  const group = new THREE.Group();
  const palette = [0xd6a35d, 0xe7dfc9, 0xb85f42, 0x72a49a, 0xd2c17b];
  const width = 2.1 + (index % 3) * 0.35;
  const height = 1.5 + (index % 4) * 0.35;
  addBox(group, [width, height, 1.8], [0, height / 2, 0], palette[index % palette.length], true);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(width * 0.77, 0.9, 4), new THREE.MeshStandardMaterial({ color: 0x784536, roughness: 1, flatShading: true }));
  roof.position.set(0, height + 0.45, 0);
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  group.add(roof);
  addBox(group, [0.45, 0.85, 0.08], [0, 0.43, 0.94], 0x354e49);
  addBox(group, [0.36, 0.36, 0.08], [-width * 0.31, height * 0.66, 0.94], 0xc7e1df);
  addBox(group, [0.36, 0.36, 0.08], [width * 0.31, height * 0.66, 0.94], 0xc7e1df);
  group.position.set(x, 0, z);
  scene.add(group);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.42, 0.13), new THREE.MeshStandardMaterial({ color: 0x21463a, roughness: 0.78 }));
  sign.position.set(x, height + 1.05, z + 1.1);
  scene.add(sign);
}

function addTree(scene, x, z, size = 1) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.11 * size, 0.16 * size, 0.9 * size, 5), new THREE.MeshStandardMaterial({ color: 0x72513a, flatShading: true }));
  trunk.position.set(x, 0.45 * size, z);
  trunk.castShadow = true;
  scene.add(trunk);
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75 * size, 1), new THREE.MeshStandardMaterial({ color: 0x39785c, roughness: 1, flatShading: true }));
  crown.position.set(x, 1.25 * size, z);
  crown.castShadow = true;
  scene.add(crown);
}

function createPerson(color) {
  const group = new THREE.Group();
  const shirt = new THREE.MeshStandardMaterial({ color, roughness: 0.9, flatShading: true });
  const skin = new THREE.MeshStandardMaterial({ color: 0x96552f, roughness: 0.9, flatShading: true });
  const trousers = new THREE.MeshStandardMaterial({ color: 0x344052, roughness: 1, flatShading: true });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.62, 0.28), shirt);
  torso.position.y = 1.05;
  group.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), skin);
  head.position.y = 1.55;
  group.add(head);
  const limbs = [];
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.48, 0.16), trousers);
    leg.position.set(side * 0.12, 0.48, 0);
    group.add(leg);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.43, 0.14), skin);
    arm.position.set(side * 0.29, 1.04, 0);
    group.add(arm);
    limbs.push(leg, arm);
  }
  group.userData.limbs = limbs;
  return group;
}

function createTaxi(color) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.72, 1.35), new THREE.MeshStandardMaterial({ color, roughness: 0.7, flatShading: true }));
  body.position.y = 0.72;
  group.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.62, 1.12), new THREE.MeshStandardMaterial({ color: 0x9fc6c4, roughness: 0.38, metalness: 0.12 }));
  cabin.position.set(-0.1, 1.34, 0);
  group.add(cabin);
  const wheels = [];
  for (const x of [-0.8, 0.8]) for (const z of [-0.67, 0.67]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.17, 9), new THREE.MeshStandardMaterial({ color: 0x24282a, roughness: 1 }));
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.38, z);
    group.add(wheel);
    wheels.push(wheel);
  }
  group.userData.wheels = wheels;
  return group;
}

function createAnimal(color, scale = 1) {
  const group = new THREE.Group();
  const coat = new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.76, 9, 7), coat);
  body.scale.set(1.25, 0.82, 0.78);
  body.position.y = 0.92;
  group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 8, 6), coat);
  head.position.set(0.88, 1.18, 0);
  group.add(head);
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.63, 6), coat);
    leg.position.set(side * 0.42, 0.36, side * 0.34);
    group.add(leg);
  }
  group.scale.setScalar(scale);
  return group;
}

function createAvatar() {
  const avatar = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0x96552f, roughness: 0.92, flatShading: true });
  const green = new THREE.MeshStandardMaterial({ color: 0xd66a42, roughness: 0.85, flatShading: true });
  const dark = new THREE.MeshStandardMaterial({ color: 0x263d53, roughness: 0.95, flatShading: true });
  const hair = new THREE.MeshStandardMaterial({ color: 0x201b18, roughness: 1, flatShading: true });
  const limb = (material, dimensions, x, y) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...dimensions), material);
    mesh.position.set(x, y, 0);
    mesh.castShadow = true;
    avatar.add(mesh);
    return mesh;
  };
  limb(green, [0.62, 0.8, 0.34], 0, 1.18);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6), skin);
  head.position.set(0, 1.83, 0);
  head.castShadow = true;
  avatar.add(head);
  const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.045, 0.035), new THREE.MeshStandardMaterial({ color: 0x211b18, roughness: 1 }));
  eyes.position.set(0, 1.85, 0.232);
  avatar.add(eyes);
  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.255, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.53), hair);
  hairCap.position.copy(head.position);
  avatar.add(hairCap);
  const arms = [limb(skin, [0.19, 0.62, 0.2], -0.42, 1.22), limb(skin, [0.19, 0.62, 0.2], 0.42, 1.22)];
  const legs = [limb(dark, [0.23, 0.62, 0.24], -0.17, 0.48), limb(dark, [0.23, 0.62, 0.24], 0.17, 0.48)];
  limb(hair, [0.3, 0.14, 0.42], -0.17, 0.13);
  limb(hair, [0.3, 0.14, 0.42], 0.17, 0.13);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.58, 12), new THREE.MeshBasicMaterial({ color: 0x25352b, transparent: true, opacity: 0.28, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  avatar.add(shadow);
  avatar.userData.limbs = [...arms, ...legs];
  return avatar;
}

export function mountWorldScene(container, locations, position, sceneOptions = {}) {
  const aspect = container.clientWidth / container.clientHeight;
  const dimensions = aspect < 0.75 ? { width: 16, depth: 30 } : { width: WIDTH, depth: DEPTH };
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xb9d9d2);
  scene.fog = new THREE.Fog(0xb9d9d2, 35, 80);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 120);
  camera.position.set(0, aspect < 0.75 ? 34 : 24, aspect < 0.75 ? 37 : 31);
  camera.lookAt(0, 0, 0);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.4));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = false;
  renderer.domElement.className = 'world3d-canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.prepend(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xe7f4e8, 0x536a4a, 2.1));
  const sun = new THREE.DirectionalLight(0xffe4bd, 2.4);
  sun.position.set(-12, 24, 10);
  scene.add(sun);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(dimensions.width, dimensions.depth), new THREE.MeshStandardMaterial({ color: 0x82a77b, roughness: 1, flatShading: true }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.08;
  ground.receiveShadow = true;
  scene.add(ground);
  const roadMaterial = new THREE.MeshStandardMaterial({ color: 0xc8bda2, roughness: 1 });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(dimensions.width, 3.2), roadMaterial);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0, 1.8);
  scene.add(road);
  const crossRoad = new THREE.Mesh(new THREE.PlaneGeometry(3.1, dimensions.depth), roadMaterial);
  crossRoad.rotation.x = -Math.PI / 2;
  crossRoad.position.set(-4, 0.01, 0);
  scene.add(crossRoad);

  for (let index = 0; index < 5; index += 1) {
    const mountain = new THREE.Mesh(new THREE.ConeGeometry(7 + index * 0.7, 8 + (index % 2) * 2, 5), new THREE.MeshStandardMaterial({ color: 0x668b79, roughness: 1, flatShading: true }));
    mountain.position.set(-dimensions.width * 0.55 + index * dimensions.width * 0.275, 2.3, -dimensions.depth * 0.82 - (index % 2) * 2);
    mountain.rotation.y = index * 0.7;
    scene.add(mountain);
  }
  locations.forEach((location, index) => addBuilding(scene, location, index, dimensions));
  for (let index = 0; index < 42; index += 1) {
    const x = (Math.sin(index * 12.9898) * 0.5 + 0.5) * (dimensions.width - 2) - (dimensions.width - 2) / 2;
    const z = (Math.sin(index * 78.233 + 1.4) * 0.5 + 0.5) * (dimensions.depth - 2) - (dimensions.depth - 2) / 2;
    const nearBuilding = locations.some((location) => {
      const point = mapPosition(location.x, location.y, dimensions);
      return Math.hypot(point.x - x, point.z - z) < 2.9;
    });
    if (Math.abs(z - 1.8) > 2.2 && Math.abs(x + 4) > 2.2 && !nearBuilding) addTree(scene, x, z, 0.72 + (index % 5) * 0.1);
  }

  let level = Math.max(1, sceneOptions.level || 1);
  let activityUntil = 0;
  const ambientActors = [];
  for (let index = 0; index < 4; index += 1) {
    const person = createPerson([0x39745d, 0xd66a42, 0x55769a, 0xb69a54][index]);
    const originX = -dimensions.width * 0.28 + index * dimensions.width * 0.18;
    const originZ = 0.05 + (index % 2) * 3.8;
    person.position.set(originX, 0, originZ);
    person.scale.setScalar(0.78 + (index % 2) * 0.12);
    scene.add(person);
    ambientActors.push({ group: person, originX, originZ, speed: 0.00065 + index * 0.00011, range: 1.1 + (index % 2) * 0.6, phase: index * 2.2, unlock: 1, walk: true });
  }
  for (let index = 0; index < 2; index += 1) {
    const taxi = createTaxi(index === 0 ? 0xd7a747 : 0x4d8872);
    const originZ = 1.8 + (index ? 0.75 : -0.75);
    const originX = -dimensions.width / 2 - 2 - index * 8;
    taxi.position.set(originX, 0, originZ);
    scene.add(taxi);
    ambientActors.push({ group: taxi, originX, originZ, speed: 0.001 + index * 0.0002, phase: index * 3, unlock: index ? 12 : 1, traffic: true });
  }
  const cow = createAnimal(0xe5ddc9);
  cow.position.set(dimensions.width * 0.3, 0, dimensions.depth * 0.28);
  scene.add(cow);
  ambientActors.push({ group: cow, originX: cow.position.x, originZ: cow.position.z, speed: 0.00025, range: 1.6, phase: 1.2, unlock: 4 });
  const goat = createAnimal(0x8c765c, 0.55);
  goat.position.set(-dimensions.width * 0.32, 0, dimensions.depth * 0.34);
  scene.add(goat);
  ambientActors.push({ group: goat, originX: goat.position.x, originZ: goat.position.z, speed: 0.00038, range: 1.2, phase: 4, unlock: 8 });

  const avatar = createAvatar();
  const start = mapPosition(position.x, position.y, dimensions);
  avatar.scale.setScalar(1.7);
  avatar.position.set(start.x + 2.3, 0, start.z + 1.1);
  scene.add(avatar);
  let frame = 0;
  let disposed = false;
  let movement = null;
  let lastTime = 0;
  let activeContainer = container;
  let cameraTarget = new THREE.Vector3(0, 0, 0);
  let cameraDistance = camera.position.distanceTo(cameraTarget);
  let focusMotion = null;
  const pointers = new Map();
  let pinchStart = null;
  const markerPositions = new Map(locations.map((location) => [location.id, mapPosition(location.x, location.y, dimensions)]));
  const resizeObserver = new ResizeObserver(() => {
    const { width, height } = activeContainer.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  });
  resizeObserver.observe(container);
  const initialBounds = container.getBoundingClientRect();
  if (initialBounds.width > 0 && initialBounds.height > 0) {
    camera.aspect = initialBounds.width / initialBounds.height;
    camera.updateProjectionMatrix();
    renderer.setSize(initialBounds.width, initialBounds.height, false);
  }
  function applyZoom(nextDistance) {
    cameraDistance = THREE.MathUtils.clamp(nextDistance, 18, aspect < 0.75 ? 72 : 54);
    const direction = camera.position.clone().sub(cameraTarget).normalize();
    camera.position.copy(cameraTarget).addScaledVector(direction, cameraDistance);
    camera.lookAt(cameraTarget);
  }
  function onPointerDown(event) {
    if (event.target.closest('button, .activity-sheet, .leaderboard-sheet, .mission-banner, .interaction-bar')) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2) {
      const [first, second] = [...pointers.values()];
      pinchStart = { distance: Math.hypot(first.x - second.x, first.y - second.y), zoom: cameraDistance };
    }
  }
  function onPointerMove(event) {
    const previous = pointers.get(event.pointerId);
    if (!previous) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size >= 2 && pinchStart) {
      const [first, second] = [...pointers.values()];
      applyZoom(pinchStart.zoom * pinchStart.distance / Math.max(1, Math.hypot(first.x - second.x, first.y - second.y)));
      return;
    }
    const scale = cameraDistance / Math.max(1, activeContainer.clientWidth) * 0.9;
    cameraTarget.x -= (event.clientX - previous.x) * scale;
    cameraTarget.z += (event.clientY - previous.y) * scale;
    camera.position.x = cameraTarget.x;
    camera.position.z = cameraTarget.z + cameraDistance * 0.84;
    camera.lookAt(cameraTarget);
  }
  function onPointerUp(event) {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinchStart = null;
  }
  function onWheel(event) {
    event.preventDefault();
    applyZoom(cameraDistance * (event.deltaY > 0 ? 1.08 : 0.92));
  }
  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerup', onPointerUp);
  container.addEventListener('pointercancel', onPointerUp);
  container.addEventListener('wheel', onWheel, { passive: false });
  function positionMarkers() {
    for (const marker of activeContainer.querySelectorAll('.location-marker')) {
      const location = locations.find((entry) => entry.id === marker.dataset.location);
      const position = markerPositions.get(marker.dataset.location);
      if (!location || !position) continue;
      const height = 1.5 + (locations.indexOf(location) % 4) * 0.35;
      const projected = new THREE.Vector3(position.x, height + 1.3, position.z + 1.1).project(camera);
      const projectedX = (projected.x * 0.5 + 0.5) * activeContainer.clientWidth;
      const safeX = THREE.MathUtils.clamp(projectedX, marker.offsetWidth / 2 + 6, activeContainer.clientWidth - marker.offsetWidth / 2 - 6);
      marker.style.left = `${(safeX / activeContainer.clientWidth) * 100}%`;
      marker.style.top = `${(-projected.y * 0.5 + 0.5) * 100}%`;
    }
  }
  const render = (time) => {
    if (disposed) return;
    frame = requestAnimationFrame(render);
    if (time - lastTime < 28) return;
    lastTime = time;
    avatar.position.y = 0.025 + Math.sin(time * 0.004) * 0.025;
    for (const actor of ambientActors) {
      actor.group.visible = level >= actor.unlock;
      if (!actor.group.visible) continue;
      const activityBoost = time < activityUntil ? 1.7 : 1;
      const movementPhase = time * actor.speed * activityBoost + actor.phase;
      actor.group.position.x = actor.originX + Math.sin(movementPhase) * (actor.range || 0);
      if (actor.traffic) {
        actor.group.position.x = ((actor.originX + movementPhase * 5 + dimensions.width / 2 + 2) % (dimensions.width + 8)) - dimensions.width / 2 - 2;
        actor.group.userData.wheels.forEach((wheel) => { wheel.rotation.z = movementPhase * 7; });
      } else if (actor.walk) {
        actor.group.position.z = actor.originZ + Math.sin(movementPhase * 0.7) * 0.35;
        actor.group.userData.limbs.forEach((limb, index) => { limb.rotation.x = Math.sin(movementPhase * 7 + index * Math.PI) * 0.16; });
      } else {
        actor.group.rotation.y = Math.sin(movementPhase) * 0.28;
      }
    }
    if (movement) {
      const progress = Math.min((time - movement.started) / 650, 1);
      const eased = progress * progress * (3 - 2 * progress);
      avatar.position.x = THREE.MathUtils.lerp(movement.fromX, movement.toX, eased);
      avatar.position.z = THREE.MathUtils.lerp(movement.fromZ, movement.toZ, eased);
      avatar.rotation.y = movement.heading;
      const swing = Math.sin(progress * Math.PI * 8) * (1 - progress) * 0.42;
      avatar.userData.limbs.forEach((part, index) => { part.rotation.x = swing * (index % 2 ? -1 : 1); });
      if (progress === 1) movement = null;
    }
    if (focusMotion) {
      const progress = Math.min((time - focusMotion.started) / 520, 1);
      const eased = progress * progress * (3 - 2 * progress);
      cameraTarget.lerpVectors(focusMotion.fromTarget, focusMotion.toTarget, eased);
      cameraDistance = THREE.MathUtils.lerp(focusMotion.fromDistance, focusMotion.toDistance, eased);
      camera.position.copy(cameraTarget).addScaledVector(focusMotion.direction, cameraDistance);
      camera.lookAt(cameraTarget);
      if (progress >= 1) focusMotion = null;
    }
    renderer.render(scene, camera);
    positionMarkers();
  };
  frame = requestAnimationFrame(render);
  return {
    attach(nextContainer) {
      if (activeContainer === nextContainer) return;
      resizeObserver.disconnect();
      activeContainer.removeEventListener('pointerdown', onPointerDown);
      activeContainer.removeEventListener('pointermove', onPointerMove);
      activeContainer.removeEventListener('pointerup', onPointerUp);
      activeContainer.removeEventListener('pointercancel', onPointerUp);
      activeContainer.removeEventListener('wheel', onWheel);
      activeContainer = nextContainer;
      nextContainer.prepend(renderer.domElement);
      resizeObserver.observe(nextContainer);
      nextContainer.addEventListener('pointerdown', onPointerDown);
      nextContainer.addEventListener('pointermove', onPointerMove);
      nextContainer.addEventListener('pointerup', onPointerUp);
      nextContainer.addEventListener('pointercancel', onPointerUp);
      nextContainer.addEventListener('wheel', onWheel, { passive: false });
      positionMarkers();
    },
    movePlayer(x, y) {
      const next = mapPosition(x, y, dimensions);
      const toX = next.x + 2.3;
      const toZ = next.z + 1.1;
      if (Math.hypot(avatar.position.x - toX, avatar.position.z - toZ) < 0.05) return;
      movement = { fromX: avatar.position.x, fromZ: avatar.position.z, toX, toZ, heading: Math.atan2(toX - avatar.position.x, toZ - avatar.position.z), started: performance.now() };
    },
    focusLocation(x, y) {
      const position = mapPosition(x, y, dimensions);
      focusMotion = { fromTarget: cameraTarget.clone(), toTarget: new THREE.Vector3(position.x, 0, position.z), fromDistance: cameraDistance, toDistance: Math.max(18, cameraDistance * 0.8), direction: camera.position.clone().sub(cameraTarget).normalize(), started: performance.now() };
    },
    zoom(factor) {
      applyZoom(cameraDistance * factor);
    },
    setLevel(nextLevel) {
      level = Math.max(1, nextLevel || 1);
    },
    activityPulse() {
      activityUntil = performance.now() + 1800;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      activeContainer.removeEventListener('pointerdown', onPointerDown);
      activeContainer.removeEventListener('pointermove', onPointerMove);
      activeContainer.removeEventListener('pointerup', onPointerUp);
      activeContainer.removeEventListener('pointercancel', onPointerUp);
      activeContainer.removeEventListener('wheel', onWheel);
      scene.traverse((object) => {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
        else object.material?.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    }
  };
}