'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import gsap from 'gsap';
import {
  Box,
  Layers,
  RotateCw,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  X,
  ShieldCheck,
  Truck,
  Flame,
  Maximize2,
  ChevronRight,
  Eye,
  Sliders,
  ZoomIn,
  ZoomOut,
  Info,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import CartDrawer from '@/components/cart/CartDrawer';
import { RfqLineItem } from '@/lib/types';

// Zone Definitions
interface Zone {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  camPos: [number, number, number];
  camLook: [number, number, number];
  hotspotPos: [number, number, number];
  featuredProduct: {
    sku: string;
    name: string;
    standard: string;
    grade: string;
    price: number;
    weightKg: number;
    stock: string;
    leadTime: string;
    details: string;
    approvals: string[];
  };
}

const ZONES: Zone[] = [
  {
    id: 'heavy-anchors',
    name: 'Zone 1: Heavy Anchors Bay',
    subtitle: 'High-Performance Structural Fixings & Seismic Anchor Studs',
    category: 'Steel Fixings & Anchors',
    camPos: [14, 11, 14],
    camLook: [6, 2, 6],
    hotspotPos: [6, 2.5, 6],
    featuredProduct: {
      sku: 'CBH-FAZ2-M12-100',
      name: 'FAZ II Plus High-Performance Bolt Anchor M12x100',
      standard: 'ETA Option 1 / C1 & C2 Seismic',
      grade: 'High-Grade Zinc Plated (5μm)',
      price: 148.5,
      weightKg: 0.125,
      stock: '14,200 pcs in stock (Bhiwandi Depot)',
      leadTime: 'Same-day dispatch',
      details: 'Calibrated expansion clip engineered for maximum tensile load in cracked & non-cracked concrete. Variable embedment depth hef = 40-70mm.',
      approvals: ['ETA-19/0520', 'Seismic C1/C2', 'Fire R120', 'ICC-ES']
    }
  },
  {
    id: 'high-tensile',
    name: 'Zone 2: High-Tensile Fasteners',
    subtitle: 'Automated High-Bay Pallet Racks // Grade 8.8 & 10.9',
    category: 'Hex Screws & Bolts',
    camPos: [-14, 12, 12],
    camLook: [-6, 3, 4],
    hotspotPos: [-6, 3, 4],
    featuredProduct: {
      sku: 'CBH-DIN933-M16-80-109',
      name: 'Hexagon Head Screws Full Thread M16x80 Grade 10.9',
      standard: 'DIN 933 / ISO 4017',
      grade: 'Alloy Steel Grade 10.9 Black Oxide',
      price: 36.8,
      weightKg: 0.155,
      stock: '48,000 pcs in stock (Aisle 4-B)',
      leadTime: 'Dispatch in 24 Hours',
      details: 'High-tensile proof-load tested alloy steel screws for structural steel frameworks, pressure piping, and heavy machinery bolting.',
      approvals: ['ISO 4017', 'EN 10204 3.1 MTC', 'BIS Certified']
    }
  },
  {
    id: 'qa-lab',
    name: 'Zone 3: Metallurgy & Testing Lab',
    subtitle: 'Calibrated Tensile Rig, Hardness Tester & MTC 3.1 Verification',
    category: 'Quality Assurance',
    camPos: [-12, 10, -12],
    camLook: [-4, 2, -4],
    hotspotPos: [-4, 2, -4],
    featuredProduct: {
      sku: 'CBH-MTC-CERT-LAB',
      name: '100% Batch Proof Load & Salt-Spray Verified Lots',
      standard: 'ISO 9001:2015 / NABL Accredited',
      grade: 'Full Traceability Heat Code Stamped',
      price: 0,
      weightKg: 0,
      stock: 'Continuous QA Testing in Progress',
      leadTime: 'Digital MTC with every invoice',
      details: 'Every batch undergoes Vickers hardness testing (HV), ultrasonic crack detection, and 720-hour salt spray corrosion test.',
      approvals: ['NABL Accredited', 'MTC Type 3.1', 'ISO 9001:2015']
    }
  },
  {
    id: 'dispatch-bay',
    name: 'Zone 4: Express Dispatch & Fleet',
    subtitle: 'Automated Loading Bays // PAN-India Express Freight',
    category: 'Logistics & Surplus Depot',
    camPos: [15, 12, -14],
    camLook: [6, 2, -6],
    hotspotPos: [6, 2, -6],
    featuredProduct: {
      sku: 'CBH-LOT-SURPLUS-88',
      name: 'Factory Surplus Lot: M12 Hex Nuts DIN 934 Grade 8',
      standard: 'DIN 934 / ISO 4032',
      grade: 'Grade 8 Hot-Dip Galvanized',
      price: 3.45,
      weightKg: 0.017,
      stock: '25,000 pcs Master Pallet Lot',
      leadTime: 'Immediate Dispatch from Dock 2',
      details: 'Surplus OEM manufacturing lot offered at 28% clearance discount. Complete with original test certificates.',
      approvals: ['Immediate 24h Truckload', 'Clearance Rate ₹3.45/pc', 'ISO 4032']
    }
  }
];

export default function VirtualStorePage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeZone, setActiveZone] = useState<Zone | null>(null);
  const [isOverview, setIsOverview] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isExploded, setIsExploded] = useState(false);
  const [quantity, setQuantity] = useState(500);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(1);
  const [isNightMode, setIsNightMode] = useState(false);
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([
    {
      id: 1,
      productId: 1,
      sku: 'CBH-FAZ2-M12-100',
      name: 'FAZ II Plus Bolt Anchor M12x100 Grade 5.8 / 8.8 BP',
      standard: 'ETA Option 1',
      unit: 'PCS',
      unitRate: 148.5,
      quantity: 500,
      weightPerPcKg: 0.125,
      totalWeightKg: 500 * 0.125,
      rowTotal: 500 * 148.5
    }
  ]);

  // Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 2, 0));
  const explodedPartsRef = useRef<{
    nut: THREE.Mesh | null;
    washer: THREE.Mesh | null;
    clip: THREE.Mesh | null;
    stud: THREE.Mesh | null;
    group: THREE.Group | null;
  }>({ nut: null, washer: null, clip: null, stud: null, group: null });

  // Initialize Three.js 3D Virtual Depot
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isNightMode ? 0x080c16 : 0xf4f7fb);
    scene.fog = new THREE.FogExp2(isNightMode ? 0x080c16 : 0xf4f7fb, 0.015);
    sceneRef.current = scene;

    // 2. Camera (Isometric Perspective)
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(38, 28, 38);
    camera.lookAt(0, 2, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isNightMode ? 0.8 : 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, isNightMode ? 1.0 : 2.2);
    dirLight.position.set(30, 45, 25);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 150;
    const d = 35;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    // Blue & Orange Accent Spotlights
    const blueSpot = new THREE.SpotLight(0x0052cc, 5.0, 50, Math.PI / 4, 0.4);
    blueSpot.position.set(0, 20, 0);
    scene.add(blueSpot);

    const orangeAccentSpot = new THREE.PointLight(0xff6b00, 3.0, 30);
    orangeAccentSpot.position.set(6, 4, -6);
    scene.add(orangeAccentSpot);

    // 5. Materials
    const floorMat = new THREE.MeshStandardMaterial({
      color: isNightMode ? 0x0f172a : 0xe2e8f0,
      roughness: 0.65,
      metalness: 0.15
    });
    const roadMat = new THREE.MeshStandardMaterial({
      color: isNightMode ? 0x070b14 : 0xcbd5e1,
      roughness: 0.8
    });
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x0052cc, // Brand Blue
      roughness: 0.4,
      metalness: 0.7
    });
    const orangeMat = new THREE.MeshStandardMaterial({
      color: 0xff6b00, // Brand Orange
      roughness: 0.3,
      metalness: 0.4
    });
    const galvanizedMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.3,
      metalness: 0.85
    });
    const whiteWallMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      transmission: 0.8,
      thickness: 0.5
    });

    // 6. Architectural Elements: Floor & Roads
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid markings
    const grid = new THREE.GridHelper(80, 40, isNightMode ? 0x1e293b : 0xcbd5e1, isNightMode ? 0x0f172a : 0xe2e8f0);
    grid.position.y = 0.02;
    scene.add(grid);

    // Perimeter Yellow/Orange Safety Border
    const safetyLine = new THREE.Mesh(
      new THREE.RingGeometry(24, 24.3, 64),
      new THREE.MeshBasicMaterial({ color: 0xff6b00, side: THREE.DoubleSide })
    );
    safetyLine.rotation.x = -Math.PI / 2;
    safetyLine.position.y = 0.03;
    scene.add(safetyLine);

    // 7. Warehouse Building & High-Bay Racking Structure
    const depotGroup = new THREE.Group();
    scene.add(depotGroup);

    // Main Warehouse Building Shell (Cutaway / Isometric View)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(36, 12, 1), whiteWallMat);
    backWall.position.set(0, 6, -18);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    depotGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(1, 12, 36), whiteWallMat);
    leftWall.position.set(-18, 6, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    depotGroup.add(leftWall);

    // Steel Pillars
    for (let x = -15; x <= 15; x += 10) {
      for (let z = -15; z <= 15; z += 10) {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.6, 12, 0.6), steelMat);
        pillar.position.set(x, 6, z);
        pillar.castShadow = true;
        depotGroup.add(pillar);
      }
    }

    // High-Bay Pallet Racks Helper Function
    const createPalletRack = (posX: number, posZ: number, rotationY = 0) => {
      const rackGroup = new THREE.Group();
      rackGroup.position.set(posX, 0, posZ);
      rackGroup.rotation.y = rotationY;

      // Vertical Uprights (Blue Steel)
      for (let x = -4; x <= 4; x += 2) {
        for (let z = -0.8; z <= 0.8; z += 1.6) {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.15, 8, 0.15), steelMat);
          post.position.set(x, 4, z);
          post.castShadow = true;
          rackGroup.add(post);
        }
      }

      // Horizontal Beams (Orange Steel)
      for (let y = 1.5; y <= 7.5; y += 2) {
        const beamF = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.15, 0.1), orangeMat);
        beamF.position.set(0, y, 0.8);
        beamF.castShadow = true;
        rackGroup.add(beamF);

        const beamB = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.15, 0.1), orangeMat);
        beamB.position.set(0, y, -0.8);
        beamB.castShadow = true;
        rackGroup.add(beamB);

        // Pallet Boxes on Shelves
        for (let bx = -3; bx <= 3; bx += 1.5) {
          const boxMat = Math.random() > 0.4 ? galvanizedMat : Math.random() > 0.5 ? steelMat : orangeMat;
          const box = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.8, 1.3), boxMat);
          box.position.set(bx, y + 0.45, 0);
          box.castShadow = true;
          rackGroup.add(box);
        }
      }

      return rackGroup;
    };

    // Add High-Bay Racks for Zone 1 & Zone 2
    const rack1 = createPalletRack(6, 6, 0);
    const rack2 = createPalletRack(-6, 6, 0);
    const rack3 = createPalletRack(-6, -6, Math.PI / 2);
    depotGroup.add(rack1);
    depotGroup.add(rack2);
    depotGroup.add(rack3);

    // 8. Logistics Loading Dock & CBH Delivery Trucks
    const dockBay = new THREE.Mesh(new THREE.BoxGeometry(16, 2, 8), floorMat);
    dockBay.position.set(6, 1, -12);
    dockBay.castShadow = true;
    depotGroup.add(dockBay);

    // Truck Generator
    const createTruck = (x: number, z: number, angle = 0) => {
      const truck = new THREE.Group();
      truck.position.set(x, 1, z);
      truck.rotation.y = angle;

      // Cabin (White)
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.5, 2), whiteWallMat);
      cabin.position.set(0, 1.25, 3.5);
      cabin.castShadow = true;
      truck.add(cabin);

      // Windshield
      const windshield = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 0.2), glassMat);
      windshield.position.set(0, 1.7, 4.52);
      truck.add(windshield);

      // Trailer Body (Blue Brand)
      const trailer = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.2, 6.5), steelMat);
      trailer.position.set(0, 1.6, -1);
      trailer.castShadow = true;
      truck.add(trailer);

      // Orange Branding Accent Stripe
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.42, 0.4, 6.5), orangeMat);
      stripe.position.set(0, 1.6, -1);
      truck.add(stripe);

      // Wheels
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
      for (const wz of [-3, -1.5, 3]) {
        for (const wx of [-1.2, 1.2]) {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.35, 16), wheelMat);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(wx, 0.45, wz);
          wheel.castShadow = true;
          truck.add(wheel);
        }
      }

      return truck;
    };

    const truck1 = createTruck(6, -14, Math.PI);
    const truck2 = createTruck(12, -14, Math.PI);
    depotGroup.add(truck1);
    depotGroup.add(truck2);

    // Animated Forklift
    const forklift = new THREE.Group();
    forklift.position.set(0, 0, 0);
    const forkBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.8), orangeMat);
    forkBody.position.y = 0.8;
    forkBody.castShadow = true;
    forklift.add(forkBody);

    const forkMast = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.4, 0.1), steelMat);
    forkMast.position.set(0, 1.4, 1.0);
    forklift.add(forkMast);

    const forkPallet = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 1.0), galvanizedMat);
    forkPallet.position.set(0, 0.8, 1.4);
    forkPallet.castShadow = true;
    forklift.add(forkPallet);
    depotGroup.add(forklift);

    // 9. Interactive 3D Product Model: FAZ II Plus Bolt Anchor
    const boltGroup = new THREE.Group();
    boltGroup.position.set(6, 2.2, 6);
    boltGroup.scale.set(0.6, 0.6, 0.6);
    scene.add(boltGroup);

    // Threaded Stud
    const studGeom = new THREE.CylinderGeometry(0.3, 0.3, 6, 32);
    const studMesh = new THREE.Mesh(studGeom, galvanizedMat);
    studMesh.castShadow = true;
    studMesh.rotation.x = Math.PI / 2;
    boltGroup.add(studMesh);

    // Expansion Clip
    const clipGeom = new THREE.CylinderGeometry(0.38, 0.38, 1.2, 32, 1, true);
    const clipMesh = new THREE.Mesh(clipGeom, new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.95,
      roughness: 0.15,
      side: THREE.DoubleSide
    }));
    clipMesh.rotation.x = Math.PI / 2;
    clipMesh.position.z = 1.8;
    boltGroup.add(clipMesh);

    // DIN 125 Washer
    const washerGeom = new THREE.CylinderGeometry(0.7, 0.7, 0.1, 32);
    const washerMesh = new THREE.Mesh(washerGeom, galvanizedMat);
    washerMesh.rotation.x = Math.PI / 2;
    washerMesh.position.z = -1.8;
    boltGroup.add(washerMesh);

    // DIN 934 Hex Nut
    const nutGeom = new THREE.CylinderGeometry(0.6, 0.6, 0.5, 6);
    const nutMesh = new THREE.Mesh(nutGeom, galvanizedMat);
    nutMesh.rotation.x = Math.PI / 2;
    nutMesh.position.z = -2.2;
    boltGroup.add(nutMesh);

    explodedPartsRef.current = {
      nut: nutMesh,
      washer: washerMesh,
      clip: clipMesh,
      stud: studMesh,
      group: boltGroup
    };

    // 10. Interactive Ground Hotspot Markers with Pulsing Radar Rings
    const hotspotMarkers: THREE.Mesh[] = [];
    ZONES.forEach((zone) => {
      const ringGeom = new THREE.RingGeometry(1.2, 1.5, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff6b00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(zone.hotspotPos[0], 0.05, zone.hotspotPos[2]);
      scene.add(ring);
      hotspotMarkers.push(ring);
    });

    // 11. Mouse Drag / Orbit Interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !cameraRef.current) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      // Rotate camera around controls target
      const cam = cameraRef.current;
      const offset = cam.position.clone().sub(controlsTargetRef.current);
      const radius = offset.length();
      let theta = Math.atan2(offset.x, offset.z);
      let phi = Math.acos(Math.max(0.1, Math.min(1.5, offset.y / radius)));

      theta -= deltaX * 0.005;
      phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, phi - deltaY * 0.005));

      cam.position.x = controlsTargetRef.current.x + radius * Math.sin(phi) * Math.sin(theta);
      cam.position.y = controlsTargetRef.current.y + radius * Math.cos(phi);
      cam.position.z = controlsTargetRef.current.z + radius * Math.sin(phi) * Math.cos(theta);
      cam.lookAt(controlsTargetRef.current);
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      if (!cameraRef.current) return;
      const cam = cameraRef.current;
      const zoomFactor = e.deltaY * 0.02;
      const dir = cam.position.clone().sub(controlsTargetRef.current).normalize();
      const currentDist = cam.position.distanceTo(controlsTargetRef.current);
      const newDist = Math.max(6, Math.min(75, currentDist + zoomFactor));
      cam.position.copy(controlsTargetRef.current).add(dir.multiplyScalar(newDist));
      cam.lookAt(controlsTargetRef.current);
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: true });

    // 12. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slow idle rotation of warehouse when in overview
      if (isOverview && !isDragging) {
        depotGroup.rotation.y = Math.sin(elapsedTime * 0.08) * 0.05;
      }

      // Forklift gentle patrol animation
      forklift.position.x = Math.sin(elapsedTime * 0.6) * 4;
      forklift.position.z = Math.cos(elapsedTime * 0.4) * 3;
      forklift.rotation.y = Math.atan2(Math.cos(elapsedTime * 0.6) * 4, -Math.sin(elapsedTime * 0.4) * 3);

      // Pulse hotspot rings
      hotspotMarkers.forEach((marker, idx) => {
        const s = 1 + Math.sin(elapsedTime * 3 + idx) * 0.15;
        marker.scale.set(s, s, s);
      });

      // Bolt slow rotation if inspector active
      if (boltGroup) {
        boltGroup.rotation.y = elapsedTime * 0.4;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 13. Window Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [isNightMode, isOverview]);

  // GSAP Camera Navigation to Zones
  const navigateToZone = (zone: Zone) => {
    if (!cameraRef.current) return;
    setActiveZone(zone);
    setIsOverview(false);
    setIsInspectorOpen(false);

    const cam = cameraRef.current;
    gsap.to(cam.position, {
      x: zone.camPos[0],
      y: zone.camPos[1],
      z: zone.camPos[2],
      duration: 1.8,
      ease: 'power3.inOut'
    });

    gsap.to(controlsTargetRef.current, {
      x: zone.camLook[0],
      y: zone.camLook[1],
      z: zone.camLook[2],
      duration: 1.8,
      ease: 'power3.inOut',
      onUpdate: () => {
        cam.lookAt(controlsTargetRef.current);
      }
    });
  };

  // Reset to Isometric 360 Overview
  const resetToOverview = () => {
    if (!cameraRef.current) return;
    setActiveZone(null);
    setIsOverview(true);
    setIsInspectorOpen(false);

    const cam = cameraRef.current;
    gsap.to(cam.position, {
      x: 38,
      y: 28,
      z: 38,
      duration: 2.0,
      ease: 'power3.inOut'
    });

    gsap.to(controlsTargetRef.current, {
      x: 0,
      y: 2,
      z: 0,
      duration: 2.0,
      ease: 'power3.inOut',
      onUpdate: () => {
        cam.lookAt(controlsTargetRef.current);
      }
    });
  };

  // Focus on 3D Bolt Anchor Inspector
  const open3DInspector = () => {
    if (!cameraRef.current) return;
    setIsInspectorOpen(true);
    setIsOverview(false);

    const cam = cameraRef.current;
    gsap.to(cam.position, {
      x: 9,
      y: 3.5,
      z: 9,
      duration: 1.6,
      ease: 'power3.inOut'
    });

    gsap.to(controlsTargetRef.current, {
      x: 6,
      y: 2.2,
      z: 6,
      duration: 1.6,
      ease: 'power3.inOut',
      onUpdate: () => {
        cam.lookAt(controlsTargetRef.current);
      }
    });
  };

  // GSAP Exploded Assembly Animation
  const toggleExplodedAssembly = () => {
    const parts = explodedPartsRef.current;
    if (!parts.nut || !parts.washer || !parts.clip) return;

    const nextState = !isExploded;
    setIsExploded(nextState);

    if (nextState) {
      // Explode outwards along stud axis
      gsap.to(parts.nut.position, { z: -4.5, duration: 1.2, ease: 'back.out(1.5)' });
      gsap.to(parts.washer.position, { z: -3.4, duration: 1.2, ease: 'back.out(1.5)' });
      gsap.to(parts.clip.position, { z: 3.2, duration: 1.2, ease: 'back.out(1.5)' });
    } else {
      // Collapse back to assembled position
      gsap.to(parts.nut.position, { z: -2.2, duration: 1.0, ease: 'power2.inOut' });
      gsap.to(parts.washer.position, { z: -1.8, duration: 1.0, ease: 'power2.inOut' });
      gsap.to(parts.clip.position, { z: 1.8, duration: 1.0, ease: 'power2.inOut' });
    }
  };

  // Add Product to Cart Drawer
  const handleAddToCart = (product: Zone['featuredProduct']) => {
    const newLineItem: RfqLineItem = {
      id: Date.now(),
      productId: 101,
      sku: product.sku,
      name: product.name,
      standard: product.standard,
      unit: 'PCS',
      unitRate: product.price,
      quantity: quantity,
      weightPerPcKg: product.weightKg,
      totalWeightKg: quantity * product.weightKg,
      rowTotal: quantity * product.price
    };

    setCartItems((prev) => [newLineItem, ...prev]);
    setCartCount((c) => c + 1);
    setIsCartOpen(true);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0f1d' }}>
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

      {/* Top Floating Command Navigation Bar */}
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(10, 15, 29, 0.9) 0%, rgba(10, 15, 29, 0) 100%)',
          zIndex: 40,
          pointerEvents: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', pointerEvents: 'auto' }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '8px 16px',
              borderRadius: '8px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)'
            }}
          >
            <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '18px', color: '#0052CC' }}>
              CBH
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#FF6B00', background: 'rgba(255, 107, 0, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
              3D VIRTUAL DEPOT
            </span>
          </Link>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '6px 14px',
              borderRadius: '20px',
              color: '#F8FAFC',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            <span>40,000 SQ.FT DIGITAL TWIN // 60 FPS GSAP ORBIT</span>
          </div>
        </div>

        {/* Right Top Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', pointerEvents: 'auto' }}>
          <button
            onClick={() => setIsNightMode(!isNightMode)}
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#F8FAFC',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Eye size={14} color="#FF6B00" />
            <span>{isNightMode ? 'Day Mode' : 'Night Depot'}</span>
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              background: '#0052CC',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(0, 82, 204, 0.4)'
            }}
          >
            <ShoppingBag size={16} />
            <span>RFQ Cart ({cartCount})</span>
            <span style={{ background: '#FF6B00', padding: '2px 6px', borderRadius: '10px', fontSize: '10px' }}>
              LIVE
            </span>
          </button>

          <Link
            href="/"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              textDecoration: 'none',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Exit 3D</span>
            <X size={14} />
          </Link>
        </div>
      </header>

      {/* Floating Instructions & Orbit Tooltip */}
      <div
        style={{
          position: 'absolute',
          top: '76px',
          left: '24px',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '8px 14px',
          borderRadius: '8px',
          color: '#94A3B8',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 30
        }}
      >
        <span>🖱️ Drag to rotate 3D camera</span>
        <span>•</span>
        <span>🔍 Scroll to zoom in/out</span>
        <span>•</span>
        <span>📍 Click any zone to fly in</span>
      </div>

      {/* Center 3D Inspector HUD Trigger (FAZ II Plus Bolt Anchor) */}
      <div
        style={{
          position: 'absolute',
          top: '76px',
          right: '24px',
          zIndex: 30
        }}
      >
        <button
          onClick={open3DInspector}
          style={{
            background: 'linear-gradient(135deg, #0052CC 0%, #0747A6 100%)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            padding: '10px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 6px 20px rgba(0, 82, 204, 0.4)'
          }}
        >
          <Sparkles size={16} color="#FF6B00" />
          <span>Inspect FAZ II Plus Anchor in 3D</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Active Zone Detail Flyout Card (Emons-Style Glassmorphism HUD) */}
      {activeZone && !isInspectorOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100px',
            left: '24px',
            maxWidth: '440px',
            width: 'calc(100% - 48px)',
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(16px)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 82, 204, 0.15)',
            zIndex: 40,
            animation: 'fadeInUp 0.3s ease-out'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#FF6B00',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {activeZone.category}
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
                {activeZone.name}
              </h3>
            </div>
            <button
              onClick={() => setActiveZone(null)}
              style={{
                background: 'rgba(0,0,0,0.05)',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} color="#475569" />
            </button>
          </div>

          <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5, marginBottom: '16px' }}>
            {activeZone.subtitle}
          </p>

          {/* Featured Product Box */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0052CC' }}>
                {activeZone.featuredProduct.sku}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: 'rgba(5, 150, 105, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                {activeZone.featuredProduct.stock}
              </span>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
              {activeZone.featuredProduct.name}
            </h4>

            <p style={{ fontSize: '11px', color: '#64748B', marginBottom: '10px' }}>
              {activeZone.featuredProduct.details}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              {activeZone.featuredProduct.approvals.map((app, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    color: '#0052CC',
                    background: 'rgba(0, 82, 204, 0.08)',
                    border: '1px solid rgba(0, 82, 204, 0.2)',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}
                >
                  {app}
                </span>
              ))}
            </div>

            {/* Price & Quantity Row */}
            {activeZone.featuredProduct.price > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#94A3B8', display: 'block' }}>ESTIMATED UNIT RATE</span>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#0052CC' }}>
                    ₹{activeZone.featuredProduct.price.toFixed(2)}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}> / pc</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>QTY:</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(100, parseInt(e.target.value) || 100))}
                    step={100}
                    style={{
                      width: '75px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      fontWeight: 700,
                      textAlign: 'center'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {activeZone.featuredProduct.price > 0 ? (
              <button
                onClick={() => handleAddToCart(activeZone.featuredProduct)}
                style={{
                  flex: 1,
                  background: '#0052CC',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(0, 82, 204, 0.35)'
                }}
              >
                <ShoppingBag size={16} />
                <span>Add to RFQ Cart</span>
              </button>
            ) : (
              <Link
                href="/contact"
                style={{
                  flex: 1,
                  background: '#0052CC',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <FileSpreadsheet size={16} />
                <span>Request Sample Batch Report</span>
              </Link>
            )}

            <button
              onClick={open3DInspector}
              style={{
                background: 'rgba(255, 107, 0, 0.1)',
                border: '1px solid #FF6B00',
                color: '#FF6B00',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Box size={15} />
              <span>3D Model</span>
            </button>
          </div>
        </div>
      )}

      {/* Exploded 3D Fastener Inspector Modal Flyout */}
      {isInspectorOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100px',
            right: '24px',
            maxWidth: '460px',
            width: 'calc(100% - 48px)',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '24px',
            color: '#FFFFFF',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 82, 204, 0.4)',
            zIndex: 40
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, background: '#FF6B00', padding: '2px 8px', borderRadius: '4px' }}>
                ETA OPTION 1
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#60A5FA' }}>
                CALIBRATED 3D FASTENER
              </span>
            </div>

            <button
              onClick={() => setIsInspectorOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '6px', color: '#FFFFFF' }}>
            FAZ II Plus Bolt Anchor M12x100
          </h3>

          <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5, marginBottom: '16px' }}>
            Engineered for cracked concrete and high seismic demand (C1 & C2). Dynamic expansion clip ensures maximum pull-out resistance.
          </p>

          {/* GSAP Exploded Assembly Interactive Button */}
          <div style={{ marginBottom: '16px' }}>
            <button
              onClick={toggleExplodedAssembly}
              style={{
                width: '100%',
                background: isExploded
                  ? 'linear-gradient(135deg, #FF6B00 0%, #E55C00 100%)'
                  : 'linear-gradient(135deg, #0052CC 0%, #0747A6 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: isExploded ? '0 4px 16px rgba(255, 107, 0, 0.4)' : '0 4px 16px rgba(0, 82, 204, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              <Layers size={18} />
              <span>{isExploded ? 'COLLAPSE 3D ASSEMBLY' : 'EXPLODE 3D ASSEMBLY (GSAP)'}</span>
            </button>
          </div>

          {/* Exploded Parts Legend */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px'
            }}
          >
            <div>
              <span style={{ color: '#94A3B8', display: 'block' }}>1. EXPANSION CLIP:</span>
              <strong style={{ color: '#FF6B00' }}>Stainless Spring Steel</strong>
            </div>
            <div>
              <span style={{ color: '#94A3B8', display: 'block' }}>2. THREADED STUD:</span>
              <strong style={{ color: '#60A5FA' }}>Zinc-Plated (5μm)</strong>
            </div>
            <div>
              <span style={{ color: '#94A3B8', display: 'block' }}>3. WASHER DIN 125:</span>
              <strong style={{ color: '#FFFFFF' }}>Outer Dia 24mm</strong>
            </div>
            <div>
              <span style={{ color: '#94A3B8', display: 'block' }}>4. HEX NUT DIN 934:</span>
              <strong style={{ color: '#FFFFFF' }}>SW 19 / Tinst 60Nm</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              href="/products/steel-fixings/bolt-anchor/bolt-anchor-faz-ii-plus"
              style={{
                flex: 1,
                background: '#FFFFFF',
                color: '#0F172A',
                textDecoration: 'none',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>View Technical Matrix</span>
              <ArrowRight size={14} />
            </Link>

            <button
              onClick={() => handleAddToCart(ZONES[0].featuredProduct)}
              style={{
                background: '#0052CC',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ShoppingBag size={14} />
              <span>Add (500 pcs)</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Zone Quick Navigation Bar (Like the bottom category bar in Emons video) */}
      <nav
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '8px 12px',
          borderRadius: '50px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          zIndex: 40,
          maxWidth: '92vw',
          overflowX: 'auto'
        }}
      >
        <button
          onClick={resetToOverview}
          style={{
            background: isOverview ? '#0052CC' : 'transparent',
            color: '#FFFFFF',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '30px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease'
          }}
        >
          <RotateCw size={13} />
          <span>Overview (360°)</span>
        </button>

        {ZONES.map((zone) => {
          const isActive = activeZone?.id === zone.id && !isInspectorOpen;
          return (
            <button
              key={zone.id}
              onClick={() => navigateToZone(zone)}
              style={{
                background: isActive ? '#FF6B00' : 'rgba(255, 255, 255, 0.06)',
                color: isActive ? '#FFFFFF' : '#CBD5E1',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '30px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{zone.name.split(':')[0]}</span>
            </button>
          );
        })}

        <button
          onClick={open3DInspector}
          style={{
            background: isInspectorOpen ? '#FF6B00' : 'rgba(255, 107, 0, 0.15)',
            color: '#FF6B00',
            border: '1px solid rgba(255, 107, 0, 0.3)',
            padding: '8px 16px',
            borderRadius: '30px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          <Box size={13} />
          <span>3D Bolt Anchor</span>
        </button>
      </nav>

      {/* Cart Drawer Component */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={(id, qty) => {
          setCartItems((prev) =>
            prev.map((item) =>
              item.id === id
                ? {
                    ...item,
                    quantity: qty,
                    totalWeightKg: qty * item.weightPerPcKg,
                    rowTotal: qty * item.unitRate
                  }
                : item
            )
          );
        }}
        onRemoveItem={(id) => {
          setCartItems((prev) => prev.filter((i) => i.id !== id));
          setCartCount((c) => Math.max(0, c - 1));
        }}
      />
    </div>
  );
}
