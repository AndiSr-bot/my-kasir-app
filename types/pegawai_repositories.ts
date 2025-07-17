export interface TPegawai {
    id?: string;
    perusahaanId: string;
    nama: string;
    jabatan: string;
    role: "admin" | "staff";
    no_hp?: string;
    foto?: string | null;
}

export interface TPegawaiCreate {
    perusahaanId: string;
    nama: string;
    jabatan: string;
    role: "admin" | "staff";
    no_hp?: string;
    foto?: string | null;
}

export interface TPegawaiUpdate {
    perusahaanId?: string;
    nama?: string;
    jabatan?: string;
    role?: "admin" | "staff";
    no_hp?: string;
    foto?: string | null;
}
