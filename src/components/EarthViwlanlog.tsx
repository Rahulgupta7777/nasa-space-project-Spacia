'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const EARTH_RADIUS = 6.371;
const LEO_MIN = 0.16;
const LEO_MAX = 2.0;

const toNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const latLonAltToCartesian = (latitude: number, longitude: number, altitudeKm: number): THREE.Vector3 => {
  const latRad = THREE.MathUtils.degToRad(latitude);
  const lonRad = THREE.MathUtils.degToRad(longitude);
  const radius = EARTH_RADIUS + altitudeKm / 1000;

  const x = radius * Math.cos(latRad) * Math.cos(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.sin(lonRad);

  return new THREE.Vector3(x, y, z);
};

const createLaunchLabelSprite = (text: string): THREE.Sprite => {
  if (typeof document === 'undefined') {
    return new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffffff }));
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffffff }));
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background glow
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, 'rgba(255, 140, 66, 0.15)');
  gradient.addColorStop(0.5, 'rgba(255, 214, 102, 0.3)');
  gradient.addColorStop(1, 'rgba(102, 240, 255, 0.2)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = 'bold 80px "Orbitron", "Arial", sans-serif';
  ctx.fillStyle = '#f8fbff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2);

  ctx.strokeStyle = 'rgba(255, 145, 102, 0.7)';
  ctx.lineWidth = 6;
  ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(material);
  const width = 2.2;
  const height = width * (canvas.height / canvas.width);
  sprite.scale.set(width, height, 1);

  return sprite;
};

// Types
interface SpaceObject {
  mesh: THREE.Mesh | THREE.Points;
  type: 'satellite' | 'large-debris' | 'small-debris';
  radius: number;
  inclination: number;
  theta: number;
  speed: number;
  period?: number;
  tumbleX?: number;
  tumbleY?: number;
  isStatic?: boolean;
  isLaunchSite?: boolean;
  glowMesh?: THREE.Mesh;
  beamMesh?: THREE.Mesh;
  ringMesh?: THREE.Mesh;
  labelSprite?: THREE.Sprite;
  accentMeshes?: THREE.Object3D[];
  launchMeta?: {
    name: string;
    latitude: number;
    longitude: number;
    altitudeKm: number;
  };
}

interface RiskZone {
  mesh: THREE.Mesh;
  baseScale: number;
  phase: number;
}

interface Stats {
  total: number;
  satellites: number;
  largeDebris: number;
  smallDebris: number;
  conjunctions: number;
}

// NASA aggregated public summaries (order-of-magnitude)
const NASA_STATS = {
  satellites: 13000, // approximate active satellites (all orbits, LEO-dominant)
  largeDebris: 28000, // objects >= 10 cm (tracked/catalogued)
  mediumDebris: 500000, // objects >=1 cm and <10 cm (estimate)
  smallDebrisEstimate: 100_000_000, // >1 mm (order of magnitude estimate)
};

const LEO_ZONES = [
  { altitude: 0.4, name: '400km', velocity: 7.67, period: 92.5 },
  { altitude: 0.55, name: '550km', velocity: 7.59, period: 95.5 },
  { altitude: 0.8, name: '800km', velocity: 7.45, period: 101.0 },
  { altitude: 1.2, name: '1200km', velocity: 7.26, period: 110.0 },
];

interface EarthViewProps {
  launchLatitude?: number;
  launchLongitude?: number;
  launchAltitudeKm?: number;
  launchName?: string;
  layout?: "fullscreen" | "embedded";
}

const EarthView: React.FC<EarthViewProps> = ({
  launchLatitude = 13.73, // Provided defaults can be overridden
  launchLongitude = 80.23,
  launchAltitudeKm = 550,
  launchName = 'Launch Site',
  layout = "fullscreen",
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<any>(null);
  const objectsRef = useRef<SpaceObject[]>([]);
  const riskZonesRef = useRef<RiskZone[]>([]);
  const smallDebrisRef = useRef<THREE.Points | null>(null);
  const orbitRingsRef = useRef<THREE.Mesh[]>([]);
  const animationIdRef = useRef<number | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const hoveredObjectRef = useRef<string | null>(null);
  const launchSatelliteRef = useRef<SpaceObject | null>(null);
  const launchSatelliteGroupRef = useRef<THREE.Group | null>(null);

  const safeLaunchLatitude = clamp(toNumber(launchLatitude, 28.5721), -90, 90);
  const safeLaunchLongitude = clamp(toNumber(launchLongitude, -80.648), -180, 180);
  const safeLaunchAltitudeKm = Math.max(0, toNumber(launchAltitudeKm, 550));
  const safeLaunchName =
    typeof launchName === 'string' && launchName.trim().length > 0 ? launchName.trim() : 'Launch Site';

  const [stats, setStats] = useState<Stats>({
    total: 0,
    satellites: 0,
    largeDebris: 0,
    smallDebris: 0,
    conjunctions: 0,
  });

  const [debrisVisible, setDebrisVisible] = useState(true);
  const [orbitsVisible, setOrbitsVisible] = useState(true);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set());
  const [highlightedObjects, setHighlightedObjects] = useState<Set<string>>(new Set());
  const [showSatellites, setShowSatellites] = useState(true);
  const [showLargeDebris, setShowLargeDebris] = useState(true);
  const [showSmallDebris, setShowSmallDebris] = useState(true);
  const [pulseRiskZones, setPulseRiskZones] = useState(true);
  const [animationPaused, setAnimationPaused] = useState(false);
  const [smallDebrisIntensity, setSmallDebrisIntensity] = useState(0.7); // opacity 0..1
  // Only show official stats; visualization is density-scaled for performance

  useEffect(() => {
    if (!mountRef.current) return;
    
    const container = mountRef.current;
    
    // Use requestAnimationFrame to ensure DOM is ready
    const initId = requestAnimationFrame(() => {
      if (!mountRef.current) return;

      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      scene.fog = new THREE.FogExp2(0x000000, 0.0002);
      sceneRef.current = scene;

      // Camera setup - use actual dimensions or fallback
      const width = Math.max(container.clientWidth || 800, 400);
      const height = Math.max(container.clientHeight || 600, 400);
      const camera = new THREE.PerspectiveCamera(
        50,
        width / height,
        0.1,
        1000
      );
      camera.position.set(25, 15, 25);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // OrbitControls (dynamically imported)
      import('three/examples/jsm/controls/OrbitControls.js').then(({ OrbitControls }) => {
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 8;
        controls.maxDistance = 60;
        controls.maxPolarAngle = Math.PI;
        controlsRef.current = controls;
        
        // Note: Auto-focus is handled after launch satellite is created
      });

      // Create starfield
      createStarfield(scene);

      // Create Earth
      createEarth(scene);

      // Create orbit shells
      createOrbitShells(scene);

      // Create space objects
      const { satellites, largeDebris, smallDebrisCount, smallDebrisMesh } = createSpaceObjects(scene);
      objectsRef.current = [...satellites, ...largeDebris];
      smallDebrisRef.current = smallDebrisMesh;

      // Create launch site highlight satellite
      const launchSatellite = createLaunchSiteSatellite(scene, {
        latitude: safeLaunchLatitude,
        longitude: safeLaunchLongitude,
        altitudeKm: safeLaunchAltitudeKm,
        name: safeLaunchName,
      });
      if (launchSatellite) {
        objectsRef.current.push(launchSatellite.spaceObject);
        launchSatelliteRef.current = launchSatellite.spaceObject;
        launchSatelliteGroupRef.current = launchSatellite.group;
        setSelectedObjects(new Set(['launch-site-satellite']));
        setHighlightedObjects(new Set(['launch-site-satellite']));
        setSelectedObject('launch-site-satellite');
        
        // Auto-focus on launch site after it's created and controls are ready
        const focusLaunchSite = () => {
          if (launchSatelliteGroupRef.current && cameraRef.current && controlsRef.current) {
            const target = new THREE.Vector3();
            launchSatelliteGroupRef.current.getWorldPosition(target);
            const offset = target.clone().normalize().multiplyScalar(2.4);
            cameraRef.current.position.copy(target.clone().add(offset));
            controlsRef.current.target.copy(target);
            controlsRef.current.update();
          }
        };
        
        // Try to focus after controls are loaded
        if (controlsRef.current) {
          setTimeout(focusLaunchSite, 100);
        } else {
          // Wait for controls to be loaded
          const checkControls = setInterval(() => {
            if (controlsRef.current) {
              clearInterval(checkControls);
              setTimeout(focusLaunchSite, 100);
            }
          }, 50);
          
          // Cleanup interval after 5 seconds
          setTimeout(() => clearInterval(checkControls), 5000);
        }
      }

      // Create risk zones
      const risks = createRiskZones(scene);
      riskZonesRef.current = risks;

      // Update stats (official counts)
      setStats({
        total:
          NASA_STATS.satellites +
          NASA_STATS.largeDebris +
          NASA_STATS.mediumDebris +
          NASA_STATS.smallDebrisEstimate,
        satellites: NASA_STATS.satellites,
        largeDebris: NASA_STATS.largeDebris + NASA_STATS.mediumDebris,
        smallDebris: NASA_STATS.smallDebrisEstimate,
        conjunctions: riskZonesRef.current.length,
      });

      // Lighting
      setupLighting(scene);

      // Animation loop
      let animationTime = 0;

      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate);
        if (!animationPaused) {
          animationTime += 0.01;
        }

        // Rotate Earth
        const earth = scene.getObjectByName('earth');
        if (earth && !animationPaused) earth.rotation.y += 0.0003;

        // Rotate clouds slightly faster than Earth
        const clouds = scene.getObjectByName('clouds');
        if (clouds && !animationPaused) clouds.rotation.y += 0.0005;

        // Animate objects
        objectsRef.current.forEach((obj) => {
          if (obj.isStatic) {
            if (obj.isLaunchSite) {
              if (obj.glowMesh) {
                const pulseScale = 1.18 + Math.sin(animationTime * 4.2) * 0.22;
                obj.glowMesh.scale.set(pulseScale, pulseScale, pulseScale);
                const glowMaterial = obj.glowMesh.material as THREE.MeshBasicMaterial;
                glowMaterial.opacity = 0.58 + (Math.sin(animationTime * 4.2) + 1) * 0.18;
              }
              if (obj.ringMesh) {
                obj.ringMesh.rotation.z += 0.02;
              }
              if (obj.beamMesh) {
                const beamMaterial = obj.beamMesh.material as THREE.MeshBasicMaterial;
                beamMaterial.opacity = 0.25 + (Math.sin(animationTime * 3.6) + 1) * 0.22;
              }
              if (obj.accentMeshes) {
                obj.accentMeshes.forEach((accent, index) => {
                  accent.rotation.z += 0.01 + index * 0.002;
                });
              }
              if (!animationPaused) {
                obj.mesh.rotation.y += 0.01;
              }
              if (obj.labelSprite && cameraRef.current) {
                obj.labelSprite.quaternion.copy(cameraRef.current.quaternion);
                obj.labelSprite.position.y = 0.55 + Math.sin(animationTime * 2.5) * 0.04;
              }
            }
            return;
          }

          if (!animationPaused) {
            obj.theta += obj.speed;

            const x = obj.radius * Math.sin(obj.inclination) * Math.cos(obj.theta);
            const y = obj.radius * Math.cos(obj.inclination);
            const z = obj.radius * Math.sin(obj.inclination) * Math.sin(obj.theta);

            obj.mesh.position.set(x, y, z);

            if (obj.type === 'large-debris' && obj.tumbleX && obj.tumbleY) {
              obj.mesh.rotation.x += obj.tumbleX;
              obj.mesh.rotation.y += obj.tumbleY;
            }
          }
        });

        // Animate small debris
        if (smallDebrisRef.current) {
          // apply intensity
          const mat = smallDebrisRef.current.material as THREE.PointsMaterial;
          mat.opacity = smallDebrisIntensity;
          if (!animationPaused) {
            smallDebrisRef.current.rotation.y += 0.0001;
          }
        }

        // Pulse risk zones
        riskZonesRef.current.forEach((zone) => {
          if (pulseRiskZones && !animationPaused) {
            const pulse = Math.sin(animationTime * 2 + zone.phase) * 0.3 + 1;
            zone.mesh.scale.set(pulse, pulse, pulse);
            const opacity = 0.1 + Math.sin(animationTime * 2 + zone.phase) * 0.05;
            (zone.mesh.material as THREE.MeshBasicMaterial).opacity = opacity;
          } else {
            zone.mesh.scale.set(1, 1, 1);
            (zone.mesh.material as THREE.MeshBasicMaterial).opacity = 0.15;
          }
        });

        if (controlsRef.current) controlsRef.current.update();
        renderer.render(scene, camera);
      };

      animate();

      // Handle resize
      const handleResize = () => {
        if (!mountRef.current || !camera || !renderer) return;
        const newWidth = Math.max(mountRef.current.clientWidth || 800, 400);
        const newHeight = Math.max(mountRef.current.clientHeight || 600, 400);
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      };

      window.addEventListener('resize', handleResize);

      // Add click event listener
      renderer.domElement.addEventListener('click', handleCanvasClick);
      renderer.domElement.addEventListener('mousemove', handleCanvasMouseMove);
    });

    // Cleanup
    return () => {
      cancelAnimationFrame(initId);
      window.removeEventListener('resize', () => {});
      if (launchSatelliteGroupRef.current) {
        launchSatelliteGroupRef.current.parent?.remove(launchSatelliteGroupRef.current);
        launchSatelliteGroupRef.current = null;
      }
      launchSatelliteRef.current = null;
      if (rendererRef.current?.domElement) {
        rendererRef.current.domElement.removeEventListener('click', handleCanvasClick);
        rendererRef.current.domElement.removeEventListener('mousemove', handleCanvasMouseMove);
        if (mountRef.current && rendererRef.current.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
      }
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
      objectsRef.current = [];
      riskZonesRef.current = [];
      orbitRingsRef.current = [];
      smallDebrisRef.current = null;
    };
  }, [launchLatitude, launchLongitude, launchAltitudeKm, launchName, layout]);

  // Helper functions
  const createStarfield = (scene: THREE.Scene) => {
    const starGeometry = new THREE.BufferGeometry();
    const starVertices: number[] = [];
    const starSizes: number[] = [];

    for (let i = 0; i < 10000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 500 + Math.random() * 500;

      starVertices.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );
      starSizes.push(Math.random() * 1.5 + 0.5);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
  };

  const createEarth = (scene: THREE.Scene) => {
    const loader = new THREE.TextureLoader();
    
    // Load Earth textures
    const earthTexture = loader.load("https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg");
    const earthBump = loader.load("https://threejs.org/examples/textures/planets/earth_bump_2048.jpg");
    const earthSpec = loader.load("https://threejs.org/examples/textures/planets/earth_specular_2048.jpg");
    const cloudsTexture = loader.load("https://threejs.org/examples/textures/planets/earth_clouds_1024.png");
    
    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: earthBump,
      bumpScale: 0.05,
      specularMap: earthSpec,
      specular: new THREE.Color(0x333333),
      shininess: 10,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.name = 'earth';
    scene.add(earth);

    // Clouds layer
    const cloudsGeometry = new THREE.SphereGeometry(EARTH_RADIUS + 0.01, 64, 64);
    const cloudsMaterial = new THREE.MeshPhongMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    clouds.name = 'clouds';
    scene.add(clouds);

    // Atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(EARTH_RADIUS + 0.1, 32, 32);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);
  };

  const createOrbitShells = (scene: THREE.Scene) => {
    LEO_ZONES.forEach((zone, index) => {
      const radius = EARTH_RADIUS + zone.altitude;
      const geometry = new THREE.RingGeometry(radius - 0.01, radius + 0.01, 128);
      const material = new THREE.MeshBasicMaterial({
        color: 0x4a9eff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.15 - index * 0.02,
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
      orbitRingsRef.current.push(ring);
    });
  };


const createLaunchSiteSatellite = (
    scene: THREE.Scene,
    {
      latitude,
      longitude,
      altitudeKm,
      name,
    }: { latitude: number; longitude: number; altitudeKm: number; name: string }
  ): { spaceObject: SpaceObject; group: THREE.Group } | null => {
    const position = latLonAltToCartesian(latitude, longitude, altitudeKm);
    if (!Number.isFinite(position.x) || !Number.isFinite(position.y) || !Number.isFinite(position.z)) {
      return null;
    }
  
    const group = new THREE.Group();
    group.name = 'launch-site-group';
    group.position.copy(position);
  
    const radialDirection = position.clone().normalize();
    const towardsEarth = radialDirection.clone().negate();
    const altitudeDistance = Math.max(position.length() - EARTH_RADIUS, 0.25);
  
    // ✅ Sleek luminous core
    const coreGeometry = new THREE.OctahedronGeometry(0.18, 1);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x00e5ff,
      emissive: 0x00ffff,
      emissiveIntensity: 1.4,
      metalness: 0.8,
      roughness: 0.2,
      transmission: 0.6,
      thickness: 0.5,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.name = 'launch-site-satellite';
    group.add(core);
  
    // ✅ Subtle glow aura
    const glowGeometry = new THREE.SphereGeometry(0.28, 48, 48);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    core.add(glow);
  
    // ✅ Thin rotating energy ring (blue-white)
    const ringGeometry = new THREE.RingGeometry(0.25, 0.32, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x88ffff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.name = 'launch-site-ring';
    core.add(ring);
  
    // ✅ Energy beam down to Earth
    const beamLength = altitudeDistance + 0.9;
    const beamGeometry = new THREE.CylinderGeometry(0.04, 0.12, Math.max(beamLength, 0.4), 32, 1, true);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: 0x00baff,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    const beamQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), towardsEarth.clone().normalize());
    beam.quaternion.copy(beamQuaternion);
    beam.position.copy(towardsEarth.clone().multiplyScalar(beamLength / 2));
    group.add(beam);
  
    // ✅ Minimal landing flare at surface
    const surfaceOffset = Math.max(position.length() - (EARTH_RADIUS + 0.05), 0.05);
    const baseGeometry = new THREE.CircleGeometry(0.4, 48);
    const baseMaterial = new THREE.MeshBasicMaterial({
      color: 0x00d8ff,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const baseFlare = new THREE.Mesh(baseGeometry, baseMaterial);
    baseFlare.position.copy(towardsEarth.clone().multiplyScalar(surfaceOffset));
    const baseQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), radialDirection);
    baseFlare.quaternion.copy(baseQuaternion);
    group.add(baseFlare);
  
    // ✅ Label sprite
    const labelSprite = createLaunchLabelSprite(name);
    labelSprite.position.set(0.5, 0.45, 0);
    core.add(labelSprite);
  
    // ✅ Small sparkle effect
    const sparkGeometry = new THREE.RingGeometry(0.15, 0.19, 4);
    const sparkMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const sparkHalo = new THREE.Mesh(sparkGeometry, sparkMaterial);
    sparkHalo.rotation.x = Math.PI / 2;
    core.add(sparkHalo);
  
    const parent = scene.getObjectByName('earth') || scene;
    parent.add(group);
  
    const spaceObject: SpaceObject = {
      mesh: core,
      type: 'satellite',
      radius: EARTH_RADIUS + altitudeKm / 1000,
      inclination: 0,
      theta: 0,
      speed: 0,
      isStatic: true,
      isLaunchSite: true,
      glowMesh: glow,
      beamMesh: beam,
      ringMesh: ring,
      labelSprite,
      accentMeshes: [sparkHalo],
      launchMeta: { name, latitude, longitude, altitudeKm },
    };
  
    return { spaceObject, group };
  };

  const createSpaceObjects = (scene: THREE.Scene) => {
    const satellites: SpaceObject[] = [];
    const largeDebris: SpaceObject[] = [];
    let smallDebrisCount = 0;

    // Representation scaling (performance-aware)
    const SATELLITE_COUNT = 1200;
    for (let i = 0; i < SATELLITE_COUNT; i++) {
      const geometry = new THREE.BoxGeometry(0.06, 0.06, 0.08);
      const material = new THREE.MeshPhongMaterial({
        color: 0x4affb8,
        emissive: 0x2aff98,
        emissiveIntensity: 0.4,
      });
      const satellite = new THREE.Mesh(geometry, material);

      const zoneIndex = Math.floor(Math.random() * LEO_ZONES.length);
      const zone = LEO_ZONES[zoneIndex];
      const radius = EARTH_RADIUS + zone.altitude + (Math.random() - 0.5) * 0.05;
      const inclination = ((Math.random() * 60 + 30) * Math.PI) / 180;
      const theta = Math.random() * Math.PI * 2;

      const x = radius * Math.sin(inclination) * Math.cos(theta);
      const y = radius * Math.cos(inclination);
      const z = radius * Math.sin(inclination) * Math.sin(theta);

      satellite.position.set(x, y, z);
      satellite.name = `satellite-${i}`;
      scene.add(satellite);

      const orbitalSpeed = (zone.velocity / 7670) * 0.001;

      satellites.push({
        mesh: satellite,
        type: 'satellite',
        radius,
        inclination,
        theta,
        speed: orbitalSpeed,
        period: zone.period,
      });
    }

    // Large debris (includes a portion of tracked and estimated medium objects as representation)
    const LARGE_DEBRIS_COUNT = 1500;
    for (let i = 0; i < LARGE_DEBRIS_COUNT; i++) {
      const size = 0.03 + Math.random() * 0.05;
      const geometry =
        Math.random() > 0.5
          ? new THREE.BoxGeometry(size, size, size)
          : new THREE.SphereGeometry(size, 8, 8);
      const material = new THREE.MeshPhongMaterial({
        color: 0xff6b6b,
        emissive: 0xff4444,
        emissiveIntensity: 0.2,
      });
      const debris = new THREE.Mesh(geometry, material);

      const altitude = LEO_MIN + Math.random() * (LEO_MAX - LEO_MIN);
      const radius = EARTH_RADIUS + altitude;
      const inclination = Math.random() * Math.PI;
      const theta = Math.random() * Math.PI * 2;

      const x = radius * Math.sin(inclination) * Math.cos(theta);
      const y = radius * Math.cos(inclination);
      const z = radius * Math.sin(inclination) * Math.sin(theta);

      debris.position.set(x, y, z);
      debris.name = `large-debris-${i}`;
      scene.add(debris);

      const baseSpeed = (7.5 / 7670) * 0.001;
      const speed = baseSpeed * (0.8 + Math.random() * 0.4);

      largeDebris.push({
        mesh: debris,
        type: 'large-debris',
        radius,
        inclination,
        theta,
        speed,
        tumbleX: Math.random() * 0.02,
        tumbleY: Math.random() * 0.02,
      });
    }

    // Small debris cloud (density-scaled)
    const SMALL_DEBRIS_COUNT = 40000;
    const smallDebrisGeometry = new THREE.BufferGeometry();
    const smallDebrisPositions: number[] = [];
    const smallDebrisSizes: number[] = [];

    for (let i = 0; i < SMALL_DEBRIS_COUNT; i++) {
      const altitude = LEO_MIN + Math.random() * (LEO_MAX - LEO_MIN);
      const radius = EARTH_RADIUS + altitude;
      const inclination = Math.random() * Math.PI;
      const theta = Math.random() * Math.PI * 2;

      const x = radius * Math.sin(inclination) * Math.cos(theta);
      const y = radius * Math.cos(inclination);
      const z = radius * Math.sin(inclination) * Math.sin(theta);

      smallDebrisPositions.push(x, y, z);
      smallDebrisSizes.push(Math.random() * 0.8 + 0.3);
      smallDebrisCount++;
    }

    smallDebrisGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(smallDebrisPositions, 3)
    );
    smallDebrisGeometry.setAttribute(
      'size',
      new THREE.Float32BufferAttribute(smallDebrisSizes, 1)
    );

    const smallDebrisMaterial = new THREE.PointsMaterial({
      color: 0xffd93d,
      size: 0.03,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.7,
    });

    const smallDebrisMesh = new THREE.Points(smallDebrisGeometry, smallDebrisMaterial);
    scene.add(smallDebrisMesh);

    return { satellites, largeDebris, smallDebrisCount, smallDebrisMesh };
  };

  const createRiskZones = (scene: THREE.Scene): RiskZone[] => {
    const riskZones: RiskZone[] = [];
    const RISK_ZONE_COUNT = 5;

    const preferredAltitudes = [0.7, 0.8, 0.85, 0.9, 1.2]; // ~700–900km bands and one higher
    for (let i = 0; i < RISK_ZONE_COUNT; i++) {
      const geometry = new THREE.SphereGeometry(0.3, 16, 16);
      const material = new THREE.MeshBasicMaterial({
        color: 0xff4aff,
        transparent: true,
        opacity: 0.15,
        wireframe: true,
      });
      const zone = new THREE.Mesh(geometry, material);

      const altitude = preferredAltitudes[i % preferredAltitudes.length];
      const radius = EARTH_RADIUS + altitude;
      const inclination = Math.random() * Math.PI;
      const theta = Math.random() * Math.PI * 2;

      zone.position.x = radius * Math.sin(inclination) * Math.cos(theta);
      zone.position.y = radius * Math.cos(inclination);
      zone.position.z = radius * Math.sin(inclination) * Math.sin(theta);
      zone.name = `risk-zone-${i}`;

      scene.add(zone);
      riskZones.push({
        mesh: zone,
        baseScale: 1,
        phase: Math.random() * Math.PI * 2,
      });
    }

    return riskZones;
  };

  const setupLighting = (scene: THREE.Scene) => {
    const ambientLight = new THREE.AmbientLight(0x1a1a2a, 0.3);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(100, 50, 100);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x4a7a9f, 0.4);
    rimLight.position.set(-50, -30, -50);
    scene.add(rimLight);
  };

  // Control functions
  const toggleDebris = () => {
    const newVisibility = !debrisVisible;
    setDebrisVisible(newVisibility);

    if (smallDebrisRef.current) {
      smallDebrisRef.current.visible = newVisibility;
    }

    objectsRef.current.forEach((obj) => {
      if (obj.type === 'large-debris') {
        obj.mesh.visible = newVisibility;
      }
    });
  };

  const toggleSatellites = () => {
    const newVisibility = !showSatellites;
    setShowSatellites(newVisibility);
    objectsRef.current.forEach((obj) => {
      if (obj.type === 'satellite') {
        if (obj.isLaunchSite) {
          obj.mesh.visible = true;
          return;
        }
        obj.mesh.visible = newVisibility;
      }
    });
  };

  const toggleLargeDebrisOnly = () => {
    const newVisibility = !showLargeDebris;
    setShowLargeDebris(newVisibility);
    objectsRef.current.forEach((obj) => {
      if (obj.type === 'large-debris') {
        obj.mesh.visible = newVisibility;
      }
    });
  };

  const toggleSmallDebrisOnly = () => {
    const newVisibility = !showSmallDebris;
    setShowSmallDebris(newVisibility);
    if (smallDebrisRef.current) {
      smallDebrisRef.current.visible = newVisibility;
    }
  };

  const togglePulse = () => {
    setPulseRiskZones(!pulseRiskZones);
  };

  const toggleAnimation = () => {
    setAnimationPaused(!animationPaused);
  };

  const focusOnLaunchSite = () => {
    if (!launchSatelliteGroupRef.current || !cameraRef.current || !controlsRef.current) return;
    const target = new THREE.Vector3();
    launchSatelliteGroupRef.current.getWorldPosition(target);
    const offset = target.clone().normalize().multiplyScalar(2.4);
    cameraRef.current.position.copy(target.clone().add(offset));
    controlsRef.current.target.copy(target);
  };

  const focusOnRisk = () => {
    if (riskZonesRef.current.length > 0 && cameraRef.current && controlsRef.current) {
      const zone = riskZonesRef.current[Math.floor(Math.random() * riskZonesRef.current.length)];
      const pos = zone.mesh.position;
      const distance = 3;

      cameraRef.current.position.set(
        pos.x + distance,
        pos.y + distance * 0.5,
        pos.z + distance
      );
      controlsRef.current.target.copy(pos);
    }
  };

  const toggleOrbits = () => {
    const newVisibility = !orbitsVisible;
    setOrbitsVisible(newVisibility);
    orbitRingsRef.current.forEach((ring) => {
      ring.visible = newVisibility;
    });
  };

  const resetView = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(25, 15, 25);
      controlsRef.current.target.set(0, 0, 0);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  // Mouse move handler for hover effects
  const handleCanvasMouseMove = (event: MouseEvent) => {
    if (!cameraRef.current || !sceneRef.current || !rendererRef.current) return;

    const rect = rendererRef.current.domElement.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

    // Get all clickable objects
    const clickableObjects: THREE.Object3D[] = [];
    
    objectsRef.current.forEach(obj => {
      clickableObjects.push(obj.mesh);
    });
    
    riskZonesRef.current.forEach(zone => {
      clickableObjects.push(zone.mesh);
    });

    const intersects = raycasterRef.current.intersectObjects(clickableObjects, true);

    // Reset previous hover
    if (hoveredObjectRef.current && !selectedObjects.has(hoveredObjectRef.current)) {
      const prevHovered = getObjectByName(hoveredObjectRef.current);
      if (prevHovered) {
        resetObjectHighlight(prevHovered);
      }
    }

    if (intersects.length > 0) {
      const hoveredObject = intersects[0].object;
      const objectName = hoveredObject.name || hoveredObject.uuid;
      
      if (objectName !== hoveredObjectRef.current && !selectedObjects.has(objectName)) {
        // Apply hover effect
        hoveredObject.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const material = child.material as THREE.Material;
            if (material instanceof THREE.MeshPhongMaterial) {
              // Store original values if not already stored
              if (!child.userData.originalEmissive) {
                child.userData.originalEmissive = material.emissive.clone();
                child.userData.originalEmissiveIntensity = material.emissiveIntensity;
              }
              // Apply subtle hover effect
              material.emissive.setHex(0x222222);
              material.emissiveIntensity = 0.3;
            }
          }
        });
        hoveredObjectRef.current = objectName;
        rendererRef.current.domElement.style.cursor = 'pointer';
      }
    } else {
      hoveredObjectRef.current = null;
      rendererRef.current.domElement.style.cursor = 'default';
    }
  };

  // Helper function to get object by name
  const getObjectByName = (name: string): THREE.Object3D | null => {
    // Check in objects array
    const obj = objectsRef.current.find(o => o.mesh.name === name);
    if (obj) return obj.mesh;
    
    // Check in risk zones
    const zone = riskZonesRef.current.find(z => z.mesh.name === name);
    if (zone) return zone.mesh;
    
    return null;
  };

  // Click interaction handler
  const handleCanvasClick = (event: MouseEvent) => {
    if (!cameraRef.current || !sceneRef.current || !rendererRef.current) return;

    const rect = rendererRef.current.domElement.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

    // Get all clickable objects
    const clickableObjects: THREE.Object3D[] = [];
    
    // Add satellites and large debris
    objectsRef.current.forEach(obj => {
      clickableObjects.push(obj.mesh);
    });
    
    // Add risk zones
    riskZonesRef.current.forEach(zone => {
      clickableObjects.push(zone.mesh);
    });

    const intersects = raycasterRef.current.intersectObjects(clickableObjects, true);

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      const objectName = clickedObject.name || clickedObject.uuid;
      
      // Reset hover state since this object is now selected
      if (hoveredObjectRef.current === objectName) {
        hoveredObjectRef.current = null;
      }
      
      // Toggle selection
      const newSelectedObjects = new Set(selectedObjects);
      const newHighlightedObjects = new Set(highlightedObjects);
      
      if (selectedObjects.has(objectName)) {
        newSelectedObjects.delete(objectName);
        newHighlightedObjects.delete(objectName);
        // Reset material
        resetObjectHighlight(clickedObject);
      } else {
        newSelectedObjects.add(objectName);
        newHighlightedObjects.add(objectName);
        // Highlight object
        highlightObject(clickedObject);
      }
      
      setSelectedObjects(newSelectedObjects);
      setHighlightedObjects(newHighlightedObjects);
      setSelectedObject(objectName);
    } else {
      // Clear all selections if clicking on empty space
      clearAllSelections();
    }
  };

  const highlightObject = (object: THREE.Object3D) => {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const material = child.material as THREE.Material;
        if (material instanceof THREE.MeshPhongMaterial) {
          // Store original values
          child.userData.originalEmissive = material.emissive.clone();
          child.userData.originalEmissiveIntensity = material.emissiveIntensity;
          
          // Apply highlight
          material.emissive.setHex(0x444444);
          material.emissiveIntensity = 0.5;
        }
      }
    });
  };

  const resetObjectHighlight = (object: THREE.Object3D) => {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const material = child.material as THREE.Material;
        if (material instanceof THREE.MeshPhongMaterial) {
          // Reset to original values based on object type
          if (child.userData.originalEmissive) {
            material.emissive.copy(child.userData.originalEmissive);
            material.emissiveIntensity = child.userData.originalEmissiveIntensity || 1;
          } else {
            material.emissive.setHex(0x000000);
            material.emissiveIntensity = 1;
          }
        }
      }
    });
  };

  const clearAllSelections = () => {
    // Reset all highlighted objects
    objectsRef.current.forEach(obj => {
      if (highlightedObjects.has(obj.mesh.name || obj.mesh.uuid)) {
        resetObjectHighlight(obj.mesh);
      }
    });
    
    riskZonesRef.current.forEach(zone => {
      if (highlightedObjects.has(zone.mesh.name || zone.mesh.uuid)) {
        resetObjectHighlight(zone.mesh);
      }
    });
    
    setSelectedObjects(new Set());
    setHighlightedObjects(new Set());
    setSelectedObject(null);
  };

  const getObjectInfo = (objectName: string): { type: string; name: string; details: string[] } => {
    if (objectName === 'launch-site-satellite') {
      const launchObj = launchSatelliteRef.current;
      const latitude = launchObj?.launchMeta?.latitude;
      const longitude = launchObj?.launchMeta?.longitude;
      const altitudeKm = launchObj?.launchMeta?.altitudeKm;
      return {
        type: 'Launch Target',
        name: launchObj?.launchMeta?.name ?? 'Launch Site',
        details: [
          `Latitude: ${typeof latitude === 'number' ? latitude.toFixed(2) : 'N/A'}°`,
          `Longitude: ${typeof longitude === 'number' ? longitude.toFixed(2) : 'N/A'}°`,
          `Altitude: ${typeof altitudeKm === 'number' ? altitudeKm.toLocaleString() : 'N/A'} km`,
        ],
      };
    }

    if (objectName.startsWith('satellite-')) {
      const index = parseInt(objectName.split('-')[1]);
      const satellite = objectsRef.current.find(obj => obj.type === 'satellite' && obj.mesh.name === objectName);
      return {
        type: 'Satellite',
        name: `SAT-${index + 1}`,
        details: [
          `Altitude: ${satellite ? Math.round((satellite.radius - EARTH_RADIUS) * 100) : 'N/A'} km`,
          `Velocity: ${satellite ? (satellite.speed * 7670000).toFixed(2) : 'N/A'} km/s`,
          `Period: ${satellite ? satellite.period : 'N/A'} min`
        ]
      };
    } else if (objectName.startsWith('large-debris-')) {
      const index = parseInt(objectName.split('-')[2]);
      const debris = objectsRef.current.find(obj => obj.type === 'large-debris' && obj.mesh.name === objectName);
      return {
        type: 'Large Debris',
        name: `DEBRIS-${index + 1}`,
        details: [
          `Altitude: ${debris ? Math.round((debris.radius - EARTH_RADIUS) * 100) : 'N/A'} km`,
          `Velocity: ${debris ? (debris.speed * 7670000).toFixed(2) : 'N/A'} km/s`,
          `Size: Medium to Large fragment`
        ]
      };
    } else if (objectName.startsWith('risk-zone-')) {
      const index = parseInt(objectName.split('-')[2]);
      const zone = riskZonesRef.current.find(z => z.mesh.name === objectName);
      return {
        type: 'Risk Zone',
        name: `RISK-${index + 1}`,
        details: [
          `Collision probability: HIGH`,
          `Debris density: Critical`,
          `Monitoring required: YES`
        ]
      };
    }
    
    return { type: 'Unknown', name: objectName, details: ['No additional information'] };
  };

  const containerClassName =
    layout === "fullscreen"
      ? "relative w-full h-screen bg-black overflow-hidden"
      : "relative w-full h-[520px] md:h-[620px] bg-black overflow-hidden";

  return (
    <div className={containerClassName}>
      {/* 3D Canvas */}
      <div ref={mountRef} className="w-full h-full min-h-[400px]" />

      {/* Launch Control Panel */}
      <div className={`absolute top-5 left-5 backdrop-blur-xl bg-gradient-to-br from-[#090d1c]/90 via-[#150b2b]/90 to-[#240f2f]/90 rounded-2xl border border-[#ff6f3c]/45 shadow-[0_18px_48px_rgba(255,122,64,0.25)] font-mono text-[12px] text-[#eef7ff] animate-fade-in-slide transition-all duration-500 ease-in-out ${
        panelExpanded ? 'p-5 min-w-[230px]' : 'p-3 min-w-[210px]'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff6f3c]/15 via-transparent to-[#45d6ff]/15 rounded-2xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.38em] text-[#ffb347]/80">Launch Control</div>
              <div
                className={`text-transparent bg-clip-text bg-gradient-to-r from-[#ffb347] via-[#ffe29f] to-[#66f1ff] font-semibold transition-all duration-300 whitespace-nowrap ${
                  panelExpanded ? 'text-[16px]' : 'text-[13px]'
                }`}
              >
                {safeLaunchName.toUpperCase()}
              </div>
            </div>
            <button
              onClick={() => setPanelExpanded(!panelExpanded)}
              className="ml-2 p-1 rounded-md bg-[#ff6f3c]/20 border border-[#ff9d63]/40 hover:bg-[#ff6f3c]/30 hover:border-[#ffd29f]/60 transition-all duration-300 flex items-center justify-center"
              aria-label={panelExpanded ? 'Collapse panel' : 'Expand panel'}
            >
              <svg
                className={`w-3 h-3 text-[#ffe5ba] transition-transform duration-300 ${
                  panelExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
            panelExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            {panelExpanded && (
              <>
                <div className="border-b border-[#ff9d63]/30 pb-3 mb-4" />

                <div className="text-[10px] text-[#ffdca8] mt-2 mb-2 tracking-wider font-semibold uppercase">
                  Launch Target
                </div>
                <LaunchDetailRow label="Site" value={safeLaunchName} accent />
                <LaunchDetailRow label="Latitude" value={`${safeLaunchLatitude.toFixed(2)}°`} />
                <LaunchDetailRow label="Longitude" value={`${safeLaunchLongitude.toFixed(2)}°`} />
                <LaunchDetailRow label="Target Altitude" value={`${safeLaunchAltitudeKm.toLocaleString()} km`} />

                {/* <div className="text-[10px] text-[#ffdca8] mt-4 mb-2 tracking-wider font-semibold uppercase">
                  Orbital Snapshot
                </div>
                <StatRow label="Total Objects (est.)" value={stats.total.toLocaleString()} />
                <StatRow label="Active Satellites" value={NASA_STATS.satellites.toLocaleString()} />
                <StatRow label="Tracked Debris ≥10 cm" value={NASA_STATS.largeDebris.toLocaleString()} warning />
                <StatRow label="Estimated Debris 1–10 cm" value={NASA_STATS.mediumDebris.toLocaleString()} warning />
                <StatRow label="Critical Debris >1 mm" value={NASA_STATS.smallDebrisEstimate.toLocaleString()} danger />
                <StatRow label="Risk Zones (visualized)" value={riskZonesRef.current.length.toString()} /> */}

                <div className="text-[10px] text-[#ffdca8] mt-4 mb-2 tracking-wider font-semibold uppercase">
                  Mission Controls
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <ControlButton onClick={focusOnLaunchSite}>FOCUS SITE</ControlButton>
                  <ControlButton onClick={toggleSatellites}>
                    {showSatellites ? 'HIDE SATS' : 'SHOW SATS'}
                  </ControlButton>
                  <ControlButton onClick={toggleLargeDebrisOnly}>
                    {showLargeDebris ? 'HIDE LARGE' : 'SHOW LARGE'}
                  </ControlButton>
                  <ControlButton onClick={toggleSmallDebrisOnly}>
                    {showSmallDebris ? 'HIDE CLOUD' : 'SHOW CLOUD'}
                  </ControlButton>
                  {/* <ControlButton onClick={togglePulse}>
                    {pulseRiskZones ? 'FREEZE RISK' : 'PULSE RISK'}
                  </ControlButton>
                  <ControlButton onClick={focusOnRisk}>RANDOM RISK</ControlButton> */}
                  <ControlButton onClick={resetView}>RESET VIEW</ControlButton>
                </div>

                <div className="text-[10px] text-[#ffdca8] mt-4 mb-2 tracking-wider font-semibold uppercase">
                  Small Debris Intensity
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={smallDebrisIntensity}
                    onChange={(e) => setSmallDebrisIntensity(parseFloat(e.target.value))}
                    className="w-full accent-[#ff914d]"
                  />
                  <span className="text-[10px] text-[#ffe8c8] w-8 text-right">
                    {(smallDebrisIntensity * 100).toFixed(0)}%
                  </span>
                </div>
              </>
            )}
          </div>

          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
            !panelExpanded ? 'max-h-[80px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            {!panelExpanded && (
              <div className="space-y-1 pt-1 text-[10px]">
                <div className="flex justify-between items-center">
                  <span className="text-[#ffe5ba]/80">Launch Site</span>
                  <span className="text-[#ffe8c8] font-bold tracking-wider">{safeLaunchName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#ffe5ba]/60">Lat / Lon</span>
                  <span className="text-[#ffbfa1] font-bold">
                    {safeLaunchLatitude.toFixed(2)}° / {safeLaunchLongitude.toFixed(2)}°
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#ffe5ba]/60">Target Altitude</span>
                  <span className="text-[#66f1ff] font-bold">{safeLaunchAltitudeKm.toLocaleString()} km</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend - Right Side */}
      <div className="absolute top-1/2 right-5 transform -translate-y-1/2 backdrop-blur-md bg-gradient-to-br from-[#0b0d1c]/90 via-[#150b2b]/90 to-[#240f2f]/90 p-1.5 mt-4 rounded-lg border border-[#ff6f3c]/35 shadow-[0_12px_36px_rgba(255,122,64,0.2)] font-mono text-[9px] animate-fade-in-slide-slow">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff6f3c]/12 via-transparent to-[#45d6ff]/12 rounded-lg pointer-events-none" />
        <div className="relative">
          <div className="text-[#8fe7ff] mb-1.5 tracking-wider font-semibold uppercase text-center text-[9px]">Legend</div>
          <LegendItem color="#4affb8" label="Satellites" />
          <LegendItem color="#7fffff" label="Launch Target" />
          <LegendItem color="#ff6b6b" label="Large Debris" />
          <LegendItem color="#ffd93d" label="Small Debris" />
          <LegendItem color="#ff4aff" label="Risk Zones" />
          <LegendItem color="#4a9eff" label="Orbit Shells" opacity={0.3} />
        </div>
      </div>

      {/* Launch Briefing Panel */}
      <div className="absolute top-3 right-5 mb-5 backdrop-blur-xl bg-gradient-to-br from-[#0a0d1f]/90 via-[#18113a]/90 to-[#240f2f]/90 p-2 rounded-xl border border-[#66f1ff]/30 shadow-[0_14px_40px_rgba(70,210,255,0.25)] max-w-[200px] font-mono text-[10px] leading-relaxed animate-fade-in-slide-medium">
        <div className="absolute inset-0 bg-gradient-to-br from-[#45d6ff]/12 via-transparent to-[#ff6f3c]/12 rounded-xl pointer-events-none" />
        <div className="relative space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-[#8fe7ff] tracking-wider font-semibold uppercase text-[10px]">Launch Briefing</div>
            <span className="px-1.5 py-0.5 rounded-md bg-[#ff6f3c]/20 border border-[#ff9d63]/40 text-[#ffdca8] text-[9px] uppercase tracking-wide">
              L-0
            </span>
          </div>
          <p className="text-[#cde8ff] leading-relaxed text-[9.5px]">
            Monitoring launch corridor at <span className="text-[#ffe29f]">{safeLaunchAltitudeKm.toLocaleString()} km</span>.
            Guidance systems synced with live debris telemetry to maintain a clear ascent window.
          </p>
          <div className="space-y-0.5 text-[#a8c7ff] text-[9px] uppercase tracking-[0.2em]">
            <div>Checkpoints</div>
            <ul className="space-y-0.5 text-[9.5px] text-[#f3f8ff] normal-case tracking-normal">
              <li>• Trajectory collision sweep every 30s</li>
              <li>• Dynamic reroute ready for orbital plane shifts</li>
              <li>• Launch beacon broadcasting to regional traffic</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Selected Object Info Panel */}
      {selectedObject && (
        <div className="absolute mt-20 bottom-24 right-5 backdrop-blur-xl bg-gradient-to-br from-[#090d1c]/90 via-[#180f2d]/90 to-[#250f2f]/90 p-3 rounded-xl border border-[#ff6f3c]/35 shadow-[0_14px_36px_rgba(255,122,64,0.22)] max-w-[240px] font-mono text-[10px] leading-relaxed animate-fade-in-slide">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff6f3c]/12 via-transparent to-[#45d6ff]/12 rounded-xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[#ffcf96] tracking-wider font-semibold uppercase text-[10px]">Selected Object</div>
              <button
                onClick={clearAllSelections}
                className="ml-3 p-0.5 rounded-md bg-[#ff6f3c]/20 border border-[#ff9d63]/40 hover:bg-[#ff6f3c]/30 hover:border-[#ffd29f]/60 transition-all duration-300 flex items-center justify-center"
                aria-label="Clear selection"
              >
                <svg className="w-2.5 h-2.5 text-[#ffe5ba]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {(() => {
              const info = getObjectInfo(selectedObject);
              return (
                <div>
                  <div className="text-[#f3f8ff] mb-1.5 text-[9.5px]">
                    <span className="text-[#ffe5ba]/70">Type:</span> <span className="text-[#66f1ff]">{info.type}</span>
                  </div>
                  <div className="text-[#d7e8ff] text-[9px] space-y-0.5">
                    {info.details.map((detail, index) => (
                      <div key={index} className="text-[#f3f8ff]/90">• {detail}</div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
interface StatRowProps {
  label: string;
  value: string;
  warning?: boolean;
  danger?: boolean;
}

const StatRow: React.FC<StatRowProps> = ({ label, value, warning, danger }) => (
  <div className="flex justify-between my-1.5 p-2.5 bg-gradient-to-r from-[#120f24]/70 to-[#1d1636]/70 border border-[#ff6f3c]/12 text-[11px] rounded-md transition-all duration-300 hover:border-[#ff9d63]/35">
    <span className="text-[#dbe8ff]">{label}</span>
    <span
      className={`font-bold font-mono tracking-wide transition-all duration-300 ${
        danger
          ? 'text-[#ff7b6b] drop-shadow-[0_0_12px_rgba(255,123,107,0.6)]'
          : warning
            ? 'text-[#ffd93d] drop-shadow-[0_0_12px_rgba(255,217,61,0.6)]'
            : 'text-[#66f1ff] drop-shadow-[0_0_12px_rgba(102,241,255,0.6)]'
      }`}
    >
      {value}
    </span>
  </div>
);

interface ControlButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const ControlButton: React.FC<ControlButtonProps> = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="w-full py-2 px-3 bg-gradient-to-br from-[#ff6f3c]/25 to-[#66f1ff]/20 border border-[#ff9d63]/40 rounded-md text-[#ffe8c8] font-mono text-[10px] tracking-wider transition-all duration-500 hover:from-[#ff6f3c]/35 hover:to-[#66f1ff]/30 hover:border-[#ffd29f]/60 hover:shadow-[0_0_24px_rgba(255,122,64,0.35)] hover:scale-[1.03] active:scale-[0.97] active:translate-y-px cursor-pointer backdrop-blur-sm"
  >
    {children}
  </button>
);

interface LegendItemProps {
  color: string;
  label: string;
  opacity?: number;
}

const LegendItem: React.FC<LegendItemProps> = ({ color, label, opacity = 1 }) => (
  <div className="flex items-center my-1 text-[#e4eeff] transition-all duration-300 hover:text-white">
    <div
      className="w-2.5 h-2.5 rounded-sm mr-1.5 border border-white/30 shadow-[0_0_8px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-110"
      style={{ backgroundColor: color, opacity }}
    />
    <span className="text-[9px]">{label}</span>
  </div>
);

interface LaunchDetailRowProps {
  label: string;
  value: string;
  accent?: boolean;
}

const LaunchDetailRow: React.FC<LaunchDetailRowProps> = ({ label, value, accent }) => (
  <div className="flex justify-between items-center py-1.5 text-[11px]">
    <span className="text-[#dbe8ff]/80">{label}</span>
    <span
      className={`font-mono tracking-wide ${
        accent ? 'text-[#ffe29f] drop-shadow-[0_0_10px_rgba(255,226,159,0.4)]' : 'text-[#8fe7ff]'
      }`}
    >
      {value}
    </span>
  </div>
);

export default EarthView;