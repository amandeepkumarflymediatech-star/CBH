'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  ChevronRight,
  ChevronLeft,
  Eye,
  Sliders,
  ZoomIn,
  ZoomOut,
  Info,
  Building2,
  Search,
  Sun,
  Moon,
  Compass,
  PackageCheck,
  Plus,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Filter,
  Check,
  Boxes,
  Cpu
} from 'lucide-react';
import CartDrawer from '@/components/cart/CartDrawer';
import { RfqLineItem } from '@/lib/types';
import { getStoredCart, setStoredCart } from '@/lib/cart';
import {
  VirtualStoreZone,
  DEFAULT_ZONES,
  CadBoltModel,
  CAD_BOLT_MODELS
} from '@/lib/virtual-store-types';

interface BayProduct {
  id: number;
  sku: string;
  name: string;
  category: string;
  subCategory?: string;
  standard: string;
  grade: string;
  finish: string;
  diameter: string;
  lengthMm: number;
  pricePerPiece: number;
  pricePerKg: number;
  weightPerPcKg: number;
  stockPcs: number;
  isInStock: boolean;
  isSurplus: boolean;
  imageUrl: string;
}

export default function VirtualStorePage() {
  const mountRef = useRef<HTMLDivElement>(null);

  // View Mode: 'depot' (3D Warehouse) vs 'inspector' (3D Fastener Assembly)
  const [viewMode, setViewMode] = useState<'depot' | 'inspector'>('depot');

  // Fastener CAD Inspector state (7 bolt types)
  const [selectedCadId, setSelectedCadId] = useState<string>('hex-bolt');
  const [explodedDist, setExplodedDist] = useState(0);
  const [selectedPartId, setSelectedPartId] = useState<string>('bolt');

  // Zones & Active Bay
  const [zones, setZones] = useState<VirtualStoreZone[]>(DEFAULT_ZONES);
  const [activeZone, setActiveZone] = useState<VirtualStoreZone>(DEFAULT_ZONES[0]);

  // Lighting & Orbit state
  const [isNightMode, setIsNightMode] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(false);

  // Shelf Products state
  const [products, setProducts] = useState<BayProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStandard, setSelectedStandard] = useState('ALL');
  const [selectedDiameter, setSelectedDiameter] = useState('ALL');
  const [availableStandards, setAvailableStandards] = useState<string[]>([]);
  const [availableDiameters, setAvailableDiameters] = useState<string[]>([]);
  const [totalProducts, setTotalProducts] = useState(16167);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isShelfOpen, setIsShelfOpen] = useState(true);

  // RFQ Cart State
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedSku, setAddedSku] = useState<string | null>(null);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const reqIdRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePosRef = useRef({ x: 0, y: 0 });

  // 3D Assembly mesh parts
  const assemblyPartsRef = useRef<{ [key: string]: THREE.Mesh }>({});

  // Lighting refs for dynamic day/night mode
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const floorMatRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Sync Cart on mount
  useEffect(() => {
    const stored = getStoredCart();
    setCartItems(stored);
    setCartCount(stored.length);
  }, []);

  // Fetch Zones from server API
  useEffect(() => {
    async function loadZones() {
      try {
        const res = await fetch('/api/virtual-store');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setZones(json.data);
          setActiveZone(json.data[0]);
        }
      } catch (err) {
        console.warn('Failed to load virtual store zones, using defaults:', err);
      }
    }
    loadZones();
  }, []);

  // Check URL query parameters (e.g. ?mode=inspector&bolt=hsfg-bolt&bay=bay-hsfg)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'inspector') {
      setViewMode('inspector');
    } else if (mode === 'depot') {
      setViewMode('depot');
    }
    const bolt = params.get('bolt');
    if (bolt) {
      setSelectedCadId(bolt);
    }
    const bay = params.get('bay');
    if (bay && zones.length > 0) {
      const match = zones.find((z) => z.id === bay || z.category.toLowerCase().includes(bay.toLowerCase()));
      if (match) setActiveZone(match);
    }
  }, [zones]);

  // Fetch Bay Products whenever activeZone, search, page, or filters change
  const fetchBayProducts = useCallback(async () => {
    if (!activeZone) return;
    setProductsLoading(true);
    try {
      const params = new URLSearchParams({
        category: activeZone.category || '',
        page: String(currentPage),
        limit: '16',
      });
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedStandard !== 'ALL') params.append('standard', selectedStandard);
      if (selectedDiameter !== 'ALL') params.append('diameter', selectedDiameter);

      const res = await fetch(`/api/virtual-store/zone-products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data || []);
        setTotalProducts(data.total || 0);
        setTotalPages(data.totalPages || 1);
        if (data.availableStandards && data.availableStandards.length > 0) {
          setAvailableStandards(data.availableStandards);
        }
        if (data.availableDiameters && data.availableDiameters.length > 0) {
          setAvailableDiameters(data.availableDiameters);
        }
      }
    } catch (err) {
      console.error('Error fetching bay products:', err);
    } finally {
      setProductsLoading(false);
    }
  }, [activeZone, currentPage, searchQuery, selectedStandard, selectedDiameter]);

  useEffect(() => {
    fetchBayProducts();
  }, [fetchBayProducts]);

  // Reset page and filters when zone changes
  const handleSelectZone = (zone: VirtualStoreZone) => {
    setActiveZone(zone);
    setCurrentPage(1);
    setSearchQuery('');
    setSelectedStandard('ALL');
    setSelectedDiameter('ALL');

    if (viewMode === 'depot' && cameraRef.current) {
      // Smooth camera glide to the aisle
      gsap.to(cameraRef.current.position, {
        x: zone.camPos[0],
        y: zone.camPos[1],
        z: zone.camPos[2],
        duration: 1.2,
        ease: 'power3.inOut'
      });
      gsap.to(controlsTargetRef.current, {
        x: zone.camLook[0],
        y: zone.camLook[1],
        z: zone.camLook[2],
        duration: 1.2,
        ease: 'power3.inOut',
        onUpdate: () => {
          if (cameraRef.current) {
            cameraRef.current.lookAt(controlsTargetRef.current);
          }
        }
      });
    }
  };

  // Add product to RFQ cart
  const handleAddToCart = (product: BayProduct, qty = 100) => {
    const lineItem: RfqLineItem = {
      id: `virtual-${product.sku}-${Date.now()}`,
      productId: Number(product.id) || 101,
      sku: product.sku,
      name: product.name,
      standard: product.standard || 'DIN 933',
      unit: 'PCS',
      quantity: qty,
      weightPerPcKg: product.weightPerPcKg || 0.05,
      totalWeightKg: qty * (product.weightPerPcKg || 0.05),
      unitRate: product.pricePerPiece || 10,
      rowTotal: qty * (product.pricePerPiece || 10),
      imageUrl: product.imageUrl || ''
    };

    const currentCart = getStoredCart();
    const updated = [...currentCart, lineItem];
    setStoredCart(updated);
    setCartItems(updated);
    setCartCount(updated.length);

    setAddedSku(product.sku);
    setTimeout(() => setAddedSku(null), 2500);
  };

  // -------------------------------------------------------------
  // THREE.JS SETUP & LIFECYCLE
  // -------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const bgLight = new THREE.Color(0xf8fafc);
    const bgDark = new THREE.Color(0x0a1120);
    scene.background = isNightMode ? bgDark : bgLight;
    scene.fog = new THREE.FogExp2(isNightMode ? 0x0a1120 : 0xf8fafc, 0.015);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      500
    );
    camera.position.set(0, 22, 28);
    camera.lookAt(0, 2, 0);
    controlsTargetRef.current = new THREE.Vector3(0, 2, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const hemiLight = new THREE.HemisphereLight(
      isNightMode ? 0x1e293b : 0xffffff,
      isNightMode ? 0x090d16 : 0xe2e8f0,
      isNightMode ? 0.7 : 1.4
    );
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xffffff, isNightMode ? 1.0 : 2.4);
    dirLight.position.set(25, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 120;
    const d = 30;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Subtle blue accent light in center aisle
    const centerSpot = new THREE.SpotLight(0x0052cc, 4, 40, Math.PI / 4, 0.4);
    centerSpot.position.set(0, 18, 0);
    scene.add(centerSpot);

    // -------------------------------------------------------------
    // BUILD SCENE ACCORDING TO VIEW MODE
    // -------------------------------------------------------------
    const depotGroup = new THREE.Group();
    const inspectorGroup = new THREE.Group();

    if (viewMode === 'depot') {
      scene.add(depotGroup);

      // Floor - Clean polished warehouse slab
      const floorMat = new THREE.MeshStandardMaterial({
        color: isNightMode ? 0x0f172a : 0xf1f5f9,
        roughness: 0.4,
        metalness: 0.1
      });
      floorMatRef.current = floorMat;
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      depotGroup.add(floor);

      // Grid Lines
      const grid = new THREE.GridHelper(90, 45, isNightMode ? 0x1e293b : 0xcbd5e1, isNightMode ? 0x0f172a : 0xe2e8f0);
      grid.position.y = 0.01;
      depotGroup.add(grid);

      // Yellow Center Forklift Lane Lines
      const laneLineMat = new THREE.MeshBasicMaterial({ color: 0xeab308 });
      const leftLine = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 50), laneLineMat);
      leftLine.rotation.x = -Math.PI / 2;
      leftLine.position.set(-2.5, 0.02, 0);
      depotGroup.add(leftLine);

      const rightLine = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 50), laneLineMat);
      rightLine.rotation.x = -Math.PI / 2;
      rightLine.position.set(2.5, 0.02, 0);
      depotGroup.add(rightLine);

      // Racking Materials
      const blueRackMat = new THREE.MeshStandardMaterial({ color: 0x0052cc, metalness: 0.6, roughness: 0.3 });
      const orangeBeamMat = new THREE.MeshStandardMaterial({ color: 0xff6b00, metalness: 0.5, roughness: 0.35 });
      const palletMat = new THREE.MeshStandardMaterial({ color: 0xc49a45, roughness: 0.8 });
      const boxMatA = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
      const boxMatB = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
      const metalBoxMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });

      // Build Racking Bays (8 Bays: 4 on Left, 4 on Right)
      const bayPositions = [
        { id: 'bay-hex-screws', x: -8, z: -18, label: 'BAY 01', color: 0x0052cc },
        { id: 'bay-hex-bolts', x: -8, z: -6, label: 'BAY 02', color: 0x2563eb },
        { id: 'bay-hsfg', x: -8, z: 6, label: 'BAY 03', color: 0xd97706 },
        { id: 'bay-socket-head', x: -8, z: 18, label: 'BAY 04', color: 0x059669 },
        { id: 'bay-flange', x: 8, z: -18, label: 'BAY 05', color: 0xea580c },
        { id: 'bay-carriage', x: 8, z: -6, label: 'BAY 06', color: 0x7c3aed },
        { id: 'bay-threaded-rods', x: 8, z: 6, label: 'BAY 07', color: 0x0891b2 },
        { id: 'bay-qa-lab', x: 8, z: 18, label: 'BAY 08', color: 0x10b981 },
      ];

      bayPositions.forEach((bay) => {
        const rackGroup = new THREE.Group();
        rackGroup.position.set(bay.x, 0, bay.z);
        rackGroup.userData = { zoneId: bay.id };

        // 4 Vertical Uprights
        const uprightGeo = new THREE.BoxGeometry(0.25, 9, 0.25);
        const offsets = [
          [-3, 4.5, -1.2],
          [3, 4.5, -1.2],
          [-3, 4.5, 1.2],
          [3, 4.5, 1.2],
        ];
        offsets.forEach(([ux, uy, uz]) => {
          const up = new THREE.Mesh(uprightGeo, blueRackMat);
          up.position.set(ux, uy, uz);
          up.castShadow = true;
          rackGroup.add(up);
        });

        // 3 Horizontal Load Beams per side
        [2.5, 5.5, 8.5].forEach((levelY) => {
          const beamFront = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.25, 0.15), orangeBeamMat);
          beamFront.position.set(0, levelY, 1.2);
          beamFront.castShadow = true;
          rackGroup.add(beamFront);

          const beamBack = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.25, 0.15), orangeBeamMat);
          beamBack.position.set(0, levelY, -1.2);
          beamBack.castShadow = true;
          rackGroup.add(beamBack);

          // Pallets & Fastener Crates on each level
          [-1.8, 0, 1.8].forEach((px) => {
            const pallet = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 2.2), palletMat);
            pallet.position.set(px, levelY + 0.1, 0);
            pallet.castShadow = true;
            pallet.receiveShadow = true;
            rackGroup.add(pallet);

            // Fastener Master Cartons / Steel Wire Bins
            const crateMat = Math.random() > 0.5 ? boxMatA : Math.random() > 0.3 ? boxMatB : metalBoxMat;
            const crate = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 1.8), crateMat);
            crate.position.set(px, levelY + 0.75, 0);
            crate.castShadow = true;
            crate.receiveShadow = true;
            rackGroup.add(crate);
          });
        });

        // Floor Bay Marker Box
        const markerMat = new THREE.MeshBasicMaterial({ color: bay.color });
        const markerPill = new THREE.Mesh(new THREE.BoxGeometry(4, 0.05, 1), markerMat);
        markerPill.position.set(0, 0.03, bay.x < 0 ? 2.2 : -2.2);
        rackGroup.add(markerPill);

        // Vertical glowing Beacon above the bay
        const beaconGeo = new THREE.CylinderGeometry(0.04, 0.04, 3, 16);
        const beaconMat = new THREE.MeshBasicMaterial({ color: bay.color, transparent: true, opacity: 0.7 });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(0, 10.5, 0);
        rackGroup.add(beacon);

        const beaconRing = new THREE.Mesh(
          new THREE.RingGeometry(0.3, 0.5, 32),
          new THREE.MeshBasicMaterial({ color: bay.color, side: THREE.DoubleSide })
        );
        beaconRing.rotation.x = -Math.PI / 2;
        beaconRing.position.set(0, 12, 0);
        rackGroup.add(beaconRing);

        depotGroup.add(rackGroup);
      });

      // Animated Forklift in aisle
      const forkliftGroup = new THREE.Group();
      forkliftGroup.position.set(0, 0, 4);

      const forkBody = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1.4, 3.2),
        new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.3 })
      );
      forkBody.position.y = 0.9;
      forkBody.castShadow = true;
      forkliftGroup.add(forkBody);

      const mast = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 3.8, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 })
      );
      mast.position.set(0, 2.1, 1.7);
      mast.castShadow = true;
      forkliftGroup.add(mast);

      depotGroup.add(forkliftGroup);

    } else {
      // -------------------------------------------------------------
      // 3D FASTENER ASSEMBLY INSPECTOR MODE (7 BOLT MODELS)
      // -------------------------------------------------------------
      scene.add(inspectorGroup);
      camera.position.set(0, 2, 7);
      camera.lookAt(0, 0, 0);
      controlsTargetRef.current = new THREE.Vector3(0, 0, 0);

      // Studio Pedestal
      const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(2.5, 2.8, 0.3, 48),
        new THREE.MeshStandardMaterial({ color: isNightMode ? 0x0f172a : 0xe2e8f0, roughness: 0.3, metalness: 0.2 })
      );
      pedestal.position.y = -2;
      pedestal.receiveShadow = true;
      inspectorGroup.add(pedestal);

      // Materials for mechanical parts
      const steelMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.9,
        roughness: 0.2
      });
      const yellowZincMat = new THREE.MeshStandardMaterial({
        color: 0xeab308,
        metalness: 0.85,
        roughness: 0.25
      });
      const blackOxideMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.35
      });

      assemblyPartsRef.current = {};

      if (selectedCadId === 'hex-bolt') {
        // Hex Head
        const head = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.5, 6), steelMat);
        head.position.y = 1.6;
        head.castShadow = true;
        inspectorGroup.add(head);

        // Shank
        const shank = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 3.2, 32), steelMat);
        shank.position.y = -0.1;
        shank.castShadow = true;
        inspectorGroup.add(shank);

        // Washer
        const washer = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.08, 40), yellowZincMat);
        washer.position.y = -1.2;
        washer.castShadow = true;
        inspectorGroup.add(washer);

        // Nut
        const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.5, 6), steelMat);
        nut.position.y = -1.6;
        nut.castShadow = true;
        inspectorGroup.add(nut);

        assemblyPartsRef.current = { bolt: head, washer, nut };
      } else if (selectedCadId === 'hsfg-bolt') {
        // Heavy Hex Head
        const head = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.65, 6), blackOxideMat);
        head.position.y = 1.6;
        head.castShadow = true;
        inspectorGroup.add(head);

        // Heavy Shank
        const shank = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 3.2, 32), blackOxideMat);
        shank.position.y = -0.1;
        shank.castShadow = true;
        inspectorGroup.add(shank);

        // Hardened Structural Washer
        const washer = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.12, 40), blackOxideMat);
        washer.position.y = -1.2;
        washer.castShadow = true;
        inspectorGroup.add(washer);

        // Heavy Nut
        const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.7, 6), blackOxideMat);
        nut.position.y = -1.7;
        nut.castShadow = true;
        inspectorGroup.add(nut);

        assemblyPartsRef.current = { bolt: head, washer, nut };
      } else if (selectedCadId === 'wedge-anchor') {
        const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 4, 32), steelMat);
        stud.castShadow = true;
        inspectorGroup.add(stud);

        const clip = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.8, 32, 1, true), yellowZincMat);
        clip.position.y = -1.2;
        clip.castShadow = true;
        inspectorGroup.add(clip);

        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.7, 32), steelMat);
        cone.position.y = -1.9;
        cone.rotation.x = Math.PI;
        cone.castShadow = true;
        inspectorGroup.add(cone);

        const washer = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.08, 40), yellowZincMat);
        washer.position.y = 1.2;
        washer.castShadow = true;
        inspectorGroup.add(washer);

        const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.5, 6), steelMat);
        nut.position.y = 1.6;
        nut.castShadow = true;
        inspectorGroup.add(nut);

        assemblyPartsRef.current = { stud, clip, cone, washer, nut };
      } else if (selectedCadId === 'socket-head') {
        // Cylindrical Head
        const head = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.75, 32), blackOxideMat);
        head.position.y = 1.4;
        head.castShadow = true;
        inspectorGroup.add(head);

        // Hex Socket Recess
        const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.35, 6), steelMat);
        socket.position.y = 1.65;
        inspectorGroup.add(socket);

        // Shank
        const shank = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 3.2, 32), blackOxideMat);
        shank.position.y = -0.2;
        shank.castShadow = true;
        inspectorGroup.add(shank);

        // Spring Lock Washer
        const washer = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.08, 16, 32), steelMat);
        washer.rotation.x = Math.PI / 2;
        washer.position.y = -1.2;
        washer.castShadow = true;
        inspectorGroup.add(washer);

        // Nut
        const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.5, 6), blackOxideMat);
        nut.position.y = -1.6;
        nut.castShadow = true;
        inspectorGroup.add(nut);

        assemblyPartsRef.current = { bolt: head, washer, nut };
      } else if (selectedCadId === 'flange-bolt') {
        const head = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.45, 6), yellowZincMat);
        head.position.y = 1.5;
        head.castShadow = true;
        inspectorGroup.add(head);

        const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.1, 40), yellowZincMat);
        flange.position.y = 1.25;
        flange.castShadow = true;
        inspectorGroup.add(flange);

        const shank = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 3.2, 32), yellowZincMat);
        shank.position.y = -0.2;
        shank.castShadow = true;
        inspectorGroup.add(shank);

        const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.45, 6), yellowZincMat);
        nut.position.y = -1.6;
        nut.castShadow = true;
        inspectorGroup.add(nut);

        assemblyPartsRef.current = { bolt: head, nut };
      } else if (selectedCadId === 'carriage-bolt') {
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.85, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), steelMat);
        head.position.y = 1.35;
        head.castShadow = true;
        inspectorGroup.add(head);

        const sqNeck = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.55), steelMat);
        sqNeck.position.y = 1.2;
        sqNeck.castShadow = true;
        inspectorGroup.add(sqNeck);

        const shank = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 3.2, 32), steelMat);
        shank.position.y = -0.2;
        shank.castShadow = true;
        inspectorGroup.add(shank);

        const washer = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.08, 40), steelMat);
        washer.position.y = -1.2;
        washer.castShadow = true;
        inspectorGroup.add(washer);

        const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.45, 6), steelMat);
        nut.position.y = -1.6;
        nut.castShadow = true;
        inspectorGroup.add(nut);

        assemblyPartsRef.current = { bolt: head, washer, nut };
      } else if (selectedCadId === 'threaded-rod') {
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 4.6, 32), steelMat);
        rod.castShadow = true;
        inspectorGroup.add(rod);

        const nutTop = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.5, 6), steelMat);
        nutTop.position.y = 1.5;
        nutTop.castShadow = true;
        inspectorGroup.add(nutTop);

        const washerTop = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.08, 40), steelMat);
        washerTop.position.y = 1.1;
        washerTop.castShadow = true;
        inspectorGroup.add(washerTop);

        const washerBot = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.08, 40), steelMat);
        washerBot.position.y = -1.1;
        washerBot.castShadow = true;
        inspectorGroup.add(washerBot);

        const nutBot = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.5, 6), steelMat);
        nutBot.position.y = -1.5;
        nutBot.castShadow = true;
        inspectorGroup.add(nutBot);

        assemblyPartsRef.current = { bolt: rod, nut: nutTop, washer: washerTop, washer2: washerBot, nut2: nutBot };
      }
    }

    // -------------------------------------------------------------
    // MOUSE & TOUCH ORBIT CONTROLS + RAYCASTER
    // -------------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let downPos = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePosRef.current = { x: e.clientX, y: e.clientY };
      downPos = { x: e.clientX, y: e.clientY };
    };

    const onCanvasClick = (e: MouseEvent) => {
      const distMoved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      if (distMoved > 6 || !cameraRef.current || viewMode !== 'depot') return;

      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(depotGroup.children, true);
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData?.zoneId && obj.parent) {
          obj = obj.parent;
        }
        if (obj?.userData?.zoneId) {
          const matched = zones.find((z) => z.id === obj?.userData?.zoneId);
          if (matched) {
            handleSelectZone(matched);
          }
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !cameraRef.current) return;
      const deltaX = e.clientX - previousMousePosRef.current.x;
      const deltaY = e.clientY - previousMousePosRef.current.y;
      previousMousePosRef.current = { x: e.clientX, y: e.clientY };

      const cam = cameraRef.current;
      const target = controlsTargetRef.current;
      const offset = new THREE.Vector3().subVectors(cam.position, target);

      // Spherical orbit
      let theta = Math.atan2(offset.x, offset.z);
      let phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);

      theta -= deltaX * 0.006;
      phi -= deltaY * 0.006;
      phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, phi));

      const radius = offset.length();
      cam.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
      cam.position.y = target.y + radius * Math.cos(phi);
      cam.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
      cam.lookAt(target);
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const cam = cameraRef.current;
      const target = controlsTargetRef.current;
      const dir = new THREE.Vector3().subVectors(cam.position, target);
      const dist = dir.length();
      const newDist = Math.max(3, Math.min(80, dist + e.deltaY * 0.02));
      dir.normalize().multiplyScalar(newDist);
      cam.position.copy(target).add(dir);
    };

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('click', onCanvasClick);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', handleResize);

    // -------------------------------------------------------------
    // ANIMATION LOOP (60 FPS)
    // -------------------------------------------------------------
    let clock = new THREE.Clock();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isAutoRotate && cameraRef.current) {
        const cam = cameraRef.current;
        const target = controlsTargetRef.current;
        const offset = new THREE.Vector3().subVectors(cam.position, target);
        let theta = Math.atan2(offset.x, offset.z);
        const radius = offset.length();
        const y = offset.y;
        theta += delta * 0.25;
        cam.position.x = target.x + radius * Math.sin(theta);
        cam.position.z = target.z + radius * Math.cos(theta);
        cam.position.y = target.y + y;
        cam.lookAt(target);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      resizeObserver.disconnect();
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('click', onCanvasClick);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [viewMode, isNightMode, selectedCadId]);

  // Handle Exploded Assembly slider change in Inspector mode
  useEffect(() => {
    if (viewMode !== 'inspector') return;
    const parts = assemblyPartsRef.current;
    if (!parts) return;

    const factor = explodedDist;

    if (selectedCadId === 'wedge-anchor') {
      if (parts.cone) gsap.to(parts.cone.position, { y: -1.9 - factor * 1.5, duration: 0.3 });
      if (parts.clip) gsap.to(parts.clip.position, { y: -1.2 - factor * 0.8, duration: 0.3 });
      if (parts.washer) gsap.to(parts.washer.position, { y: 1.2 + factor * 1.0, duration: 0.3 });
      if (parts.nut) gsap.to(parts.nut.position, { y: 1.6 + factor * 2.0, duration: 0.3 });
    } else if (selectedCadId === 'threaded-rod') {
      if (parts.washer) gsap.to(parts.washer.position, { y: 1.1 + factor * 0.8, duration: 0.3 });
      if (parts.nut) gsap.to(parts.nut.position, { y: 1.5 + factor * 1.8, duration: 0.3 });
      if (parts.washer2) gsap.to(parts.washer2.position, { y: -1.1 - factor * 0.8, duration: 0.3 });
      if (parts.nut2) gsap.to(parts.nut2.position, { y: -1.5 - factor * 1.8, duration: 0.3 });
    } else {
      // standard bolt + washer + nut (hex-bolt, hsfg-bolt, socket-head, flange-bolt, carriage-bolt)
      if (parts.washer) gsap.to(parts.washer.position, { y: -1.2 - factor * 1.0, duration: 0.3 });
      if (parts.nut) gsap.to(parts.nut.position, { y: -1.6 - factor * 1.8, duration: 0.3 });
    }
  }, [explodedDist, viewMode, selectedCadId]);

  // Zoom buttons helper
  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const cam = cameraRef.current;
    const target = controlsTargetRef.current;
    const dir = new THREE.Vector3().subVectors(cam.position, target);
    const dist = dir.length();
    const factor = direction === 'in' ? 0.8 : 1.25;
    const newDist = Math.max(3, Math.min(80, dist * factor));
    dir.normalize().multiplyScalar(newDist);
    gsap.to(cam.position, {
      x: target.x + dir.x,
      y: target.y + dir.y,
      z: target.z + dir.z,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => cam.lookAt(target)
    });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none flex flex-col">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP GLOBAL CONTROL HEADER */}
      {/* ------------------------------------------------------------- */}
      <header className="relative z-30 h-14 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 flex items-center justify-between shadow-lg flex-shrink-0">
        {/* Left: Brand & Live Inventory Badge */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 text-white no-underline">
            <img src="/assets/cbh-logo-icon.png" alt="CBH Fasteners" className="w-8 h-8 object-contain" />
            <div>
              <span className="font-black text-sm tracking-tight text-white block leading-tight">
                CBH 3D Virtual Depot
              </span>
              <span className="text-[10px] text-blue-400 font-mono block">
                Digital Twin • Bhiwandi Logistics Hub
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>54,392 Fasteners Live in Stock</span>
          </div>
        </div>

        {/* Center: Dual Mode Switcher */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-white/15">
          <button
            type="button"
            onClick={() => setViewMode('depot')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'depot'
                ? 'bg-[#0052CC] text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Boxes size={14} />
            <span>3D Depot Walkthrough</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('inspector')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'inspector'
                ? 'bg-[#0052CC] text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Cpu size={14} />
            <span>Fastener CAD Inspector</span>
          </button>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-2">
          {/* Day / Night Studio Lighting */}
          <button
            type="button"
            onClick={() => setIsNightMode(!isNightMode)}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs transition-colors cursor-pointer"
            title="Toggle Daylight / Dark Depot"
          >
            {isNightMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-blue-400" />}
          </button>

          {/* Auto Rotate Spin */}
          <button
            type="button"
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
              isAutoRotate
                ? 'bg-blue-600/30 text-blue-300 border-blue-400/50'
                : 'bg-slate-800/90 text-slate-300 border-white/10 hover:bg-slate-700'
            }`}
            title="360° Auto-Orbit"
          >
            <RotateCw size={15} className={isAutoRotate ? 'animate-spin' : ''} />
          </button>

          {/* RFQ Cart Live Button */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all border border-blue-400/40"
          >
            <ShoppingBag size={14} />
            <span>RFQ Cart ({cartCount})</span>
            <span className="bg-[#FF6B00] text-white px-1.5 py-0.5 rounded-full text-[10px] font-black hidden sm:inline-block">
              LIVE
            </span>
          </button>

          {/* Exit Link */}
          <Link
            href="/"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center cursor-pointer border border-white/10"
            title="Exit 3D Depot"
          >
            <X size={15} />
          </Link>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN VIEWPORT (FULL-WIDTH 3D CANVAS + SLIDE-OVER FASTENER SHELF) */}
      {/* ------------------------------------------------------------- */}
      <div className="relative flex-1 w-full h-[calc(100vh-56px)] overflow-hidden bg-slate-100">
        {/* Full-Screen 3D WebGL Canvas */}
        <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing bg-slate-100 z-0" />

        {/* Floating Camera Controls (Zoom In, Zoom Out) - Clean White Glassmorphism */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-md">
          <button
            type="button"
            onClick={() => handleZoom('in')}
            className="p-2 text-slate-700 hover:text-[#0052CC] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleZoom('out')}
            className="p-2 text-slate-700 hover:text-[#0052CC] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
        </div>

          {/* Inspector Mode: Assembly Controls Overlay - Clean High-Contrast White */}
          {viewMode === 'inspector' && (() => {
            const activeCad = CAD_BOLT_MODELS.find((m) => m.id === selectedCadId) || CAD_BOLT_MODELS[0];
            return (
              <div className="absolute top-4 right-4 z-20 w-96 max-w-[calc(100vw-32px)] bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xl text-slate-900 transition-all max-h-[calc(100vh-140px)] overflow-y-auto">
                {/* Header with Icon, Name, and Standard Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-2.5">
                    <span className="text-2xl sm:text-3xl p-1 bg-slate-100 rounded-xl border border-slate-200 flex-shrink-0">
                      {activeCad.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0052CC] border border-blue-200 uppercase">
                          {activeCad.standard}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {activeCad.grade}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug mt-1">
                        {activeCad.name}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Exploded View Slider Controls */}
                <div className="mb-4 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Layers size={14} className="text-[#0052CC]" />
                      <span>Exploded View Animation:</span>
                    </span>
                    <span className="font-mono text-[#0052CC] font-extrabold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {Math.round(explodedDist * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={explodedDist}
                    onChange={(e) => setExplodedDist(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0052CC]"
                  />
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => setExplodedDist(0)}
                      className={`text-[10px] font-extrabold px-2 py-1 rounded transition-colors cursor-pointer ${
                        explodedDist === 0 ? 'bg-[#0052CC] text-white' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Assembled (0%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setExplodedDist(0.5)}
                      className={`text-[10px] font-extrabold px-2 py-1 rounded transition-colors cursor-pointer ${
                        explodedDist > 0.4 && explodedDist < 0.6 ? 'bg-[#0052CC] text-white' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      50% Exploded
                    </button>
                    <button
                      type="button"
                      onClick={() => setExplodedDist(1)}
                      className={`text-[10px] font-extrabold px-2 py-1 rounded transition-colors cursor-pointer ${
                        explodedDist === 1 ? 'bg-[#0052CC] text-white' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Fully Exploded (100%)
                    </button>
                  </div>
                </div>

                {/* Component Breakdown Selector */}
                <div className="mb-4">
                  <span className="block text-[11px] font-mono font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                    Components Breakdown ({activeCad.parts.length} Parts):
                  </span>
                  <div className="space-y-1.5">
                    {activeCad.parts.map((part) => {
                      const isPartSelected = selectedPartId === part.id;
                      return (
                        <button
                          key={part.id}
                          type="button"
                          onClick={() => setSelectedPartId(part.id)}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer ${
                            isPartSelected
                              ? 'bg-[#0052CC] text-white font-extrabold shadow-sm'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/80 font-medium'
                          }`}
                        >
                          <span className="truncate pr-2">{part.name}</span>
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                              isPartSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {part.spec}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Engineering Specifications Box */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-1.5 mb-4">
                  <div>
                    <span className="font-bold text-slate-700">Available Diameters: </span>
                    <span className="text-slate-900 font-mono">{activeCad.diameters}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Engineering Use: </span>
                    <span className="text-slate-600 leading-relaxed">{activeCad.applications}</span>
                  </div>
                </div>

                {/* Direct Action: Jump to Depot Catalog for this bolt */}
                <button
                  type="button"
                  onClick={() => {
                    const targetZone = zones.find((z) => z.id === activeCad.zoneId) || zones[0];
                    setViewMode('depot');
                    handleSelectZone(targetZone);
                    setIsShelfOpen(true);
                  }}
                  className="w-full py-2.5 px-4 bg-[#0052CC] hover:bg-[#0747A6] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <Search size={14} />
                  <span>Find in Depot Catalog ({activeCad.category})</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })()}

        {/* Floating Trigger to Open Fastener Shelf when Closed (Depot Mode) */}
        {viewMode === 'depot' && !isShelfOpen && (
          <button
            type="button"
            onClick={() => setIsShelfOpen(true)}
            className="absolute top-4 right-4 z-20 px-4 py-2.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl shadow-xl flex items-center gap-2 font-extrabold text-xs cursor-pointer border-2 border-white transition-all hover:scale-105"
          >
            <ShoppingBag size={15} />
            <span>Browse {activeZone.name.split(':')[0]} Fasteners</span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#FF6B00] text-white text-[10px] font-black">
              {totalProducts.toLocaleString()}
            </span>
            <ChevronLeft size={16} />
          </button>
        )}

        {/* Bottom Dock: Dual-Mode Quick Selector (Clean High-Contrast White) */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-center pointer-events-none">
          <nav className="pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-xl border border-slate-200/90 px-3 py-2 rounded-2xl shadow-xl max-w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {viewMode === 'depot' ? (
              zones.map((zone) => {
                const isSelected = activeZone.id === zone.id;
                return (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => handleSelectZone(zone)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0052CC] text-white shadow-md ring-2 ring-blue-300'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-xs hover:text-[#0052CC]'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: zone.color || '#0052CC' }}
                    />
                    <div className="text-left">
                      <span className={`block text-[11px] font-extrabold leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {zone.name.split(':')[0]}
                      </span>
                      <span
                        className={`block text-[9px] font-mono ${
                          isSelected ? 'text-blue-100 font-semibold' : 'text-slate-600 font-bold'
                        }`}
                      >
                        {zone.skuCount > 0 ? `${zone.skuCount.toLocaleString()} SKUs` : zone.category}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              CAD_BOLT_MODELS.map((bolt) => {
                const isSelected = selectedCadId === bolt.id;
                return (
                  <button
                    key={bolt.id}
                    type="button"
                    onClick={() => {
                      setSelectedCadId(bolt.id);
                      setSelectedPartId(bolt.parts[0]?.id || 'bolt');
                      setExplodedDist(0);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0052CC] text-white shadow-md ring-2 ring-blue-300'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-xs hover:text-[#0052CC]'
                    }`}
                  >
                    <span className="text-base flex-shrink-0">{bolt.icon}</span>
                    <div className="text-left">
                      <span className={`block text-[11px] font-extrabold leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {bolt.shortName}
                      </span>
                      <span
                        className={`block text-[9px] font-mono ${
                          isSelected ? 'text-blue-100 font-semibold' : 'text-slate-600 font-bold'
                        }`}
                      >
                        {bolt.standard.split('/')[0]}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </nav>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. RIGHT SIDE: HIGH-CAPACITY FASTENER CATALOG SHELF (SLIDE-OVER DRAWER) */}
        {/* ------------------------------------------------------------- */}
        <div
          className={`absolute top-0 right-0 z-30 h-full w-[440px] max-w-[95vw] bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
            isShelfOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
            {/* Shelf Header */}
            <div className="p-4 border-b border-slate-200 bg-white flex-shrink-0 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-[#0052CC] border border-blue-200 text-[11px] font-mono font-bold">
                    {activeZone.aisleCode || 'AISLE 1'}
                  </span>
                  <span className="text-[11px] font-black uppercase text-[#FF6B00] font-mono tracking-wider">
                    {activeZone.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {totalProducts.toLocaleString()} SKUs
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsShelfOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Close Shelf"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

                <h2 className="text-base font-extrabold text-slate-900 leading-tight mb-0.5">
                  {activeZone.name}
                </h2>
                <p className="text-xs text-slate-600 line-clamp-1">
                  {activeZone.subtitle}
                </p>

                {/* Live Search Bar */}
                <div className="relative mt-3">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder={`Search in ${activeZone.name.split(':')[0]} (e.g. M12, 10.9, Zinc)...`}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#0052CC] focus:bg-white rounded-xl pl-9 pr-8 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Quick Standards & Diameter Filter Chips */}
                <div className="mt-2.5 space-y-1.5">
                  {/* Standards Row */}
                  <div className="flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <span className="text-[10px] font-bold text-slate-600 uppercase flex-shrink-0">STD:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStandard('ALL');
                        setCurrentPage(1);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                        selectedStandard === 'ALL'
                          ? 'bg-[#0052CC] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      All
                    </button>
                    {availableStandards.slice(0, 5).map((std) => (
                      <button
                        key={std}
                        type="button"
                        onClick={() => {
                          setSelectedStandard(std);
                          setCurrentPage(1);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                          selectedStandard === std
                            ? 'bg-[#0052CC] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {std}
                      </button>
                    ))}
                  </div>

                  {/* Diameters Row */}
                  {availableDiameters.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      <span className="text-[10px] font-bold text-slate-600 uppercase flex-shrink-0">DIA:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDiameter('ALL');
                          setCurrentPage(1);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                          selectedDiameter === 'ALL'
                            ? 'bg-[#0052CC] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        All
                      </button>
                      {availableDiameters.slice(0, 8).map((dia) => (
                        <button
                          key={dia}
                          type="button"
                          onClick={() => {
                            setSelectedDiameter(dia);
                            setCurrentPage(1);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                            selectedDiameter === dia
                              ? 'bg-[#0052CC] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {dia}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Fastener Products List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
                {productsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <RotateCw size={26} className="animate-spin text-[#0052CC] mb-2" />
                    <span className="text-xs font-semibold text-slate-600">Loading depot inventory...</span>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <Boxes size={32} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-sm font-bold text-slate-900">No fasteners found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      No matching items for the current filter in this bay.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedStandard('ALL');
                        setSelectedDiameter('ALL');
                      }}
                      className="mt-3 px-3.5 py-1.5 bg-[#0052CC] text-white rounded-lg text-xs font-bold hover:bg-[#0747A6] cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border border-slate-200/90 hover:border-[#0052CC] hover:shadow-md rounded-xl p-3.5 transition-all flex gap-3 group"
                    >
                      {/* Product Thumbnail */}
                      <div className="relative w-20 h-20 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center p-1.5">
                        <img
                          src={product.imageUrl || '/assets/bolt_zinc.jpg'}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/bolt_zinc.jpg';
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-mono text-xs font-bold text-[#0052CC] truncate">
                            {product.sku}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 flex-shrink-0">
                            {product.standard}
                          </span>
                        </div>

                        <h4 className="text-xs font-extrabold text-slate-900 line-clamp-2 leading-snug mb-1.5" title={product.name}>
                          {product.name}
                        </h4>

                        <div className="flex items-center gap-2 text-[11px] text-slate-600 mb-2 flex-wrap">
                          <span className="font-semibold text-slate-700">Grade {product.grade}</span>
                          <span>•</span>
                          <span>{product.finish}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                            {product.stockPcs > 0 ? `${product.stockPcs.toLocaleString()} pcs in stock` : 'In Stock'}
                          </span>
                        </div>

                        {/* Rate & 1-Click RFQ Add */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <div>
                            <span className="text-sm font-black text-slate-900">
                              ₹{product.pricePerPiece.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold"> / pc</span>
                            <span className="block text-[10px] text-slate-500 font-mono">
                              (₹{product.pricePerKg.toFixed(1)}/kg)
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                              addedSku === product.sku
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-[#0052CC] hover:bg-[#0747A6] text-white shadow-xs'
                            }`}
                          >
                            {addedSku === product.sku ? (
                              <>
                                <Check size={13} />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus size={13} />
                                <span>Add to RFQ</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Shelf Footer: Pagination & Full Category Page Link */}
              <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs flex-shrink-0 shadow-xs">
                <div className="flex items-center gap-1 text-slate-600 font-bold">
                  <span>Page {currentPage} of {totalPages}</span>
                  <span className="text-slate-400 font-normal">({totalProducts.toLocaleString()} items)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1 || productsLoading}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages || productsLoading}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>

                  <Link
                    href={`/products?category=${encodeURIComponent(activeZone.category)}`}
                    target="_blank"
                    className="ml-2 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0052CC] border border-blue-200 text-[11px] font-bold flex items-center gap-1 no-underline transition-colors"
                  >
                    <span>Full Grid</span>
                    <ExternalLink size={11} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. RFQ CART DRAWER */}
      {/* ------------------------------------------------------------- */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={(id, qty) => {
          setCartItems((prev) => {
            const updated = prev.map((item) => {
              if (item.id === id) {
                const q = Math.max(1, qty);
                return {
                  ...item,
                  quantity: q,
                  totalWeightKg: q * (item.weightPerPcKg || 0.05),
                  rowTotal: q * (item.unitRate || 10)
                };
              }
              return item;
            });
            setStoredCart(updated);
            return updated;
          });
        }}
        onRemoveItem={(id) => {
          setCartItems((prev) => {
            const updated = prev.filter((i) => i.id !== id);
            setStoredCart(updated);
            return updated;
          });
          setCartCount((c) => Math.max(0, c - 1));
        }}
      />
    </div>
  );
}
