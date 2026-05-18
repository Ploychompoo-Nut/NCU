import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Statistic, Button, Typography, Spin, Alert, Segmented, message } from 'antd';
import {
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  CodeSandboxOutlined,
  ExpandOutlined,
  CloseOutlined,
  UploadOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { Niivue } from '@niivue/niivue';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ padding: 20, textAlign: 'center' }}>
        <Typography.Text type="danger">Failed to load 3D Model. Please ensure the backend server is running.</Typography.Text>
      </div>;
    }
    return this.props.children;
  }
}

const { Title, Text } = Typography;

// ─── NiiVue Viewer Component ───────────────────────────────────────────────
// Renders NIfTI volumes on a canvas. When is3D is true, switches to pure 3D
// volume rendering (single view, not quad-view).
function NiiVueViewer({ volumes, is3D = false, containerKey }) {
  const canvasRef = useRef(null);
  const nvRef = useRef(null);

  useEffect(() => {
    if (!volumes || volumes.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize NiiVue
    const nv = new Niivue({
      backColor: [0.08, 0.08, 0.10, 1],
      show3Dcrosshair: false,
    });
    nvRef.current = nv;
    nv.attachToCanvas(canvas);

    nv.loadVolumes(volumes).then(() => {
      if (is3D) {
        // Requirement 2: Switch to single 3D volume rendering only
        nv.setSliceType(nv.sliceTypeRender);
        nv.setCrosshairColor([0, 0, 0, 0]); // hide crosshair in 3D
        // Set base anatomy to be slightly transparent, mask to be solid
        if (nv.volumes.length > 1) {
          nv.volumes[0].cal_min = 100;
          nv.volumes[0].cal_max = 1000;
          nv.volumes[1].opacity = 1.0;
        }
      } else {
        // In 2D MPR view, make the overlay mask partially transparent
        if (nv.volumes.length > 1) {
          nv.volumes[1].opacity = 0.5;
        }
      }
    }).catch(err => console.error("Niivue load error:", err));

    return () => {
      // cleanup
      nvRef.current = null;
    };
  }, [volumes, is3D, containerKey]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', outline: 'none' }} />;
}

// ─── Fullscreen Overlay Component ──────────────────────────────────────────
function FullscreenOverlay({ viewType, onClose, volumes3D, volumes2D, loading, selectedDatasetFile, setSelectedDatasetFile, datasetFiles }) {
  const is3D = viewType === '3d';
  const volumes = is3D ? volumes3D : volumes2D;

  // Prevent body scroll while fullscreen is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="pd-fullscreen-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pd-fullscreen-content">
        {/* Close button */}
        <button className="pd-fullscreen-close" onClick={onClose} title="Close Full Screen">
          <CloseOutlined style={{ fontSize: 20 }} />
        </button>

        {/* Title bar */}
        <div className="pd-fullscreen-header">
          <span className="pd-fullscreen-title">
            {is3D ? '3D Overlay View' : '2D MPR View (Axial)'}
          </span>
          {/* Dropdown for 2D view */}
          {!is3D && (
            <select
              value={selectedDatasetFile}
              onChange={(e) => setSelectedDatasetFile(e.target.value)}
              className="pd-fullscreen-select"
            >
              {datasetFiles.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          )}
        </div>

        {/* Canvas area */}
        <div className="pd-fullscreen-canvas">
          {loading ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Spin size="large" />
            </div>
          ) : (
            <ErrorBoundary>
              <NiiVueViewer
                volumes={volumes}
                is3D={is3D}
                containerKey="fullscreen"
              />
            </ErrorBoundary>
          )}
        </div>

        {/* Labels */}
        {is3D && (
          <div className="pd-fullscreen-label">
            <Text style={{ color: 'white', fontSize: 13 }}>Predicted Nerve (Red) overlaid on Anatomy</Text>
          </div>
        )}
        {!is3D && (
          <div className="pd-fullscreen-hint">
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Use mouse wheel over the image to scroll through slices.</Text>
          </div>
        )}
      </div>
    </div>
  );
}


// ─── Main Page Component ───────────────────────────────────────────────────
export default function PatientDetailsPage() {
  const { id } = useParams();
  const patientId = id || 'demo_patient';

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [metrics, setMetrics] = useState({ volume_mm3: 0, hd95: 0, dice: 0 });
  const [datasetFiles, setDatasetFiles] = useState([]);
  const [selectedDatasetFile, setSelectedDatasetFile] = useState('');
  const [inferenceError, setInferenceError] = useState(null);
  const [fullscreenView, setFullscreenView] = useState(null); // null | '3d' | '2d'
  const [uploadMode, setUploadMode] = useState('NIfTI'); // 'NIfTI' | 'DICOM'

  // Hidden file input refs
  const niftiInputRef = useRef(null);
  const dicomInputRef = useRef(null);

  useEffect(() => {
    // Fetch metrics (with mock fallback)
    fetch(`/api/results/${patientId}/metrics.json`)
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(err => {
        console.warn("Metrics not found, using placeholder. Triggering inference might be required.");
        setMetrics({
          volume_mm3: 450.2,
          hd95: 1.25,
          dice: 0.92
        });
        setLoading(false);
      });

    // Fetch dataset files
    fetch('http://localhost:8080/api/dataset-files')
      .then(res => res.json())
      .then(data => {
        if (data.files && data.files.length > 0) {
          setDatasetFiles(data.files);
          setSelectedDatasetFile(data.files[0]);
        }
      })
      .catch(err => {
        console.error("Failed to load dataset files:", err);
        // Mock fallback dataset files for UI development
        const mockFiles = ['0027781276_image.nii.gz', '0031245890_image.nii.gz'];
        setDatasetFiles(mockFiles);
        setSelectedDatasetFile(mockFiles[0]);
      });
  }, [patientId]);

  // ── Inference handler (kept intact) ─────────────────────────────────────
  const handleInference = useCallback(async () => {
    setLoading(true);
    setInferenceError(null);
    try {
      const payload = {
        patient_id: patientId,
        file_path: selectedDatasetFile ? `../SwinUNETR/dataset/test/image/${selectedDatasetFile}` : "../SwinUNETR/dataset/test/image/0027781276_image.nii.gz"
      };

      const response = await fetch('http://localhost:8080/api/inference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to run inference');
      }

      // Re-fetch metrics after inference
      const metricsRes = await fetch(`http://localhost:8080/api/results/${patientId}/metrics.json`);
      const metricsData = await metricsRes.json();
      setMetrics(metricsData);

    } catch (error) {
      setInferenceError(error.message);
    } finally {
      setLoading(false);
    }
  }, [patientId, selectedDatasetFile]);

  // ── Upload handler ──────────────────────────────────────────────────────
  const handleUploadClick = () => {
    if (uploadMode === 'NIfTI') {
      niftiInputRef.current?.click();
    } else {
      dicomInputRef.current?.click();
    }
  };

  const handleNiftiFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 1) {
      message.error('Only a single NIfTI file (.nii or .nii.gz) can be uploaded at a time.');
      e.target.value = '';
      return;
    }

    const file = files[0];
    const name = file.name.toLowerCase();
    if (!name.endsWith('.nii') && !name.endsWith('.nii.gz')) {
      message.error('Invalid file type. Please select a .nii or .nii.gz file.');
      e.target.value = '';
      return;
    }

    await processUpload([file], file.name);
    e.target.value = '';
  };

  const handleDicomFolderChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate that the folder contains .dcm files
    const dcmFiles = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.dcm'));
    if (dcmFiles.length === 0) {
      message.error('No DICOM (.dcm) files found in the selected folder.');
      e.target.value = '';
      return;
    }

    const folderName = files[0].webkitRelativePath.split('/')[0] || 'dicom_series';
    message.info(`Found ${dcmFiles.length} DICOM files in "${folderName}".`);
    await processUpload(dcmFiles, `${folderName}_series.nii.gz`);
    e.target.value = '';
  };

  const processUpload = async (files, displayName) => {
    setUploading(true);
    setLoading(true);
    setInferenceError(null);

    try {
      // ── Placeholder: Build FormData for future backend API ──────────
      const formData = new FormData();
      formData.append('patient_id', patientId);
      files.forEach((file, idx) => {
        formData.append(`file_${idx}`, file);
      });

      console.log('[Upload] Prepared FormData for backend:', {
        patient_id: patientId,
        fileCount: files.length,
        displayName,
      });

      // ── TODO: Replace with real API call ────────────────────────────
      // const response = await fetch('http://localhost:8080/api/upload', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const data = await response.json();

      // ── Mock: Simulate upload delay ─────────────────────────────────
      await new Promise(resolve => setTimeout(resolve, 1500));

      // ── Mock: Update dataset files with newly uploaded file ─────────
      const newFileName = displayName;
      setDatasetFiles(prev => {
        if (prev.includes(newFileName)) return prev;
        return [newFileName, ...prev];
      });
      setSelectedDatasetFile(newFileName);

      message.success(`"${newFileName}" uploaded successfully!`);

      // ── Auto-trigger inference after successful upload ──────────────
      // In production, this would call the real inference endpoint
      // handleInference();

    } catch (error) {
      message.error(`Upload failed: ${error.message}`);
      setInferenceError(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  // ── Volume data (memo) ──────────────────────────────────────────────────
  const volume3D = React.useMemo(() => {
    const vols = [];
    if (selectedDatasetFile) {
      vols.push({ url: `http://localhost:8080/api/dataset/${selectedDatasetFile}`, colormap: 'gray' });
    }
    if (!loading) {
      vols.push({ url: `http://localhost:8080/api/results/${patientId}/nerve_mask.nii.gz`, colormap: 'red' });
    }
    return vols;
  }, [selectedDatasetFile, patientId, loading]);

  const volume2D = React.useMemo(() => {
    if (!selectedDatasetFile) return [];
    return [{ url: `http://localhost:8080/api/dataset/${selectedDatasetFile}`, colormap: 'gray' }];
  }, [selectedDatasetFile]);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="pd-page">
      {/* Hidden file inputs */}
      <input
        ref={niftiInputRef}
        type="file"
        accept=".nii,.nii.gz"
        style={{ display: 'none' }}
        onChange={handleNiftiFileChange}
      />
      <input
        ref={dicomInputRef}
        type="file"
        webkitdirectory=""
        directory=""
        style={{ display: 'none' }}
        onChange={handleDicomFolderChange}
      />

      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="pd-header">
        <div className="pd-header-left">
          <Title level={3} style={{ margin: 0, color: '#1a1a2e', fontWeight: 700 }}>
            Patient Analysis: {patientId}
          </Title>
        </div>
        <div className="pd-header-right">
          <Segmented
            options={['NIfTI', 'DICOM']}
            value={uploadMode}
            onChange={setUploadMode}
            size="middle"
            className="pd-upload-mode"
          />
          <Button
            type="primary"
            icon={uploading ? <LoadingOutlined /> : <UploadOutlined />}
            onClick={handleUploadClick}
            loading={uploading}
            className="pd-upload-btn"
          >
            Upload
          </Button>
        </div>
      </div>

      {inferenceError && <Alert message="Error" description={inferenceError} type="error" showIcon style={{ marginBottom: 16, borderRadius: 10 }} />}

      {/* ── Compact Metrics Strip ─────────────────────────────────────── */}
      <div className="pd-metrics-strip">
        <div className="pd-metric-chip pd-metric-chip--success">
          <CheckCircleOutlined className="pd-metric-chip-icon" />
          <div className="pd-metric-chip-body">
            <span className="pd-metric-chip-label">Dice Score</span>
            <span className="pd-metric-chip-value">{metrics.dice.toFixed(3)} <span className="pd-metric-chip-unit">/ 1.0</span></span>
          </div>
        </div>
        <div className="pd-metric-chip pd-metric-chip--info">
          <CodeSandboxOutlined className="pd-metric-chip-icon" />
          <div className="pd-metric-chip-body">
            <span className="pd-metric-chip-label">Nerve Volume</span>
            <span className="pd-metric-chip-value">{metrics.volume_mm3.toFixed(1)} <span className="pd-metric-chip-unit">mm³</span></span>
          </div>
        </div>
        <div className="pd-metric-chip pd-metric-chip--danger">
          <SafetyCertificateOutlined className="pd-metric-chip-icon" />
          <div className="pd-metric-chip-body">
            <span className="pd-metric-chip-label">Safety Margin (HD95)</span>
            <span className="pd-metric-chip-value">{metrics.hd95.toFixed(2)} <span className="pd-metric-chip-unit">mm</span></span>
          </div>
        </div>
      </div>

      {/* ── Main Imaging Views ─────────────────────────────────────── */}
      <Row gutter={[16, 16]}>
        {/* 3D Overlay View */}
        <Col xs={24} lg={12}>
          <div className="pd-view-card">
            <div className="pd-view-card-header">
              <span className="pd-view-card-title">3D Overlay View</span>
              <button
                className="pd-maximize-btn"
                onClick={() => setFullscreenView('3d')}
                title="Full Screen"
              >
                <ExpandOutlined />
              </button>
            </div>
            <div className="pd-view-card-body">
              {loading ? (
                <div className="pd-view-loading"><Spin size="large" /></div>
              ) : (
                <ErrorBoundary>
                  <NiiVueViewer
                    volumes={volume3D}
                    is3D={true}
                    containerKey="inline-3d"
                  />
                </ErrorBoundary>
              )}
              <div className="pd-view-label pd-view-label--bottom">
                <Text style={{ color: 'white', fontSize: 12 }}>Predicted Nerve (Red) overlaid on Anatomy</Text>
              </div>
            </div>
          </div>
        </Col>

        {/* 2D MPR View */}
        <Col xs={24} lg={12}>
          <div className="pd-view-card">
            <div className="pd-view-card-header">
              <span className="pd-view-card-title">2D MPR View (Axial)</span>
              <div className="pd-view-card-actions">
                <select
                  value={selectedDatasetFile}
                  onChange={(e) => setSelectedDatasetFile(e.target.value)}
                  className="pd-dataset-select"
                >
                  {datasetFiles.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <button
                  className="pd-maximize-btn"
                  onClick={() => setFullscreenView('2d')}
                  title="Full Screen"
                >
                  <ExpandOutlined />
                </button>
              </div>
            </div>
            <div className="pd-view-card-body">
              <div className="pd-2d-canvas-wrapper">
                {selectedDatasetFile ? (
                  <NiiVueViewer
                    volumes={volume2D}
                    is3D={false}
                    containerKey="inline-2d"
                  />
                ) : (
                  <Text style={{ color: '#666' }}>No Dataset Selected</Text>
                )}
              </div>
              <div className="pd-view-hint">
                <Text type="secondary" style={{ fontSize: 12 }}>Use mouse wheel over the image to scroll through slices.</Text>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* ── Fullscreen Modal ─────────────────────────────────────────── */}
      {fullscreenView && (
        <FullscreenOverlay
          viewType={fullscreenView}
          onClose={() => setFullscreenView(null)}
          volumes3D={volume3D}
          volumes2D={volume2D}
          loading={loading}
          selectedDatasetFile={selectedDatasetFile}
          setSelectedDatasetFile={setSelectedDatasetFile}
          datasetFiles={datasetFiles}
        />
      )}
    </div>
  );
}
