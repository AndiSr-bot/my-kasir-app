/* eslint-disable react-hooks/exhaustive-deps */
import { getSecondary2ndColor, getWhiteColor } from "@/constants/Colors";
import { globalStyles } from "@/constants/styles"; // jika sudah punya global style
import { namaBulan } from "@/constants/time";
import { db } from "@/services/firebase";
import { TRestock } from "@/types/stok_repositories";
import { TPembukuan } from "@/types/transaksi_repositories";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
// Contoh data dummy
const dummyData = [
    {
        id: "1",
        tanggal: "2025-07-21",
        jenis: "masuk",
        keterangan: "Penjualan Produk A",
        nominal: 150000,
    },
    {
        id: "2",
        tanggal: "2025-07-22",
        jenis: "keluar",
        keterangan: "Beli Bahan",
        nominal: 50000,
    },
    {
        id: "3",
        tanggal: "2025-07-23",
        jenis: "masuk",
        keterangan: "Penjualan Produk B",
        nominal: 100000,
    },
    // 10
    {
        id: "4",
        tanggal: "2025-07-24",
        jenis: "keluar",
        keterangan: "Beli Bahan",
        nominal: 30000,
    },
    {
        id: "5",
        tanggal: "2025-07-25",
        jenis: "masuk",
        keterangan: "Penjualan Produk C",
        nominal: 80000,
    },
    {
        id: "6",
        tanggal: "2025-07-26",
        jenis: "keluar",
        keterangan: "Beli Bahan",
        nominal: 20000,
    },
    {
        id: "7",
        tanggal: "2025-07-27",
        jenis: "masuk",
        keterangan: "Penjualan Produk D",
        nominal: 120000,
    },
    {
        id: "8",
        tanggal: "2025-07-28",
        jenis: "keluar",
        keterangan: "Beli Bahan",
        nominal: 40000,
    },
    {
        id: "9",
        tanggal: "2025-07-29",
        jenis: "masuk",
        keterangan: "Penjualan Produk E",
        nominal: 60000,
    },
    {
        id: "10",
        tanggal: "2025-07-30",
        jenis: "keluar",
        keterangan: "Beli Bahan",
        nominal: 10000,
    },
    {
        id: "11",
        tanggal: "2025-07-31",
        jenis: "masuk",
        keterangan: "Penjualan Produk F",
        nominal: 90000,
    },
    {
        id: "12",
        tanggal: "2025-08-01",
        jenis: "keluar",
        keterangan: "Beli Bahan",
        nominal: 50000,
    },
];

export default function DetailPembukuanScreen() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TPembukuan[]>([]);
    const [totalMasuk, setTotalMasuk] = useState(0);
    const [totalKeluar, setTotalKeluar] = useState(0);
    const [bulan, setBulan] = useState("Januari");
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());
    const [perusahaanId, setPerusahaanId] = useState("");
    const bulanOptions = namaBulan;
    const tahunOptions = Array.from({ length: 5 }, (_, i) =>
        (new Date().getFullYear() - i).toString()
    );
    const fetchData = async () => {
        setLoading(true);
        try {
            if (!perusahaanId) return;

            const transaksiRef = collection(
                db,
                "perusahaan",
                perusahaanId,
                "transaksi"
            );
            const q = query(
                transaksiRef,
                where("bulan", "==", bulan),
                where("tahun", "==", tahun)
            );

            const snapshot = await getDocs(q);
            let total = 0;
            const pemasukanTEMP: TPembukuan[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                total += (data.harga || 0) * (data.jumlah || 0);
                const indexBulan = namaBulan.findIndex(
                    (item) => item === data.bulan
                );
                pemasukanTEMP.push({
                    id: (pemasukanTEMP.length + 1).toString(),
                    tanggal: `${data.tanggal}/${(indexBulan + 1)
                        .toString()
                        .padStart(2, "0")}/${data.tahun}`,
                    jenis: "masuk",
                    keterangan: "Penjualan Produk " + data.nama,
                    nominal:
                        parseInt(data.harga || 0) * parseInt(data.jumlah || 0),
                });
            });

            const stokRef = query(
                collection(db, "perusahaan", perusahaanId, "stok")
                // where("restocked_at", "==", null)
            );
            const stokSnapshot = await getDocs(stokRef);
            stokSnapshot.forEach((doc) => {
                const data = doc.data();
                const restocks: TRestock[] = data.restocks;
                restocks.forEach((restock) => {
                    total -= restock.harga_beli;
                    pemasukanTEMP.push({
                        id: (pemasukanTEMP.length + 1).toString(),
                        tanggal: restock.tanggal,
                        jenis: "keluar",
                        keterangan: "Restock Produk " + data.nama,
                        nominal: restock.jumlah * restock.harga_beli,
                    });
                });
            });
            const dateToEpoch = (date: string) => {
                const [day, month, year] = date.split("/").map(Number);
                const dateObj = new Date(year, month - 1, day);
                return dateObj.getTime();
            };
            pemasukanTEMP.sort((a, b) => {
                const dateA = new Date(dateToEpoch(a.tanggal)).getTime();
                const dateB = new Date(dateToEpoch(b.tanggal)).getTime();
                return dateA - dateB;
            });
            setData(pemasukanTEMP);
            setTotalMasuk(total);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    const getNow = () => {
        const now = new Date();
        setBulan(namaBulan[now.getMonth()]);
        setTahun(String(now.getFullYear()));
    };
    const getUserData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem("user");
            if (jsonValue != null) {
                setPerusahaanId(JSON.parse(jsonValue).perusahaanId);
            }
        } catch (e) {
            console.log("Error loading user data", e);
        }
    };
    useEffect(() => {
        getNow();
        getUserData();
        fetchData();
    }, []);
    useEffect(() => {
        fetchData();
    }, [bulan, tahun]);
    // useEffect(() => {
    //     // Hitung total pemasukan & pengeluaran
    //     let masuk = 0;
    //     let keluar = 0;
    //     data.forEach((item) => {
    //         if (item.jenis === "masuk") masuk += item.nominal;
    //         else keluar += item.nominal;
    //     });
    //     setTotalMasuk(masuk);
    //     setTotalKeluar(keluar);
    // }, [data]);
    const renderItem = ({ item }: { item: (typeof dummyData)[0] }) => (
        <View style={styles.item}>
            <View style={{ flex: 1 }}>
                <Text style={styles.keterangan}>{item.keterangan}</Text>
                <Text style={styles.tanggal}>{item.tanggal}</Text>
            </View>
            <Text
                style={[
                    styles.nominal,
                    { color: item.jenis === "masuk" ? "green" : "red" },
                ]}>
                {item.jenis === "masuk" ? "+" : "-"} Rp{" "}
                {item.nominal.toLocaleString()}
            </Text>
        </View>
    );

    return (
        <View
            style={[
                globalStyles.container,
                { padding: 16, marginBottom: 100 },
            ]}>
            <View
                style={[
                    globalStyles.pickerRow,
                    {
                        gap: 10,
                        paddingBottom: 0,
                        justifyContent: "space-between",
                    },
                ]}>
                <View
                    style={{
                        borderWidth: 1,
                        borderColor: getSecondary2ndColor(),
                        borderRadius: 8,
                        backgroundColor: getWhiteColor(),
                    }}>
                    <Picker
                        selectedValue={bulan}
                        onValueChange={(value) => setBulan(value)}
                        style={[globalStyles.picker, { width: 160 }]}>
                        {bulanOptions.map((b) => (
                            <Picker.Item key={b} label={b} value={b} />
                        ))}
                    </Picker>
                </View>

                <View
                    style={{
                        borderWidth: 1,
                        borderColor: getSecondary2ndColor(),
                        borderRadius: 8,
                        backgroundColor: getWhiteColor(),
                    }}>
                    <Picker
                        selectedValue={tahun}
                        onValueChange={(value) => setTahun(value)}
                        style={[globalStyles.picker, { width: 150 }]}>
                        {tahunOptions.map((y) => (
                            <Picker.Item key={y} label={y} value={y} />
                        ))}
                    </Picker>
                </View>
            </View>
            {/* Ringkasan */}
            <View style={styles.summary}>
                <Text style={styles.summaryText}>
                    Masuk: Rp {totalMasuk.toLocaleString()}
                </Text>
                <Text style={styles.summaryText}>
                    Keluar: Rp {totalKeluar.toLocaleString()}
                </Text>
                <Text style={styles.summaryText}>
                    Saldo: Rp {(totalMasuk - totalKeluar).toLocaleString()}
                </Text>
            </View>

            {/* Daftar transaksi */}
            <View style={{ height: "75%" }}>
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    summary: {
        marginBottom: 15,
        padding: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        backgroundColor: "#f9f9f9",
    },
    summaryText: {
        fontSize: 16,
        marginBottom: 4,
    },
    item: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    keterangan: {
        fontSize: 16,
        fontWeight: "500",
    },
    tanggal: {
        fontSize: 12,
        color: "#888",
    },
    nominal: {
        fontSize: 16,
        fontWeight: "bold",
    },
});
