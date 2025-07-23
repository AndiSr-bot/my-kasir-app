/* eslint-disable react-hooks/exhaustive-deps */
import {
    getPrimaryColor,
    getSecondaryColor,
    getWhiteColor,
} from "@/constants/Colors";
import { globalStyles } from "@/constants/styles";
import { db } from "@/services/firebase";
import { TRestock, TStokUpdate } from "@/types/stok_repositories";
import { useRouter } from "expo-router";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
interface Props {
    id: string;
    perusahaanId: string;
    kodeActiveTab: string;
}
export default function RestockStokTab({
    id,
    perusahaanId,
    kodeActiveTab,
}: Props) {
    const router = useRouter();
    const [nama, setNama] = useState("");
    const [harga, setHarga] = useState("");
    const [gambar, setGambar] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [dataRestock, setDataRestock] = useState<TRestock[]>([]);
    const [jumlah, setJumlah] = useState("");
    const [hargaBeli, setHargaBeli] = useState("");
    const [stokAwal, setStokAwal] = useState("");
    const [stokSisa, setStokSisa] = useState("");
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
                setHarga(data.harga);
                setGambar(data.gambar || null);
                setStokAwal(data.stok_awal);
                setStokSisa(data.stok_sisa);
                const restockTEMP: TRestock[] = [];
                for (let i = 0; i < data.restocks.length; i++) {
                    restockTEMP.push(data.restocks[i]);
                }
                const dateToEpoch = (date: string) => {
                    const [day, month, year] = date.split("/").map(Number);
                    const dateObj = new Date(year, month - 1, day);
                    return dateObj.getTime();
                };
                restockTEMP.sort((a, b) => {
                    const dateA = new Date(dateToEpoch(a.tanggal)).getTime();
                    const dateB = new Date(dateToEpoch(b.tanggal)).getTime();
                    return dateB - dateA;
                });
                setDataRestock(restockTEMP);
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
    const handleRestock = async () => {
        if (!jumlah || !hargaBeli) return alert("Semua field harus diisi.");
        setLoading(true);
        const now = new Date();
        const tahun = now.getFullYear();
        const bulan = String(now.getMonth() + 1).padStart(2, "0");
        const tanggal = String(now.getDate()).padStart(2, "0");
        try {
            const dataStok: TStokUpdate = {
                nama,
                harga: parseFloat(harga),
                stok_awal: parseInt(stokAwal) + parseInt(jumlah),
                stok_sisa: parseInt(stokSisa) + parseInt(jumlah),
                gambar: gambar || null,
                updated_at: serverTimestamp(),
                restocked_at: serverTimestamp(),
                restocks: [
                    ...dataRestock,
                    {
                        harga_beli: parseFloat(hargaBeli),
                        jumlah: parseInt(jumlah),
                        tanggal: `${tanggal}/${bulan}/${tahun}`,
                    },
                ],
            };
            await updateDoc(
                doc(
                    db,
                    "perusahaan",
                    perusahaanId as string,
                    "stok",
                    id as string
                ),
                {
                    ...dataStok,
                }
            );
            setJumlah("");
            setHargaBeli("");
            setModalVisible(false);
            fetchData();
        } catch (error) {
            console.log("Error add restock:", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (kodeActiveTab === "restock") fetchData();
    }, []);

    if (loading) {
        return (
            <ActivityIndicator
                size="large"
                color={getPrimaryColor()}
                style={{ marginTop: 20 }}
            />
        );
    }
    const renderItem = ({ item }: { item: TRestock }) => (
        <View
            style={[
                globalStyles.card,
                { flexDirection: "row", alignItems: "center" },
            ]}>
            <View>
                <Text style={globalStyles.title}>{item.tanggal}</Text>
                <Text>Jumlah: {item.jumlah}</Text>
                <Text>
                    Harga Beli: Rp {item.harga_beli.toLocaleString("id-ID")}
                </Text>
            </View>
        </View>
    );
    return (
        <View style={{ marginTop: 8 }}>
            {/* tombol restock */}
            <TouchableOpacity
                style={[
                    globalStyles.buttonPrimary,
                    { marginHorizontal: 15, marginVertical: 8, marginTop: 8 },
                ]}
                onPress={() => setModalVisible(true)}>
                <Text style={globalStyles.buttonText}>Restock</Text>
            </TouchableOpacity>

            <FlatList
                data={dataRestock}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                refreshing={loading}
                onRefresh={fetchData}
                ListEmptyComponent={
                    !loading ? (
                        <Text style={globalStyles.emptyText}>
                            {perusahaanId
                                ? "Belum ada produk"
                                : "Silahkan pilih perusahaan"}
                        </Text>
                    ) : (
                        <ActivityIndicator
                            size="large"
                            color={getPrimaryColor()}
                            style={{ marginTop: 20 }}
                        />
                    )
                }
            />
            <Modal visible={modalVisible} transparent animationType="slide">
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        justifyContent: "center",
                        padding: 20,
                    }}>
                    <View
                        style={{
                            backgroundColor: getWhiteColor(),
                            borderRadius: 10,
                            padding: 20,
                        }}>
                        {/* detail stok terpilih */}
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginTop: 10,
                                backgroundColor: getSecondaryColor(),
                                padding: 10,
                                borderRadius: 8,
                            }}>
                            <Image
                                source={
                                    gambar
                                        ? { uri: gambar }
                                        : require("@/assets/default-image.png")
                                }
                                style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 8,
                                    marginRight: 10,
                                    backgroundColor: getWhiteColor(),
                                }}
                            />
                            <View>
                                <Text style={globalStyles.title}>{nama}</Text>
                                <Text>
                                    Harga Jual: Rp
                                    {parseInt(harga).toLocaleString("id-ID")}
                                </Text>
                            </View>
                        </View>
                        <TextInput
                            placeholder="Jumlah"
                            value={jumlah}
                            keyboardType="numeric"
                            onChangeText={setJumlah}
                            style={[
                                globalStyles.input,
                                {
                                    marginTop: 10,
                                },
                            ]}
                        />
                        <TextInput
                            placeholder="Harga Beli"
                            value={hargaBeli}
                            keyboardType="numeric"
                            onChangeText={setHargaBeli}
                            style={[
                                globalStyles.input,
                                {
                                    marginVertical: 10,
                                },
                            ]}
                        />

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "flex-end",
                            }}>
                            <TouchableOpacity
                                style={globalStyles.buttonModalDanger}
                                onPress={() => setModalVisible(false)}>
                                <Text
                                    style={{
                                        color: getWhiteColor(),
                                        fontWeight: "bold",
                                    }}>
                                    Batal
                                </Text>
                            </TouchableOpacity>
                            <View style={{ width: 10 }} />
                            <TouchableOpacity
                                style={globalStyles.buttonModalPrimary}
                                onPress={handleRestock}>
                                <Text
                                    style={{
                                        color: getWhiteColor(),
                                        fontWeight: "bold",
                                    }}>
                                    Restock
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
