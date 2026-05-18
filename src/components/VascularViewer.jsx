/**
 * 3D Vascular Model Viewer — GLB Model Loader
 *
 * This viewer loads an external .glb/.gltf 3D model instead of
 * procedurally generating vessels. It applies neon glow materials,
 * dark blue scene lighting, and post-processing bloom effects.
 *
 * ─── HOW TO USE ────────────────────────────────────────────────
 * 1. Download a Human Vascular System .glb model from:
 *    • Sketchfab: https://sketchfab.com/search?q=human+vascular+system&type=models
 *    • CGTrader:  https://www.cgtrader.com/free-3d-models/character/anatomy
 *    • TurboSquid: https://www.turbosquid.com/Search/3D-Models/free/vascular
 *
 * 2. Place the .glb file at:
 *       public/models/vascular_system.glb
 *
 * 3. The viewer will auto-detect and load it on page refresh.
 *
 * Supported formats: .glb, .gltf
 * ───────────────────────────────────────────────────────────────
 */
import React, { useRef, Suspense, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Card, Button, Tooltip, Space, Alert, Typography, Spin } from 'antd';
import { DownloadOutlined, InfoCircleOutlined, FolderOpenOutlined } from '@ant-design/icons';
import * as THREE from 'three';

const { Text } = Typography;

// ─── Model path ────────────────────────────────────────────────────────────
const MODEL_PATH = '/models/vascular_system.glb';


// ─── Loading Spinner (shown while model loads) ─────────────────────────────
function LoadingIndicator() {
    return (
        <Html center>
            <div className="model-loading">
                <div className="model-loading-spinner" />
                <div className="model-loading-text">Loading 3D Model...</div>
                <div className="model-loading-sub">Preparing vascular visualization</div>
            </div>
        </Html>
    );
}


// ─── Apply neon/glow materials to loaded model ─────────────────────────────
function applyVascularMaterials(scene) {
    scene.traverse((child) => {
        if (child.isMesh) {
            const oldMat = child.material;

            // Detect arteries vs veins by material name, mesh name, or color
            const name = (child.name + ' ' + (oldMat?.name || '')).toLowerCase();
            const isVein = name.includes('vein') || name.includes('venous') || name.includes('blue');
            const isArtery = name.includes('arter') || name.includes('aort') || name.includes('red');

            // Default: detect by existing color or treat as artery
            let baseColor, emissiveColor;
            if (isVein) {
                baseColor = new THREE.Color('#1a5ca8');
                emissiveColor = new THREE.Color('#2196f3');
            } else if (isArtery) {
                baseColor = new THREE.Color('#8b1a1a');
                emissiveColor = new THREE.Color('#ff3333');
            } else {
                // Auto-detect by original material color
                const origColor = oldMat?.color;
                if (origColor) {
                    const hsl = {};
                    origColor.getHSL(hsl);
                    if (hsl.h > 0.55 && hsl.h < 0.75) {
                        // Blue-ish → vein
                        baseColor = new THREE.Color('#1a5ca8');
                        emissiveColor = new THREE.Color('#2196f3');
                    } else {
                        // Everything else → artery (warm tones)
                        baseColor = new THREE.Color('#8b1a1a');
                        emissiveColor = new THREE.Color('#ff3333');
                    }
                } else {
                    baseColor = new THREE.Color('#991122');
                    emissiveColor = new THREE.Color('#ee2244');
                }
            }

            child.material = new THREE.MeshPhysicalMaterial({
                color: baseColor,
                emissive: emissiveColor,
                emissiveIntensity: 0.6,
                roughness: 0.35,
                metalness: 0.15,
                transparent: true,
                opacity: 0.92,
                clearcoat: 0.4,
                clearcoatRoughness: 0.2,
                side: THREE.DoubleSide,
                envMapIntensity: 0.3,
            });

            // Ensure proper rendering
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
}


// ─── Auto-center and scale model to fit viewport ──────────────────────────
function normalizeModel(scene) {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Center the model
    scene.position.sub(center);

    // Scale to fit within ~8 units
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
        const scale = 8 / maxDim;
        scene.scale.multiplyScalar(scale);
    }
}


// ─── The loaded GLB model component ────────────────────────────────────────
function VascularModel() {
    const { scene } = useGLTF(MODEL_PATH);
    const groupRef = useRef();

    // Apply materials and normalize on load
    useMemo(() => {
        normalizeModel(scene);
        applyVascularMaterials(scene);
    }, [scene]);

    // Gentle sway animation
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.02;
        }
    });

    return (
        <group ref={groupRef}>
            <primitive object={scene} />
        </group>
    );
}


// ─── Scene lighting (dark blue ambient + chest point light) ────────────────
function SceneLighting() {
    return (
        <>
            {/* Deep blue ambient */}
            <ambientLight intensity={0.15} color="#1a237e" />

            {/* Key light — clinical white-blue */}
            <directionalLight position={[5, 10, 8]} intensity={1.8} color="#e8eaf6" />

            {/* Fill — cool blue side */}
            <directionalLight position={[-6, 4, -4]} intensity={0.5} color="#42a5f5" />

            {/* Rim — purple backlight */}
            <directionalLight position={[0, -5, -8]} intensity={0.3} color="#7c4dff" />

            {/* Center chest point light (as in reference image) */}
            <pointLight position={[0, 1, 2]} intensity={1.2} color="#ff4444" distance={15} decay={2} />

            {/* Secondary points for depth */}
            <pointLight position={[3, 4, 3]} intensity={0.5} color="#ff6b6b" distance={12} decay={2} />
            <pointLight position={[-3, 4, 3]} intensity={0.4} color="#448aff" distance={12} decay={2} />
            <pointLight position={[0, -4, 2]} intensity={0.3} color="#e040fb" distance={10} decay={2} />
            <pointLight position={[0, 6, -2]} intensity={0.3} color="#80d8ff" distance={10} decay={2} />
        </>
    );
}


// ─── Placeholder UI when no model file exists ──────────────────────────────
function PlaceholderScene() {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
        }
    });

    return (
        <group>
            {/* Central pulsing sphere as heart placeholder */}
            <mesh ref={meshRef} position={[0, 0, 0]}>
                <icosahedronGeometry args={[1.5, 3]} />
                <meshPhysicalMaterial
                    color="#661122"
                    emissive="#ff2244"
                    emissiveIntensity={0.8}
                    wireframe
                    transparent
                    opacity={0.6}
                />
            </mesh>

            {/* Ring effect */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[2.5, 0.02, 16, 100]} />
                <meshBasicMaterial color="#ff4466" transparent opacity={0.4} />
            </mesh>
            <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
                <torusGeometry args={[3, 0.015, 16, 100]} />
                <meshBasicMaterial color="#4488ff" transparent opacity={0.3} />
            </mesh>

            <Html center position={[0, -3.5, 0]}>
                <div className="model-placeholder-label">
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🫀</div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>No Model Loaded</div>
                    <div style={{ fontSize: 11, opacity: 0.7, maxWidth: 220, lineHeight: 1.4 }}>
                        Place a .glb file at<br />
                        <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4, fontSize: 10 }}>
                            public/models/vascular_system.glb
                        </code>
                    </div>
                </div>
            </Html>
        </group>
    );
}


// ─── Model wrapper with error boundary ─────────────────────────────────────
function ModelOrPlaceholder({ modelExists }) {
    if (!modelExists) {
        return <PlaceholderScene />;
    }

    return (
        <Suspense fallback={<LoadingIndicator />}>
            <VascularModel />
        </Suspense>
    );
}


// ─── Main Viewer Component ─────────────────────────────────────────────────
function VascularViewer() {
    const [modelExists, setModelExists] = useState(false);
    const [checking, setChecking] = useState(true);

    // Check if model file exists
    useEffect(() => {
        fetch(MODEL_PATH, { method: 'HEAD' })
            .then(res => {
                setModelExists(res.ok && res.headers.get('content-type')?.includes('model'));
                // Also check for generic octet-stream or gltf types
                if (res.ok) setModelExists(true);
            })
            .catch(() => setModelExists(false))
            .finally(() => setChecking(false));
    }, []);

    const handleDownload = (format) => {
        const link = document.createElement('a');
        link.download = `vascular_model.${format}`;
        const blob = new Blob([`Mock ${format} file content`], { type: 'application/octet-stream' });
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    };

    return (
        <Card
            title={
                <span style={{ fontWeight: 600, fontSize: 16 }}>
                    🫀 3D Vascular Model Viewer
                </span>
            }
            className="viewer-card"
            extra={
                <Space>
                    <Tooltip title="Download .nii.gz">
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownload('nii.gz')}
                            style={{ background: '#52c41a', borderColor: '#52c41a' }}
                        />
                    </Tooltip>
                    <Tooltip title="Download .obj">
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownload('obj')}
                            style={{ background: '#1890ff', borderColor: '#1890ff' }}
                        />
                    </Tooltip>
                </Space>
            }
        >
            {/* Model path info */}
            {!checking && !modelExists && (
                <Alert
                    type="info"
                    showIcon
                    icon={<FolderOpenOutlined />}
                    className="model-alert"
                    message={
                        <span style={{ fontSize: 12 }}>
                            Place your <code>.glb</code> model at <code>public/models/vascular_system.glb</code> and refresh
                        </span>
                    }
                    style={{ marginBottom: 12, borderRadius: 8 }}
                />
            )}

            <div className="viewer-container">
                <Canvas
                    camera={{ position: [0, 0, 14], fov: 45 }}
                    gl={{
                        antialias: true,
                        toneMapping: THREE.ACESFilmicToneMapping,
                        toneMappingExposure: 1.1,
                        powerPreference: 'high-performance',
                    }}
                    dpr={[1, 2]}
                    style={{ background: 'radial-gradient(ellipse at center, #0d1b3e 0%, #050a1a 100%)' }}
                >
                    <SceneLighting />
                    <ModelOrPlaceholder modelExists={modelExists} />
                    <OrbitControls
                        enablePan
                        enableZoom
                        enableRotate
                        autoRotate
                        autoRotateSpeed={0.5}
                        minDistance={4}
                        maxDistance={30}
                        target={[0, 0, 0]}
                    />

                    {/* Post-processing: neon glow */}
                    <EffectComposer>
                        <Bloom
                            intensity={0.55}
                            luminanceThreshold={0.12}
                            luminanceSmoothing={0.9}
                            mipmapBlur
                            radius={0.85}
                        />
                        <Vignette eskil={false} offset={0.1} darkness={0.88} />
                    </EffectComposer>
                </Canvas>

                <div className="viewer-overlay">
                    <span className="viewer-hint">🖱️ Drag to rotate · Scroll to zoom</span>
                </div>
                <div className="viewer-legend">
                    <span className="legend-title">Vessel Types</span>
                    <span className="legend-item"><span className="legend-dot" style={{ background: '#ff3333', boxShadow: '0 0 6px #ff3333' }} />Arteries</span>
                    <span className="legend-item"><span className="legend-dot" style={{ background: '#2196f3', boxShadow: '0 0 6px #2196f3' }} />Veins</span>
                    <span className="legend-divider" />
                    <span className="legend-item" style={{ fontSize: 10, opacity: 0.6 }}>
                        {modelExists ? '✓ Model loaded' : '⚠ Placeholder mode'}
                    </span>
                </div>
            </div>
        </Card>
    );
}

export default VascularViewer;
