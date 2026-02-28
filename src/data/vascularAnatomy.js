/**
 * Full-Body Human Vascular System — Anatomically Accurate
 * 
 * All coordinates are hand-placed based on human anatomical references.
 * NO random noise or procedural jitter — every point is deterministic.
 * 
 * Coordinate system (normalized adult human ~16 units tall):
 *   Y-axis: vertical (feet at y=0, head top at y=16)
 *   X-axis: lateral (right = +X, left = -X)
 *   Z-axis: anterior-posterior (front = +Z, back = -Z)
 *   Body centerline: x=0
 *   Heart center: approximately (0, 12.2, 0.3)
 * 
 * Proportions based on standard adult anatomy:
 *   Head top:      y ≈ 16.0
 *   Chin:          y ≈ 14.5
 *   Shoulders:     y ≈ 13.2
 *   Heart:         y ≈ 12.0–12.5
 *   Diaphragm:     y ≈ 10.8
 *   Navel:         y ≈ 9.5
 *   Pelvis/Groin:  y ≈ 8.0
 *   Knee:          y ≈ 4.5
 *   Ankle:         y ≈ 1.0
 *   Foot sole:     y ≈ 0.0
 *   Shoulder width: ±1.8
 *   Hip width:      ±0.9
 *   Elbow:         at about y=10.5 when arms at sides
 *   Wrist:         at about y=8.0 when arms at sides
 *   Fingertips:    at about y=7.0 when arms at sides
 */
import * as THREE from 'three';

// Helper: create CatmullRom smooth curve from control points
function smoothCurve(controlPoints, pointsPerSegment = 3) {
    const vectors = controlPoints.map(p => new THREE.Vector3(p[0], p[1], p[2]));
    const curve = new THREE.CatmullRomCurve3(vectors);
    const total = Math.max(8, (controlPoints.length - 1) * pointsPerSegment);
    const pts = [];
    for (let i = 0; i <= total; i++) {
        pts.push(curve.getPoint(i / total));
    }
    return pts;
}

// Mirror points across X axis (right → left)
function mirror(points) {
    return points.map(p => new THREE.Vector3(-p.x, p.y, p.z));
}

export function generateFullBodyVasculature() {
    const vessels = [];

    // Shorthand to add a vessel
    const add = (controlPts, radius, type, depth, label) => {
        vessels.push({
            points: smoothCurve(controlPts, 4),
            radius,
            type,
            depth,
            label,
        });
    };

    // Mirror shorthand — adds both right and left
    const addBilateral = (controlPts, radius, type, depth, labelR, labelL) => {
        const pts = smoothCurve(controlPts, 4);
        vessels.push({ points: pts, radius, type, depth, label: labelR });
        vessels.push({ points: mirror(pts), radius, type, depth, label: labelL || labelR.replace('R.', 'L.') });
    };


    // ═══════════════════════════════════════════════════════════════════════
    //  HEART & GREAT VESSELS (y ≈ 11.5–13.0)
    // ═══════════════════════════════════════════════════════════════════════

    // ── Ascending Aorta ──
    add([
        [0.1, 11.8, 0.5],    // Aortic root (left ventricle)
        [0.15, 12.2, 0.55],  // Ascending
        [0.1, 12.7, 0.5],    // Near arch
        [0.0, 13.0, 0.4],    // Top of arch
    ], 0.32, 'artery', 0, 'Ascending Aorta');

    // ── Aortic Arch ──
    add([
        [0.0, 13.0, 0.4],    // Top of ascending
        [-0.2, 13.15, 0.3],  // Peak of arch
        [-0.35, 13.05, 0.15],// Posterior bend
        [-0.3, 12.8, 0.0],   // Transition to descending
    ], 0.28, 'artery', 0, 'Aortic Arch');

    // ── Descending Thoracic Aorta ──
    add([
        [-0.3, 12.8, 0.0],
        [-0.2, 12.2, -0.05],
        [-0.1, 11.5, -0.05],
        [-0.05, 10.8, 0.0],  // Diaphragm level
    ], 0.26, 'artery', 0, 'Desc. Thoracic Aorta');

    // ── Abdominal Aorta ──
    add([
        [-0.05, 10.8, 0.0],
        [0.0, 10.0, 0.05],
        [0.0, 9.5, 0.05],    // Navel level
        [0.0, 9.0, 0.05],
        [0.0, 8.5, 0.05],
        [0.0, 8.2, 0.05],    // Bifurcation
    ], 0.22, 'artery', 0, 'Abdominal Aorta');

    // ── Pulmonary Trunk ──
    add([
        [0.2, 12.0, 0.6],    // Right ventricle
        [0.15, 12.4, 0.65],
        [-0.05, 12.6, 0.55],
    ], 0.28, 'artery', 1, 'Pulmonary Trunk');

    // ── R. Pulmonary Artery ──
    add([
        [-0.05, 12.6, 0.55],
        [0.4, 12.5, 0.4],
        [0.8, 12.4, 0.2],
        [1.1, 12.3, 0.0],
    ], 0.18, 'artery', 1, 'R. Pulmonary A.');

    // ── L. Pulmonary Artery ──
    add([
        [-0.05, 12.6, 0.55],
        [-0.5, 12.5, 0.35],
        [-0.9, 12.4, 0.15],
        [-1.1, 12.3, 0.0],
    ], 0.18, 'artery', 1, 'L. Pulmonary A.');

    // ── Pulmonary Veins (4 total, bringing blood back to left atrium) ──
    add([[0.9, 12.3, -0.05], [0.5, 12.2, 0.15], [0.1, 12.1, 0.35], [-0.1, 12.0, 0.4]],
        0.14, 'vein', 2, 'R. Sup. Pulmonary V.');
    add([[1.0, 12.1, -0.1], [0.6, 12.0, 0.1], [0.2, 11.9, 0.3], [-0.1, 11.9, 0.38]],
        0.14, 'vein', 2, 'R. Inf. Pulmonary V.');
    add([[-0.9, 12.3, -0.05], [-0.5, 12.2, 0.15], [-0.1, 12.1, 0.35], [0.0, 12.0, 0.4]],
        0.14, 'vein', 2, 'L. Sup. Pulmonary V.');
    add([[-1.0, 12.1, -0.1], [-0.6, 12.0, 0.1], [-0.2, 11.9, 0.3], [0.0, 11.9, 0.38]],
        0.14, 'vein', 2, 'L. Inf. Pulmonary V.');

    // ── Coronary Arteries ──
    add([
        [0.1, 12.0, 0.55],
        [0.35, 11.9, 0.6],
        [0.5, 11.7, 0.5],
        [0.4, 11.5, 0.35],
        [0.2, 11.4, 0.4],
    ], 0.06, 'artery', 3, 'R. Coronary A.');

    // Left main → LAD + Circumflex
    add([
        [0.05, 12.0, 0.55],
        [-0.15, 11.9, 0.6],
        [-0.3, 11.7, 0.55],
        [-0.2, 11.5, 0.5],
        [-0.05, 11.3, 0.55],
    ], 0.06, 'artery', 3, 'LAD');

    add([
        [-0.15, 11.9, 0.6],
        [-0.4, 11.8, 0.5],
        [-0.5, 11.6, 0.35],
        [-0.35, 11.4, 0.3],
    ], 0.05, 'artery', 3, 'Circumflex A.');

    // Coronary capillary network (dense mesh around heart)
    const heartCx = 0.0, heartCy = 11.7, heartCz = 0.45;
    for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const r1 = 0.25, r2 = 0.45;
        const yOff = Math.sin(angle * 1.5) * 0.4;
        add([
            [heartCx + Math.cos(angle) * r1, heartCy + yOff * 0.5, heartCz + Math.sin(angle) * r1 * 0.4],
            [heartCx + Math.cos(angle) * r2, heartCy + yOff, heartCz + Math.sin(angle) * r2 * 0.4],
        ], 0.015 + (i % 3) * 0.005, i % 2 === 0 ? 'artery' : 'vein', 4, 'Coronary Cap.');
    }


    // ═══════════════════════════════════════════════════════════════════════
    //  SUPERIOR VENA CAVA & INFERIOR VENA CAVA
    // ═══════════════════════════════════════════════════════════════════════

    add([
        [0.3, 13.2, 0.3],    // Junction of brachiocephalic veins
        [0.25, 12.8, 0.35],
        [0.2, 12.4, 0.38],
        [0.15, 12.0, 0.4],   // Right atrium
    ], 0.28, 'vein', 0, 'Superior Vena Cava');

    add([
        [0.15, 8.2, 0.0],    // Iliac confluence
        [0.12, 8.8, 0.02],
        [0.1, 9.5, 0.05],
        [0.1, 10.0, 0.08],
        [0.1, 10.8, 0.1],
        [0.12, 11.3, 0.15],
        [0.15, 11.8, 0.35],  // Right atrium
    ], 0.28, 'vein', 0, 'Inferior Vena Cava');


    // ═══════════════════════════════════════════════════════════════════════
    //  HEAD & NECK (y ≈ 13.0–16.0)
    // ═══════════════════════════════════════════════════════════════════════

    // ── Brachiocephalic Trunk (right side only) ──
    add([
        [0.0, 13.0, 0.4],    // From arch
        [0.2, 13.1, 0.35],
        [0.4, 13.2, 0.25],   // Bifurcation to R. carotid + R. subclavian
    ], 0.18, 'artery', 0, 'Brachiocephalic Trunk');

    // ── Common Carotid Arteries ──
    addBilateral([
        [0.35, 13.2, 0.2],   // Base of neck
        [0.3, 13.6, 0.18],
        [0.25, 14.0, 0.15],  // Mid neck
        [0.22, 14.5, 0.12],  // Chin level — bifurcation
    ], 0.12, 'artery', 1, 'R. Common Carotid', 'L. Common Carotid');

    // ── Internal Carotid (to brain) ──
    addBilateral([
        [0.22, 14.5, 0.12],
        [0.2, 14.8, 0.08],
        [0.18, 15.2, 0.0],
        [0.15, 15.5, -0.05],  // Enters skull base
    ], 0.08, 'artery', 2, 'R. Int. Carotid', 'L. Int. Carotid');

    // ── External Carotid (face & scalp) ──
    addBilateral([
        [0.22, 14.5, 0.12],
        [0.28, 14.8, 0.15],
        [0.3, 15.2, 0.12],
        [0.25, 15.6, 0.08],
    ], 0.07, 'artery', 2, 'R. Ext. Carotid', 'L. Ext. Carotid');

    // ── Vertebral Arteries ──
    addBilateral([
        [0.4, 13.2, 0.0],    // From subclavian
        [0.3, 13.6, -0.15],  // Run through vertebral foramina
        [0.2, 14.2, -0.18],
        [0.1, 14.8, -0.15],
        [0.05, 15.3, -0.12], // Enter skull — join to form basilar
    ], 0.06, 'artery', 2, 'R. Vertebral A.', 'L. Vertebral A.');

    // ── Basilar Artery ──
    add([
        [0.0, 15.3, -0.12],
        [0.0, 15.5, -0.1],
        [0.0, 15.7, -0.08],
    ], 0.06, 'artery', 2, 'Basilar A.');

    // ── Circle of Willis (simplified) ──
    // Anterior cerebral
    addBilateral([
        [0.12, 15.5, 0.0],
        [0.06, 15.7, 0.05],
        [0.02, 15.9, 0.08],
        [0.0, 16.0, 0.05],
    ], 0.04, 'artery', 3, 'R. Ant. Cerebral', 'L. Ant. Cerebral');

    // Middle cerebral
    addBilateral([
        [0.12, 15.5, 0.0],
        [0.3, 15.6, 0.0],
        [0.5, 15.7, -0.02],
        [0.65, 15.6, -0.05],
    ], 0.045, 'artery', 3, 'R. Mid. Cerebral', 'L. Mid. Cerebral');

    // Posterior cerebral
    addBilateral([
        [0.0, 15.7, -0.08],
        [0.15, 15.65, -0.1],
        [0.35, 15.55, -0.12],
        [0.5, 15.4, -0.15],
    ], 0.04, 'artery', 3, 'R. Post. Cerebral', 'L. Post. Cerebral');

    // ── Jugular Veins ──
    addBilateral([
        [0.35, 15.3, 0.08],  // Skull base
        [0.38, 14.8, 0.12],
        [0.4, 14.2, 0.15],
        [0.38, 13.6, 0.18],
        [0.35, 13.2, 0.22],  // Base of neck
        [0.3, 12.8, 0.28],   // To brachiocephalic vein
    ], 0.12, 'vein', 1, 'R. Int. Jugular V.', 'L. Int. Jugular V.');

    // External jugular
    addBilateral([
        [0.4, 15.0, 0.15],
        [0.5, 14.5, 0.2],
        [0.5, 14.0, 0.22],
        [0.45, 13.5, 0.2],
        [0.4, 13.2, 0.18],
    ], 0.07, 'vein', 2, 'R. Ext. Jugular V.', 'L. Ext. Jugular V.');

    // Brachiocephalic veins
    addBilateral([
        [0.5, 13.2, 0.2],
        [0.4, 13.2, 0.25],
        [0.3, 13.2, 0.3],
    ], 0.16, 'vein', 1, 'R. Brachiocephalic V.', 'L. Brachiocephalic V.');

    // Facial artery branches
    addBilateral([
        [0.28, 14.8, 0.15],
        [0.35, 15.0, 0.25],
        [0.3, 15.3, 0.3],
        [0.2, 15.5, 0.28],
    ], 0.035, 'artery', 3, 'R. Facial A.', 'L. Facial A.');

    // Temporal artery
    addBilateral([
        [0.3, 15.2, 0.12],
        [0.45, 15.4, 0.1],
        [0.55, 15.6, 0.05],
        [0.5, 15.8, 0.0],
    ], 0.03, 'artery', 3, 'R. Temporal A.', 'L. Temporal A.');


    // ═══════════════════════════════════════════════════════════════════════
    //  UPPER LIMBS (y ≈ 7.0–13.2)
    // ═══════════════════════════════════════════════════════════════════════

    // ── Subclavian Arteries ──
    // Right subclavian (from brachiocephalic trunk)
    add([
        [0.4, 13.2, 0.25],
        [0.7, 13.2, 0.18],
        [1.0, 13.15, 0.1],
        [1.3, 13.1, 0.05],
        [1.6, 13.05, 0.0],   // Lateral border of 1st rib → becomes axillary
    ], 0.12, 'artery', 1, 'R. Subclavian A.');

    // Left subclavian (directly from arch)
    add([
        [-0.2, 13.05, 0.2],
        [-0.5, 13.1, 0.15],
        [-0.8, 13.15, 0.1],
        [-1.1, 13.15, 0.05],
        [-1.4, 13.1, 0.0],
        [-1.6, 13.05, 0.0],
    ], 0.12, 'artery', 1, 'L. Subclavian A.');

    // ── Axillary → Brachial Arteries ──
    addBilateral([
        [1.6, 13.05, 0.0],   // Axillary
        [1.7, 12.7, 0.02],
        [1.75, 12.2, 0.05],  // Armpit
        [1.7, 11.5, 0.08],   // Upper arm
        [1.65, 10.8, 0.1],
        [1.6, 10.2, 0.08],   // Near elbow (cubital fossa)
    ], 0.08, 'artery', 1, 'R. Brachial A.', 'L. Brachial A.');

    // ── Radial Artery (lateral forearm — thumb side) ──
    addBilateral([
        [1.6, 10.2, 0.08],
        [1.62, 9.8, 0.12],
        [1.65, 9.3, 0.15],
        [1.68, 8.8, 0.16],
        [1.7, 8.3, 0.15],
        [1.7, 8.0, 0.13],    // Wrist
    ], 0.05, 'artery', 2, 'R. Radial A.', 'L. Radial A.');

    // ── Ulnar Artery (medial forearm — pinky side) ──
    addBilateral([
        [1.6, 10.2, 0.08],
        [1.55, 9.8, 0.05],
        [1.5, 9.3, 0.02],
        [1.48, 8.8, 0.0],
        [1.5, 8.3, 0.02],
        [1.52, 8.0, 0.05],   // Wrist
    ], 0.045, 'artery', 2, 'R. Ulnar A.', 'L. Ulnar A.');

    // ── Palmar Arch (in the hand) ──
    addBilateral([
        [1.7, 8.0, 0.13],    // Radial at wrist
        [1.65, 7.7, 0.14],
        [1.6, 7.5, 0.12],
        [1.55, 7.5, 0.08],
        [1.52, 7.7, 0.05],   // Join ulnar
    ], 0.03, 'artery', 3, 'R. Palmar Arch', 'L. Palmar Arch');

    // ── Digital Arteries (fingers) ──
    for (let f = 0; f < 5; f++) {
        const fx = 1.52 + f * 0.05;
        const fz = 0.06 + f * 0.015;
        const endY = 7.0 - f * 0.05;
        addBilateral([
            [fx, 7.5, fz],
            [fx + 0.02, 7.3, fz + 0.02],
            [fx + 0.01, endY, fz + 0.01],
        ], 0.012, 'artery', 4, `R. Digital ${f + 1}`, `L. Digital ${f + 1}`);
    }

    // ── Subclavian Veins ──
    addBilateral([
        [1.6, 13.0, 0.08],
        [1.2, 13.05, 0.12],
        [0.8, 13.1, 0.15],
        [0.5, 13.15, 0.2],
    ], 0.13, 'vein', 1, 'R. Subclavian V.', 'L. Subclavian V.');

    // ── Cephalic Vein (superficial, lateral arm) ──
    addBilateral([
        [1.7, 7.8, 0.18],    // Wrist lateral
        [1.72, 8.5, 0.2],
        [1.75, 9.3, 0.22],
        [1.78, 10.0, 0.2],
        [1.75, 10.8, 0.18],
        [1.7, 11.5, 0.15],
        [1.65, 12.2, 0.1],
        [1.55, 12.8, 0.08],
        [1.3, 13.0, 0.1],
    ], 0.06, 'vein', 2, 'R. Cephalic V.', 'L. Cephalic V.');

    // ── Basilic Vein (superficial, medial arm) ──
    addBilateral([
        [1.5, 7.9, 0.0],     // Wrist medial
        [1.48, 8.5, -0.02],
        [1.45, 9.3, -0.03],
        [1.48, 10.0, -0.02],
        [1.52, 10.5, 0.0],
        [1.55, 11.0, 0.02],  // Joins brachial veins
    ], 0.05, 'vein', 2, 'R. Basilic V.', 'L. Basilic V.');

    // ── Brachial Veins (deep, accompany artery) ──
    addBilateral([
        [1.55, 10.5, 0.0],
        [1.6, 11.0, 0.02],
        [1.65, 11.5, 0.03],
        [1.68, 12.0, 0.04],
        [1.65, 12.5, 0.05],
        [1.6, 12.9, 0.08],
    ], 0.06, 'vein', 1, 'R. Brachial V.', 'L. Brachial V.');


    // ═══════════════════════════════════════════════════════════════════════
    //  ABDOMINAL BRANCHES (y ≈ 8.2–10.8)
    // ═══════════════════════════════════════════════════════════════════════

    // ── Celiac Trunk (to stomach, liver, spleen) — T12 level ──
    add([
        [0.0, 10.5, 0.05],
        [0.0, 10.5, 0.2],
        [0.1, 10.5, 0.35],
    ], 0.1, 'artery', 2, 'Celiac Trunk');

    // Hepatic Artery (to liver — right)
    add([
        [0.1, 10.5, 0.35],
        [0.3, 10.5, 0.4],
        [0.6, 10.6, 0.35],
        [0.9, 10.5, 0.25],
    ], 0.06, 'artery', 2, 'Hepatic A.');

    // Splenic Artery (to spleen — left)
    add([
        [0.1, 10.5, 0.35],
        [-0.2, 10.5, 0.4],
        [-0.6, 10.6, 0.35],
        [-0.9, 10.5, 0.2],
        [-1.1, 10.4, 0.1],
    ], 0.06, 'artery', 2, 'Splenic A.');

    // Left Gastric Artery
    add([
        [0.1, 10.5, 0.35],
        [-0.05, 10.7, 0.4],
        [-0.15, 10.9, 0.35],
    ], 0.04, 'artery', 3, 'L. Gastric A.');

    // ── Superior Mesenteric Artery (to small intestine) — L1 ──
    add([
        [0.0, 10.2, 0.05],
        [0.0, 10.2, 0.25],
        [0.1, 10.0, 0.4],
        [0.15, 9.5, 0.45],
        [0.1, 9.0, 0.4],
        [0.0, 8.6, 0.35],
    ], 0.09, 'artery', 2, 'Sup. Mesenteric A.');

    // SMA branches (jejunal/ileal)
    for (let i = 0; i < 5; i++) {
        const t = i / 4;
        const y = 10.0 - t * 1.2;
        const side = i % 2 === 0 ? 1 : -1;
        add([
            [0.1 * side, y, 0.4],
            [0.3 * side, y - 0.1, 0.5],
            [0.5 * side, y - 0.2, 0.45],
        ], 0.025, 'artery', 3, `Intestinal Br. ${i + 1}`);
    }

    // ── Renal Arteries (to kidneys) — L1/L2 level ──
    addBilateral([
        [0.0, 10.0, 0.05],
        [0.3, 10.0, 0.02],
        [0.6, 10.0, -0.02],
        [0.85, 10.0, -0.05],
    ], 0.08, 'artery', 2, 'R. Renal A.', 'L. Renal A.');

    // Renal capillary network
    for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 1.6 + 0.3;
            add([
                [side * 0.85, 10.0, -0.05],
                [side * (0.85 + Math.cos(angle) * 0.2), 10.0 + Math.sin(angle) * 0.15, -0.05 + Math.cos(angle * 2) * 0.06],
            ], 0.015, i % 2 === 0 ? 'artery' : 'vein', 4, 'Renal Cap.');
        }
    }

    // ── Renal Veins ──
    addBilateral([
        [0.85, 9.95, -0.1],
        [0.55, 9.9, -0.06],
        [0.3, 9.85, -0.02],
        [0.12, 9.8, 0.02],
    ], 0.09, 'vein', 2, 'R. Renal V.', 'L. Renal V.');

    // ── Inferior Mesenteric Artery (to large intestine) ──
    add([
        [0.0, 9.0, 0.05],
        [-0.1, 8.8, 0.2],
        [-0.2, 8.5, 0.3],
        [-0.15, 8.2, 0.25],
    ], 0.06, 'artery', 2, 'Inf. Mesenteric A.');

    // ── Gonadal Arteries ──
    addBilateral([
        [0.0, 9.5, 0.05],
        [0.15, 9.2, 0.08],
        [0.3, 8.8, 0.1],
        [0.4, 8.4, 0.12],
    ], 0.03, 'artery', 3, 'R. Gonadal A.', 'L. Gonadal A.');

    // Hepatic portal vein
    add([
        [0.3, 9.8, 0.35],
        [0.5, 10.2, 0.35],
        [0.7, 10.4, 0.3],
        [0.85, 10.5, 0.25],
    ], 0.1, 'vein', 2, 'Hepatic Portal V.');

    // Hepatic veins (draining liver to IVC)
    add([
        [0.7, 10.8, 0.2],
        [0.5, 10.8, 0.15],
        [0.3, 10.8, 0.1],
        [0.12, 10.8, 0.08],
    ], 0.08, 'vein', 2, 'Hepatic V.');


    // ═══════════════════════════════════════════════════════════════════════
    //  LOWER LIMBS (y ≈ 0.0–8.2)
    // ═══════════════════════════════════════════════════════════════════════

    // ── Common Iliac Arteries ──
    addBilateral([
        [0.0, 8.2, 0.05],    // Aortic bifurcation
        [0.2, 8.0, 0.04],
        [0.45, 7.8, 0.03],
        [0.65, 7.6, 0.02],   // Bifurcation to internal/external iliac
    ], 0.14, 'artery', 1, 'R. Common Iliac A.', 'L. Common Iliac A.');

    // ── Internal Iliac (pelvic organs) ──
    addBilateral([
        [0.65, 7.6, 0.02],
        [0.55, 7.4, -0.1],
        [0.45, 7.2, -0.18],
        [0.4, 7.0, -0.22],
    ], 0.07, 'artery', 2, 'R. Int. Iliac A.', 'L. Int. Iliac A.');

    // ── External Iliac → Femoral ──
    addBilateral([
        [0.65, 7.6, 0.02],   // External iliac
        [0.75, 7.4, 0.05],
        [0.8, 7.2, 0.08],
        [0.82, 7.0, 0.1],    // Inguinal ligament → becomes femoral
        [0.8, 6.5, 0.08],
        [0.78, 6.0, 0.06],   // Mid thigh
        [0.75, 5.5, 0.04],
        [0.7, 5.0, 0.02],
        [0.68, 4.6, 0.0],    // Adductor hiatus → becomes popliteal
    ], 0.10, 'artery', 1, 'R. Femoral A.', 'L. Femoral A.');

    // ── Deep Femoral (Profunda Femoris) — major branch for thigh muscles ──
    addBilateral([
        [0.82, 7.0, 0.1],
        [0.9, 6.7, 0.0],
        [0.92, 6.3, -0.05],
        [0.88, 5.8, -0.08],
        [0.82, 5.4, -0.06],
    ], 0.07, 'artery', 2, 'R. Deep Femoral A.', 'L. Deep Femoral A.');

    // ── Popliteal Artery (behind knee) ──
    addBilateral([
        [0.68, 4.6, 0.0],
        [0.65, 4.4, -0.08],
        [0.62, 4.2, -0.12],
        [0.6, 4.0, -0.1],    // Bifurcation below knee
    ], 0.07, 'artery', 2, 'R. Popliteal A.', 'L. Popliteal A.');

    // ── Anterior Tibial (front of lower leg → dorsalis pedis) ──
    addBilateral([
        [0.6, 4.0, -0.1],
        [0.58, 3.5, 0.05],   // Passes through interosseous membrane
        [0.55, 3.0, 0.1],
        [0.52, 2.5, 0.12],
        [0.5, 2.0, 0.14],
        [0.48, 1.5, 0.15],
        [0.45, 1.0, 0.15],   // Ankle
    ], 0.05, 'artery', 2, 'R. Ant. Tibial A.', 'L. Ant. Tibial A.');

    // ── Posterior Tibial (back of lower leg) ──
    addBilateral([
        [0.6, 4.0, -0.1],
        [0.6, 3.5, -0.12],
        [0.58, 3.0, -0.1],
        [0.55, 2.5, -0.08],
        [0.52, 2.0, -0.05],
        [0.48, 1.5, -0.02],
        [0.42, 1.0, 0.0],    // Behind medial malleolus
    ], 0.045, 'artery', 2, 'R. Post. Tibial A.', 'L. Post. Tibial A.');

    // ── Peroneal (Fibular) Artery ──
    addBilateral([
        [0.6, 3.8, -0.1],
        [0.65, 3.3, -0.12],
        [0.63, 2.8, -0.1],
        [0.6, 2.2, -0.08],
        [0.55, 1.5, -0.05],
    ], 0.035, 'artery', 3, 'R. Peroneal A.', 'L. Peroneal A.');

    // ── Dorsalis Pedis (top of foot) ──
    addBilateral([
        [0.45, 1.0, 0.15],
        [0.42, 0.7, 0.2],
        [0.4, 0.4, 0.25],
        [0.38, 0.2, 0.3],
    ], 0.03, 'artery', 3, 'R. Dorsalis Pedis', 'L. Dorsalis Pedis');

    // ── Plantar Arch ──
    addBilateral([
        [0.42, 1.0, 0.0],    // Post. tibial at ankle
        [0.4, 0.5, 0.08],
        [0.38, 0.25, 0.15],
        [0.35, 0.2, 0.25],
        [0.38, 0.2, 0.3],    // Connect to dorsalis pedis
    ], 0.025, 'artery', 3, 'R. Plantar Arch', 'L. Plantar Arch');

    // ── Toe arteries ──
    for (let t = 0; t < 5; t++) {
        const tx = 0.3 + t * 0.04;
        const tz = 0.28 + t * 0.02;
        addBilateral([
            [tx, 0.2, tz],
            [tx + 0.01, 0.1, tz + 0.03],
            [tx, 0.0, tz + 0.05],
        ], 0.01, 'artery', 4, `R. Toe ${t + 1}`, `L. Toe ${t + 1}`);
    }

    // ── Common Iliac Veins ──
    addBilateral([
        [0.7, 7.5, -0.05],
        [0.5, 7.7, -0.02],
        [0.3, 7.9, 0.0],
        [0.15, 8.1, 0.0],
    ], 0.15, 'vein', 1, 'R. Common Iliac V.', 'L. Common Iliac V.');

    // ── Great Saphenous Vein (longest vein — medial leg surface) ──
    addBilateral([
        [0.35, 0.5, 0.15],   // Medial ankle
        [0.4, 1.2, 0.2],
        [0.45, 2.0, 0.22],
        [0.5, 2.8, 0.2],
        [0.55, 3.5, 0.18],
        [0.6, 4.2, 0.15],    // Knee medial
        [0.65, 5.0, 0.14],
        [0.7, 5.8, 0.13],
        [0.75, 6.5, 0.12],
        [0.78, 7.0, 0.12],   // Saphenofemoral junction
    ], 0.06, 'vein', 1, 'R. Great Saphenous V.', 'L. Great Saphenous V.');

    // ── Small Saphenous Vein (posterior lower leg) ──
    addBilateral([
        [0.48, 0.8, -0.1],   // Lateral ankle
        [0.52, 1.5, -0.15],
        [0.55, 2.2, -0.18],
        [0.58, 3.0, -0.16],
        [0.6, 3.8, -0.12],
        [0.62, 4.2, -0.1],   // Popliteal fossa
    ], 0.04, 'vein', 2, 'R. Small Saphenous V.', 'L. Small Saphenous V.');

    // ── Femoral Vein (deep — accompanies artery) ──
    addBilateral([
        [0.62, 4.5, -0.05],
        [0.68, 5.0, -0.02],
        [0.72, 5.5, 0.0],
        [0.76, 6.0, 0.02],
        [0.78, 6.5, 0.04],
        [0.8, 7.0, 0.06],
        [0.75, 7.4, 0.02],
        [0.7, 7.5, -0.02],
    ], 0.09, 'vein', 1, 'R. Femoral V.', 'L. Femoral V.');


    // ═══════════════════════════════════════════════════════════════════════
    //  THORACIC SECONDARY VESSELS
    // ═══════════════════════════════════════════════════════════════════════

    // Intercostal arteries (from descending aorta, pairs along ribs)
    for (let i = 0; i < 5; i++) {
        const y = 12.5 - i * 0.4;
        addBilateral([
            [-0.15, y, -0.02],
            [0.3, y, -0.05],
            [0.7, y, -0.08],
            [1.0, y, -0.06],
        ], 0.025, 'artery', 3, `R. Intercostal ${i + 1}`, `L. Intercostal ${i + 1}`);
    }

    // Internal thoracic artery (mammary)
    addBilateral([
        [0.5, 13.1, 0.2],
        [0.45, 12.5, 0.25],
        [0.4, 11.8, 0.28],
        [0.38, 11.2, 0.3],
        [0.35, 10.8, 0.28],
    ], 0.04, 'artery', 2, 'R. Int. Thoracic A.', 'L. Int. Thoracic A.');

    // Azygos vein (right side paravertebral)
    add([
        [0.4, 10.8, -0.15],
        [0.38, 11.3, -0.14],
        [0.35, 11.8, -0.12],
        [0.32, 12.3, -0.1],
        [0.3, 12.6, -0.05],
        [0.28, 12.8, 0.1],
        [0.25, 12.8, 0.3],   // Arch over right bronchus to SVC
    ], 0.06, 'vein', 2, 'Azygos V.');


    return vessels;
}
