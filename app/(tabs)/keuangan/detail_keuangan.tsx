/* eslint-disable react-hooks/exhaustive-deps */
import { globalStyles } from "@/constants/styles";
import { namaBulan } from "@/constants/time";
import { db } from "@/services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function DetailKeuanganScreen() {
    const [tanggal, setTanggal] = useState("1");
    const [bulan, setBulan] = useState("Januari");
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());

    const [loading, setLoading] = useState(false);
    const [totalSales, setTotalSales] = useState(0);
    const [jumlahTransaksi, setJumlahTransaksi] = useState(0);
    const [jumlahProduk, setJumlahProduk] = useState(0);

    const tanggalOptions = Array.from({ length: 31 }, (_, i) =>
        (i + 1).toString()
    );
    const bulanOptions = namaBulan;
    const tahunOptions = Array.from({ length: 5 }, (_, i) =>
        (new Date().getFullYear() - i).toString()
    );

    const getNow = () => {
        const now = new Date();
        setTanggal(String(now.getDate()));
        setBulan(namaBulan[now.getMonth()]);
        setTahun(String(now.getFullYear()));
    };

    useEffect(() => {
        fetchData();
    }, [tanggal, bulan, tahun]);
    useEffect(() => {
        getNow();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const perusahaanId = await AsyncStorage.getItem("perusahaanId");
            if (!perusahaanId) return;

            const transaksiRef = collection(
                db,
                "perusahaan",
                perusahaanId,
                "transaksi"
            );
            const q = query(
                transaksiRef,
                where("tanggal", "==", tanggal),
                where("bulan", "==", bulan),
                where("tahun", "==", tahun)
            );

            const snapshot = await getDocs(q);
            let total = 0;
            let kodeSet = new Set();
            let jumlah = 0;

            snapshot.forEach((doc) => {
                const data = doc.data();
                total += (data.harga || 0) * (data.jumlah || 0);
                kodeSet.add(data.kode_transaksi);
                jumlah += 1;
            });

            setTotalSales(total);
            setJumlahTransaksi(kodeSet.size);
            setJumlahProduk(jumlah);
        } catch (error) {
            console.error("Error fetching transaksi:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View>
            {/* Picker Tanggal/Bulan/Tahun */}
            <View style={globalStyles.pickerRow}>
                <View
                    style={{
                        borderWidth: 1,
                        borderColor: "#ccc",
                        borderRadius: 8,
                    }}>
                    <Picker
                        selectedValue={tanggal}
                        onValueChange={(value) => setTanggal(value)}
                        style={globalStyles.picker}>
                        {tanggalOptions.map((t) => (
                            <Picker.Item key={t} label={t} value={t} />
                        ))}
                    </Picker>
                </View>

                <View
                    style={{
                        borderWidth: 1,
                        borderColor: "#ccc",
                        borderRadius: 8,
                    }}>
                    <Picker
                        selectedValue={bulan}
                        onValueChange={(value) => setBulan(value)}
                        style={globalStyles.picker}>
                        {bulanOptions.map((b) => (
                            <Picker.Item key={b} label={b} value={b} />
                        ))}
                    </Picker>
                </View>

                <View
                    style={{
                        borderWidth: 1,
                        borderColor: "#ccc",
                        borderRadius: 8,
                    }}>
                    <Picker
                        selectedValue={tahun}
                        onValueChange={(value) => setTahun(value)}
                        style={globalStyles.picker}>
                        {tahunOptions.map((y) => (
                            <Picker.Item key={y} label={y} value={y} />
                        ))}
                    </Picker>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            ) : (
                <>
                    {/* Card 1: Total Sales */}
                    <View style={globalStyles.cardFull}>
                        <Text style={globalStyles.cardTitle}>Total Sales</Text>
                        <Text style={globalStyles.cardValue}>
                            Rp {totalSales.toLocaleString()}
                        </Text>
                    </View>

                    {/* Card 2 & 3: Jumlah Transaksi & Jumlah Produk */}
                    <View style={globalStyles.rowCards}>
                        <View style={globalStyles.cardHalf}>
                            <Text style={globalStyles.cardTitle}>
                                Jumlah Transaksi
                            </Text>
                            <Text style={globalStyles.cardValue}>
                                {jumlahTransaksi}
                            </Text>
                        </View>
                        <View style={globalStyles.cardHalf}>
                            <Text style={globalStyles.cardTitle}>
                                Jumlah Produk
                            </Text>
                            <Text style={globalStyles.cardValue}>
                                {jumlahProduk}
                            </Text>
                        </View>
                    </View>
                </>
            )}
        </View>
    );
}
