"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

function makeClay(color: number, roughness = 0.68) {
  return new THREE.MeshPhysicalMaterial({ color, roughness, metalness: 0.015, clearcoat: 0.16, clearcoatRoughness: 0.62 });
}

function makePot(geometry: THREE.BufferGeometry, material: THREE.Material, scale: number, position: THREE.Vector3) {
  const mesh = new THREE.Mesh(geometry.clone(), material.clone());
  mesh.scale.setScalar(scale);
  mesh.position.copy(position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 0.08, 7.3);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffebd8, 0x351b12, 2.5));
    const key = new THREE.DirectionalLight(0xfff5eb, 4.8);
    key.position.set(3.8, 5.8, 4.8);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 18;
    scene.add(key);
    const warmRim = new THREE.PointLight(0xd88c58, 9, 8, 2);
    warmRim.position.set(-3.5, 1.8, 2.8);
    scene.add(warmRim);
    const softFill = new THREE.PointLight(0xffd9bd, 4, 7, 2);
    softFill.position.set(2.6, -0.5, 3.8);
    scene.add(softFill);

    const profile = [new THREE.Vector2(0.02, -1.56), new THREE.Vector2(0.42, -1.54), new THREE.Vector2(0.72, -1.34), new THREE.Vector2(0.9, -0.82), new THREE.Vector2(0.94, -0.12), new THREE.Vector2(0.88, 0.62), new THREE.Vector2(0.7, 1.08), new THREE.Vector2(0.47, 1.26), new THREE.Vector2(0.32, 1.29)];
    const potGeometry = new THREE.LatheGeometry(profile, 128);
    const clay = makeClay(0xa95231, 0.72);
    const darkClay = makeClay(0x783721, 0.76);
    const main = new THREE.Group();
    main.rotation.set(-0.08, -0.25, 0.02);
    scene.add(main);

    const pot = new THREE.Mesh(potGeometry, clay);
    pot.castShadow = true;
    pot.receiveShadow = true;
    main.add(pot);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.065, 20, 96), clay);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1.28;
    rim.scale.set(1, 1, 1.08);
    rim.castShadow = true;
    main.add(rim);
    const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.34, 0.06, 96), new THREE.MeshPhysicalMaterial({ color: 0x482419, roughness: 0.9 }));
    inner.position.y = 1.27;
    main.add(inner);

    const sideLeft = makePot(potGeometry, darkClay, 0.34, new THREE.Vector3(-1.55, -0.55, -0.18));
    sideLeft.rotation.z = -0.08;
    const sideRight = makePot(potGeometry, clay, 0.25, new THREE.Vector3(1.38, 0.48, -0.55));
    sideRight.rotation.z = 0.1;
    scene.add(sideLeft, sideRight);

    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.26, 1.38, 0.18, 96), new THREE.MeshPhysicalMaterial({ color: 0xe3b18d, roughness: 0.9 }));
    pedestal.position.set(0, -1.67, -0.05);
    pedestal.receiveShadow = true;
    scene.add(pedestal);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(3.4, 96), new THREE.MeshStandardMaterial({ color: 0xe7c6ad, roughness: 1, transparent: true, opacity: 0.48 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -1.77, 0);
    floor.receiveShadow = true;
    scene.add(floor);

    const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.62, 64), new THREE.MeshBasicMaterial({ color: 0x5a2d14, transparent: true, opacity: 0.16 }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, -1.56, 0.16);
    shadow.scale.set(1.2, 0.36, 1);
    scene.add(shadow);

    const particlePositions = new Float32Array(48 * 3);
    for (let index = 0; index < particlePositions.length; index += 3) {
      particlePositions[index] = (Math.random() - 0.5) * 4.8;
      particlePositions[index + 1] = (Math.random() - 0.5) * 4.4;
      particlePositions[index + 2] = (Math.random() - 0.5) * 1.6;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0xffd4b3, size: 0.035, transparent: true, opacity: 0.68, depthWrite: false }));
    scene.add(particles);

    const pebbleMaterial = makeClay(0xd88c58, 0.76);
    const pebble = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 3), pebbleMaterial);
    pebble.position.set(-1.55, 1.64, 0.2);
    pebble.castShadow = true;
    scene.add(pebble);
    const pebbleTwo = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 2), pebbleMaterial);
    pebbleTwo.position.set(1.42, -0.72, 0.2);
    scene.add(pebbleTwo);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = new THREE.Vector2();
    const target = new THREE.Vector2();
    let scrollAmount = 0;
    const onPointer = (event: PointerEvent) => { const rect = mount.getBoundingClientRect(); target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2; target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2; };
    const onScroll = () => { scrollAmount = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1); };
    mount.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => { const width = mount.clientWidth; const height = mount.clientHeight; camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6)); };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(mount);
    let frame = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      pointer.lerp(target, 0.055);
      main.rotation.y += ((-0.25 + pointer.x * 0.24 + scrollAmount * 0.14) - main.rotation.y) * 0.035;
      main.rotation.x += ((-0.08 - pointer.y * 0.09 + scrollAmount * 0.07) - main.rotation.x) * 0.035;
      main.position.y = Math.sin(elapsed * 0.7) * 0.055 - scrollAmount * 0.18;
      sideLeft.rotation.y += 0.0025;
      sideRight.rotation.y -= 0.0035;
      pebble.position.y = 1.64 + Math.sin(elapsed * 1.2) * 0.12;
      pebble.rotation.y += 0.006;
      pebbleTwo.position.y = -0.72 + Math.cos(elapsed * 1.4) * 0.08;
      particles.rotation.y = elapsed * 0.018;
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    };
    if (reduceMotion) renderer.render(scene, camera); else animate();
    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mount.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      renderer.dispose();
      renderer.domElement.remove();
      potGeometry.dispose();
      rim.geometry.dispose();
      inner.geometry.dispose();
      pedestal.geometry.dispose();
      floor.geometry.dispose();
      shadow.geometry.dispose();
      particleGeometry.dispose();
      pebble.geometry.dispose();
      pebbleTwo.geometry.dispose();
      clay.dispose();
      darkClay.dispose();
      pebbleMaterial.dispose();
      (inner.material as THREE.Material).dispose();
      (pedestal.material as THREE.Material).dispose();
      (floor.material as THREE.Material).dispose();
      (shadow.material as THREE.Material).dispose();
      (particles.material as THREE.Material).dispose();
      (sideLeft.material as THREE.Material).dispose();
      (sideRight.material as THREE.Material).dispose();
    };
  }, []);
  return <div ref={mountRef} role="img" aria-label="A softly lit rotating handmade clay collection" className="hero-scene h-full min-h-[420px] w-full" />;
}
