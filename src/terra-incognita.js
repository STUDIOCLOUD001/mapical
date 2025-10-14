// Import dependencies from CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js';
import { createNoise2D } from 'https://cdn.jsdelivr.net/npm/simplex-noise@4.0.3/dist/esm/simplex-noise.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color('#f5f3ed');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 12, 45);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
document.getElementById('canvas-container').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 30;
controls.maxDistance = 150;

// Track user interaction
let userHasInteracted = false;
const onInteraction = () => {
    userHasInteracted = true;
};

renderer.domElement.addEventListener('mousedown', onInteraction);
renderer.domElement.addEventListener('touchstart', onInteraction);
renderer.domElement.addEventListener('wheel', onInteraction);

// Lighting
const ambientLight = new THREE.AmbientLight(0xfff4e6, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xfff8dc, 1.5);
directionalLight.position.set(30, 40, 20);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 200;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
scene.add(directionalLight);

const fillLight = new THREE.DirectionalLight(0xe8d4b8, 0.4);
fillLight.position.set(-20, 15, -15);
scene.add(fillLight);

const skyLight = new THREE.HemisphereLight(0x87ceeb, 0xd2b48c, 0.5);
scene.add(skyLight);

// Noise function
const noise2D = createNoise2D();

function getHeight(x, y) {
    let height = 0;
    height += noise2D(x * 0.02, y * 0.02) * 6;
    height += noise2D(x * 0.04, y * 0.04) * 3;
    height += noise2D(x * 0.08, y * 0.08) * 1.5;
    height += noise2D(x * 0.16, y * 0.16) * 0.66;
    return height;
}

// Create contour lines
function createContourLines() {
    const contourLevels = [];
    for (let i = -12; i <= 16; i += 0.5) {
        contourLevels.push(i);
    }
    const size = 100;
    const segments = 200;
    const lineGroup = new THREE.Group();

    contourLevels.forEach((level) => {
        const lineSegments = [];

        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < segments; j++) {
                const x = -size / 2 + (i / segments) * size;
                const y = -size / 2 + (j / segments) * size;
                const step = size / segments;

                const h00 = getHeight(x, y);
                const h10 = getHeight(x + step, y);
                const h01 = getHeight(x, y + step);
                const h11 = getHeight(x + step, y + step);

                if ((h00 < level && h10 >= level) || (h00 >= level && h10 < level)) {
                    const t = (level - h00) / (h10 - h00);
                    lineSegments.push(new THREE.Vector3(x + t * step, y, level + 0.15));
                }

                if ((h00 < level && h01 >= level) || (h00 >= level && h01 < level)) {
                    const t = (level - h00) / (h01 - h00);
                    lineSegments.push(new THREE.Vector3(x, y + t * step, level + 0.15));
                }

                if ((h01 < level && h11 >= level) || (h01 >= level && h11 < level)) {
                    const t = (level - h01) / (h11 - h01);
                    lineSegments.push(new THREE.Vector3(x + t * step, y + step, level + 0.15));
                }

                if ((h10 < level && h11 >= level) || (h10 >= level && h11 < level)) {
                    const t = (level - h10) / (h11 - h10);
                    lineSegments.push(new THREE.Vector3(x + step, y + t * step, level + 0.15));
                }
            }
        }

        if (lineSegments.length > 0) {
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(lineSegments);
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0xf5f3ed,
                opacity: 0.35,
                transparent: true
            });
            const line = new THREE.LineSegments(lineGeometry, lineMaterial);
            lineGroup.add(line);
        }
    });

    return lineGroup;
}

// Create Terrain Chunk
function createTerrainChunk(offsetZ) {
    const size = 100;
    const segments = 200;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    const positions = geometry.attributes.position.array;
    const colors = new Float32Array(positions.length);

    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const height = getHeight(x, y + offsetZ);
        positions[i + 2] = height;

        let r, g, b;
        const noiseVariation = (noise2D(x * 0.5, y * 0.5) + 1) * 0.5;

        if (height < -2) {
            r = 0.78 + noiseVariation * 0.12;
            g = 0.64 + noiseVariation * 0.10;
            b = 0.38 + noiseVariation * 0.08;
        } else if (height < 2) {
            r = 0.68 + noiseVariation * 0.10;
            g = 0.65 + noiseVariation * 0.08;
            b = 0.42 + noiseVariation * 0.08;
        } else if (height < 5) {
            r = 0.52 + noiseVariation * 0.12;
            g = 0.58 + noiseVariation * 0.10;
            b = 0.38 + noiseVariation * 0.08;
        } else if (height < 8) {
            r = 0.72 + noiseVariation * 0.10;
            g = 0.68 + noiseVariation * 0.10;
            b = 0.48 + noiseVariation * 0.10;
        } else {
            r = 0.82 + noiseVariation * 0.10;
            g = 0.76 + noiseVariation * 0.08;
            b = 0.58 + noiseVariation * 0.10;
        }

        colors[i] = r;
        colors[i + 1] = g;
        colors[i + 2] = b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        flatShading: false,
        transparent: false,
        opacity: 1,
        roughness: 0.95,
        metalness: 0.02,
        envMapIntensity: 0.3
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    const group = new THREE.Group();
    group.add(mesh);

    const contourLines = createContourLines();
    group.add(contourLines);

    group.position.y = offsetZ;

    return { group, offset: offsetZ };
}

function createRoundedRectShape(width, height, radius) {
  const shape = new THREE.Shape()
  const x = -width / 2
  const y = -height / 2

  shape.moveTo(x, y + radius)
  shape.lineTo(x, y + height - radius)
  shape.quadraticCurveTo(x, y + height, x + radius, y + height)
  shape.lineTo(x + width - radius, y + height)
  shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius)
  shape.lineTo(x + width, y + radius)
  shape.quadraticCurveTo(x + width, y, x + width - radius, y)
  shape.lineTo(x + radius, y)
  shape.quadraticCurveTo(x, y, x, y + radius)

  return shape
}

function createRoundedTexture(image, width, height, radius) {
  const canvas = document.createElement("canvas");

  const aspect = width / height;
  canvas.width = 1024;
  canvas.height = Math.round(canvas.width / aspect);

  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const r = radius * (w / width);

  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.quadraticCurveTo(w, 0, w, r);
  ctx.lineTo(w, h - r);
  ctx.quadraticCurveTo(w, h, w - r, h);
  ctx.lineTo(r, h);
  ctx.quadraticCurveTo(0, h, 0, h - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.clip();

  const imgRatio = image.width / image.height;
  const cardRatio = w / h;
  let drawWidth, drawHeight, offsetX, offsetY;

  if (imgRatio > cardRatio) {
    drawHeight = h;
    drawWidth = h * imgRatio;
    offsetX = (w - drawWidth) / 2;
    offsetY = 0;
  } else {
    drawWidth = w;
    drawHeight = w / imgRatio;
    offsetX = 0;
    offsetY = (h - drawHeight) / 2;
  }

  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

  const texture = new THREE.CanvasTexture(canvas);

  if ('colorSpace' in texture) texture.colorSpace = THREE.SRGBColorSpace;
  else texture.encoding = THREE.sRGBEncoding;

  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  return texture;
}

function createRoundedCardMaterial(color, roughness, metalness) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const radius = 40;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(0, 0, 512, 512, radius);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  if ('colorSpace' in texture) texture.colorSpace = THREE.SRGBColorSpace;
  else texture.encoding = THREE.sRGBEncoding;

  return new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    roughness: roughness,
    metalness: metalness,
    side: THREE.DoubleSide
  });
}

function createPhotocard(position, imageUrl) {
  const cardGroup = new THREE.Group();

  const cardWidth = 5;
  const cardHeight = 6;
  const cornerRadius = 0.2;

  const backGeometry = new THREE.PlaneGeometry(cardWidth, cardHeight);
  const backMaterial = createRoundedCardMaterial('#f5f5f5', 0.7, 0.1);
  const back = new THREE.Mesh(backGeometry, backMaterial);
  back.position.z = -0.02;
  back.castShadow = true;
  back.receiveShadow = true;
  cardGroup.add(back);

  const frontGeometry = new THREE.PlaneGeometry(cardWidth, cardHeight);
  const frontMaterial = createRoundedCardMaterial('#ffffff', 0.3, 0.05);
  const front = new THREE.Mesh(frontGeometry, frontMaterial);
  front.castShadow = true;
  front.receiveShadow = true;
  cardGroup.add(front);

  const imageGeometry = new THREE.PlaneGeometry(cardWidth, cardHeight);
  const imageMaterial = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
  });

  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(imageUrl, (texture) => {
    const img = texture.image;
    const roundedTexture = createRoundedTexture(
      img,
      cardWidth,
      cardHeight,
      cornerRadius
    );
    imageMaterial.map = roundedTexture;
    imageMaterial.needsUpdate = true;
  });

  const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);
  imageMesh.position.set(0, 0, 0.02);
  imageMesh.castShadow = true;
  imageMesh.receiveShadow = true;
  cardGroup.add(imageMesh);

  cardGroup.position.set(position[0], position[1], position[2]);
  return cardGroup;
}

// Spatial Placement of Media
const terrainGroup = new THREE.Group();
terrainGroup.rotation.x = -Math.PI / 2;
scene.add(terrainGroup);

const terrainChunk = createTerrainChunk(0);
terrainGroup.add(terrainChunk.group);

const photocardData = [
  { x: -15, z: 20, image: 'assets/images/wav_thumbnail_2.webp' },
  { x: 25,  z: -15, image: 'assets/images/trail_2.webp' },
  { x: -30, z: -25, image: 'assets/images/trail_3.webp' },
  { x: 30,  z: 25, image: 'assets/images/trail_4.webp' },
  { x: 50,  z: 15, image: 'assets/images/document_thumbnail.webp' },
  { x: 0,   z: 0,  image: 'assets/images/trail_5.webp' }
];

const photocards = photocardData.map((data) => {
  const height = getHeight(data.x, data.z);
  const card = createPhotocard(
    [data.x, data.z, height + 3],
    data.image
  );
  terrainGroup.add(card);
  return { card, baseHeight: height + 3, x: data.x, z: data.z };
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredCard = null;

window.addEventListener('mousemove', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const allMeshes = [];
    photocards.forEach(p => {
        p.card.traverse((child) => {
            if (child.isMesh) allMeshes.push(child);
        });
    });

    const intersects = raycaster.intersectObjects(allMeshes);

    if (hoveredCard) {
        hoveredCard.userData.targetScale = 1;
        hoveredCard.userData.targetLift = 0;
        hoveredCard = null;
        document.body.style.cursor = 'default';
    }

    if (intersects.length > 0) {
        let object = intersects[0].object;
        while (object.parent !== terrainGroup) {
            object = object.parent;
        }
        hoveredCard = object;
        hoveredCard.userData.targetScale = 1.2;
        hoveredCard.userData.targetLift = 1;
        document.body.style.cursor = 'pointer';
    }
});

const clock = new THREE.Clock();
const autoFlyStartTime = clock.getElapsedTime();

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    if (!userHasInteracted) {
        const flyTime = (elapsedTime - autoFlyStartTime) * 0.069;

        const radius = 45;
        const height = 12 + Math.sin(flyTime * 0.3) * 2;

        camera.position.x = Math.sin(flyTime + Math.PI * 0) * radius;
        camera.position.y = height;
        camera.position.z = Math.cos(flyTime + Math.PI * 0) * radius;

        const lookAtTarget = new THREE.Vector3(
            Math.sin(flyTime * 0.5) * 3,
            8,
            Math.cos(flyTime * 0.5) * 3
        );
        camera.lookAt(lookAtTarget);

        controls.target.copy(lookAtTarget);
    }

    photocards.forEach(p => {
        const targetScale = p.card.userData.targetScale || 1;
        const targetLift = p.card.userData.targetLift || 0;
        const currentScale = p.card.scale.x;
        const currentZ = p.card.position.z;

        const newScale = currentScale + (targetScale - currentScale) * 0.15;
        p.card.scale.set(newScale, newScale, newScale);

        const newZ = currentZ + ((p.baseHeight + targetLift) - currentZ) * 0.15;
        p.card.position.z = newZ;
    });

    photocards.forEach((photocard) => {
        photocard.card.position.z = photocard.baseHeight + Math.sin(elapsedTime * 0.5 + photocard.x) * 0.3;
        photocard.card.lookAt(camera.position);
    });

    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
