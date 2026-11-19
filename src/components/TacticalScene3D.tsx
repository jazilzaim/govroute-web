import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type SceneIndustryId = 'DEFENSE' | 'LAW_ENFORCEMENT' | 'AVIATION';

interface TacticalScene3DProps {
  selectedIndustry: SceneIndustryId;
  activeScreen: string;
}

interface Keyframe {
  stop: number;
  pos: [number, number, number];
  rot: [number, number, number];
  scale: number;
  explode: number;
  ringSpread: number;
  camZ: number;
}

const KEYFRAMES: Keyframe[] = [
  // 01. Hero — sculpted precision core positioned right-of-center behind PWA preview
  {
    stop: 0.0,
    pos: [1.55, 0.15, -0.35],
    rot: [0.35, -0.45, 0.12],
    scale: 1.05,
    explode: 0.06,
    ringSpread: 0.0,
    camZ: 6.8,
  },
  // 02. Features — glides left & explodes into modular layers to showcase speed
  {
    stop: 0.34,
    pos: [-1.7, 0.05, 0.25],
    rot: [0.72, 1.25, -0.25],
    scale: 1.12,
    explode: 0.88,
    ringSpread: 0.55,
    camZ: 6.3,
  },
  // 03. Sectors — sweeps right, semi-assembled, highlighting sector-specific 3D formation
  {
    stop: 0.68,
    pos: [1.75, -0.05, 0.35],
    rot: [-0.28, 2.75, 0.32],
    scale: 1.08,
    explode: 0.34,
    ringSpread: 0.3,
    camZ: 6.4,
  },
  // 04. Workflow — converges centrally & locks tight in verified chain-of-custody equilibrium
  {
    stop: 1.0,
    pos: [0.0, 0.08, -0.2],
    rot: [0.22, 4.35, 0.0],
    scale: 1.15,
    explode: 0.0,
    ringSpread: 0.12,
    camZ: 6.6,
  },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

function sampleKeyframes(progress: number): Keyframe {
  const p = Math.max(0, Math.min(1, progress));
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    const a = KEYFRAMES[i];
    const b = KEYFRAMES[i + 1];
    if (p >= a.stop && p <= b.stop) {
      const localT = smoothstep((p - a.stop) / (b.stop - a.stop));
      return {
        stop: p,
        pos: [
          lerp(a.pos[0], b.pos[0], localT),
          lerp(a.pos[1], b.pos[1], localT),
          lerp(a.pos[2], b.pos[2], localT),
        ],
        rot: [
          lerp(a.rot[0], b.rot[0], localT),
          lerp(a.rot[1], b.rot[1], localT),
          lerp(a.rot[2], b.rot[2], localT),
        ],
        scale: lerp(a.scale, b.scale, localT),
        explode: lerp(a.explode, b.explode, localT),
        ringSpread: lerp(a.ringSpread, b.ringSpread, localT),
        camZ: lerp(a.camZ, b.camZ, localT),
      };
    }
  }
  return KEYFRAMES[KEYFRAMES.length - 1];
}

/**
 * Procedural studio environment texture using PMREMGenerator so metallic dark
 * titanium and frosted obsidian glass catch crisp studio highlights offline.
 */
function createStudioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x060608);

  const panelGeo = new THREE.PlaneGeometry(12, 4);
  const topPanel = new THREE.Mesh(
    panelGeo,
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
  );
  topPanel.position.set(0, 7, 2);
  topPanel.rotation.x = Math.PI / 2.2;
  envScene.add(topPanel);

  const leftPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 10),
    new THREE.MeshBasicMaterial({ color: 0x9fb8d8, side: THREE.DoubleSide })
  );
  leftPanel.position.set(-8, 1, 1);
  leftPanel.rotation.y = Math.PI / 2;
  envScene.add(leftPanel);

  const rightPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 10),
    new THREE.MeshBasicMaterial({ color: 0xe6e8ec, side: THREE.DoubleSide })
  );
  rightPanel.position.set(8, -1, 3);
  rightPanel.rotation.y = -Math.PI / 2;
  envScene.add(rightPanel);

  const backRim = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 2.2),
    new THREE.MeshBasicMaterial({ color: 0xd0d8e6, side: THREE.DoubleSide })
  );
  backRim.position.set(0, 3, -9);
  envScene.add(backRim);

  const rt = pmrem.fromScene(envScene, 0.04);
  pmrem.dispose();

  panelGeo.dispose();
  return rt.texture;
}

export function TacticalScene3D({ selectedIndustry, activeScreen }: TacticalScene3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const industryRef = useRef<SceneIndustryId>(selectedIndustry);
  const impulseRef = useRef<number>(0);

  useEffect(() => {
    industryRef.current = selectedIndustry;
    impulseRef.current = 1.0;
  }, [selectedIndustry]);

  useEffect(() => {
    impulseRef.current = Math.max(impulseRef.current, 0.55);
  }, [activeScreen]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      // WebGL unavailable — fail gracefully without breaking the page
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const envTexture = createStudioEnvironment(renderer);
    scene.environment = envTexture;

    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 6.8);

    // Sculptural 3-point monochrome studio lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(5, 6, 6);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xdbe8ff, 14, 24);
    rimLight.position.set(-4.5, 3.5, -2.5);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xffffff, 8, 22);
    fillLight.position.set(4.5, -3.5, 3.5);
    scene.add(fillLight);

    // Shared high-craft materials (brushed titanium, obsidian glass, platinum wire)
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x16171b,
      metalness: 0.92,
      roughness: 0.22,
      envMapIntensity: 1.5,
    });

    const brushedSilverMat = new THREE.MeshStandardMaterial({
      color: 0xbec4ce,
      metalness: 0.95,
      roughness: 0.18,
      envMapIntensity: 1.6,
    });

    const obsidianGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x12141a,
      metalness: 0.15,
      roughness: 0.08,
      transmission: 0.65,
      thickness: 0.8,
      ior: 1.45,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.7,
    });

    const coreEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xeaf2ff,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.1,
    });

    const wireMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.24,
    });

    // Root assembly choreographed by scroll keyframes
    const root = new THREE.Group();
    scene.add(root);

    // 1) Central Cryptographic Ledger Core (icosahedron glass + glowing nucleus + wireframe)
    const coreGroup = new THREE.Group();
    root.add(coreGroup);

    const innerGeo = new THREE.IcosahedronGeometry(0.68, 1);
    const innerGlass = new THREE.Mesh(innerGeo, obsidianGlassMat);
    coreGroup.add(innerGlass);

    const innerWire = new THREE.LineSegments(new THREE.WireframeGeometry(innerGeo), wireMat);
    innerWire.scale.setScalar(1.03);
    coreGroup.add(innerWire);

    const nucleusGeo = new THREE.OctahedronGeometry(0.28, 0);
    const nucleus = new THREE.Mesh(nucleusGeo, coreEmissiveMat);
    coreGroup.add(nucleus);

    // 2) Six Armored Explodable Plates forming a precision vault shell around the core
    interface PlateEntry {
      mesh: THREE.Group;
      normal: THREE.Vector3;
      baseDist: number;
    }
    const plates: PlateEntry[] = [];
    const plateMainGeo = new THREE.BoxGeometry(1.18, 1.18, 0.12);
    const plateTrimGeo = new THREE.BoxGeometry(0.84, 0.84, 0.145);
    const plateEdgeGeo = new THREE.EdgesGeometry(plateMainGeo);

    const faceNormals: [THREE.Vector3, [number, number, number]][] = [
      [new THREE.Vector3(0, 0, 1), [0, 0, 0]],
      [new THREE.Vector3(0, 0, -1), [0, Math.PI, 0]],
      [new THREE.Vector3(1, 0, 0), [0, Math.PI / 2, 0]],
      [new THREE.Vector3(-1, 0, 0), [0, -Math.PI / 2, 0]],
      [new THREE.Vector3(0, 1, 0), [-Math.PI / 2, 0, 0]],
      [new THREE.Vector3(0, -1, 0), [Math.PI / 2, 0, 0]],
    ];

    for (const [normal, euler] of faceNormals) {
      const plateGroup = new THREE.Group();
      const body = new THREE.Mesh(plateMainGeo, titaniumMat);
      const trim = new THREE.Mesh(plateTrimGeo, obsidianGlassMat);
      const edge = new THREE.LineSegments(plateEdgeGeo, wireMat);
      plateGroup.add(body, trim, edge);
      plateGroup.rotation.set(euler[0], euler[1], euler[2]);
      plateGroup.position.copy(normal).multiplyScalar(0.84);
      root.add(plateGroup);
      plates.push({ mesh: plateGroup, normal, baseDist: 0.84 });
    }

    // 3) Outer Gyroscopic Custody Rings + Calibrated Tick Notches + Orbiting Nodes
    const outerRingGroup = new THREE.Group();
    root.add(outerRingGroup);

    const primaryRingGeo = new THREE.TorusGeometry(1.88, 0.022, 16, 120);
    const primaryRing = new THREE.Mesh(primaryRingGeo, brushedSilverMat);
    outerRingGroup.add(primaryRing);

    const tickGeo = new THREE.BoxGeometry(0.02, 0.11, 0.02);
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const tick = new THREE.Mesh(tickGeo, i % 9 === 0 ? coreEmissiveMat : brushedSilverMat);
      const r = 1.98;
      tick.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0);
      tick.rotation.z = angle + Math.PI / 2;
      if (i % 9 === 0) tick.scale.set(1.4, 1.6, 1.4);
      outerRingGroup.add(tick);
    }

    const secondaryRingGroup = new THREE.Group();
    secondaryRingGroup.rotation.set(Math.PI / 3, Math.PI / 5, 0);
    root.add(secondaryRingGroup);

    const secondaryRingGeo = new THREE.TorusGeometry(2.26, 0.012, 12, 120);
    const secondaryRing = new THREE.Mesh(
      secondaryRingGeo,
      new THREE.MeshStandardMaterial({
        color: 0x8f98a8,
        metalness: 0.9,
        roughness: 0.28,
        transparent: true,
        opacity: 0.65,
      })
    );
    secondaryRingGroup.add(secondaryRing);

    // Orbiting serialized tag nodes on secondary ring
    const nodeGeo = new THREE.OctahedronGeometry(0.075, 0);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const node = new THREE.Mesh(nodeGeo, i % 2 === 0 ? coreEmissiveMat : brushedSilverMat);
      node.position.set(Math.cos(a) * 2.26, Math.sin(a) * 2.26, 0);
      secondaryRingGroup.add(node);
    }

    // 4) Sector-Specific 3D Morphing Accent Groups
    // 4a. DEFENSE: 8 armored corner tactical brackets
    const defenseGroup = new THREE.Group();
    const bracketGeo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
    const bracketEdgeGeo = new THREE.EdgesGeometry(bracketGeo);
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const b = new THREE.Group();
          b.add(
            new THREE.Mesh(bracketGeo, brushedSilverMat),
            new THREE.LineSegments(bracketEdgeGeo, wireMat)
          );
          b.position.set(sx * 1.18, sy * 1.18, sz * 1.18);
          defenseGroup.add(b);
        }
      }
    }
    root.add(defenseGroup);

    // 4b. LAW ENFORCEMENT: precision faceted tactical shield-ring & radar arc
    const lawGroup = new THREE.Group();
    const shieldRingGeo = new THREE.TorusGeometry(1.48, 0.045, 6, 6);
    const shieldRing = new THREE.Mesh(shieldRingGeo, brushedSilverMat);
    lawGroup.add(shieldRing);
    const radarArcGeo = new THREE.TorusGeometry(1.64, 0.018, 12, 48, Math.PI * 0.8);
    const radarArc = new THREE.Mesh(radarArcGeo, coreEmissiveMat);
    lawGroup.add(radarArc);
    lawGroup.scale.setScalar(0.001);
    root.add(lawGroup);

    // 4c. AVIATION: 6 swept aerodynamic turbine vanes orbiting the core
    const aviationGroup = new THREE.Group();
    const vaneGeo = new THREE.BoxGeometry(0.55, 0.08, 0.22);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const vane = new THREE.Mesh(vaneGeo, brushedSilverMat);
      vane.position.set(Math.cos(angle) * 1.52, Math.sin(angle) * 1.52, 0);
      vane.rotation.z = angle + 0.35;
      vane.rotation.x = 0.45;
      aviationGroup.add(vane);
    }
    aviationGroup.scale.setScalar(0.001);
    root.add(aviationGroup);

    // 5) Subtle Ambient Spatial Depth Stars (restrained monochrome dust for 3D parallax)
    const particleCount = 110;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 18;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.032,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Input & scroll tracking
    const mouse = { targetX: 0, targetY: 0, x: 0, y: 0 };
    let targetScroll = 0;
    let currentScroll = 0;

    const updateScrollTarget = () => {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      targetScroll = Math.max(0, Math.min(1, window.scrollY / maxScroll));
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      updateScrollTarget();
    };

    updateScrollTarget();
    window.addEventListener('scroll', updateScrollTarget, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize);

    // Responsive X offset damping for smaller screens so 3D core stays gracefully framed
    const getResponsiveXFactor = () => {
      if (window.innerWidth < 768) return 0.22;
      if (window.innerWidth < 1100) return 0.55;
      return 1.0;
    };

    let rafId = 0;
    let spinAccum = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = window.requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      // Smooth spring damping on scroll & cursor
      currentScroll = lerp(currentScroll, targetScroll, prefersReducedMotion ? 0.2 : 0.065);
      mouse.x = lerp(mouse.x, mouse.targetX, 0.05);
      mouse.y = lerp(mouse.y, mouse.targetY, 0.05);

      // Decay kinetic interaction impulse
      impulseRef.current = lerp(impulseRef.current, 0, 0.06);
      if (!prefersReducedMotion) {
        spinAccum += dt * (0.22 + impulseRef.current * 1.45);
      }

      const kf = sampleKeyframes(currentScroll);
      const xFactor = getResponsiveXFactor();

      // Root choreography + gentle levitation + mouse parallax
      const floatY = prefersReducedMotion ? 0 : Math.sin(elapsed * 1.15) * 0.1;
      root.position.set(
        kf.pos[0] * xFactor + mouse.x * 0.18,
        kf.pos[1] + floatY + mouse.y * 0.12,
        kf.pos[2]
      );

      root.rotation.set(
        kf.rot[0] + mouse.y * 0.16,
        kf.rot[1] + spinAccum + mouse.x * 0.24,
        kf.rot[2]
      );

      const mobileScale = window.innerWidth < 768 ? 0.72 : 1.0;
      const pulseScale = 1 + impulseRef.current * 0.045;
      root.scale.setScalar(kf.scale * mobileScale * pulseScale);

      // Explode armored plates radially along their face normals
      const explodeOffset = kf.explode * 0.72 + impulseRef.current * 0.12;
      for (let i = 0; i < plates.length; i++) {
        const entry = plates[i];
        const dist = entry.baseDist + explodeOffset;
        entry.mesh.position.copy(entry.normal).multiplyScalar(dist);
      }

      // Inner cryptographic core counter-rotation & subtle glow pulse
      coreGroup.rotation.y = -elapsed * 0.55;
      coreGroup.rotation.x = elapsed * 0.32;
      nucleus.scale.setScalar(1 + Math.sin(elapsed * 2.4) * 0.08 + kf.explode * 0.22);
      coreEmissiveMat.emissiveIntensity = 0.75 + kf.explode * 0.85 + impulseRef.current * 0.6;

      // Gyroscopic custody rings independent orbital motion
      outerRingGroup.rotation.z = elapsed * 0.28;
      outerRingGroup.rotation.x = Math.sin(elapsed * 0.45) * 0.25 + kf.ringSpread * 0.9;
      outerRingGroup.scale.setScalar(1 + kf.ringSpread * 0.18);

      secondaryRingGroup.rotation.y = -elapsed * 0.38;
      secondaryRingGroup.rotation.x = Math.PI / 3 + kf.ringSpread * 0.55;
      secondaryRingGroup.scale.setScalar(1 + kf.ringSpread * 0.14);

      // Morph sector-specific 3D formations smoothly
      const activeSector = industryRef.current;
      const defTarget = activeSector === 'DEFENSE' ? 1 + kf.explode * 0.35 : 0.001;
      const lawTarget = activeSector === 'LAW_ENFORCEMENT' ? 1 + kf.explode * 0.2 : 0.001;
      const aviTarget = activeSector === 'AVIATION' ? 1 + kf.explode * 0.22 : 0.001;

      defenseGroup.scale.setScalar(lerp(defenseGroup.scale.x, defTarget, 0.08));
      lawGroup.scale.setScalar(lerp(lawGroup.scale.x, lawTarget, 0.08));
      aviationGroup.scale.setScalar(lerp(aviationGroup.scale.x, aviTarget, 0.08));

      lawGroup.rotation.z = elapsed * 0.75;
      aviationGroup.rotation.z = -elapsed * 0.9;

      // Subtle camera breathing & scroll depth zoom
      camera.position.z = lerp(camera.position.z, kf.camZ, 0.06);
      camera.position.x = lerp(camera.position.x, mouse.x * 0.25, 0.04);
      camera.position.y = lerp(camera.position.y, mouse.y * 0.18, 0.04);
      camera.lookAt(0, 0, 0);

      // Ambient spatial particles drift
      particles.rotation.y = elapsed * 0.02 + currentScroll * 0.4;
      particles.rotation.x = mouse.y * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', updateScrollTarget);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      envTexture.dispose();
      innerGeo.dispose();
      nucleusGeo.dispose();
      plateMainGeo.dispose();
      plateTrimGeo.dispose();
      plateEdgeGeo.dispose();
      primaryRingGeo.dispose();
      tickGeo.dispose();
      secondaryRingGeo.dispose();
      nodeGeo.dispose();
      bracketGeo.dispose();
      bracketEdgeGeo.dispose();
      shieldRingGeo.dispose();
      radarArcGeo.dispose();
      vaneGeo.dispose();
      particleGeo.dispose();

      titaniumMat.dispose();
      brushedSilverMat.dispose();
      obsidianGlassMat.dispose();
      coreEmissiveMat.dispose();
      wireMat.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
    >
      {/* Subtle radial atmospheric depth vignette keeping editorial copy crisp */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 68% 36%, rgba(255,255,255,0.045) 0%, rgba(6,6,6,0.18) 42%, rgba(6,6,6,0.72) 100%)',
        }}
      />
    </div>
  );
}
