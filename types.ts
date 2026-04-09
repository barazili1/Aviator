
export interface Prediction {
  multiplier: number;
  timestamp: string;
  confidence: number;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export enum PredictionMode {
  STABLE = 'STABLE',
  BALANCED = 'BALANCED',
  HIGH_RISK = 'HIGH_RISK',
  AI_PRO = 'AI_PRO'
}
