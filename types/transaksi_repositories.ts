export interface TTransaksi {
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
export interface TTransaksiCreate {
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

export interface TTransaksiGrouped {
    namaPerusahaan: string;
    tanggal: any;
    kode: string;
    total: string;
    transaksi: TTransaksi[];
}
