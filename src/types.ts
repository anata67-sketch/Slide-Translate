export interface BoundingBox {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  sourceText: string;
  targetText: string;
  defaultTargetText: string;
  fontSizePt: number;
  confidence: number;
  isMath?: boolean;
  preservedTerms: string[];
}

export interface SlideData {
  id: number;
  slideNumber: number;
  title: string;
  thaiTitle: string;
  subtitle?: string;
  thaiSubtitle?: string;
  confidence: number;
  status: 'ready' | 'processing' | 'queued';
  progress?: number;
  type: 'title' | 'diagram' | 'math' | 'bullet' | 'benchmark';
  diagramType?: 'cnn' | 'loss-curve' | 'optimizer-graph' | 'matrix' | 'backprop';
  boundingBoxes: BoundingBox[];
}

export interface DeckData {
  id: string;
  filename: string;
  version: string;
  totalPages: number;
  fileSize: string;
  dpi: number;
  sourceLang: string;
  targetLang: string;
  status: 'ready' | 'processing' | 'queued';
  activePage: number;
  slides: SlideData[];
}

export interface GlossaryTerm {
  id: string;
  english: string;
  thai: string;
  domain: 'Machine Learning' | 'Linear Algebra' | 'Optimization' | 'Computer Vision' | 'Statistics';
  royalSocietyStandard: boolean;
  notes?: string;
}

export interface BatchJob {
  id: string;
  deckName: string;
  pages: number;
  status: 'completed' | 'running' | 'queued' | 'failed';
  progress: number;
  eta: string;
  throughput: string;
  bleuScore: number;
}
