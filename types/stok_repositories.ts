export interface TStok {
    id?: string;
    perusahaanId: string;
    nama: string;
    harga: number;
    stok_awal: number;
    stok_terjual: number;
    stok_sisa: number;
    no_barcode: string;
    gambar?: string | null;
    restocks?: TRestock[];
    created_at?: any;
    updated_at?: any;
    restocked_at?: any;
}
export interface TStokCreate {
    perusahaanId: string;
    nama: string;
    harga: number;
    stok_awal: number;
    stok_terjual: number;
    stok_sisa: number;
    no_barcode: string;
    gambar?: string | null;
    created_at: any;
    updated_at: any;
    restocked_at: any;
    restocks: TRestock[];
}
export interface TStokUpdate {
    nama?: string;
    harga?: number;
    stok_awal?: number;
    stok_sisa?: number;
    stok_terjual?: number;
    gambar?: string | null;
    updated_at?: any;
    restocked_at?: any;
    restocks?: TRestock[];
}
export interface TRestock {
    tanggal: string;
    jumlah: number;
    harga_beli: number;
}
