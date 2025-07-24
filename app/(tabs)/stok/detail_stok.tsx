/* eslint-disable react-hooks/exhaustive-deps */
import { getPrimaryColor } from "@/constants/Colors";
import { globalStyles } from "@/constants/styles";
import { db } from "@/services/firebase";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from "react-native";
interface Props {
    id: string;
    perusahaanId: string;
    kodeActiveTab: string;
}
export default function DetailStokTab({
    id,
    perusahaanId,
    kodeActiveTab,
}: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [nama, setNama] = useState("");
    const [harga, setHarga] = useState("");
    const [stokAwal, setStokAwal] = useState("");
    const [stokSisa, setStokSisa] = useState("");
    const [stokTerjual, setStokTerjual] = useState(0);
    const [barcode, setBarcode] = useState("");
    const [gambar, setGambar] = useState<string | null>(null);

    useEffect(() => {
        if (kodeActiveTab === "detail") fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const docRef = doc(
                db,
                "perusahaan",
                perusahaanId as string,
                "stok",
                id as string
            );
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setNama(data.nama);
                setHarga(data.harga.toString());
                setStokAwal(data.stok_awal);
                setStokSisa(data.stok_sisa);
                setStokTerjual(data.stok_terjual);
                setBarcode(data.no_barcode);
                setGambar(data.gambar || null);
            } else {
                Alert.alert("Error", "Produk tidak ditemukan");
                router.back();
            }
        } catch (error) {
            console.log("Error fetch:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ActivityIndicator
                size="large"
                color={getPrimaryColor()}
                style={{ marginTop: 20 }}
            />
        );
    }
    return (
        <ScrollView
            style={globalStyles.container}
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={fetchData} />
            }>
            <View
                style={{
                    alignItems: "center",
                }}>
                <Image
                    source={
                        gambar
                            ? { uri: gambar }
                            : require("@/assets/default-image.png")
                    }
                    style={globalStyles.imagePreview}
                />
            </View>
            <View style={globalStyles.stokRow}>
                <View style={globalStyles.stokItem}>
                    <Text style={globalStyles.stokLabel}>Stok Awal</Text>
                    <Text style={globalStyles.stokValue}>{stokAwal}</Text>
                </View>
                <View style={globalStyles.stokItem}>
                    <Text style={globalStyles.stokLabel}>Stok Sisa</Text>
                    <Text style={globalStyles.stokValue}>{stokSisa}</Text>
                </View>
                <View style={globalStyles.stokItem}>
                    <Text style={globalStyles.stokLabel}>Terjual</Text>
                    <Text style={globalStyles.stokValue}>{stokTerjual}</Text>
                </View>
            </View>

            {/* Nama Produk */}
            <Text style={globalStyles.label}>Nama Produk</Text>
            <View style={[globalStyles.input, { borderWidth: 0 }]}>
                <Text>{nama}</Text>
            </View>

            {/* Harga */}
            <Text style={globalStyles.label}>Harga</Text>
            <View style={[globalStyles.input, { borderWidth: 0 }]}>
                <Text>{harga}</Text>
            </View>

            {/* Barcode */}
            <Text style={globalStyles.label}>No Barcode</Text>
            <View style={[globalStyles.input, { borderWidth: 0 }]}>
                <Text>{barcode}</Text>
            </View>
        </ScrollView>
    );
}
