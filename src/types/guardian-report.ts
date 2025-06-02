export interface GuardianReport {
  id: string;
  guardian_id: string;
  object_id: number;
  status_note: string | null;
  status_type: 'ok' | 'damaged' | 'needs_repair' | 'other';
  image_urls: string[];
  location_text: string | null;
  is_public: boolean;
  approved: boolean;
  created_at: string;
  updated_at: string;
  objects?: {
    id: number;
    title_en: string | null;
    title_de: string | null;
  };
} 