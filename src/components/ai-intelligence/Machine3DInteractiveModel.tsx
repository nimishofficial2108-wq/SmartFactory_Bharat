import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useAIIntelligence } from '../../context/AIIntelligenceContext';
import { SensorNodeState } from '../../types/aiIntelligence';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Radio,
  Eye,
} from 'lucide-react';

export const Machine3DInteractiveModel: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const {
    selectedProfileId,
    selectedProfile,
    sensors,
    selectedSensorId,
    setSelectedSensorId,
    scenario,
    isSimulating,
  } = useAIIntelligence();

  const [hoveredSensor, setHoveredSensor] = useState<SensorNodeState | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 420;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfcfcfd); // Crisp off-white technical viewport

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4.5, 3.2, 5.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't go below ground
    controls.minDistance = 2.5;
    controls.maxDistance = 12;

    // 3. Grid & Ground Plane
    const grid = new THREE.GridHelper(10, 20, 0xd1d5db, 0xe5e7eb);
    grid.position.y = -0.01;
    scene.add(grid);

    // Subtle technical floor circle
    const floorGeo = new THREE.CircleGeometry(4, 32);
    const floorMat = new THREE.MeshBasicMaterial({ color: 0xf3f4f6, side: THREE.DoubleSide });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.02;
    scene.add(floorMesh);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(6, 10, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xfef3c7, 0.4); // Subtle amber/warm fill
    fillLight.position.set(-5, 4, -4);
    scene.add(fillLight);

    // 5. Machine Body Assembly based on Profile
    const machineGroup = new THREE.Group();
    scene.add(machineGroup);

    // Industrial materials
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Slate steel
      roughness: 0.35,
      metalness: 0.7,
    });

    const highlightMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Saffron / Amber accent
      roughness: 0.3,
      metalness: 0.5,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.15,
      metalness: 0.9,
    });

    const esp32BoxMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep graphite
      roughness: 0.4,
      metalness: 0.6,
    });

    let movingPartMesh: THREE.Mesh | null = null;

    if (selectedProfile.id === 'hydraulic_press') {
      // Base Platen
      const baseGeo = new THREE.BoxGeometry(2.4, 0.4, 1.8);
      const baseMesh = new THREE.Mesh(baseGeo, steelMat);
      baseMesh.position.y = 0.2;
      machineGroup.add(baseMesh);

      // 4 Pillars
      const pillarGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.6, 16);
      const pPositions = [
        [-0.95, 1.5, -0.7],
        [0.95, 1.5, -0.7],
        [-0.95, 1.5, 0.7],
        [0.95, 1.5, 0.7],
      ];
      pPositions.forEach(([x, y, z]) => {
        const p = new THREE.Mesh(pillarGeo, chromeMat);
        p.position.set(x, y, z);
        machineGroup.add(p);
      });

      // Top Crown Cylinder
      const crownGeo = new THREE.BoxGeometry(2.4, 0.6, 1.8);
      const crownMesh = new THREE.Mesh(crownGeo, steelMat);
      crownMesh.position.y = 2.9;
      machineGroup.add(crownMesh);

      // Hydraulic Ram Cylinder
      const hydGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.9, 24);
      const hydMesh = new THREE.Mesh(hydGeo, chromeMat);
      hydMesh.position.set(0, 2.4, 0);
      machineGroup.add(hydMesh);

      // Moving Press Ram
      const ramGeo = new THREE.BoxGeometry(1.6, 0.3, 1.2);
      movingPartMesh = new THREE.Mesh(ramGeo, highlightMat);
      movingPartMesh.position.set(0, 1.4, 0);
      machineGroup.add(movingPartMesh);
    } else if (selectedProfile.id === 'air_compressor') {
      // Compressor tank base
      const tankGeo = new THREE.CylinderGeometry(0.7, 0.7, 2.2, 24);
      const tank = new THREE.Mesh(tankGeo, steelMat);
      tank.rotation.z = Math.PI / 2;
      tank.position.set(0, 0.8, 0);
      machineGroup.add(tank);

      // Motor & Screw Block on top
      const motorGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.9, 20);
      const motor = new THREE.Mesh(motorGeo, chromeMat);
      motor.position.set(-0.5, 1.8, 0);
      motor.rotation.z = Math.PI / 2;
      machineGroup.add(motor);

      // Air filter housing
      const filterGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.4, 16);
      const filter = new THREE.Mesh(filterGeo, highlightMat);
      filter.position.set(0.4, 1.9, 0);
      machineGroup.add(filter);
    } else if (selectedProfile.id === 'furnace') {
      // Furnace cylindrical crucible
      const potGeo = new THREE.CylinderGeometry(1.0, 0.8, 1.8, 28);
      const pot = new THREE.Mesh(potGeo, steelMat);
      pot.position.set(0, 1.0, 0);
      machineGroup.add(pot);

      // Copper Induction Coils around crucible
      const coilGeo = new THREE.TorusGeometry(1.05, 0.04, 12, 32);
      for (let i = 0; i < 5; i++) {
        const coil = new THREE.Mesh(coilGeo, highlightMat);
        coil.rotation.x = Math.PI / 2;
        coil.position.set(0, 0.5 + i * 0.25, 0);
        machineGroup.add(coil);
      }
    } else {
      // Motor Profile (Polishing Motor / Generic Motor)
      const baseGeo = new THREE.BoxGeometry(1.4, 0.25, 1.1);
      const base = new THREE.Mesh(baseGeo, steelMat);
      base.position.y = 0.125;
      machineGroup.add(base);

      // Motor Stator Cylinder
      const bodyGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.5, 24);
      const body = new THREE.Mesh(bodyGeo, steelMat);
      body.rotation.z = Math.PI / 2;
      body.position.set(0, 0.85, 0);
      machineGroup.add(body);

      // Rotor Shaft
      const shaftGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.2, 16);
      movingPartMesh = new THREE.Mesh(shaftGeo, chromeMat);
      movingPartMesh.rotation.z = Math.PI / 2;
      movingPartMesh.position.set(0.3, 0.85, 0);
      machineGroup.add(movingPartMesh);

      // Terminal Box on top
      const tBoxGeo = new THREE.BoxGeometry(0.45, 0.25, 0.35);
      const tBox = new THREE.Mesh(tBoxGeo, highlightMat);
      tBox.position.set(0, 1.55, 0);
      machineGroup.add(tBox);
    }

    // 6. ESP32 Retrofit Gateway Box (Mounted externally on the side)
    const esp32Box = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.3, 0.2), esp32BoxMat);
    esp32Box.position.set(-1.4, 1.2, 0.8);
    machineGroup.add(esp32Box);

    // Glowing LED on ESP32 Box
    const ledGeo = new THREE.SphereGeometry(0.03, 12, 12);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(-1.4, 1.3, 0.91);
    machineGroup.add(led);

    // 7. Sensor Nodes Placed Visually Around Machine
    // SCT-013 (Conductor Lead), MPU6050 (Housing), DS18B20 (Surface), MLX90614 (IR), INMP441 (Audio), Proximity (Stroke)
    const sensorAnchors: Record<SensorNodeState['id'], THREE.Vector3> = {
      sct013: new THREE.Vector3(-1.1, 1.6, 0.4), // near power intake lead
      mpu6050: new THREE.Vector3(0.6, 0.9, 0.6), // on bearing housing
      ds18b20: new THREE.Vector3(0.0, 1.2, 0.8), // contact surface
      mlx90614: new THREE.Vector3(1.4, 1.3, 0.5), // IR sensor pointing at spinning shaft
      inmp441: new THREE.Vector3(-0.6, 0.5, 1.1), // microphone near acoustic origin
      proximity: new THREE.Vector3(0.8, 1.5, -0.6), // near moving ram
    };

    const sensorPins: { id: SensorNodeState['id']; mesh: THREE.Mesh; line: THREE.Line }[] = [];

    const esp32Pos = new THREE.Vector3(-1.4, 1.2, 0.8);

    sensors.forEach((s) => {
      const pos = sensorAnchors[s.id] || new THREE.Vector3(0, 1, 0);

      // Pin head
      const isSelected = selectedSensorId === s.id;
      const isWarn = s.status === 'warning' || s.status === 'critical';
      const isOffline = s.status === 'offline';

      const pinColor = isOffline ? 0x94a3b8 : isWarn ? 0xf59e0b : isSelected ? 0x2563eb : 0x10b981;

      const pinGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const pinMat = new THREE.MeshStandardMaterial({
        color: pinColor,
        emissive: isOffline ? 0x000000 : pinColor,
        emissiveIntensity: isWarn ? 0.6 : 0.3,
        roughness: 0.2,
      });

      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      pinMesh.userData = { sensorId: s.id };
      machineGroup.add(pinMesh);

      // Animated connection line to ESP32
      const lineMat = new THREE.LineDashedMaterial({
        color: isOffline ? 0xcbd5e1 : 0x10b981,
        dashSize: 0.15,
        gapSize: 0.08,
        opacity: isOffline ? 0.3 : 0.8,
        transparent: true,
      });

      const lineGeo = new THREE.BufferGeometry().setFromPoints([pos, esp32Pos]);
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      machineGroup.add(line);

      sensorPins.push({ id: s.id, mesh: pinMesh, line });
    });

    // 8. Raycasting for Click / Hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const pinMeshes = sensorPins.map((p) => p.mesh);
      const intersects = raycaster.intersectObjects(pinMeshes);

      if (intersects.length > 0) {
        const clickedSensorId = intersects[0].object.userData.sensorId as SensorNodeState['id'];
        setSelectedSensorId(clickedSensorId);
      }
    };

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const pinMeshes = sensorPins.map((p) => p.mesh);
      const intersects = raycaster.intersectObjects(pinMeshes);

      if (intersects.length > 0) {
        const id = intersects[0].object.userData.sensorId as SensorNodeState['id'];
        const found = sensors.find((s) => s.id === id) || null;
        setHoveredSensor(found);
        container.style.cursor = 'pointer';
      } else {
        setHoveredSensor(null);
        container.style.cursor = 'grab';
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);

    // 9. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Gentle movement for active machine components
      if (movingPartMesh && isSimulating) {
        if (selectedProfile.id === 'hydraulic_press') {
          movingPartMesh.position.y = 1.35 + Math.sin(elapsed * 2.5) * 0.25;
        } else if (selectedProfile.id === 'polishing_motor' || selectedProfile.id === 'generic_motor') {
          movingPartMesh.rotation.x += delta * 12;
        }
      }

      // Pulse sensor pins and animate connection line dashes
      sensorPins.forEach((sp, idx) => {
        const s = sensors.find((sen) => sen.id === sp.id);
        if (s && s.isOnline) {
          const scale = 1 + Math.sin(elapsed * 4 + idx) * 0.15;
          sp.mesh.scale.set(scale, scale, scale);
        }

        // Shift dash offset to show moving data packets
        if (sp.line.material instanceof THREE.LineDashedMaterial) {
          sp.line.material.dashSize = 0.12 + Math.sin(elapsed * 3) * 0.02;
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 10. Resize handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      renderer.dispose();
    };
  }, [selectedProfileId, selectedSensorId, sensors, isSimulating, scenario]);

  const handleResetCamera = () => {
    // Reset view
  };

  return (
    <div className="relative w-full h-[440px] md:h-[480px] rounded-3xl bg-[#fcfcfd] dark:bg-slate-900 border border-[#00000012] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden transition-all">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Floating Machine Profile & Simulation Mode Badge */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-xs pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{selectedProfile.name}</span>
          <span className="text-[10px] text-slate-400 font-mono">3D Twin</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[10px] font-mono font-semibold self-start">
          <span>● SIMULATION MODE</span>
          <span className="text-slate-400">· Demo Data</span>
        </div>
      </div>

      {/* Top Right Controls (Reset, Zoom, Instructions) */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 text-[10px] text-slate-500 font-mono">
          <Eye className="w-3 h-3 text-slate-400" />
          <span>Click any sensor node pin</span>
        </div>

        <button
          onClick={handleResetCamera}
          title="Reset Camera Angle"
          className="p-2 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 shadow-xs hover:scale-105 active:scale-95 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Floating Legend / Active Sensor Card Overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Sensor Quick Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
          {sensors.map((s) => {
            const isSelected = selectedSensorId === s.id;
            const isWarn = s.status === 'warning' || s.status === 'critical';
            const isOffline = s.status === 'offline';

            return (
              <button
                key={s.id}
                onClick={() => setSelectedSensorId(isSelected ? null : s.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all backdrop-blur-md border shadow-2xs ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white scale-105'
                    : isOffline
                    ? 'bg-slate-100/90 text-slate-400 border-slate-200 line-through opacity-70'
                    : isWarn
                    ? 'bg-amber-50/90 text-amber-800 border-amber-200 dark:bg-amber-950/80 dark:text-amber-200'
                    : 'bg-white/90 text-slate-700 dark:bg-slate-800/90 dark:text-slate-200 border-slate-200/80 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOffline
                      ? 'bg-slate-400'
                      : isWarn
                      ? 'bg-amber-500 animate-pulse'
                      : isSelected
                      ? 'bg-white dark:bg-slate-900'
                      : 'bg-emerald-500'
                  }`}
                />
                <span>{s.sensorModel.split(' ')[0]}</span>
                <span className="font-mono-num text-[10px] font-bold">
                  {s.isOnline ? s.value.split(' ')[0] : 'OFF'}
                </span>
              </button>
            );
          })}
        </div>

        {/* ESP32 Retrofit Gateway Floating Pip */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 text-xs font-semibold shadow-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>ESP32 Gateway</span>
          <span className="text-[10px] font-mono-num text-slate-400">100% Wi-Fi</span>
        </div>
      </div>

      {/* Selected Sensor Floating Details Popover */}
      {selectedSensorId && (
        <div className="absolute top-16 right-4 z-20 w-72 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
          {(() => {
            const s = sensors.find((item) => item.id === selectedSensorId);
            if (!s) return null;
            return (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {s.name}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">{s.sensorModel}</span>
                  </div>
                  <button
                    onClick={() => setSelectedSensorId(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">Live Telemetry:</span>
                  <span
                    className={`text-lg font-bold font-mono-num ${
                      s.status === 'critical'
                        ? 'text-red-600'
                        : s.status === 'warning'
                        ? 'text-amber-600'
                        : s.status === 'offline'
                        ? 'text-slate-400 line-through'
                        : 'text-emerald-600'
                    }`}
                  >
                    {s.value}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-[#f7f7f8] dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                  <span className="font-semibold block text-slate-700 dark:text-slate-300 mb-0.5">
                    Mounting & Physical Interface:
                  </span>
                  {s.mountType}
                </div>

                <p className="text-[10px] text-slate-400">{s.description}</p>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
