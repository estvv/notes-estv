export interface Note {
  id: number;
  title: string;
  content: string;
  folder_id: number | null;
  position: number;
  share_token: string | null;
  is_shared: number;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
  share_token: string | null;
  is_shared: number;
  created_at: string;
  updated_at: string;
}