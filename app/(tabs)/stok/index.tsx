import { globalStyles } from "@/constants/styles";
import { db } from "@/services/firebase";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

export default function StokListScreen() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    // const { perusahaanId } = useLocalSearchParams(); // Ambil ID perusahaan dari URL
    const [perusahaanId, setPerusahaanId] = useState("");
    const [perusahaanList, setPerusahaanList] = useState<any[]>([]);

    useEffect(() => {
        if (!perusahaanId) return;

        setLoading(true);
        const stokRef = collection(
            db,
            "perusahaan",
            perusahaanId as string,
            "stok"
        );

        const unsubscribe = onSnapshot(stokRef, (snapshot) => {
            const stokList: any[] = [];
            snapshot.forEach((doc) => {
                stokList.push({ id: doc.id, ...doc.data() });
            });
            setData(stokList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [perusahaanId]);
    useEffect(() => {
        fetchPerusahaan();
    }, []);

    const fetchPerusahaan = async () => {
        try {
            const snapshot = await getDocs(collection(db, "perusahaan"));
            const list: any[] = [];
            snapshot.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() });
            });
            setPerusahaanList(list);
        } catch (error) {
            console.log("Error fetching perusahaan:", error);
        }
    };

    const renderItem = ({ item }: any) => (
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
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                refreshing={loading}
                onRefresh={() => {}}
                ListEmptyComponent={
                    <Text style={globalStyles.emptyText}>Belum ada produk</Text>
                }
            />
        </View>
    );
}
