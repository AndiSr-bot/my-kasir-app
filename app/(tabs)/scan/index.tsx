import { globalStyles } from "@/constants/styles";
import { namaBulan, namaHari } from "@/constants/time";
import { db } from "@/services/firebase";
import { TKeranjang } from "@/types/keranjang_repositories";
import { TStok } from "@/types/stok_repositories";
import { TKeranjangCreate } from "@/types/transaksi_repositories";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { CameraView } from "expo-camera";
import {
    addDoc,
    collection,
    getDocs,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function ScanScreen() {
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    const [perusahaanId, setPerusahaanId] = useState("");
    const [keranjang, setKeranjang] = useState<TKeranjang[]>([]);
    const [bayarModalVisible, setBayarModalVisible] = useState(false);
    const [stokList, setStokList] = useState<TStok[]>([]);
    const [selectedStok, setSelectedStok] = useState<TStok | null>(null);
    const [jumlah, setJumlah] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [namaToko, setNamaToko] = useState("Nama Toko");
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editJumlah, setEditJumlah] = useState("");

    const generateKodeTransaksi = () => {
        const now = new Date();
        const tahun = now.getFullYear();
        const bulan = String(now.getMonth() + 1).padStart(2, "0");
        const tanggal = String(now.getDate()).padStart(2, "0");
        const random = Math.floor(1000 + Math.random() * 9000); // 4 angka acak
        return `TR-${tahun}${bulan}${tanggal}${random}`;
    };
    const handleBayar = async () => {
        try {
            setLoading(true);
            const now = new Date();
            const hari = namaHari[now.getDay()];
            const tanggal = String(now.getDate()).padStart(2, "0");
            const bulan = namaBulan[now.getMonth()];
            const tahun = now.getFullYear();
            const kode = generateKodeTransaksi();

            for (const item of keranjang) {
                const data: TKeranjangCreate = {
                    perusahaanId,
                    stokId: item.stokId,
                    nama: item.nama,
                    harga: item.harga,
                    jumlah: item.jumlah,
                    gambar: item.gambar || null,
                    hari,
                    tanggal,
                    bulan,
                    tahun: tahun.toString(),
                    kode,
                    created_at: serverTimestamp(),
                    updated_at: serverTimestamp(),
                };

                await addDoc(
                    collection(db, "perusahaan", perusahaanId, "transaksi"),
                    data
                );
            }

            Alert.alert("Pembayaran Berhasil", `Transaksi ${kode} tersimpan!`);
            setKeranjang([]);
            setBayarModalVisible(false);
            setLoading(false);
        } catch (error) {
            console.log("Error simpan transaksi:", error);
            Alert.alert("Error", "Gagal menyimpan transaksi.");
        }
    };

    const getUserData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem("user");
            if (jsonValue != null) {
                setPerusahaanId(JSON.parse(jsonValue).perusahaanId);
                setNamaToko(
                    JSON.parse(jsonValue).perusahaan.nama || "Nama Toko"
                );
            }
        } catch (e) {
            console.log("Error loading user data", e);
        }
    };

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (!scanned && perusahaanId) {
            setSelectedStok(null);
            setModalVisible(true);
            setScanned(true);
            setStokList([]);
            setJumlah("");
            const q = query(
                collection(db, "perusahaan", perusahaanId, "stok"),
                where("no_barcode", "==", data)
            );
            const querySnapshot = await getDocs(q);
            const stokResult: TStok[] = [];
            querySnapshot.forEach((doc) => {
                stokResult.push({
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

            if (stokResult.length > 0) {
                setStokList(stokResult);
                setSelectedStok(stokResult[0]);
                setJumlah("");
            } else {
                setScanned(false);
                setModalVisible(false);
                Alert.alert("Produk tidak ditemukan", `Barcode: ${data}`);
            }
        }
    };

    const handleTambahKeranjang = () => {
        if (!selectedStok || !jumlah) {
            Alert.alert("Error", "Pilih produk dan isi jumlah");
            return;
        }

        const qty = parseInt(jumlah);
        if (isNaN(qty) || qty <= 0) {
            Alert.alert("Error", "Jumlah harus lebih dari 0");
            return;
        }

        setKeranjang((prev) => {
            const existingIndex = prev.findIndex(
                (item) =>
                    item.stokId === selectedStok.id &&
                    item.nama === selectedStok.nama
            );
            if (existingIndex !== -1) {
                const updated = [...prev];
                updated[existingIndex].jumlah += qty;
                return updated;
            } else {
                return [
                    ...prev,
                    {
                        jumlah: qty,
                        harga: selectedStok.harga,
                        nama: selectedStok.nama,
                        perusahaanId: selectedStok.perusahaanId,
                        stokId: selectedStok.id || "",
                        gambar: selectedStok.gambar,
                    },
                ];
            }
        });

        setModalVisible(false);
        setScanned(false);
    };

    const handleHapusItem = (index: number) => {
        Alert.alert("Konfirmasi", "Yakin ingin menghapus item?", [
            { text: "Batal", style: "cancel" },
            {
                text: "Hapus",
                style: "destructive",
                onPress: async () => {
                    setKeranjang((prev) => prev.filter((_, i) => i !== index));
                },
            },
        ]);
    };

    const handleEditJumlah = () => {
        if (editIndex === null) return;
        const qty = parseInt(editJumlah);
        if (isNaN(qty) || qty <= 0) {
            Alert.alert("Error", "Jumlah harus lebih dari 0");
            return;
        }
        setKeranjang((prev) => {
            const updated = [...prev];
            updated[editIndex].jumlah = qty;
            return updated;
        });
        setEditModalVisible(false);
    };

    const totalKeseluruhan = keranjang.reduce(
        (sum, item) => sum + item.jumlah * item.harga,
        0
    );

    useEffect(() => {
        getUserData();
    }, []);

    return (
        <View style={globalStyles.container}>
            {!bayarModalVisible && !editModalVisible && !modalVisible ? (
                <CameraView
                    style={{ height: 100, marginBottom: 10, marginTop: 30 }}
                    onBarcodeScanned={handleBarCodeScanned}
                />
            ) : (
                <View style={{ marginTop: 20 }}></View>
            )}
            {/* Total Keseluruhan */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginVertical: 10,
                }}>
                <Text style={[globalStyles.title, {}]}>
                    Total: Rp{totalKeseluruhan.toLocaleString("id-ID")}
                </Text>
                <TouchableOpacity
                    style={[
                        globalStyles.buttonModalPrimary,
                        {
                            marginVertical: 10,
                            paddingHorizontal: 20,
                            paddingVertical: 5,
                            borderRadius: 8,
                        },
                    ]}
                    onPress={() => {
                        if (keranjang.length === 0) {
                            Alert.alert(
                                "Keranjang kosong",
                                "Tambahkan produk terlebih dahulu."
                            );
                            return;
                        }
                        setBayarModalVisible(true);
                    }}>
                    <Text
                        style={{
                            color: "#fff",
                            fontSize: 16,
                            fontWeight: "bold",
                            textAlign: "center",
                        }}>
                        Bayar
                    </Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={[globalStyles.container, { padding: 0 }]}>
                {keranjang.map((item, idx) => (
                    <TouchableOpacity
                        key={idx}
                        style={[
                            globalStyles.card,
                            {
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                            },
                        ]}
                        onPress={() => {
                            setEditIndex(idx);
                            setEditJumlah(item.jumlah.toString());
                            setEditModalVisible(true);
                        }}>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                            }}>
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
                                    backgroundColor: "#fff",
                                }}
                            />
                            <View>
                                <Text style={globalStyles.title}>
                                    {item.nama}
                                </Text>
                                <Text>
                                    {item.jumlah} x Rp
                                    {item.harga.toLocaleString("id-ID")} = Rp
                                    {(item.jumlah * item.harga).toLocaleString(
                                        "id-ID"
                                    )}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={{ marginRight: 10 }}
                            onPress={() => handleHapusItem(idx)}>
                            {/* <Text style={{ color: "red", fontWeight: "bold" }}>
                                Hapus
                            </Text> */}
                            <Ionicons name="trash" color="red" size={20} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            {/* Modal Tambah */}
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
                            backgroundColor: "#fff",
                            borderRadius: 10,
                            padding: 20,
                        }}>
                        <Text style={globalStyles.title}>Pilih Produk</Text>
                        <Picker
                            selectedValue={selectedStok?.id}
                            enabled={stokList.length > 1}
                            onValueChange={(itemValue) => {
                                const stok = stokList.find(
                                    (s) => s.id === itemValue
                                );
                                if (stok) setSelectedStok(stok);
                            }}>
                            {stokList.map((stok) => (
                                <Picker.Item
                                    key={stok.id}
                                    label={stok.nama + " @Rp." + stok.harga}
                                    value={stok.id}
                                />
                            ))}
                        </Picker>

                        <TextInput
                            placeholder="Jumlah"
                            value={jumlah}
                            keyboardType="numeric"
                            onChangeText={setJumlah}
                            style={{
                                borderWidth: 1,
                                borderColor: "#ccc",
                                borderRadius: 6,
                                padding: 10,
                                marginVertical: 10,
                            }}
                        />

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "flex-end",
                            }}>
                            <TouchableOpacity
                                style={globalStyles.buttonModalDanger}
                                onPress={() => {
                                    setModalVisible(false);
                                    setScanned(false);
                                }}>
                                <Text
                                    style={{
                                        color: "#fff",
                                        fontWeight: "bold",
                                    }}>
                                    Batal
                                </Text>
                            </TouchableOpacity>
                            <View style={{ width: 10 }} />
                            <TouchableOpacity
                                style={globalStyles.buttonModalPrimary}
                                onPress={handleTambahKeranjang}>
                                <Text
                                    style={{
                                        color: "#fff",
                                        fontWeight: "bold",
                                    }}>
                                    Masukkan
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* Modal Edit */}
            <Modal visible={editModalVisible} transparent animationType="slide">
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        justifyContent: "center",
                        padding: 20,
                    }}>
                    <View
                        style={{
                            backgroundColor: "#fff",
                            borderRadius: 10,
                            padding: 20,
                        }}>
                        <Text style={globalStyles.title}>Edit Jumlah</Text>
                        <TextInput
                            placeholder="Jumlah"
                            value={editJumlah}
                            keyboardType="numeric"
                            onChangeText={setEditJumlah}
                            style={{
                                borderWidth: 1,
                                borderColor: "#ccc",
                                borderRadius: 6,
                                padding: 10,
                                marginVertical: 10,
                            }}
                        />

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "flex-end",
                            }}>
                            <TouchableOpacity
                                style={globalStyles.buttonModalDanger}
                                onPress={() => setEditModalVisible(false)}>
                                <Text
                                    style={{
                                        color: "#fff",
                                        fontWeight: "bold",
                                    }}>
                                    Batal
                                </Text>
                            </TouchableOpacity>
                            <View style={{ width: 10 }} />
                            <TouchableOpacity
                                style={globalStyles.buttonModalPrimary}
                                onPress={handleEditJumlah}>
                                <Text
                                    style={{
                                        color: "#fff",
                                        fontWeight: "bold",
                                    }}>
                                    Simpan
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* Modal Bayar */}
            <Modal
                visible={bayarModalVisible}
                transparent
                animationType="slide">
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        justifyContent: "center",
                        padding: 20,
                    }}>
                    <View
                        style={{
                            backgroundColor: "#fff",
                            borderRadius: 10,
                            padding: 20,
                            maxHeight: "80%",
                        }}>
                        {/* HEADER STRUK */}
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                textAlign: "center",
                                marginBottom: 4,
                            }}>
                            {namaToko}
                        </Text>
                        <Text
                            style={{
                                fontSize: 12,
                                textAlign: "center",
                                marginBottom: 10,
                            }}>
                            {new Date().toLocaleString("id-ID", {
                                dateStyle: "medium",
                                timeStyle: "short",
                            })}
                        </Text>
                        <Text
                            style={{
                                fontSize: 12,
                                textAlign: "center",
                                marginBottom: 15,
                            }}>
                            ID Transaksi: {generateKodeTransaksi()}
                        </Text>

                        {/* DETAIL BELANJA */}
                        <ScrollView style={{ marginBottom: 20 }}>
                            {keranjang.map((item, idx) => (
                                <View
                                    key={idx}
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        marginBottom: 5,
                                    }}>
                                    <Text>
                                        {item.nama} ({item.jumlah}x) @ Rp{" "}
                                        {item.harga.toLocaleString("id-ID")}
                                    </Text>
                                    <Text>
                                        Rp{" "}
                                        {(
                                            item.jumlah * item.harga
                                        ).toLocaleString("id-ID")}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>

                        {/* TOTAL */}
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                marginBottom: 15,
                                textAlign: "right",
                            }}>
                            Total: Rp {totalKeseluruhan.toLocaleString("id-ID")}
                        </Text>

                        {/* ACTION BUTTONS */}
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "flex-end",
                            }}>
                            {loading ? (
                                <>
                                    <TouchableOpacity
                                        disabled={true}
                                        style={
                                            globalStyles.buttonModalSecondary
                                        }>
                                        <Text
                                            style={{
                                                color: "#fff",
                                                fontWeight: "bold",
                                            }}>
                                            Batal
                                        </Text>
                                    </TouchableOpacity>
                                    <View style={{ width: 10 }} />
                                    <TouchableOpacity
                                        disabled={true}
                                        style={
                                            globalStyles.buttonModalSecondary
                                        }>
                                        <Text
                                            style={{
                                                color: "#fff",
                                                fontWeight: "bold",
                                            }}>
                                            Loading...
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        style={globalStyles.buttonModalDanger}
                                        onPress={() =>
                                            setBayarModalVisible(false)
                                        }>
                                        <Text
                                            style={{
                                                color: "#fff",
                                                fontWeight: "bold",
                                            }}>
                                            Batal
                                        </Text>
                                    </TouchableOpacity>
                                    <View style={{ width: 10 }} />
                                    <TouchableOpacity
                                        style={globalStyles.buttonModalPrimary}
                                        onPress={handleBayar}>
                                        <Text
                                            style={{
                                                color: "#fff",
                                                fontWeight: "bold",
                                            }}>
                                            Konfirmasi Bayar
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
