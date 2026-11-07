import type { Photo, Viewpoint } from "@/lib/viewpoints/types";
 
/**
 * HAND-WRITTEN placeholder for the generated Supabase types.
 *
 * TODO(#37): replace this file with the output of the type-generation script
 * (`supabase gen types typescript`). The table and column names below follow
 * the architecture doc, so the generated file should be a drop-in swap.
 */
export type Database = {
  public: {
    Tables: {
      viewpoints: {
        Row: Viewpoint;
        Insert: Omit<Viewpoint, "id" | "created_at"> &
          Partial<Pick<Viewpoint, "id" | "created_at">>;
        Update: Partial<Viewpoint>;
        Relationships: [];
      };
      photos: {
        Row: Photo;
        Insert: Omit<Photo, "id" | "created_at"> &
          Partial<Pick<Photo, "id" | "created_at">>;
        Update: Partial<Photo>;
        Relationships: [
          {
            foreignKeyName: "photos_viewpoint_id_fkey";
            columns: ["viewpoint_id"];
            isOneToOne: false;
            referencedRelation: "viewpoints";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};