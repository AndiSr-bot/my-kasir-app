export interface TPerusahaan {
    id?: string;
    nama: string;
    alamat: string;
    telepon: string;
    logo?: string | null;
}

export interface TPerusahaanCreate {
    nama: string;
    alamat: string;
    telepon: string;
    logo?: string | null;
}

export interface TPerusahaanUpdate {
    nama?: string;
    alamat?: string;
    telepon?: string;
    logo?: string | null;
}
