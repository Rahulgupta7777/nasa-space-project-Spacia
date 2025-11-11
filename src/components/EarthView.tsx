'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  ChevronDown, 
  X, 
  Satellite, 
  AlertTriangle, 
  Radio, 
  Target, 
  RotateCcw, 
  Activity,
  Eye,
  EyeOff,
  Trash2,
  Zap,
  Globe,
  Layers,
  BarChart3,
  Info
} from 'lucide-react';

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

// Constants
const EARTH_RADIUS = 6.371;
const LEO_MIN = 0.16;
const LEO_MAX = 2.0;

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

const EarthView: React.FC = () => {
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
  const [panelExpanded, setPanelExpanded] = useState(true);
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set());
  const [highlightedObjects, setHighlightedObjects] = useState<Set<string>>(new Set());
  const [showSatellites, setShowSatellites] = useState(true);
  const [showLargeDebris, setShowLargeDebris] = useState(true);
  const [showSmallDebris, setShowSmallDebris] = useState(true);
  const [pulseRiskZones, setPulseRiskZones] = useState(true);
  const [animationPaused, setAnimationPaused] = useState(false);
  const [smallDebrisIntensity, setSmallDebrisIntensity] = useState(0.7); // opacity 0..1
  const [isMounted, setIsMounted] = useState(false);
  
  // Refs for animation state to avoid stale closures
  const animationPausedRef = useRef(false);
  const pulseRiskZonesRef = useRef(true);
  const smallDebrisIntensityRef = useRef(0.7);
  
  // Only show official stats; visualization is density-scaled for performance

  // Ensure component only renders on client to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync refs with state
  useEffect(() => {
    animationPausedRef.current = animationPaused;
  }, [animationPaused]);

  useEffect(() => {
    pulseRiskZonesRef.current = pulseRiskZones;
  }, [pulseRiskZones]);

  useEffect(() => {
    smallDebrisIntensityRef.current = smallDebrisIntensity;
  }, [smallDebrisIntensity]);

  useEffect(() => {
    // Ensure we're on the client side and component is mounted
    if (typeof window === 'undefined') return;
    if (!isMounted) return;
    if (!mountRef.current) return;

    // Check WebGL availability
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.error('WebGL is not supported in this browser');
      return;
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.0002);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(25, 15, 25);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup with error handling
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false
      });
      
      if (!renderer || !renderer.domElement) {
        throw new Error('Failed to create WebGL canvas');
      }
      
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mountRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    } catch (error) {
      console.error('Error creating WebGL renderer:', error);
      return;
    }

    // Ensure renderer was created successfully
    if (!renderer) {
      console.error('Renderer was not created');
      return;
    }

    // Type assertion: renderer is guaranteed to be non-null after the check
    const webglRenderer = renderer;

    // OrbitControls (dynamically imported)
    import('three/examples/jsm/controls/OrbitControls.js').then(({ OrbitControls }) => {
      const controls = new OrbitControls(camera, webglRenderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 8;
      controls.maxDistance = 60;
      controls.maxPolarAngle = Math.PI;
      controlsRef.current = controls;
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
      if (!animationPausedRef.current) {
        animationTime += 0.01;
      }

      // Rotate Earth
      const earth = scene.getObjectByName('earth');
      if (earth && !animationPausedRef.current) earth.rotation.y += 0.0003;

      // Rotate clouds slightly faster than Earth
      const clouds = scene.getObjectByName('clouds');
      if (clouds && !animationPausedRef.current) clouds.rotation.y += 0.0005;

      // Animate objects
      if (!animationPausedRef.current) {
        objectsRef.current.forEach((obj) => {
          obj.theta += obj.speed;

          const x = obj.radius * Math.sin(obj.inclination) * Math.cos(obj.theta);
          const y = obj.radius * Math.cos(obj.inclination);
          const z = obj.radius * Math.sin(obj.inclination) * Math.sin(obj.theta);

          obj.mesh.position.set(x, y, z);

          if (obj.type === 'large-debris' && obj.tumbleX && obj.tumbleY) {
            obj.mesh.rotation.x += obj.tumbleX;
            obj.mesh.rotation.y += obj.tumbleY;
          }
        });
      }

      // Animate small debris
      if (smallDebrisRef.current) {
        // apply intensity
        const mat = smallDebrisRef.current.material as THREE.PointsMaterial;
        mat.opacity = smallDebrisIntensityRef.current;
        if (!animationPausedRef.current) {
          smallDebrisRef.current.rotation.y += 0.0001;
        }
      }

      // Pulse risk zones
      riskZonesRef.current.forEach((zone) => {
        if (pulseRiskZonesRef.current && !animationPausedRef.current) {
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
      if (rendererRef.current) {
        rendererRef.current.render(scene, camera);
      }
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Add click event listener
    if (rendererRef.current && rendererRef.current.domElement) {
      rendererRef.current.domElement.addEventListener('click', handleCanvasClick);
      rendererRef.current.domElement.addEventListener('mousemove', handleCanvasMouseMove);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (rendererRef.current) {
        if (rendererRef.current.domElement) {
          rendererRef.current.domElement.removeEventListener('click', handleCanvasClick);
          rendererRef.current.domElement.removeEventListener('mousemove', handleCanvasMouseMove);
          
          if (mountRef.current && mountRef.current.contains(rendererRef.current.domElement)) {
            mountRef.current.removeChild(rendererRef.current.domElement);
          }
        }
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      
      // Dispose OrbitControls
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }
    };
  }, [isMounted]);

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

  // Prevent hydration mismatch by only rendering on client
  if (!isMounted) {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
        <div className="text-gray-400 font-mono text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Canvas */}
      <div ref={mountRef} className="w-full h-full" />

      {/* UI Panel - Reduced Size */}
      <div className={`absolute top-5 left-5 backdrop-blur-md bg-gradient-to-br from-[#0a0a0f]/90 via-[#0f1520]/90 to-[#0a0a0f]/90 rounded-lg border border-[#2a4a6a]/60 shadow-[0_8px_32px_0_rgba(74,158,255,0.15)] font-mono text-[12px] text-gray-200 animate-fade-in-slide transition-all duration-500 ease-in-out ${
        panelExpanded ? 'p-4 min-w-[180px]' : 'p-2 min-w-[180px]'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a3a5a]/20 to-transparent rounded-lg pointer-events-none" />
        <div className="relative">
          {/* Header - Smaller */}
          <div className="flex items-center justify-between mb-2">
            <h1 className={`text-transparent bg-clip-text bg-gradient-to-r from-[#4a9eff] via-[#6ab0ff] to-[#4a9eff] tracking-[1px] font-semibold transition-all duration-300 ${
              panelExpanded ? 'text-[14px]' : 'text-[11px]'
            }`}>
              LEO DEBRIS
            </h1>
            <button
              onClick={() => setPanelExpanded(!panelExpanded)}
              className="ml-1 p-1 rounded-md bg-[#1a3a5a]/40 border border-[#2a4a6a]/60 hover:bg-[#2a4a6a]/60 hover:border-[#4a9eff]/60 transition-all duration-300 flex items-center justify-center"
              aria-label={panelExpanded ? 'Collapse panel' : 'Expand panel'}
            >
              <ChevronDown
                className={`w-3 h-3 text-[#6ab0ff] transition-transform duration-300 ${
                  panelExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
            panelExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            {panelExpanded && (
              <>
                <div className="border-b border-[#2a4a6a]/50 pb-3 mb-4" />

                <div className="text-[10px] text-[#6ab0ff] mt-3 mb-2 tracking-wider font-semibold uppercase flex items-center gap-1.5">
                  <BarChart3 className="w-3 h-3" />
                  OBJECT STATISTICS
                </div>
                <StatRow label="Total Objects (est.)" value={stats.total.toLocaleString()} icon={<Globe className="w-3 h-3 text-[#4a9eff]" />} />
                <StatRow label="Active Satellites" satelliteZone value={NASA_STATS.satellites.toLocaleString()} icon={<Satellite className="w-3 h-3 text-[#4affb8]" />} />
                <StatRow label="Debris ≥10 cm (tracked)" value={NASA_STATS.largeDebris.toLocaleString()} danger icon={<Trash2 className="w-3 h-3 text-[#ff6b6b]" />} />
                <StatRow label="Debris 1–10 cm (est.)" value={NASA_STATS.mediumDebris.toLocaleString()} warning icon={<AlertTriangle className="w-3 h-3 text-[#ffd93d]" />}/>
                <StatRow
                  label="Debris >1 mm (est.)"
                  value={NASA_STATS.smallDebrisEstimate.toLocaleString()}
                  warning
                  icon={<AlertTriangle className="w-3 h-3 text-[#ffd93d]" />}
                />
                <StatRow  riskZone label="Risk Zones (visualized)" value={riskZonesRef.current.length.toString()} icon={<Zap className="w-3 h-3 text-[#ff4aff]" />} />

                <div className="text-[10px] text-[#6ab0ff] mt-4 mb-2 tracking-wider font-semibold uppercase flex items-center gap-1.5">
                  <Layers className="w-3 h-3" />
                  ORBITAL PARAMS
                </div>

                <StatRow label="Avg Velocity" value="7.66 km/s" icon={<Activity className="w-3 h-3 text-[#4a9eff]" />} />
                <StatRow label="Period (400km)" value="92.5 min" icon={<Radio className="w-3 h-3 text-[#4a9eff]" />} />

                <div className="text-[10px] text-[#6ab0ff] mt-4 mb-2 tracking-wider font-semibold uppercase flex items-center gap-1.5">
                  <Eye className="w-3 h-3" />
                  VIEW CONTROLS
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <ControlButton onClick={toggleSatellites}>
                    <div className="flex items-center gap-1.5 justify-center">
                      {showSatellites ? <EyeOff className="w-3 h-3 text-[#4affb8]" /> : <Eye className="w-3 h-3 text-[#4affb8]" />}
                      <span>{showSatellites ? 'HIDE' : 'SHOW'} SATELLITES</span>
                    </div>
                  </ControlButton>
                  <ControlButton onClick={toggleLargeDebrisOnly}>
                    <div className="flex items-center gap-1.5 justify-center">
                      {showLargeDebris ? <EyeOff className="w-3 h-3 text-[#ff6b6b]" /> : <Eye className="w-3 h-3 text-[#ff6b6b]" />}
                      <span>{showLargeDebris ? 'HIDE' : 'SHOW'} LARGE DEBRIS</span>
                    </div>
                  </ControlButton>
                  <ControlButton onClick={toggleSmallDebrisOnly}>
                    <div className="flex items-center gap-1.5 justify-center">
                      {showSmallDebris ? <EyeOff className="w-3 h-3 text-[#ffd93d]" /> : <Eye className="w-3 h-3 text-[#ffd93d]" />}
                      <span>{showSmallDebris ? 'HIDE' : 'SHOW'} SMALL DEBRIS</span>
                    </div>
                  </ControlButton>

                  <ControlButton onClick={togglePulse}>
                    <div className="flex items-center gap-1.5 justify-center">
                      <Radio className="w-3 h-3 text-[#ff4aff]" />
                      <span>{pulseRiskZones ? 'STOP' : 'START'} PULSE</span>
                    </div>
                  </ControlButton>
                  {/* <ControlButton onClick={toggleAnimation}>
                    {animationPaused ? 'PLAY' : 'PAUSE'} ANIMATION
                  </ControlButton> */}
                  <ControlButton onClick={focusOnRisk}>
                    <div className="flex items-center gap-1.5 justify-center">
                      <Target className="w-3 h-3 text-[#ff4aff]" />
                      <span>FOCUS RISK</span>
                    </div>
                  </ControlButton>
                  <ControlButton onClick={resetView}>
                    <div className="flex items-center gap-1.5 justify-center">
                      <RotateCcw className="w-3 h-3 text-[#4a9eff]" />
                      <span>RESET VIEW</span>
                    </div>
                  </ControlButton>
                </div>
                <div className="text-[10px] text-[#6ab0ff] mt-4 mb-2 tracking-wider font-semibold uppercase flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-[#ffd93d]" />
                  SMALL DEBRIS INTENSITY
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={smallDebrisIntensity}
                    onChange={(e) => setSmallDebrisIntensity(parseFloat(e.target.value))}
                    className="w-full accent-[#4a9eff]"
                  />
                  <span className="text-[10px] text-gray-300 w-8 text-right">
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
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-gray-400">Total Objects (est.)</span>
                  <span className="text-[#4affb8] font-bold font-mono">
                    {stats.total.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend - Right Side */}
      <div className="absolute top-1/2 right-5 transform -translate-y-1/2 backdrop-blur-md bg-gradient-to-br from-[#0a0a0f]/90 via-[#0f1520]/90 to-[#0a0a0f]/90 p-4 rounded-xl border border-[#2a4a6a]/60 shadow-[0_8px_32px_0_rgba(74,158,255,0.15)] font-mono text-[10px] animate-fade-in-slide-slow">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a3a5a]/20 to-transparent rounded-xl pointer-events-none" />
        <div className="relative">
          <div className="text-[#6ab0ff] mb-2 tracking-wider font-semibold uppercase text-center flex items-center justify-center gap-1.5">
            <Layers className="w-3 h-3" />
            LEGEND
          </div>
          <LegendItem color="#4affb8" label="Satellites" icon={<Satellite className="w-3 h-3 text-[#4affb8]" />} />
          <LegendItem color="#ff6b6b" label="Large Debris" icon={<Trash2 className="w-3 h-3 text-[#ff6b6b]" />} />
          <LegendItem color="#ffd93d" label="Small Debris" icon={<AlertTriangle className="w-3 h-3 text-[#ffd93d]" />} />
          <LegendItem color="#ff4aff" label="Risk Zones" icon={<Zap className="w-3 h-3 text-[#ff4aff]" />} />
        </div>
      </div>

      {/* Info Panel */}
      <div className="absolute top-5 right-5 backdrop-blur-md bg-gradient-to-br from-[#0a0a0f]/90 via-[#0f1520]/90 to-[#0a0a0f]/90 p-6 rounded-xl border border-[#2a4a6a]/60 shadow-[0_8px_32px_0_rgba(74,158,255,0.15)] max-w-[320px] font-mono text-[11px] leading-relaxed animate-fade-in-slide-medium">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a3a5a]/20 to-transparent rounded-xl pointer-events-none" />
        <div className="relative">
          <div className="text-[#6ab0ff] mb-3 tracking-wider font-semibold uppercase flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            ORBITAL CONTEXT
          </div>
          <p className="text-gray-300 mb-3 leading-relaxed">
            This visualization represents Low Earth Orbit (160-2,000 km altitude) space debris
            distribution based on statistical models.
          </p>
          <p className="text-gray-300 leading-relaxed">
            <strong className="text-[#6ab0ff]">Key Facts:</strong>
            <br />
            • ~28,000 debris objects ≥10 cm tracked
            <br />
            • ~500,000 debris objects 1–10 cm estimated
            <br />
            • &gt;100 million debris objects &gt;1 mm estimated
            <br />
            • Impact velocity: 10-15 km/s avg
            <br />• Kessler Syndrome risk: Critical
          </p>
        </div>
      </div>

      {/* Selected Object Info Panel */}
      {selectedObject && (
        <div className="absolute bottom-25 right-5 backdrop-blur-md bg-gradient-to-br from-[#0a0a0f]/90 via-[#0f1520]/90 to-[#0a0a0f]/90 p-4 rounded-xl border border-[#2a4a6a]/60 shadow-[0_8px_32px_0_rgba(74,158,255,0.15)] max-w-[280px] font-mono text-[11px] leading-relaxed animate-fade-in-slide">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a3a5a]/20 to-transparent rounded-xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[#6ab0ff] tracking-wider font-semibold uppercase">SELECTED OBJECT</div>
              <button
                onClick={clearAllSelections}
                className="ml-4 p-1 rounded-md bg-[#1a3a5a]/40 border border-[#2a4a6a]/60 hover:bg-[#2a4a6a]/60 hover:border-[#4a9eff]/60 transition-all duration-300 flex items-center justify-center"
                aria-label="Clear selection"
              >
                <X className="w-3 h-3 text-[#6ab0ff]" />
              </button>
            </div>
            {(() => {
              const info = getObjectInfo(selectedObject);
              return (
                <div>
                  <div className="text-gray-200 mb-2">
                    <span className="text-gray-400">Type:</span> <span className="text-[#4affb8]">{info.type}</span>
                  </div>
                  <div className="text-gray-300 text-[10px] space-y-1">
                    {info.details.map((detail, index) => (
                      <div key={index} className="text-gray-300">• {detail}</div>
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
  riskZone?: boolean;
  satelliteZone?: boolean;
  icon?: React.ReactNode;
}

const StatRow: React.FC<StatRowProps> = ({ label, value, warning, danger, riskZone, satelliteZone, icon }) => (
  <div className="flex justify-between items-center my-1.5 p-2 px-2.5 bg-gradient-to-r from-[#141923]/70 to-[#0f1520]/50 border-l-2 border-[#2a4a6a]/60 text-[11px] rounded-r-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-[#1a2533]/80 hover:to-[#141923]/60 hover:border-[#3a5a8a]/80">
    <div className="flex items-center gap-1.5">
      {icon && <span>{icon}</span>}
      <span className="text-gray-300">{label}</span>
    </div>
    <span
  className={`font-bold font-mono transition-all duration-300 ${
    danger
      ? 'text-[#ff6b6b] drop-shadow-[0_0_8px_rgba(255,107,107,0.5)]'
      : warning
      ? 'text-[#ffd93d] drop-shadow-[0_0_8px_rgba(255,217,61,0.5)]'
      : riskZone
      ? 'text-[#ff4aff] drop-shadow-[0_0_8px_rgba(255,74,255,0.5)]'
      : satelliteZone
      ? 'text-[#4affb8] drop-shadow-[0_0_8px_rgba(74,255,184,0.5)]'
      : 'text-[#4a9eff] drop-shadow-[0_0_8px_rgba(74,158,255,0.5)]'
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
    className="w-full py-2 px-3 bg-gradient-to-br from-[#1a3a5a]/80 to-[#2a4a7a]/80 border border-[#3a5a8a]/60 rounded-md text-gray-200 font-mono text-[10px] tracking-wider transition-all duration-500 hover:from-[#2a4a6a] hover:to-[#3a5a8a] hover:border-[#4a9eff]/80 hover:shadow-[0_0_20px_rgba(74,158,255,0.3)] hover:scale-[1.02] active:scale-[0.98] active:translate-y-px cursor-pointer backdrop-blur-sm"
  >
    {children}
  </button>
);

interface LegendItemProps {
  color: string;
  label: string;
  opacity?: number;
  icon?: React.ReactNode;
}

const LegendItem: React.FC<LegendItemProps> = ({ color, label, opacity = 1, icon }) => (
  <div className="flex items-center my-1.5 text-gray-300 transition-all duration-300 hover:text-gray-100">
    <div
      className="w-3 h-3 rounded-sm mr-2 border border-white/30 shadow-[0_0_8px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-110"
      style={{ backgroundColor: color, opacity }}
    />
    {icon && <span className="mr-1.5">{icon}</span>}
    <span className="text-[10px]">{label}</span>
  </div>
);

export default EarthView;