/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import {
    getDangerColor,
    getPrimaryColor,
    getSecondary2ndColor,
    getSecondaryColor,
    getSuccessColor,
    getWhiteColor,
} from "@/constants/Colors";
import { globalStyles } from "@/constants/styles"; // jika sudah punya global style
import { namaBulan } from "@/constants/time";
import { db } from "@/services/firebase";
import { TRestock } from "@/types/stok_repositories";
import { TPembukuan } from "@/types/transaksi_repositories";
import { Picker } from "@react-native-picker/picker";
import {
    collection,
    getDocs,
    query,
    Timestamp,
    where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    View,
} from "react-native";
interface Props {
    kodeActiveTab: string;
    perusahaanId: string;
}
export default function DetailPembukuanScreen({
    kodeActiveTab,
    perusahaanId,
}: Props) {
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<TPembukuan[]>([]);
    const [totalMasuk, setTotalMasuk] = useState<number>(0);
    const [totalKeluar, setTotalKeluar] = useState<number>(0);
    const [bulan, setBulan] = useState<string>("Januari");
    const [tahun, setTahun] = useState<string>(
        new Date().getFullYear().toString()
    );
    const [timestampAwalBulan, setTimestampAwalBulan] = useState<any>(null);

    const bulanOptions: string[] = namaBulan;
    const tahunOptions: string[] = Array.from({ length: 5 }, (_, i) =>
        (new Date().getFullYear() - i).toString()
    );
    const fetchData = async () => {
        setLoading(true);
        try {
            if (!perusahaanId) return;
            const pembukuanTEMP: TPembukuan[] = [];

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
            let totalMasuk = 0;
            snapshot.forEach((doc) => {
                const data = doc.data();
                totalMasuk += (data.harga || 0) * (data.jumlah || 0);
                const indexBulan = namaBulan.findIndex(
                    (item) => item === data.bulan
                );
                pembukuanTEMP.push({
                    id: (pembukuanTEMP.length + 1).toString(),
                    tanggal: `${data.tanggal}/${(indexBulan + 1)
                        .toString()
                        .padStart(2, "0")}/${data.tahun}`,
                    jenis: "masuk",
                    keterangan: "Penjualan Produk " + data.nama,
                    harga: parseInt(data.harga || 0),
                    jumlah: parseInt(data.jumlah || 0),
                    nominal:
                        parseInt(data.harga || 0) * parseInt(data.jumlah || 0),
                });
            });

            const stokRef = query(
                collection(db, "perusahaan", perusahaanId, "stok"),
                where("restocked_at", ">", timestampAwalBulan)
            );
            const stokSnapshot = await getDocs(stokRef);
            let totalKeluar = 0;
            stokSnapshot.forEach((doc) => {
                const data = doc.data();
                const restocks: TRestock[] = data.restocks;
                restocks.forEach((restock) => {
                    const [day, month, year] = restock.tanggal
                        .split("/")
                        .map(Number);
                    const indexBulan = namaBulan.findIndex(
                        (item) => item === bulan
                    );
                    if (indexBulan === month - 1 && year === parseInt(tahun)) {
                        totalKeluar += restock.harga_beli;
                        pembukuanTEMP.push({
                            id: (pembukuanTEMP.length + 1).toString(),
                            tanggal: restock.tanggal,
                            jenis: "keluar",
                            keterangan: "Restock Produk " + data.nama,
                            harga: restock.harga_beli,
                            jumlah: restock.jumlah,
                            nominal: restock.jumlah * restock.harga_beli,
                        });
                    }
                });
            });
            const dateToEpoch = (date: string) => {
                const [day, month, year] = date.split("/").map(Number);
                const dateObj = new Date(year, month - 1, day);
                return dateObj.getTime();
            };
            pembukuanTEMP.sort((a, b) => {
                const dateA = new Date(dateToEpoch(a.tanggal)).getTime();
                const dateB = new Date(dateToEpoch(b.tanggal)).getTime();
                return dateB - dateA;
            });
            setData(pembukuanTEMP);
            setTotalMasuk(totalMasuk);
            setTotalKeluar(totalKeluar);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };
    const getNow = () => {
        const now = new Date();
        setBulan(namaBulan[now.getMonth()]);
        setTahun(String(now.getFullYear()));
        const awalBulan = new Date(
            now.getFullYear(),
            now.getMonth(),
            1,
            0,
            1,
            0
        );
        setTimestampAwalBulan(Timestamp.fromDate(awalBulan));
    };

    useEffect(() => {
        if (kodeActiveTab === "pembukuan") {
            getNow();
            fetchData();
        }
    }, []);
    useEffect(() => {
        fetchData();
    }, [bulan, tahun]);
    useEffect(() => {
        if (perusahaanId) fetchData();
    }, [perusahaanId]);
    const renderItem = ({ item }: { item: TPembukuan }) => (
        <>
            <View style={globalStyles.item}>
                <View style={{ flex: 1 }}>
                    <Text style={globalStyles.keterangan}>
                        {item.keterangan}
                    </Text>
                    <Text style={globalStyles.tanggal}>{item.tanggal}</Text>
                    <Text style={globalStyles.tanggal}>
                        Jumlah : {item.jumlah}, @
                        {item.harga.toLocaleString("id-ID")}
                    </Text>
                </View>
                <Text
                    style={[
                        globalStyles.nominal,
                        { color: item.jenis === "masuk" ? "green" : "red" },
                    ]}>
                    {item.jenis === "masuk" ? "+" : "-"} Rp{" "}
                    {item.nominal.toLocaleString()}
                </Text>
            </View>
            <View
                style={{
                    height: 1,
                    backgroundColor: getSecondary2ndColor(),
                }}
            />
        </>
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
            <View style={globalStyles.summary}>
                <View>
                    <Text style={globalStyles.summaryText}>Uang Masuk</Text>
                    <Text style={globalStyles.summaryText}>Uang Keluar</Text>
                    <Text style={globalStyles.summaryText}>Saldo</Text>
                </View>
                <View>
                    <Text style={globalStyles.summaryText}>:</Text>
                    <Text style={globalStyles.summaryText}>:</Text>
                    <Text style={globalStyles.summaryText}>:</Text>
                </View>
                <View>
                    <Text
                        style={[
                            globalStyles.summaryText,
                            { textAlign: "right", color: getSuccessColor() },
                        ]}>
                        Rp{" "}
                        {loading ? (
                            <ActivityIndicator
                                size="small"
                                color={getSecondaryColor()}
                            />
                        ) : (
                            totalMasuk.toLocaleString("id-ID")
                        )}
                    </Text>
                    <Text
                        style={[
                            globalStyles.summaryText,
                            { textAlign: "right", color: getDangerColor() },
                        ]}>
                        Rp{" "}
                        {loading ? (
                            <ActivityIndicator
                                size="small"
                                color={getSecondaryColor()}
                            />
                        ) : (
                            totalKeluar.toLocaleString("id-ID")
                        )}
                    </Text>
                    <Text
                        style={[
                            globalStyles.summaryText,
                            { textAlign: "right", color: getPrimaryColor() },
                        ]}>
                        Rp{" "}
                        {loading ? (
                            <ActivityIndicator
                                size="small"
                                color={getSecondaryColor()}
                            />
                        ) : (
                            (totalMasuk - totalKeluar).toLocaleString("id-ID")
                        )}
                    </Text>
                </View>
            </View>

            {/* Daftar transaksi */}
            <View style={{ height: "75%" }}>
                {loading ? (
                    <ActivityIndicator size="large" color={getPrimaryColor()} />
                ) : (
                    <FlatList
                        data={data}
                        refreshControl={
                            <RefreshControl
                                refreshing={loading}
                                onRefresh={fetchData}
                            />
                        }
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </View>
        </View>
    );
}
