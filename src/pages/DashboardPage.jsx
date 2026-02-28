import React, { useState, useEffect, useRef, useCallback } from 'react';
import VascularViewer from '../components/VascularViewer';
import MetricsReport from '../components/MetricsReport';
import SystemStatus from '../components/SystemStatus';

// Section definitions for scroll spy
const SECTIONS = [
    { id: 'model-viewer', label: '3D Model & Metrics' },
    { id: 'processing-status', label: 'Processing Status' },
    { id: 'patient-summary', label: 'Patient Summary' },
    { id: 'system-logs', label: 'System Logs' },
];

function DashboardPage({ onActiveSectionChange }) {
    const [selectedPatient, setSelectedPatient] = useState('Patient_001');
    const contentRef = useRef(null);

    // Scroll spy: track which section is currently visible
    const handleScroll = useCallback(() => {
        const scrollContainer = document.querySelector('.app-content');
        if (!scrollContainer) return;

        const scrollTop = scrollContainer.scrollTop;
        const offset = 120; // header height + buffer

        let activeId = SECTIONS[0].id;
        for (const section of SECTIONS) {
            const el = document.getElementById(section.id);
            if (el) {
                const top = el.offsetTop - scrollContainer.offsetTop;
                if (scrollTop >= top - offset) {
                    activeId = section.id;
                }
            }
        }

        if (onActiveSectionChange) {
            onActiveSectionChange(activeId);
        }
    }, [onActiveSectionChange]);

    useEffect(() => {
        const scrollContainer = document.querySelector('.app-content');
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll(); // Initial check
            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    return (
        <div className="content-wrapper" ref={contentRef}>
            {/* Section 1: 3D Viewer + Metrics */}
            <section id="model-viewer" className="dashboard-section">
                <div className="top-section">
                    <div className="viewer-section">
                        <VascularViewer />
                    </div>
                    <div className="metrics-section">
                        <MetricsReport
                            selectedPatient={selectedPatient}
                            onPatientChange={setSelectedPatient}
                        />
                    </div>
                </div>
            </section>

            {/* Section 2: System Status & Logs (SystemStatus has 3 cards internally) */}
            <section id="processing-status" className="dashboard-section">
                {/* We render SystemStatus once but its internal cards have their own IDs */}
            </section>

            <div className="bottom-section">
                <SystemStatus />
            </div>
        </div>
    );
}

export { SECTIONS };
export default DashboardPage;
