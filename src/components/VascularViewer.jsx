import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Card, Button, Tooltip, Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { generateFullBodyVasculature } from '../data/vascularAnatomy';

// ─── Depth-graded color palettes ───────────────────────────────────────────
const ARTERY_COLORS = [
    new THREE.Color('#9b1b30'),   // depth 0 — aorta (deep crimson)
    new THREE.Color('#c0392b'),   // depth 1 — large arteries
    new THREE.Color('#e04040'),   // depth 2 — medium arteries
    new THREE.Color('#e86c5a'),   // depth 3 — small arteries
    new THREE.Color('#f5a090'),   // depth 4 — capillaries
];

const VEIN_COLORS = [
    new THREE.Color('#1a2d5a'),   // depth 0 — vena cava (deep navy)
    new THREE.Color('#1e4a8a'),   // depth 1 — large veins
    new THREE.Color('#2b6cb0'),   // depth 2 — medium veins
    new THREE.Color('#4a90d9'),   // depth 3 — small veins
    new THREE.Color('#7eb8e8'),   // depth 4 — venous capillaries
];

// ─── Subtle organic displacement ───────────────────────────────────────────
function applySubtleDisplacement(geometry, intensity, seed) {
    const pos = geometry.attributes.position;
    const normal = geometry.attributes.normal;
    const count = pos.count;

    for (let i = 0; i < count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);

        // Low-frequency organic bumps only (no high-frequency noise)
        const disp = Math.sin(y * 8.0 + seed) * Math.cos(x * 6.0 + seed * 0.7) * intensity
            + Math.sin(y * 16.0 + z * 12.0 + seed * 1.5) * intensity * 0.3;

        const nx = normal.getX(i);
        const ny = normal.getY(i);
        const nz = normal.getZ(i);

        pos.setXYZ(i, x + nx * disp, y + ny * disp, z + nz * disp);
    }

    pos.needsUpdate = true;
    geometry.computeVertexNormals();
}

// ─── Build merged geometry batches for efficient rendering ─────────────────
function buildBatches(vessels) {
    // Group by: type (artery/vein) × size tier (major/medium/small)
    const groups = {
        arteryMajor: [],
        arteryMedium: [],
        arterySmall: [],
        veinMajor: [],
        veinMedium: [],
        veinSmall: [],
    };

    vessels.forEach((v, idx) => {
        const curve = new THREE.CatmullRomCurve3(v.points);
        const segments = Math.max(20, v.points.length * 2);
        const radialSeg = v.depth >= 3 ? 6 : v.depth >= 2 ? 8 : 12;
        const geo = new THREE.TubeGeometry(curve, segments, v.radius, radialSeg, false);

        // Apply subtle surface variation
        if (v.radius > 0.02) {
            applySubtleDisplacement(geo, v.radius * 0.12, idx * 13.7);
        }

        // Apply per-vertex colors
        const palette = v.type === 'artery' ? ARTERY_COLORS : VEIN_COLORS;
        const baseColor = palette[Math.min(v.depth, palette.length - 1)];
        const colors = [];
        const count = geo.attributes.position.count;
        for (let i = 0; i < count; i++) {
            const vary = 0.94 + (Math.sin(i * 0.37 + idx * 5.1) * 0.5 + 0.5) * 0.12;
            colors.push(baseColor.r * vary, baseColor.g * vary, baseColor.b * vary);
        }
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        // Classify
        const key = v.type === 'artery'
            ? (v.depth <= 1 ? 'arteryMajor' : v.depth <= 2 ? 'arteryMedium' : 'arterySmall')
            : (v.depth <= 1 ? 'veinMajor' : v.depth <= 2 ? 'veinMedium' : 'veinSmall');
        groups[key].push(geo);
    });

    // Merge each group into a single BufferGeometry
    const result = [];
    const materialParams = {
        arteryMajor: { emissiveIntensity: 0.6, roughness: 0.32, opacity: 0.96, transmission: 0.03, thickness: 2.5 },
        arteryMedium: { emissiveIntensity: 0.45, roughness: 0.38, opacity: 0.90, transmission: 0.06, thickness: 1.5 },
        arterySmall: { emissiveIntensity: 0.3, roughness: 0.45, opacity: 0.75, transmission: 0.10, thickness: 0.8 },
        veinMajor: { emissiveIntensity: 0.45, roughness: 0.38, opacity: 0.93, transmission: 0.05, thickness: 2.0 },
        veinMedium: { emissiveIntensity: 0.35, roughness: 0.42, opacity: 0.85, transmission: 0.08, thickness: 1.2 },
        veinSmall: { emissiveIntensity: 0.25, roughness: 0.5, opacity: 0.70, transmission: 0.12, thickness: 0.6 },
    };

    Object.entries(groups).forEach(([key, geos]) => {
        if (geos.length === 0) return;
        const merged = mergeGeometries(geos, false);
        if (merged) {
            result.push({ geometry: merged, ...materialParams[key] });
            geos.forEach(g => g.dispose());
        }
    });

    return result;
}


// ─── Vascular System Mesh Component ────────────────────────────────────────
function VascularSystem() {
    const groupRef = useRef();
    const batches = useMemo(() => {
        const vessels = generateFullBodyVasculature();
        return buildBatches(vessels);
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.03;
        }
    });

    return (
        <group ref={groupRef} position={[0, -8, 0]}>
            {/* Center the model: body goes from y=0..16, so shift down by 8 */}
            {batches.map((batch, i) => (
                <mesh key={i} geometry={batch.geometry}>
                    <meshPhysicalMaterial
                        vertexColors
                        emissive="#ffffff"
                        emissiveIntensity={batch.emissiveIntensity}
                        roughness={batch.roughness}
                        metalness={0.02}
                        clearcoat={0.45}
                        clearcoatRoughness={0.25}
                        transparent
                        opacity={batch.opacity}
                        transmission={batch.transmission}
                        thickness={batch.thickness}
                        ior={1.38}
                        sheen={0.2}
                        sheenRoughness={0.5}
                        sheenColor="#ffcccc"
                        side={THREE.DoubleSide}
                        envMapIntensity={0.1}
                    />
                </mesh>
            ))}
        </group>
    );
}


// ─── Studio Lighting for Medical Visualization ─────────────────────────────
function StudioLighting() {
    return (
        <>
            {/* Low ambient */}
            <ambientLight intensity={0.12} color="#0a0a15" />

            {/* Key: top-right warm clinical light */}
            <directionalLight position={[6, 14, 10]} intensity={2.0} color="#f5f0e8" />

            {/* Fill: left side cool */}
            <directionalLight position={[-8, 6, 4]} intensity={0.6} color="#4a80cc" />

            {/* Back/rim: subtle purple */}
            <directionalLight position={[0, -4, -12]} intensity={0.35} color="#7c3aed" />

            {/* Top scan beam */}
            <spotLight position={[0, 18, 2]} angle={0.3} penumbra={0.7} intensity={1.0} color="#d4c8f0" />

            {/* Anatomical region lights */}
            <pointLight position={[0, 4, 3]} intensity={0.7} color="#ff5252" distance={12} decay={2} />  {/* Heart */}
            <pointLight position={[0, 8, 2]} intensity={0.5} color="#ffa726" distance={10} decay={2} />  {/* Head */}
            <pointLight position={[3, 3, 2]} intensity={0.4} color="#ef5350" distance={10} decay={2} />  {/* R. arm */}
            <pointLight position={[-3, 3, 2]} intensity={0.4} color="#42a5f5" distance={10} decay={2} /> {/* L. arm */}
            <pointLight position={[1.5, -4, 2]} intensity={0.35} color="#ec407a" distance={10} decay={2} /> {/* R. leg */}
            <pointLight position={[-1.5, -4, 2]} intensity={0.35} color="#5c6bc0" distance={10} decay={2} /> {/* L. leg */}
            <pointLight position={[0, 2, -3]} intensity={0.25} color="#9575cd" distance={8} decay={2} />  {/* Back fill */}
            <pointLight position={[0, -7, 2]} intensity={0.2} color="#ff8a65" distance={8} decay={2} />   {/* Feet */}
        </>
    );
}


// ─── Main Viewer Component ─────────────────────────────────────────────────
function VascularViewer() {
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
            <div className="viewer-container">
                <Canvas
                    camera={{ position: [0, 2, 18], fov: 45 }}
                    gl={{
                        antialias: true,
                        toneMapping: THREE.ACESFilmicToneMapping,
                        toneMappingExposure: 1.15,
                        powerPreference: 'high-performance',
                    }}
                    dpr={[1, 2]}
                    style={{ background: 'radial-gradient(ellipse at center, #080c18 0%, #020305 100%)' }}
                >
                    <StudioLighting />
                    <VascularSystem />
                    <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                        autoRotate={true}
                        autoRotateSpeed={0.5}
                        minDistance={6}
                        maxDistance={30}
                        target={[0, 0, 0]}
                    />

                    {/* Post-processing */}
                    <EffectComposer>
                        <Bloom
                            intensity={0.4}
                            luminanceThreshold={0.18}
                            luminanceSmoothing={0.92}
                            mipmapBlur
                            radius={0.75}
                        />
                        <Vignette eskil={false} offset={0.1} darkness={0.85} />
                    </EffectComposer>
                </Canvas>

                <div className="viewer-overlay">
                    <span className="viewer-hint">🖱️ Drag to rotate · Scroll to zoom</span>
                </div>
                <div className="viewer-legend">
                    <span className="legend-title">Arteries</span>
                    <span className="legend-item"><span className="legend-dot" style={{ background: '#9b1b30' }} />Aorta</span>
                    <span className="legend-item"><span className="legend-dot" style={{ background: '#c0392b' }} />Major Artery</span>
                    <span className="legend-item"><span className="legend-dot" style={{ background: '#e04040' }} />Medium Artery</span>
                    <span className="legend-item"><span className="legend-dot" style={{ background: '#f5a090' }} />Capillary</span>
                    <span className="legend-divider" />
                    <span className="legend-title">Veins</span>
                    <span className="legend-item"><span className="legend-dot" style={{ background: '#1a2d5a' }} />Vena Cava</span>
                    <span className="legend-item"><span className="legend-dot" style={{ background: '#1e4a8a' }} />Major Vein</span>
                    <span className="legend-item"><span className="legend-dot" style={{ background: '#2b6cb0' }} />Medium Vein</span>
                    <span className="legend-item"><span className="legend-dot" style={{ background: '#7eb8e8' }} />Capillary</span>
                </div>
            </div>
        </Card>
    );
}

export default VascularViewer;
