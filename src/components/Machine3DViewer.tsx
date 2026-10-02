import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Machine, HotspotInfo } from '../types';
import { useFactory } from '../context/FactoryContext';
import {
  RotateCcw,
  Maximize2,
  Info,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  X,
} from 'lucide-react';

interface Machine3DViewerProps {
  machine: Machine;
}

export const Machine3DViewer: React.FC<Machine3DViewerProps> = ({ machine }) => {
  const { t, language } = useFactory();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotInfo | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Sensor hotspots positioned accurately on machine geometry
  const hotspots: HotspotInfo[] = [
    {
      id: 'current_ct',
      name: 'Current CT Clamp',
      hindiName: 'करंट क्लैंप सेंसर',
      type: 'current',
      position: [-1.4, 2.8, -0.6],
      value: `${machine.telemetry.currentA.toFixed(1)} A (${machine.telemetry.powerKW.toFixed(1)} kW)`,
      status: machine.telemetry.currentA > 70 ? 'warning' : 'normal',
      normalRange: '15.0 - 65.0 A',
      description: 'Split-core current transformer clipped onto main 3-phase feeder cable. Non-invasive.',
    },
    {
      id: 'vibration_piezo',
      name: 'Vibration RMS Sensor',
      hindiName: 'कंपन सेंसर (बेयरिंग पर)',
      type: 'vibration',
      position: [1.3, 2.7, 0.4],
      value: `${machine.telemetry.vibrationRMS.toFixed(2)} mm/s`,
      status: machine.telemetry.vibrationRMS > 4.5 ? 'warning' : 'normal',
      normalRange: '< 4.50 mm/s',
      description: 'High-frequency piezoelectric accelerometer magnetically coupled to drive motor housing.',
    },
    {
      id: 'temp_probe',
      name: 'Thermal Surface Probe',
      hindiName: 'तापमान सेंसर (ऑयल टैंक)',
      type: 'temperature',
      position: [0.0, 1.8, -1.0],
      value: `${machine.telemetry.temperatureC.toFixed(1)} °C`,
      status: machine.telemetry.temperatureC > 75 ? 'warning' : 'normal',
      normalRange: '< 65.0 °C',
      description: 'Magnetic RTD surface thermocouple on hydraulic fluid manifold and valve bank.',
    },
    {
      id: 'acoustic_mems',
      name: 'Acoustic Anomaly Mic',
      hindiName: 'आवाज विकृति माइक्रोफोन',
      type: 'acoustic',
      position: [0.0, 0.6, 1.1],
      value: `${machine.telemetry.acousticAnomalyScore}% anomaly`,
      status: machine.telemetry.acousticAnomalyScore > 25 ? 'warning' : 'normal',
      normalRange: '< 20% score',
      description: 'Directional ultrasonic & acoustic MEMS microphone pointed at die stamp zone.',
    },
    {
      id: 'prox_indexer',
      name: 'Proximity Stroke Indexer',
      hindiName: 'स्ट्रोक प्रॉक्सिमिटी सेंसर',
      type: 'proximity',
      position: [-0.9, 1.2, 0.8],
      value: `${machine.telemetry.goodStrokes || 1420} strokes`,
      status: 'normal',
      normalRange: 'Active Cycle Sync',
      description: 'Inductive proximity limit sensor detecting ram bottom dead center (BDC).',
    },
  ];

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 420;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0f1d); // Deep industrial navy

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4.5, 3.2, 5.0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clear previous children
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.minDistance = 2.5;
    controls.maxDistance = 12;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff7ed, 1.2); // Warm saffron/key light
    dirLight1.position.set(5, 8, 5);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6); // Cool rim light
    dirLight2.position.set(-5, 4, -4);
    scene.add(dirLight2);

    // Industrial Grid Floor
    const gridHelper = new THREE.GridHelper(10, 20, 0x1e3a8a, 0x1e293b);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // Build Stylized Industrial Hydraulic Machine Model Group
    const machineGroup = new THREE.Group();

    // Machine Base / Bed Plate (Cast Iron Charcoal)
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.8,
    });
    const baseGeo = new THREE.BoxGeometry(2.4, 0.4, 2.2);
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.3;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    machineGroup.add(baseMesh);

    // Heavy Columns (H-Frame / C-Frame Steel Columns)
    const columnMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.4,
      metalness: 0.7,
    });
    const colLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.2, 16), columnMat);
    colLeft.position.set(-0.95, 1.3, -0.7);
    colLeft.castShadow = true;
    machineGroup.add(colLeft);

    const colRight = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.2, 16), columnMat);
    colRight.position.set(0.95, 1.3, -0.7);
    colRight.castShadow = true;
    machineGroup.add(colRight);

    const colFrontLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.2, 16), columnMat);
    colFrontLeft.position.set(-0.95, 1.3, 0.7);
    colFrontLeft.castShadow = true;
    machineGroup.add(colFrontLeft);

    const colFrontRight = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.2, 16), columnMat);
    colFrontRight.position.set(0.95, 1.3, 0.7);
    colFrontRight.castShadow = true;
    machineGroup.add(colFrontRight);

    // Top Crown / Hydraulic Cylinder Mount
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.85,
    });
    const crownMesh = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.6, 2.0), crownMat);
    crownMesh.position.y = 3.0;
    crownMesh.castShadow = true;
    machineGroup.add(crownMesh);

    // Hydraulic Cylinder Body (Upper Center)
    const cylMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.3,
      metalness: 0.9,
    });
    const cylMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.2, 24), cylMat);
    cylMesh.position.set(0, 3.3, 0);
    cylMesh.castShadow = true;
    machineGroup.add(cylMesh);

    // Animated Ram & Punch Tooling
    const ramMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Polished chrome ram
      roughness: 0.15,
      metalness: 0.95,
    });
    const ramMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 1.4, 24), ramMat);
    ramMesh.position.set(0, 2.0, 0);
    ramMesh.castShadow = true;
    machineGroup.add(ramMesh);

    const diePlaten = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.25, 1.2), columnMat);
    diePlaten.position.set(0, 1.3, 0);
    diePlaten.castShadow = true;
    machineGroup.add(diePlaten);

    // Lower Stamping Bolster & Die Plate (On Bed)
    const lowerDieMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Saffron coated tool steel die
      roughness: 0.3,
      metalness: 0.6,
    });
    const lowerDie = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 1.0), lowerDieMat);
    lowerDie.position.set(0, 0.05, 0);
    lowerDie.castShadow = true;
    machineGroup.add(lowerDie);

    // Hydraulic Power Pack & Motor on the side
    const motorMat = new THREE.MeshStandardMaterial({
      color: 0x0f766e, // Industrial teal/green motor
      roughness: 0.4,
      metalness: 0.7,
    });
    const motorMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 16), motorMat);
    motorMesh.rotation.z = Math.PI / 2;
    motorMesh.position.set(1.4, 2.7, 0.4);
    motorMesh.castShadow = true;
    machineGroup.add(motorMesh);

    // Oil Tank / Reservoir
    const tankMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.9), columnMat);
    tankMesh.position.set(0.0, 1.8, -1.1);
    tankMesh.castShadow = true;
    machineGroup.add(tankMesh);

    // RETROFIT SMARTFACTORY IOT BOX (Safety Saffron / Amber Enclosure magnetically mounted)
    const boxGroup = new THREE.Group();
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0xf97316, // Bright saffron/orange retrofit casing
      roughness: 0.3,
      metalness: 0.3,
    });
    const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.48, 0.22), boxMat);
    boxMesh.castShadow = true;
    boxGroup.add(boxMesh);

    // Box Front Bezel with Chakra Logo & Status LED
    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
    });
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, 0.04), bezelMat);
    bezel.position.z = 0.11;
    boxGroup.add(bezel);

    // Blinking status LED on box
    const ledMat = new THREE.MeshBasicMaterial({
      color: machine.status === 'warning' ? 0xf59e0b : 0x10b981,
    });
    const ledMesh = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), ledMat);
    ledMesh.position.set(0.08, 0.12, 0.14);
    boxGroup.add(ledMesh);

    // Clip box onto machine left front pillar
    boxGroup.position.set(-1.18, 1.8, 0.72);
    boxGroup.rotation.y = Math.PI / 4;
    machineGroup.add(boxGroup);

    // Add sensor pins / hotspots as glowing 3D spheres
    const hotspotMeshes: { mesh: THREE.Mesh; info: HotspotInfo }[] = [];

    hotspots.forEach((hs) => {
      const pinColor = hs.status === 'warning' ? 0xf59e0b : 0x10b981;
      const sphereMat = new THREE.MeshBasicMaterial({ color: pinColor });
      const pinMesh = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), sphereMat);
      pinMesh.position.set(hs.position[0], hs.position[1], hs.position[2]);

      // Outer glowing pulse ring
      const ringMat = new THREE.MeshBasicMaterial({
        color: pinColor,
        wireframe: true,
        transparent: true,
        opacity: 0.7,
      });
      const ringMesh = new THREE.Mesh(new THREE.RingGeometry(0.12, 0.18, 16), ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      pinMesh.add(ringMesh);

      pinMesh.userData = { hotspotInfo: hs };
      machineGroup.add(pinMesh);
      hotspotMeshes.push({ mesh: pinMesh, info: hs });
    });

    scene.add(machineGroup);

    // Raycaster for clicking hotspots
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        hotspotMeshes.map((h) => h.mesh),
        true
      );

      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && !hitObj.userData.hotspotInfo && hitObj.parent) {
          hitObj = hitObj.parent;
        }
        if (hitObj?.userData?.hotspotInfo) {
          setSelectedHotspot(hitObj.userData.hotspotInfo as HotspotInfo);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Reciprocating Ram Animation (Stroking up and down in active mode)
      if (machine.status !== 'off') {
        const strokeCycle = Math.sin(elapsedTime * 2.2);
        // Moves between 1.3 and 0.8
        diePlaten.position.y = 1.05 + strokeCycle * 0.25;
        ramMesh.position.y = 1.75 + strokeCycle * 0.25;
      }

      // Blink status LED on IoT box
      ledMesh.visible = Math.floor(elapsedTime * 3) % 2 === 0;

      // Pulse ring scaling
      hotspotMeshes.forEach((h, i) => {
        const ring = h.mesh.children[0];
        if (ring) {
          const s = 1 + Math.sin(elapsedTime * 4 + i) * 0.25;
          ring.scale.set(s, s, s);
        }
      });

      // Auto rotation
      if (isAutoRotating) {
        machineGroup.rotation.y += 0.003;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [machine, isAutoRotating]);

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(4.5, 3.2, 5.0);
      controlsRef.current.target.set(0, 1.2, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative w-full h-[440px] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl group">
      {/* Blueprint Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* Top Header Badge */}
      <div className="absolute top-3.5 left-4 z-10 flex items-center gap-2 pointer-events-none">
        <span className="text-xs font-bold text-white bg-slate-900/85 backdrop-blur px-3 py-1 rounded-lg border border-slate-700/80 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {machine.name} · Digital Twin 3D
        </span>
        <span className="text-[11px] font-mono-num text-slate-400 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
          Box: {machine.boxId}
        </span>
      </div>

      {/* Floating 3D Interaction Controls (Top Right) */}
      <div className="absolute top-3.5 right-4 z-10 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur p-1 rounded-xl border border-slate-700">
        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            isAutoRotating ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
          }`}
          title="Toggle Auto Rotation"
        >
          {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={resetCamera}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Bottom Hint Banner */}
      <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="text-[11px] text-slate-400 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.interactive3DHint}</span>
        </div>

        {/* Hotspot Chips to click directly if user prefers buttons */}
        <div className="hidden sm:flex items-center gap-1.5 pointer-events-auto">
          {hotspots.map((hs) => (
            <button
              key={hs.id}
              onClick={() => setSelectedHotspot(hs)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                selectedHotspot?.id === hs.id
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {hs.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Sensor Hotspot Popover Card (when clicked) */}
      {selectedHotspot && (
        <div className="absolute top-16 right-4 z-20 w-80 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  selectedHotspot.status === 'warning'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-emerald-400'
                }`}
              />
              <div>
                <h4 className="text-xs font-bold text-white">
                  {selectedHotspot.name}
                </h4>
                <p className="text-[11px] text-amber-400">
                  {selectedHotspot.hindiName}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedHotspot(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Live Sensor Telemetry</span>
              <span className="font-mono text-emerald-400">REALTIME</span>
            </div>
            <div className="text-xl font-bold font-mono-num text-white">
              {selectedHotspot.value}
            </div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between font-mono-num">
              <span>Safe Baseline:</span>
              <span className="text-slate-300">{selectedHotspot.normalRange}</span>
            </div>
          </div>

          <p className="mt-2.5 text-[11px] text-slate-300 leading-relaxed">
            {selectedHotspot.description}
          </p>
        </div>
      )}
    </div>
  );
};
