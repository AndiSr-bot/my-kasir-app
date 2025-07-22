import {
    getPrimaryColor,
    getSecondary2ndColor,
    getSecondaryColor,
    getWhiteColor,
} from "@/constants/Colors";
import { globalStyles } from "@/constants/styles";
import { namaBulan, namaHari } from "@/constants/time";
import { db } from "@/services/firebase";
import { TKeranjang } from "@/types/keranjang_repositories";
import { TStok, TStokUpdate } from "@/types/stok_repositories";
import { TTransaksiCreate } from "@/types/transaksi_repositories";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { CameraView } from "expo-camera";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
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
    const [refreshCamera, setRefreshCamera] = useState(true);

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
                const data: TTransaksiCreate = {
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
                const stokRef = doc(
                    db,
                    "perusahaan",
                    perusahaanId,
                    "stok",
                    item.stokId
                );
                const stokSnap = await getDoc(stokRef);

                if (stokSnap.exists()) {
                    const stokData: TStokUpdate = {
                        stok_sisa: stokSnap.data().stok_sisa,
                        stok_terjual: stokSnap.data().stok_terjual,
                    };
                    const stokTerjual =
                        (stokData.stok_terjual || 0) + item.jumlah;
                    const stokSisa = (stokData.stok_sisa || 0) - item.jumlah;

                    await updateDoc(stokRef, {
                        stok_terjual: stokTerjual,
                        stok_sisa: Math.max(stokSisa, 0),
                        updated_at: serverTimestamp(),
                    });
                }
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
            setScanned(true);
            setStokList([]);
            setJumlah("");
            const q = query(
                collection(db, "perusahaan", perusahaanId, "stok"),
                where("no_barcode", "==", data),
                orderBy("nama", "asc")
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
                setModalVisible(true);
                setStokList(stokResult);
                setSelectedStok(stokResult[0]);
                setJumlah("");
            } else {
                setRefreshCamera(true);
                Alert.alert("Produk tidak ditemukan", `Barcode: ${data}`, [
                    {
                        text: "OK",
                        onPress: () => {
                            setScanned(false);
                            setRefreshCamera(false);
                        },
                    },
                ]);
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
        setRefreshCamera(true);
        Alert.alert("Konfirmasi", "Yakin ingin menghapus item?", [
            {
                text: "Batal",
                style: "cancel",
                onPress: () => setRefreshCamera(false),
            },
            {
                text: "Hapus",
                style: "destructive",
                onPress: async () => {
                    setKeranjang((prev) => prev.filter((_, i) => i !== index));
                    setRefreshCamera(false);
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
        setTimeout(() => {
            setRefreshCamera(false);
        }, 500);
    }, []);

    return (
        <>
            <View style={globalStyles.container}>
                {!bayarModalVisible &&
                !editModalVisible &&
                !modalVisible &&
                !refreshCamera ? (
                    <TouchableOpacity
                        style={{ height: 100, marginBottom: 10, marginTop: 0 }}
                        onPress={() => {
                            setRefreshCamera(true);
                            setTimeout(() => {
                                setRefreshCamera(false);
                            }, 500);
                        }}>
                        <CameraView
                            style={{
                                height: 100,
                                // marginBottom: 10,
                                marginTop: 20,
                            }}
                            onBarcodeScanned={handleBarCodeScanned}
                        />
                        <Text
                            style={{
                                color: "red",
                                fontSize: 9,
                                textAlign: "right",
                            }}>
                            * sentuh kamera jika tidak muncul
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View
                        style={{
                            marginTop: 20,
                            marginBottom: -10,
                            height: 100,
                            backgroundColor: getSecondary2ndColor(),
                        }}>
                        <ActivityIndicator
                            size="large"
                            color={getPrimaryColor()}
                            style={{ marginTop: 30 }}
                        />
                    </View>
                )}
                {/* Total Keseluruhan */}
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginVertical: 15,
                    }}>
                    <Text style={[globalStyles.title, {}]}>
                        Total: Rp {totalKeseluruhan.toLocaleString("id-ID")}
                    </Text>
                    <TouchableOpacity
                        style={[
                            globalStyles.buttonModalPrimary,
                            {
                                marginVertical: 10,
                                paddingHorizontal: 15,
                                paddingVertical: 5,
                                borderRadius: 6,
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
                                color: getWhiteColor(),
                                fontSize: 16,
                                fontWeight: "bold",
                                textAlign: "center",
                            }}>
                            Bayar ({keranjang.length})
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={globalStyles.containerCard}>
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
                                        backgroundColor: getWhiteColor(),
                                    }}
                                />
                                <View>
                                    <Text style={globalStyles.title}>
                                        {item.nama}
                                    </Text>
                                    <Text>
                                        {item.jumlah} x Rp
                                        {item.harga.toLocaleString("id-ID")} =
                                        Rp
                                        {(
                                            item.jumlah * item.harga
                                        ).toLocaleString("id-ID")}
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
                                backgroundColor: getWhiteColor(),
                                borderRadius: 10,
                                padding: 20,
                            }}>
                            <Text
                                style={[
                                    globalStyles.title,
                                    { marginBottom: 10 },
                                ]}>
                                Pilih Produk
                            </Text>
                            <View
                                style={[
                                    globalStyles.input,
                                    { padding: 0, height: 50 },
                                ]}>
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
                                            label={
                                                stok.nama +
                                                " @Rp." +
                                                stok.harga.toLocaleString(
                                                    "id-ID"
                                                )
                                            }
                                            value={stok.id}
                                        />
                                    ))}
                                </Picker>
                            </View>

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
                                        selectedStok?.gambar
                                            ? { uri: selectedStok.gambar }
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
                                    <Text style={globalStyles.title}>
                                        {selectedStok?.nama}
                                    </Text>
                                    <Text>
                                        Harga: Rp
                                        {selectedStok?.harga.toLocaleString(
                                            "id-ID"
                                        )}
                                    </Text>
                                    <Text>
                                        Stok: {selectedStok?.stok_sisa} /{" "}
                                        {selectedStok?.stok_awal}
                                    </Text>
                                </View>
                            </View>
                            <TextInput
                                placeholder="Jumlah"
                                value={jumlah}
                                keyboardType="numeric"
                                onChangeText={(e) => {
                                    if (
                                        selectedStok &&
                                        parseInt(e) > selectedStok.stok_sisa
                                    ) {
                                        Alert.alert(
                                            "Error",
                                            "Jumlah melebihi stok tersedia"
                                        );
                                        setJumlah("");
                                    } else {
                                        setJumlah(e);
                                    }
                                }}
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
                                    onPress={() => {
                                        setModalVisible(false);
                                        setScanned(false);
                                    }}>
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
                                    onPress={handleTambahKeranjang}>
                                    <Text
                                        style={{
                                            color: getWhiteColor(),
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
                <Modal
                    visible={editModalVisible}
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
                                backgroundColor: getWhiteColor(),
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
                                    borderColor: getSecondary2ndColor(),
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
                                            color: getWhiteColor(),
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
                                            color: getWhiteColor(),
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
                                backgroundColor: getWhiteColor(),
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
                                Total: Rp{" "}
                                {totalKeseluruhan.toLocaleString("id-ID")}
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
                                                    color: getWhiteColor(),
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
                                            <ActivityIndicator
                                                size="small"
                                                color={getPrimaryColor()}
                                            />
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            style={
                                                globalStyles.buttonModalDanger
                                            }
                                            onPress={() =>
                                                setBayarModalVisible(false)
                                            }>
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
                                            style={
                                                globalStyles.buttonModalPrimary
                                            }
                                            onPress={handleBayar}>
                                            <Text
                                                style={{
                                                    color: getWhiteColor(),
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
        </>
    );
}
