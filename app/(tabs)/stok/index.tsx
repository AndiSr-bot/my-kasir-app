/* eslint-disable react-hooks/exhaustive-deps */
import { globalStyles } from "@/constants/styles";
import { db } from "@/services/firebase";
import { TPerusahaan } from "@/types/perusahaan_repositories";
import { TStok } from "@/types/stok_repositories";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

export default function StokListScreen() {
    const router = useRouter();
    const [data, setData] = useState<TStok[]>([]);
    const [loading, setLoading] = useState(false);
    const [perusahaanId, setPerusahaanId] = useState("");
    const [perusahaanList, setPerusahaanList] = useState<TPerusahaan[]>([]);
    const fetchData = async () => {
        try {
            if (!perusahaanId) {
                setData([]);
            } else {
                setLoading(true);
                const querySnapshot = await getDocs(
                    collection(db, "perusahaan", perusahaanId, "stok")
                );
                const stokList: TStok[] = [];
                querySnapshot.forEach((doc) => {
                    stokList.push({
                        id: doc.id,
                        harga: doc.data().harga,
                        perusahaanId: doc.data().perusahaanId || perusahaanId,
                        nama: doc.data().nama,
                        no_barcode: doc.data().no_barcode,
                        stok_awal: doc.data().stok_awal,
                        stok_sisa: doc.data().stok_sisa,
                        stok_terjual: doc.data().stok_terjual,
                        created_at: doc.data().created_at,
                        gambar: doc.data().gambar,
                        updated_at: doc.data().updated_at,
                    });
                });
                setData(stokList);
            }
        } catch (error) {
            console.log("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [perusahaanId]);
    useFocusEffect(
        useCallback(() => {
            setPerusahaanId("");
            fetchData();
        }, [])
    );
    useEffect(() => {
        fetchPerusahaan();
    }, []);

    const fetchPerusahaan = async () => {
        try {
            const snapshot = await getDocs(collection(db, "perusahaan"));
            const list: TPerusahaan[] = [];
            snapshot.forEach((doc) => {
                list.push({
                    id: doc.id,
                    alamat: doc.data().alamat,
                    nama: doc.data().nama,
                    telepon: doc.data().telepon,
                    logo: doc.data().logo,
                });
            });
            setPerusahaanList(list);
        } catch (error) {
            console.log("Error fetching perusahaan:", error);
        }
    };

    const renderItem = ({ item }: { item: TStok }) => (
        <TouchableOpacity
            style={[
                globalStyles.card,
                { flexDirection: "row", alignItems: "center" },
            ]}
            onPress={() =>
                router.push(`/stok/${item.id}?perusahaanId=${perusahaanId}`)
            }>
            <Image
                source={
                    item.gambar
                        ? { uri: item.gambar }
                        : require("@/assets/default-image.png")
                }
                style={{
                    width: 50,
                    height: 50,
                    borderRadius: 8,
                    marginRight: 10,
                }}
            />
            <View>
                <Text style={globalStyles.title}>{item.nama}</Text>
                <Text>Harga: Rp {item.harga}</Text>
                <Text>
                    Stok: {item.stok_sisa} / {item.stok_awal}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={globalStyles.container}>
            <View
                style={[
                    globalStyles.input,
                    { padding: 0, height: 50, marginBottom: 12 },
                ]}>
                <Picker
                    selectedValue={perusahaanId}
                    onValueChange={setPerusahaanId}
                    style={{ color: "#000" }}>
                    <Picker.Item label="-- Pilih Perusahaan --" value="" />
                    {perusahaanList.map((item) => (
                        <Picker.Item
                            key={item.id}
                            label={item.nama}
                            value={item.id}
                        />
                    ))}
                </Picker>
            </View>
            <TouchableOpacity
                style={globalStyles.buttonPrimary}
                onPress={() =>
                    router.push(`/stok/tambah?perusahaanId=${perusahaanId}`)
                }>
                <Text style={globalStyles.buttonText}>+ Tambah Produk</Text>
            </TouchableOpacity>

            <FlatList
                data={data}
                keyExtractor={(item) => item.id || ""}
                renderItem={renderItem}
                refreshing={loading}
                onRefresh={() => {}}
                ListEmptyComponent={
                    <Text style={globalStyles.emptyText}>
                        {perusahaanId
                            ? "Belum ada produk"
                            : "Silahkan pilih perusahaan"}
                    </Text>
                }
            />
        </View>
    );
}
