export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      viewpoints: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          area: string;
          latitude: number;
          longitude: number;
          description: Json;
          photo_path: string;
          photo_name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          name: string;
          area: string;
          latitude: number;
          longitude: number;
          description: Json;
          photo_path: string;
          photo_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          area?: string;
          latitude?: number;
          longitude?: number;
          description?: Json;
          photo_path?: string;
          photo_name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
