import { Job, PreviewResult } from './api.types';

export type JobDrawerProps = {
  job: Job;
  onClose: () => void;
  onDownload: (job: Job) => void;
  onRemove: (job: Job) => void;
  onRerun: (job: Job) => void;
  onSaveTemplate: (job: Job) => void;
};

export type PreviewPanelProps = {
  result: PreviewResult | null;
  loading: boolean;
  selected: string[];
  disabled: boolean;
  onPreview: () => void;
  onToggleColumn: (column: string) => void;
};
