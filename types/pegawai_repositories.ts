export interface TPegawai {
    id?: string;
    perusahaanId: string;
    nama: string;
    jabatan: string;
    role: "admin" | "admin_perusahaan" | "staff";
    no_hp: string;
    email: string;
    foto?: string | null;
}

export interface TPegawaiCreate {
    perusahaanId: string;
    nama: string;
    jabatan: string;
    role: "admin" | "admin_perusahaan" | "staff";
    no_hp: string;
    email: string;
    foto?: string | null;
}

export interface TPegawaiUpdate {
    perusahaanId?: string;
    nama?: string;
    jabatan?: string;
    role?: "admin" | "admin_perusahaan" | "staff";
    no_hp?: string;
    foto?: string | null;
}
