export interface TKeranjang {
    id?: string;
    perusahaanId: string;
    stokId: string;
    nama: string;
    harga: number;
    jumlah: number;
    gambar?: string | null;
    hari: string;
    tanggal: string;
    bulan: string;
    tahun: string;
    kode: string;
    created_at?: any;
    updated_at?: any;
}
export interface TKeranjangCreate {
    perusahaanId: string;
    stokId: string;
    nama: string;
    harga: number;
    jumlah: number;
    gambar?: string | null;
    hari: string;
    tanggal: string;
    bulan: string;
    tahun: string;
    kode: string;
    created_at: any;
    updated_at: any;
}
