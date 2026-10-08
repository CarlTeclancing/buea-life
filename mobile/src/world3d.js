import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const WIDTH = 36;
const DEPTH = 24;

function mapPosition(x, y, dimensions) {
  return { x: (x / 100 - 0.5) * dimensions.width, z: (y / 100 - 0.5) * dimensions.depth };
}

function box(parent, size, position, color) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshStandardMaterial({ color, roughness: 0.9, flatShading: true }));
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
}

function building(scene, location, index, dimensions) {
  const { x, z } = mapPosition(location.x, location.y, dimensions);
  const width = 2.1 + (index % 3) * 0.35;
  const height = 1.5 + (index % 4) * 0.35;
  const house = new THREE.Group();
  box(house, [width, height, 1.8], [0, height / 2, 0], [0xd6a35d, 0xe7dfc9, 0xb85f42, 0x72a49a, 0xd2c17b][index % 5]);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(width * 0.77, 0.9, 4), new THREE.MeshStandardMaterial({ color: 0x784536, flatShading: true }));
  roof.position.y = height + 0.45;
  roof.rotation.y = Math.PI / 4;
  house.add(roof);
  box(house, [0.45, 0.85, 0.08], [0, 0.43, 0.94], 0x354e49);
  box(house, [0.36, 0.36, 0.08], [-width * 0.31, height * 0.66, 0.94], 0xc7e1df);
  box(house, [0.36, 0.36, 0.08], [width * 0.31, height * 0.66, 0.94], 0xc7e1df);
  house.position.set(x, 0, z);
  scene.add(house);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.42, 0.13), new THREE.MeshStandardMaterial({ color: 0x21463a }));
  sign.position.set(x, height + 1.05, z + 1.1);
  scene.add(sign);
}

function tree(scene, x, z, scale) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.11 * scale, 0.16 * scale, 0.9 * scale, 5), new THREE.MeshStandardMaterial({ color: 0x72513a, flatShading: true }));
  trunk.position.set(x, 0.45 * scale, z);
  scene.add(trunk);
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75 * scale, 1), new THREE.MeshStandardMaterial({ color: 0x39785c, flatShading: true }));
  crown.position.set(x, 1.25 * scale, z);
  scene.add(crown);
}

function streetLamp(scene, x, z) {
  const metal = new THREE.MeshStandardMaterial({ color: 0x3b4c43, roughness: 0.75, metalness: 0.2 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.09, 3.7, 6), metal);
  pole.position.set(x, 1.85, z);
  scene.add(pole);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.08, 0.08), metal);
  arm.position.set(x + 0.34, 3.56, z);
  scene.add(arm);
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.28), new THREE.MeshStandardMaterial({ color: 0xf5d68c, emissive: 0x9c7434, emissiveIntensity: 0.3 }));
  lamp.position.set(x + 0.68, 3.48, z);
  scene.add(lamp);
}

function kiosk(scene, x, z, color) {
  const stall = new THREE.Group();
  box(stall, [1.8, 1.25, 1.25], [0, 0.72, 0], color);
  box(stall, [2.1, 0.12, 1.5], [0, 1.43, 0], 0x794b38);
  box(stall, [1.9, 0.55, 0.08], [0, 0.95, 0.67], 0xe6d19f);
  stall.position.set(x, 0, z);
  scene.add(stall);
}

function townEdge(scene, dimensions) {
  const voidFloor = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), new THREE.MeshBasicMaterial({ color: 0x172321 }));
  voidFloor.rotation.x = -Math.PI / 2;
  voidFloor.position.y = -2.2;
  scene.add(voidFloor);
  const edgeMaterial = new THREE.MeshStandardMaterial({ color: 0x596e56, roughness: 1, flatShading: true });
  for (const side of [-1, 1]) {
    const verge = new THREE.Mesh(new THREE.BoxGeometry(dimensions.width + 1.2, 0.48, 0.55), edgeMaterial);
    verge.position.set(0, -0.24, side * (dimensions.depth / 2 - 0.1));
    scene.add(verge);
  }
}

function streetDetails(scene, dimensions) {
  const roadPaint = new THREE.MeshStandardMaterial({ color: 0xe4d8b7, roughness: 1 });
  const sidewalk = new THREE.MeshStandardMaterial({ color: 0xb8ae91, roughness: 1 });
  for (const z of [-dimensions.depth * 0.28, 1.8, dimensions.depth * 0.28]) {
    const road = new THREE.Mesh(new THREE.PlaneGeometry(dimensions.width * 0.86, z === 1.8 ? 3.4 : 2.5), new THREE.MeshStandardMaterial({ color: z === 1.8 ? 0xc9bea4 : 0xbeb394, roughness: 1 }));
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.015, z);
    scene.add(road);
    for (let x = -dimensions.width * 0.42; x < dimensions.width * 0.42; x += 3.7) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.025, 0.09), roadPaint);
      dash.position.set(x, 0.04, z);
      scene.add(dash);
    }
    for (const edge of [-1, 1]) {
      const walk = new THREE.Mesh(new THREE.PlaneGeometry(dimensions.width * 0.86, 0.62), sidewalk);
      walk.rotation.x = -Math.PI / 2;
      walk.position.set(0, 0.025, z + edge * 2.05);
      scene.add(walk);
    }
  }
  for (let index = 0; index < 7; index += 1) {
    const x = -dimensions.width * 0.4 + index * dimensions.width * 0.13;
    streetLamp(scene, x, -dimensions.depth * 0.28 - 2.1);
    if (index % 2 === 0) streetLamp(scene, x, dimensions.depth * 0.28 + 2.1);
  }
  kiosk(scene, -dimensions.width * 0.22, -dimensions.depth * 0.28 - 3.2, 0xc7834d);
  kiosk(scene, dimensions.width * 0.25, dimensions.depth * 0.28 + 3.1, 0x719284);
}

function createPerson(shirtColor) {
  const person = new THREE.Group();
  const shirt = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.9, flatShading: true });
  const skin = new THREE.MeshStandardMaterial({ color: 0x96552f, roughness: 0.9, flatShading: true });
  const trousers = new THREE.MeshStandardMaterial({ color: 0x344052, roughness: 1, flatShading: true });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.62, 0.28), shirt);
  torso.position.y = 1.05;
  person.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), skin);
  head.position.y = 1.55;
  person.add(head);
  const limbs = [];
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.48, 0.16), trousers);
    leg.position.set(side * 0.12, 0.48, 0);
    person.add(leg);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.43, 0.14), skin);
    arm.position.set(side * 0.29, 1.04, 0);
    person.add(arm);
    limbs.push(leg, arm);
  }
  person.userData.limbs = limbs;
  return person;
}

function createTaxi(color = 0xd7a747) {
  const taxi = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.72, 1.35), new THREE.MeshStandardMaterial({ color, roughness: 0.7, flatShading: true }));
  body.position.y = 0.72;
  taxi.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.62, 1.12), new THREE.MeshStandardMaterial({ color: 0x9fc6c4, roughness: 0.38, metalness: 0.12 }));
  cabin.position.set(-0.1, 1.34, 0);
  taxi.add(cabin);
  const wheels = [];
  for (const x of [-0.8, 0.8]) for (const z of [-0.67, 0.67]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.17, 9), new THREE.MeshStandardMaterial({ color: 0x24282a, roughness: 1 }));
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.38, z);
    taxi.add(wheel);
    wheels.push(wheel);
  }
  taxi.userData.wheels = wheels;
  return taxi;
}

function createCow() {
  const cow = new THREE.Group();
  const cream = new THREE.MeshStandardMaterial({ color: 0xe5ddc9, roughness: 1, flatShading: true });
  const dark = new THREE.MeshStandardMaterial({ color: 0x39352f, roughness: 1, flatShading: true });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.76, 9, 7), cream);
  body.scale.set(1.25, 0.82, 0.78);
  body.position.y = 0.92;
  cow.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 8, 6), cream);
  head.position.set(0.88, 1.18, 0);
  cow.add(head);
  for (const side of [-1, 1]) {
    const spot = new THREE.Mesh(new THREE.SphereGeometry(0.26, 7, 5), dark);
    spot.scale.set(0.65, 1, 0.16);
    spot.position.set(-0.25 + side * 0.18, 1.28, side * 0.52);
    cow.add(spot);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.63, 6), dark);
    leg.position.set(side * 0.42, 0.36, side * 0.34);
    cow.add(leg);
  }
  const horns = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.32, 5), new THREE.MeshStandardMaterial({ color: 0xb39c6b, flatShading: true }));
  horns.position.set(0.78, 1.58, -0.2);
  horns.rotation.z = -0.35;
  cow.add(horns);
  return cow;
}

function createGoat() {
  const goat = createCow();
  goat.scale.setScalar(0.55);
  goat.traverse((part) => { if (part.isMesh && part.material.color) part.material.color.setHex(0x8c765c); });
  return goat;
}

function createAvatar() {
  const avatar = new THREE.Group();
  const materials = {
    skin: new THREE.MeshStandardMaterial({ color: 0x96552f, flatShading: true }),
    shirt: new THREE.MeshStandardMaterial({ color: 0xd66a42, flatShading: true }),
    trousers: new THREE.MeshStandardMaterial({ color: 0x263d53, flatShading: true }),
    hair: new THREE.MeshStandardMaterial({ color: 0x201b18, flatShading: true })
  };
  const part = (material, size, x, y) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.position.set(x, y, 0);
    avatar.add(mesh);
    return mesh;
  };
  part(materials.shirt, [0.62, 0.8, 0.34], 0, 1.18);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6), materials.skin);
  head.position.y = 1.83;
  avatar.add(head);
  const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.045, 0.035), new THREE.MeshStandardMaterial({ color: 0x211b18, roughness: 1 }));
  eyes.position.set(0, 1.85, 0.232);
  avatar.add(eyes);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.255, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.53), materials.hair);
  hair.position.copy(head.position);
  avatar.add(hair);
  const limbs = [
    part(materials.skin, [0.19, 0.62, 0.2], -0.42, 1.22),
    part(materials.skin, [0.19, 0.62, 0.2], 0.42, 1.22),
    part(materials.trousers, [0.23, 0.62, 0.24], -0.17, 0.48),
    part(materials.trousers, [0.23, 0.62, 0.24], 0.17, 0.48)
  ];
  part(materials.hair, [0.3, 0.14, 0.42], -0.17, 0.13);
  part(materials.hair, [0.3, 0.14, 0.42], 0.17, 0.13);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.58, 12), new THREE.MeshBasicMaterial({ color: 0x25352b, transparent: true, opacity: 0.28, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  avatar.add(shadow);
  avatar.userData.limbs = limbs;
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
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.4));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.domElement.className = 'world3d-canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.prepend(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xe7f4e8, 0x536a4a, 2.1));
  const sun = new THREE.DirectionalLight(0xffe4bd, 2.4);
  sun.position.set(-12, 24, 10);
  scene.add(sun);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(dimensions.width, dimensions.depth), new THREE.MeshStandardMaterial({ color: 0x82a77b, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.08;
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
  townEdge(scene, dimensions);
  streetDetails(scene, dimensions);
  for (let i = 0; i < 5; i += 1) {
    const mountain = new THREE.Mesh(new THREE.ConeGeometry(7 + i * 0.7, 8 + (i % 2) * 2, 5), new THREE.MeshStandardMaterial({ color: 0x668b79, flatShading: true }));
    mountain.position.set(-dimensions.width * 0.55 + i * dimensions.width * 0.275, 2.3, -dimensions.depth * 0.82 - (i % 2) * 2);
    mountain.rotation.y = i * 0.7;
    scene.add(mountain);
  }
  locations.forEach((location, index) => building(scene, location, index, dimensions));
  for (let i = 0; i < 42; i += 1) {
    const x = (Math.sin(i * 12.9898) * 0.5 + 0.5) * (dimensions.width - 2) - (dimensions.width - 2) / 2;
    const z = (Math.sin(i * 78.233 + 1.4) * 0.5 + 0.5) * (dimensions.depth - 2) - (dimensions.depth - 2) / 2;
    const nearBuilding = locations.some((location) => {
      const point = mapPosition(location.x, location.y, dimensions);
      return Math.hypot(point.x - x, point.z - z) < 2.9;
    });
    if (Math.abs(z - 1.8) > 2.2 && Math.abs(x + 4) > 2.2 && !nearBuilding) tree(scene, x, z, 0.72 + (i % 5) * 0.1);
  }

  const ambientActors = [];
  let level = Math.max(1, sceneOptions.level || 1);
  for (let i = 0; i < 4; i += 1) {
    const person = createPerson([0x39745d, 0xd66a42, 0x55769a, 0xb69a54][i]);
    const originX = -dimensions.width * 0.28 + i * dimensions.width * 0.18;
    const originZ = 0.05 + (i % 2) * 3.8;
    person.position.set(originX, 0, originZ);
    person.scale.setScalar(0.78 + (i % 2) * 0.12);
    scene.add(person);
    ambientActors.push({ group: person, originX, originZ, speed: 0.00065 + i * 0.00011, range: 1.1 + (i % 2) * 0.6, phase: i * 2.2, unlock: 1, walk: true });
  }
  for (let i = 0; i < 2; i += 1) {
    const taxi = createTaxi(i === 0 ? 0xd7a747 : 0x4d8872);
    const originZ = 1.8 + (i ? 0.75 : -0.75);
    taxi.position.set(-dimensions.width / 2 - 2 - i * 8, 0, originZ);
    scene.add(taxi);
    ambientActors.push({ group: taxi, originX: -dimensions.width / 2 - 2 - i * 8, originZ, speed: 0.001 + i * 0.0002, range: dimensions.width + 8, phase: i * 3, unlock: i ? 12 : 1, traffic: true });
  }
  const cow = createCow();
  cow.position.set(dimensions.width * 0.3, 0, dimensions.depth * 0.28);
  scene.add(cow);
  ambientActors.push({ group: cow, originX: cow.position.x, originZ: cow.position.z, speed: 0.00025, range: 1.6, phase: 1.2, unlock: 4 });
  const goat = createGoat();
  goat.position.set(-dimensions.width * 0.32, 0, dimensions.depth * 0.34);
  scene.add(goat);
  ambientActors.push({ group: goat, originX: goat.position.x, originZ: goat.position.z, speed: 0.00038, range: 1.2, phase: 4, unlock: 8 });
  let activityUntil = 0;

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
  const pointers = new Map();
  let pinchStart = null;
  let focusMotion = null;
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
    if (event.target.closest('button, .activity-sheet, .mission-banner, .interaction-bar')) return;
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
      actor.group.position.x = actor.originX + Math.sin(movementPhase) * actor.range;
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
      avatar.userData.limbs.forEach((limbPart, index) => { limbPart.rotation.x = swing * (index % 2 ? -1 : 1); });
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
      focusMotion = {
        fromTarget: cameraTarget.clone(),
        toTarget: new THREE.Vector3(position.x, 0, position.z),
        fromDistance: cameraDistance,
        toDistance: Math.max(18, cameraDistance * 0.8),
        direction: camera.position.clone().sub(cameraTarget).normalize(),
        started: performance.now()
      };
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
