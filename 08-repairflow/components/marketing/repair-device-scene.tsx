"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./marketing.module.css";

type RepairDeviceSceneProps = {
  onStepChange: (step: number) => void;
};

type DevicePart = "back" | "frame" | "battery" | "board" | "display" | "glass";

type PartPose = {
  x: number;
  y: number;
  z: number;
  rx?: number;
  ry?: number;
  rz?: number;
  scale?: number;
};

type DevicePose = Record<DevicePart, PartPose> & {
  rotation: { x: number; y: number; z: number };
  scale: number;
};

const heroPose: DevicePose = {
  back: { x: 0, y: 0, z: -0.38 },
  frame: { x: 0, y: 0, z: -0.16 },
  battery: { x: 0, y: -0.55, z: -0.02 },
  board: { x: 0, y: 1.62, z: 0.03 },
  display: { x: 0, y: 0, z: 0.25 },
  glass: { x: 0, y: 0, z: 0.38 },
  rotation: { x: -0.12, y: -0.38, z: -0.05 },
  scale: 0.96,
};

const stagePoses: DevicePose[] = [
  {
    ...heroPose,
    display: { x: -0.1, y: 0, z: 0.65 },
    glass: { x: 0.48, y: 0.08, z: 1.16, ry: 0.05 },
    rotation: { x: -0.1, y: -0.42, z: -0.04 },
    scale: 0.94,
  },
  {
    ...heroPose,
    board: { x: -1.05, y: 1.42, z: 0.74, rz: -0.05 },
    display: { x: 0.5, y: -0.02, z: 0.82 },
    glass: { x: 1.12, y: 0.08, z: 1.34, ry: 0.08 },
    rotation: { x: -0.08, y: -0.18, z: 0.03 },
    scale: 0.9,
  },
  {
    ...heroPose,
    battery: { x: -0.78, y: -0.64, z: 0.42, rz: -0.04 },
    board: { x: -1.02, y: 1.55, z: 0.54, rz: -0.04 },
    display: { x: 0.66, y: 0.02, z: 0.86 },
    glass: { x: 1.24, y: 0.08, z: 1.4, ry: 0.08 },
    rotation: { x: -0.08, y: 0.08, z: 0.04 },
    scale: 0.88,
  },
  {
    back: { x: -0.62, y: 0, z: -0.9, ry: -0.08 },
    frame: { x: -0.24, y: 0, z: -0.25 },
    battery: { x: 1.02, y: -0.72, z: 0.55, rz: 0.08 },
    board: { x: -1.15, y: 1.5, z: 0.72, rz: -0.08 },
    display: { x: 0.78, y: 0, z: 0.96 },
    glass: { x: 1.45, y: 0.1, z: 1.62, ry: 0.1 },
    rotation: { x: -0.05, y: 0.25, z: 0.04 },
    scale: 0.84,
  },
  {
    ...heroPose,
    rotation: { x: -0.09, y: 0.44, z: 0.03 },
    scale: 1,
  },
];

function roundedPanel(width: number, height: number, depth: number, radius: number) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();

  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: Math.min(0.055, depth * 0.35),
    bevelThickness: Math.min(0.045, depth * 0.3),
    curveSegments: 12,
  });
  geometry.center();
  return geometry;
}

function createScreenTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const gradient = context.createLinearGradient(0, 0, 512, 1024);
  gradient.addColorStop(0, "#17231e");
  gradient.addColorStop(0.55, "#0b100d");
  gradient.addColorStop(1, "#060806");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 1024);

  context.fillStyle = "#c8ff3d";
  context.fillRect(48, 58, 56, 8);
  context.font = "600 26px Arial";
  context.fillText("REPAIRFLOW", 48, 118);

  context.fillStyle = "#6f7b72";
  context.font = "500 17px Arial";
  context.fillText("DEVICE RECORD", 48, 190);
  context.fillStyle = "#f4f7ee";
  context.font = "500 46px Arial";
  context.fillText("RF-2048", 48, 250);

  context.strokeStyle = "#35433a";
  context.lineWidth = 2;
  context.strokeRect(48, 310, 416, 222);
  context.fillStyle = "#8d9b91";
  context.font = "500 17px Arial";
  context.fillText("CURRENT STAGE", 76, 354);
  context.fillStyle = "#c8ff3d";
  context.font = "500 38px Arial";
  context.fillText("DIAGNOSIS", 76, 414);

  const bars = [0.94, 0.72, 0.56];
  bars.forEach((amount, index) => {
    const y = 462 + index * 28;
    context.fillStyle = "#26322b";
    context.fillRect(76, y, 334, 8);
    context.fillStyle = index === 0 ? "#c8ff3d" : "#38d7b2";
    context.fillRect(76, y, 334 * amount, 8);
  });

  context.fillStyle = "#111813";
  context.fillRect(48, 592, 416, 254);
  context.fillStyle = "#7d8a80";
  context.font = "500 17px Arial";
  context.fillText("WORKFLOW", 76, 638);

  const labels = ["Request received", "Inspection logged", "Approval pending"];
  labels.forEach((label, index) => {
    const y = 686 + index * 58;
    context.beginPath();
    context.arc(84, y - 6, 7, 0, Math.PI * 2);
    context.fillStyle = index < 2 ? "#c8ff3d" : "#536057";
    context.fill();
    context.fillStyle = index < 2 ? "#eaf0e7" : "#7d8a80";
    context.font = "500 18px Arial";
    context.fillText(label, 108, y);
  });

  context.fillStyle = "#748078";
  context.font = "500 16px Arial";
  context.fillText("09:42  /  SERVICE DESK", 48, 942);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function createBatteryTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 384;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.fillStyle = "#222a24";
  context.fillRect(0, 0, 256, 384);
  context.strokeStyle = "#4a5a4e";
  context.lineWidth = 4;
  context.strokeRect(14, 14, 228, 356);
  context.fillStyle = "#c8ff3d";
  context.fillRect(28, 30, 44, 7);
  context.fillStyle = "#e8eee7";
  context.font = "600 20px Arial";
  context.fillText("POWER CELL", 28, 82);
  context.fillStyle = "#88958b";
  context.font = "500 14px Arial";
  context.fillText("SERVICE MODULE", 28, 112);
  context.fillText("3.88 V", 28, 298);
  context.fillText("INSPECT BEFORE RELEASE", 28, 330);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createDevice() {
  const assembly = new THREE.Group();
  const parts = {} as Record<DevicePart, THREE.Group>;
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];

  const trackGeometry = <T extends THREE.BufferGeometry>(geometry: T) => {
    geometries.push(geometry);
    return geometry;
  };
  const trackMaterial = <T extends THREE.Material>(material: T) => {
    materials.push(material);
    return material;
  };

  const shellMaterial = trackMaterial(
    new THREE.MeshPhysicalMaterial({
      color: 0x1b211c,
      metalness: 0.78,
      roughness: 0.2,
      clearcoat: 0.8,
      clearcoatRoughness: 0.16,
      emissive: 0x0b160f,
      emissiveIntensity: 0.08,
    }),
  );
  const frameMaterial = trackMaterial(
    new THREE.MeshPhysicalMaterial({
      color: 0x87918a,
      metalness: 0.92,
      roughness: 0.18,
      emissive: 0x132019,
      emissiveIntensity: 0.05,
    }),
  );
  const batteryMaterial = trackMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x202820,
      metalness: 0.42,
      roughness: 0.4,
      emissive: 0xff6e3f,
      emissiveIntensity: 0.05,
    }),
  );
  const boardMaterial = trackMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x174b3b,
      metalness: 0.35,
      roughness: 0.34,
      emissive: 0x38d7b2,
      emissiveIntensity: 0.08,
    }),
  );
  const chipMaterial = trackMaterial(
    new THREE.MeshStandardMaterial({ color: 0x101512, metalness: 0.7, roughness: 0.24 }),
  );
  const copperMaterial = trackMaterial(
    new THREE.MeshStandardMaterial({
      color: 0xc97c4f,
      metalness: 0.82,
      roughness: 0.24,
      emissive: 0x7a2514,
      emissiveIntensity: 0.08,
    }),
  );

  const back = new THREE.Group();
  const shell = new THREE.Mesh(trackGeometry(roundedPanel(3.08, 6.18, 0.34, 0.48)), shellMaterial);
  shell.castShadow = true;
  shell.receiveShadow = true;
  back.add(shell);

  const cameraPlate = new THREE.Mesh(
    trackGeometry(roundedPanel(1.02, 1.25, 0.13, 0.24)),
    trackMaterial(new THREE.MeshPhysicalMaterial({ color: 0x111612, metalness: 0.68, roughness: 0.18, clearcoat: 0.9 })),
  );
  cameraPlate.position.set(-0.82, 2.1, -0.24);
  back.add(cameraPlate);
  [-0.2, 0.22].forEach((offset, index) => {
    const lens = new THREE.Mesh(
      trackGeometry(new THREE.CylinderGeometry(0.19, 0.19, 0.1, 36)),
      trackMaterial(
        new THREE.MeshPhysicalMaterial({
          color: index === 0 ? 0x08140f : 0x101810,
          metalness: 0.78,
          roughness: 0.08,
          clearcoat: 1,
          emissive: 0x1c7d63,
          emissiveIntensity: 0.12,
        }),
      ),
    );
    lens.rotation.x = Math.PI / 2;
    lens.position.set(-0.82, 2.1 + offset, -0.36);
    back.add(lens);
  });
  parts.back = back;
  assembly.add(back);

  const frame = new THREE.Group();
  const frameOuter = new THREE.Mesh(trackGeometry(roundedPanel(2.96, 6.06, 0.2, 0.44)), frameMaterial);
  frameOuter.castShadow = true;
  frame.add(frameOuter);
  const inset = new THREE.Mesh(
    trackGeometry(roundedPanel(2.64, 5.72, 0.12, 0.34)),
    trackMaterial(new THREE.MeshStandardMaterial({ color: 0x111711, metalness: 0.32, roughness: 0.5 })),
  );
  inset.position.z = 0.1;
  frame.add(inset);
  const screwGeometry = trackGeometry(new THREE.CylinderGeometry(0.055, 0.055, 0.06, 20));
  const screwMaterial = trackMaterial(new THREE.MeshStandardMaterial({ color: 0xbcc4bd, metalness: 0.9, roughness: 0.2 }));
  [
    [-1.2, -2.52],
    [1.2, -2.52],
    [-1.2, 2.52],
    [1.2, 2.52],
  ].forEach(([x, y]) => {
    const screw = new THREE.Mesh(screwGeometry, screwMaterial);
    screw.rotation.x = Math.PI / 2;
    screw.position.set(x, y, 0.2);
    frame.add(screw);
  });
  parts.frame = frame;
  assembly.add(frame);

  const battery = new THREE.Group();
  const batteryBody = new THREE.Mesh(trackGeometry(roundedPanel(2.12, 3.26, 0.18, 0.22)), batteryMaterial);
  batteryBody.castShadow = true;
  battery.add(batteryBody);
  const batteryTexture = createBatteryTexture();
  if (batteryTexture) textures.push(batteryTexture);
  const batteryLabel = new THREE.Mesh(
    trackGeometry(new THREE.PlaneGeometry(1.82, 2.7)),
    trackMaterial(new THREE.MeshStandardMaterial({ map: batteryTexture, roughness: 0.48, metalness: 0.05 })),
  );
  batteryLabel.position.z = 0.13;
  battery.add(batteryLabel);
  const batteryTab = new THREE.Mesh(trackGeometry(new THREE.BoxGeometry(0.42, 0.36, 0.08)), copperMaterial);
  batteryTab.position.set(0.62, 1.77, 0.04);
  battery.add(batteryTab);
  parts.battery = battery;
  assembly.add(battery);

  const board = new THREE.Group();
  const boardBody = new THREE.Mesh(trackGeometry(roundedPanel(2.34, 1.56, 0.13, 0.2)), boardMaterial);
  boardBody.castShadow = true;
  board.add(boardBody);
  [
    [-0.62, 0.28, 0.46, 0.34],
    [0.2, 0.28, 0.56, 0.36],
    [-0.55, -0.34, 0.3, 0.24],
    [0.52, -0.34, 0.5, 0.24],
  ].forEach(([x, y, width, height]) => {
    const chip = new THREE.Mesh(trackGeometry(new THREE.BoxGeometry(width, height, 0.12)), chipMaterial);
    chip.position.set(x, y, 0.13);
    board.add(chip);
  });
  [-0.7, -0.35, 0, 0.35, 0.7].forEach((x, index) => {
    const trace = new THREE.Mesh(trackGeometry(new THREE.BoxGeometry(0.018, 0.52 + (index % 2) * 0.18, 0.018)), copperMaterial);
    trace.position.set(x, -0.02, 0.2);
    board.add(trace);
  });
  const connector = new THREE.Mesh(trackGeometry(new THREE.BoxGeometry(0.5, 0.15, 0.08)), copperMaterial);
  connector.position.set(0.7, -0.86, 0.05);
  board.add(connector);
  parts.board = board;
  assembly.add(board);

  const display = new THREE.Group();
  const screenTexture = createScreenTexture();
  if (screenTexture) textures.push(screenTexture);
  const displayMaterial = trackMaterial(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: screenTexture,
      emissive: 0x9dff44,
      emissiveMap: screenTexture,
      emissiveIntensity: 0.5,
      metalness: 0.08,
      roughness: 0.3,
    }),
  );
  const displayMesh = new THREE.Mesh(trackGeometry(roundedPanel(2.82, 5.82, 0.08, 0.4)), displayMaterial);
  displayMesh.castShadow = true;
  display.add(displayMesh);
  parts.display = display;
  assembly.add(display);

  const glass = new THREE.Group();
  const glassMaterial = trackMaterial(
    new THREE.MeshPhysicalMaterial({
      color: 0xabc0b2,
      metalness: 0.08,
      roughness: 0.08,
      transmission: 0.42,
      transparent: true,
      opacity: 0.32,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      side: THREE.DoubleSide,
      emissive: 0x38d7b2,
      emissiveIntensity: 0.04,
    }),
  );
  const glassMesh = new THREE.Mesh(trackGeometry(roundedPanel(2.96, 5.98, 0.06, 0.44)), glassMaterial);
  glassMesh.castShadow = true;
  glass.add(glassMesh);
  const speaker = new THREE.Mesh(
    trackGeometry(new THREE.CapsuleGeometry(0.045, 0.34, 4, 16)),
    trackMaterial(new THREE.MeshStandardMaterial({ color: 0x29332c, metalness: 0.7, roughness: 0.26 })),
  );
  speaker.rotation.z = Math.PI / 2;
  speaker.position.set(0, 2.64, 0.08);
  glass.add(speaker);
  parts.glass = glass;
  assembly.add(glass);

  Object.entries(heroPose).forEach(([key, pose]) => {
    if (key === "rotation" || key === "scale") return;
    const part = parts[key as DevicePart];
    const partPose = pose as PartPose;
    part.position.set(partPose.x, partPose.y, partPose.z);
  });
  assembly.rotation.set(heroPose.rotation.x, heroPose.rotation.y, heroPose.rotation.z);
  assembly.scale.setScalar(heroPose.scale);

  return {
    assembly,
    parts,
    materials: {
      shell: shellMaterial,
      frame: frameMaterial,
      battery: batteryMaterial,
      board: boardMaterial,
      display: displayMaterial,
      glass: glassMaterial,
    },
    dispose: () => {
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());
    },
  };
}

export function RepairDeviceScene({ onStepChange }: RepairDeviceSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = styles.modelCanvas;
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.1, 11.2);

    const pointerRig = new THREE.Group();
    const floatRig = new THREE.Group();
    pointerRig.add(floatRig);
    scene.add(pointerRig);

    const device = createDevice();
    floatRig.add(device.assembly);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xc8ff3d,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.72, 0.018, 8, 160), ringMaterial);
    ring.position.z = -1.1;
    ring.rotation.x = 0.06;
    scene.add(ring);

    const innerRingMaterial = new THREE.MeshBasicMaterial({
      color: 0x38d7b2,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
    });
    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(3.16, 0.01, 8, 128), innerRingMaterial);
    innerRing.position.z = -0.9;
    scene.add(innerRing);

    const particlePositions = new Float32Array(54 * 3);
    for (let index = 0; index < 54; index += 1) {
      const angle = (index / 54) * Math.PI * 2;
      const radius = 3.35 + ((index * 17) % 21) * 0.035;
      particlePositions[index * 3] = Math.cos(angle) * radius;
      particlePositions[index * 3 + 1] = Math.sin(angle) * radius;
      particlePositions[index * 3 + 2] = -0.8 + ((index % 5) - 2) * 0.08;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({ color: 0xb7c2b9, size: 0.022, transparent: true, opacity: 0.5 });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const ambient = new THREE.HemisphereLight(0xe9f7e8, 0x152219, 2.35);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 4.4);
    key.position.set(-4, 5, 7);
    key.castShadow = true;
    scene.add(key);
    const acidLight = new THREE.PointLight(0xc8ff3d, 18, 12, 2);
    acidLight.position.set(3.6, 1.2, 4.5);
    scene.add(acidLight);
    const tealLight = new THREE.PointLight(0x38d7b2, 13, 11, 2);
    tealLight.position.set(-4, -2, 3);
    scene.add(tealLight);
    const warmLight = new THREE.PointLight(0xff835c, 8, 10, 2);
    warmLight.position.set(1.2, -4, 2.5);
    scene.add(warmLight);

    const introState = {
      y: reduceMotion ? 0 : 0.72,
      scale: reduceMotion ? 1 : 0.84,
      tilt: reduceMotion ? 0 : -0.08,
    };
    const lightState = {
      acid: reduceMotion ? 18 : 0,
      teal: reduceMotion ? 13 : 2,
    };
    let introTimeline: gsap.core.Timeline | null = null;

    if (!reduceMotion) {
      ring.scale.setScalar(0.76);
      innerRing.scale.setScalar(0.82);
      ringMaterial.opacity = 0;
      innerRingMaterial.opacity = 0;
      introTimeline = gsap
        .timeline({ delay: 0.12 })
        .to(introState, { y: 0, scale: 1, tilt: 0, duration: 1.35, ease: "power3.out" }, 0)
        .to(lightState, { acid: 18, teal: 13, duration: 1.2, ease: "power2.out" }, 0.08)
        .to(ring.scale, { x: 1, y: 1, z: 1, duration: 1.25, ease: "power3.out" }, 0.12)
        .to(innerRing.scale, { x: 1, y: 1, z: 1, duration: 1.35, ease: "power3.out" }, 0.18)
        .to(ringMaterial, { opacity: 0.2, duration: 0.9, ease: "power2.out" }, 0.16)
        .to(innerRingMaterial, { opacity: 0.1, duration: 0.95, ease: "power2.out" }, 0.22)
        .to(device.materials.glass, { emissiveIntensity: 0.22, duration: 0.42, yoyo: true, repeat: 1 }, 0.42);
    }

    const highlightMaterials = [
      device.materials.display,
      device.materials.board,
      device.materials.display,
      device.materials.battery,
      device.materials.shell,
    ];
    const overviewEmissive = new Map([
      [device.materials.shell, 0.08],
      [device.materials.frame, 0.05],
      [device.materials.battery, 0.05],
      [device.materials.board, 0.08],
      [device.materials.display, 0.5],
      [device.materials.glass, 0.04],
    ]);
    let activeStage = -1;
    let completionPulse: gsap.core.Timeline | null = null;

    const setPose = (pose: DevicePose, immediate = false) => {
      const duration = immediate || reduceMotion ? 0 : 1.05;
      const ease = "power3.inOut";

      (Object.keys(device.parts) as DevicePart[]).forEach((key) => {
        const part = device.parts[key];
        const target = pose[key];
        gsap.to(part.position, {
          x: target.x,
          y: target.y,
          z: target.z,
          duration,
          ease,
          overwrite: true,
        });
        gsap.to(part.rotation, {
          x: target.rx ?? 0,
          y: target.ry ?? 0,
          z: target.rz ?? 0,
          duration,
          ease,
          overwrite: true,
        });
        gsap.to(part.scale, {
          x: target.scale ?? 1,
          y: target.scale ?? 1,
          z: target.scale ?? 1,
          duration,
          ease,
          overwrite: true,
        });
      });

      gsap.to(device.assembly.rotation, {
        x: pose.rotation.x,
        y: pose.rotation.y,
        z: pose.rotation.z,
        duration,
        ease,
        overwrite: true,
      });
      gsap.to(device.assembly.scale, {
        x: pose.scale,
        y: pose.scale,
        z: pose.scale,
        duration,
        ease,
        overwrite: true,
      });
    };

    const activateStage = (index: number) => {
      if (activeStage === index) return;
      if (introTimeline) {
        introTimeline.progress(1).kill();
        introTimeline = null;
      }
      activeStage = index;
      onStepChange(index);
      setPose(stagePoses[index]);
      const duration = reduceMotion ? 0 : 0.55;

      completionPulse?.kill();
      completionPulse = null;

      Object.values(device.materials).forEach((material) => {
        gsap.to(material, { emissiveIntensity: 0.05, duration, overwrite: true });
      });
      gsap.to(highlightMaterials[index], {
        emissiveIntensity: index === 4 ? 0.42 : 0.72,
        duration,
        overwrite: true,
      });

      gsap.to(ringMaterial, {
        opacity: index === 4 ? 0.42 : 0.2,
        duration: reduceMotion ? 0 : 0.7,
        overwrite: true,
      });

      if (index === 4 && !reduceMotion) {
        completionPulse = gsap
          .timeline()
          .to(ring.scale, { x: 1.08, y: 1.08, duration: 0.6, ease: "power2.out" })
          .to(ring.scale, { x: 1, y: 1, duration: 0.8, ease: "power2.inOut" });
      }
    };

    const showOverview = () => {
      activeStage = -1;
      onStepChange(-1);
      setPose(heroPose);
      completionPulse?.kill();
      completionPulse = null;
      overviewEmissive.forEach((intensity, material) => {
        gsap.to(material, {
          emissiveIntensity: intensity,
          duration: reduceMotion ? 0 : 0.45,
          overwrite: true,
        });
      });
      gsap.to(ringMaterial, {
        opacity: 0.2,
        duration: reduceMotion ? 0 : 0.45,
        overwrite: true,
      });
    };

    const triggers: ScrollTrigger[] = [];
    document.querySelectorAll<HTMLElement>("[data-repair-step]").forEach((element, index) => {
      const trigger = ScrollTrigger.create({
        trigger: element,
        start: "top 58%",
        end: "bottom 42%",
        onEnter: () => activateStage(index),
        onEnterBack: () => activateStage(index),
        onLeaveBack: index === 0 ? showOverview : undefined,
      });
      triggers.push(trigger);
    });

    let targetPointerX = 0;
    let targetPointerY = 0;
    const onPointerMove = (event: PointerEvent) => {
      if (reduceMotion) return;
      const bounds = mount.getBoundingClientRect();
      targetPointerX = ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 0.12;
      targetPointerY = ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 0.1;
    };
    const onPointerLeave = () => {
      targetPointerX = 0;
      targetPointerY = 0;
    };
    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerleave", onPointerLeave);

    const resize = () => {
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width < 520 ? 12.5 : 11.2;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const clock = new THREE.Clock();
    let animationFrame = 0;
    const render = () => {
      const elapsed = clock.getElapsedTime();
      if (!reduceMotion) {
        floatRig.position.y = introState.y + Math.sin(elapsed * 0.72) * 0.065;
        floatRig.rotation.z = introState.tilt + Math.sin(elapsed * 0.4) * 0.009;
        floatRig.scale.setScalar(introState.scale);
        pointerRig.rotation.y += (targetPointerX - pointerRig.rotation.y) * 0.04;
        pointerRig.rotation.x += (targetPointerY - pointerRig.rotation.x) * 0.04;
        ring.rotation.z = elapsed * 0.035;
        innerRing.rotation.z = -elapsed * 0.022;
        particles.rotation.z = elapsed * 0.012;
        acidLight.intensity = lightState.acid + Math.sin(elapsed * 1.1) * 1.4;
        tealLight.intensity = lightState.teal + Math.sin(elapsed * 0.9 + 0.8) * 1.1;
      }
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(render);
    };
    render();
    setReady(true);
    ScrollTrigger.refresh();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      introTimeline?.kill();
      completionPulse?.kill();
      triggers.forEach((trigger) => trigger.kill());
      resizeObserver.disconnect();
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerleave", onPointerLeave);
      gsap.killTweensOf([
        device.assembly.position,
        device.assembly.rotation,
        device.assembly.scale,
        ring.scale,
        ringMaterial,
        ...Object.values(device.parts).flatMap((part) => [part.position, part.rotation, part.scale]),
        ...Object.values(device.materials),
      ]);
      device.dispose();
      ring.geometry.dispose();
      ringMaterial.dispose();
      innerRing.geometry.dispose();
      innerRingMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [onStepChange]);

  return (
    <div ref={mountRef} className={styles.modelMount} data-ready={ready ? "true" : "false"}>
      <div className={styles.modelFallback} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <span className={styles.visuallyHidden}>
        A three dimensional phone separates into its display, circuit board, battery, frame, and rear shell as the repair workflow progresses.
      </span>
    </div>
  );
}
