// Mock data for VascularAI Dashboard

export const patients = [
  {
    id: 'Patient_001',
    name: 'John Doe',
    age: 65,
    status: 'completed',
    inferenceTime: 4.2,
    result: 'Success',
    date: '2026-02-28',
  },
  {
    id: 'Patient_002',
    name: 'Jane Smith',
    age: 72,
    status: 'completed',
    inferenceTime: 3.8,
    result: 'Success',
    date: '2026-02-28',
  },
  {
    id: 'Patient_003',
    name: 'Robert Chen',
    age: 58,
    status: 'processing',
    inferenceTime: null,
    result: 'Processing',
    date: '2026-03-01',
  },
  {
    id: 'Patient_004',
    name: 'Maria Garcia',
    age: 61,
    status: 'completed',
    inferenceTime: 5.1,
    result: 'Failed',
    date: '2026-02-27',
  },
  {
    id: 'Patient_005',
    name: 'David Kim',
    age: 55,
    status: 'completed',
    inferenceTime: 3.5,
    result: 'Success',
    date: '2026-02-27',
  },
  {
    id: 'Patient_006',
    name: 'Sarah Wilson',
    age: 68,
    status: 'queued',
    inferenceTime: null,
    result: 'Queued',
    date: '2026-03-01',
  },
];

export const metricsData = {
  Patient_001: [
    { metric: 'clDice', value: 0.92, fill: '#52c41a' },
    { metric: 'Dice Score', value: 0.88, fill: '#1890ff' },
    { metric: 'IoU', value: 0.81, fill: '#36cfc9' },
  ],
  Patient_002: [
    { metric: 'clDice', value: 0.89, fill: '#52c41a' },
    { metric: 'Dice Score', value: 0.85, fill: '#1890ff' },
    { metric: 'IoU', value: 0.78, fill: '#36cfc9' },
  ],
  Patient_004: [
    { metric: 'clDice', value: 0.45, fill: '#52c41a' },
    { metric: 'Dice Score', value: 0.38, fill: '#1890ff' },
    { metric: 'IoU', value: 0.30, fill: '#36cfc9' },
  ],
  Patient_005: [
    { metric: 'clDice', value: 0.95, fill: '#52c41a' },
    { metric: 'Dice Score', value: 0.91, fill: '#1890ff' },
    { metric: 'IoU', value: 0.85, fill: '#36cfc9' },
  ],
};

export const processingStatus = {
  patientId: 'Patient_003',
  patientName: 'Robert Chen',
  progress: 80,
  stage: 'Vessel Segmentation',
  message: 'Processing Patient_003... 80%',
};

export const systemLogs = [
  { time: '03:45:12', level: 'INFO', message: 'Patient_001 reconstruction completed successfully' },
  { time: '03:42:08', level: 'INFO', message: 'Patient_002 reconstruction completed successfully' },
  { time: '03:38:55', level: 'WARNING', message: 'Patient_004 - Low confidence in vessel branch detection' },
  { time: '03:35:20', level: 'ERROR', message: 'Patient_004 reconstruction failed - insufficient input quality' },
  { time: '03:30:00', level: 'INFO', message: 'System initialized. GPU: Apple M2 Pro detected' },
  { time: '03:29:50', level: 'INFO', message: 'Model weights loaded: VascularNet v2.1' },
];

export const serverStatus = {
  online: true,
  version: 'v1.2.0',
  gpu: 'Apple M2 Pro',
  modelVersion: 'VascularNet v2.1',
};
