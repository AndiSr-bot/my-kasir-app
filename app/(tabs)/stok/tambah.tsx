/* eslint-disable react-hooks/exhaustive-deps */
import { getPrimaryColor, getSecondaryColor } from "@/constants/Colors";
import { globalStyles } from "@/constants/styles";
import { db } from "@/services/firebase";
import { TPegawai } from "@/types/pegawai_repositories";
import { TPerusahaan } from "@/types/perusahaan_repositories";
import { TStokCreate, TStokUpdate } from "@/types/stok_repositories";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { Audio } from "expo-av";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
    addDoc,
    collection,
    doc,
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
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function TambahStokScreen() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();

    const [nama, setNama] = useState("");
    const [harga, setHarga] = useState("");
    const [hargaBeli, setHargaBeli] = useState("");
    const [stokAwal, setStokAwal] = useState("");
    const [barcode, setBarcode] = useState("");
    const [gambar, setGambar] = useState<string | null>(null);
    const [perusahaanId, setPerusahaanId] = useState("");
    const [perusahaanList, setPerusahaanList] = useState<TPerusahaan[]>([]);
    const [scanned, setScanned] = useState(false);
    const [userDataLocal, setUserDataLocal] = useState<TPegawai | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshCamera, setRefreshCamera] = useState(true);
    const [sounded, setSounded] = useState(false);
    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);
    useEffect(() => {
        fetchPerusahaan();
        getUserData();
    }, []);
    const playBeepSound = async () => {
        try {
            if (!sounded) {
                const { sound } = await Audio.Sound.createAsync(
                    require("@/assets/sounds/beep.mp3")
                );
                await sound.playAsync();
            }
        } catch (error) {
            console.log("Gagal memutar suara beep:", error);
        }
    };
    const fetchPerusahaan = async () => {
        try {
            const snapshot = await getDocs(
                query(collection(db, "perusahaan"), orderBy("nama", "asc"))
            );
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
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled) {
            setGambar(result.assets[0].uri);
        }
    };

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        try {
            if (!scanned) {
                setBarcode(data);
                setScanned(true);
                const getStokByBarcode = await getDocs(
                    query(
                        collection(
                            db,
                            "perusahaan",
                            perusahaanId as string,
                            "stok"
                        ),
                        where("no_barcode", "==", data)
                    )
                );
                if (getStokByBarcode.docs.length > 0) {
                    setSounded(true);
                    await playBeepSound();
                    Alert.alert(
                        "Barcode Terdeteksi",
                        `Data dengan kode ${data} sudah tersedia`,
                        [
                            {
                                text: "Restock",
                                onPress: () => {
                                    setNama(
                                        getStokByBarcode.docs[0].data().nama
                                    );
                                    setHarga(
                                        getStokByBarcode.docs[0]
                                            .data()
                                            .harga.toString()
                                    );
                                    setGambar(
                                        getStokByBarcode.docs[0].data()
                                            .gambar || null
                                    );
                                    setSounded(false);
                                },
                            },
                            {
                                text: "Scan Ulang",
                                onPress: () => {
                                    setScanned(false);
                                    setRefreshCamera(false);
                                    setNama("");
                                    setHarga("");
                                    setGambar("");
                                    setSounded(false);
                                },
                            },
                        ]
                    );
                } else {
                    setSounded(true);
                    await playBeepSound();
                    Alert.alert("Barcode Terdeteksi", `Kode: ${data}`, [
                        {
                            text: "OK",
                            onPress: () => {
                                setSounded(false);
                            },
                        },
                        {
                            text: "Scan Ulang",
                            onPress: () => {
                                setScanned(false);
                                setRefreshCamera(false);
                                setNama("");
                                setHarga("");
                                setGambar("");
                                setSounded(false);
                            },
                        },
                    ]);
                }
            }
        } catch (error) {
            console.log("Error scanning barcode:", error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        if (
            !perusahaanId ||
            !nama ||
            !harga ||
            !stokAwal ||
            !barcode ||
            !hargaBeli
        ) {
            Alert.alert("Error", "Lengkapi semua field dan scan barcode!");
            return;
        }

        const now = new Date();
        const tahun = now.getFullYear();
        const bulan = String(now.getMonth() + 1).padStart(2, "0");
        const tanggal = String(now.getDate()).padStart(2, "0");
        try {
            const getStokByBarcode = await getDocs(
                query(
                    collection(
                        db,
                        "perusahaan",
                        perusahaanId as string,
                        "stok"
                    ),
                    where("no_barcode", "==", barcode)
                )
            );
            if (getStokByBarcode.docs.length > 0) {
                const dataStok: TStokUpdate = {
                    nama,
                    harga: parseFloat(harga),
                    stok_awal:
                        parseInt(getStokByBarcode.docs[0].data().stok_awal) +
                        parseInt(stokAwal),
                    stok_sisa:
                        parseInt(getStokByBarcode.docs[0].data().stok_sisa) +
                        parseInt(stokAwal),
                    gambar: gambar || null,
                    updated_at: serverTimestamp(),
                    restocked_at: serverTimestamp(),
                    restocks: [
                        ...getStokByBarcode.docs[0].data().restocks,
                        {
                            harga_beli: parseFloat(hargaBeli),
                            jumlah: parseInt(stokAwal),
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
                        getStokByBarcode.docs[0].id
                    ),
                    {
                        ...dataStok,
                    }
                );
            } else {
                const dataStok: TStokCreate = {
                    perusahaanId,
                    nama,
                    harga: parseFloat(harga),
                    stok_awal: parseInt(stokAwal),
                    stok_terjual: 0,
                    stok_sisa: parseInt(stokAwal),
                    no_barcode: barcode,
                    gambar: gambar || null,
                    restocks: [
                        {
                            harga_beli: parseFloat(hargaBeli),
                            jumlah: parseInt(stokAwal),
                            tanggal: `${tanggal}/${bulan}/${tahun}`,
                        },
                    ],
                    created_at: serverTimestamp(),
                    updated_at: serverTimestamp(),
                    restocked_at: serverTimestamp(),
                };
                await addDoc(
                    collection(
                        db,
                        "perusahaan",
                        perusahaanId as string,
                        "stok"
                    ),
                    dataStok
                );
            }
            Alert.alert("Sukses", "Produk berhasil ditambahkan");
            router.back();
        } catch (error) {
            console.log("Error simpan produk:", error);
            Alert.alert("Error", "Gagal menyimpan produk");
        } finally {
            setLoading(false);
        }
    };
    const getUserData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem("user");
            if (jsonValue != null) {
                setPerusahaanId(JSON.parse(jsonValue).perusahaanId);
                setUserDataLocal(JSON.parse(jsonValue));
            }
        } catch (e) {
            console.log("Error loading user data", e);
        }
    };
    useEffect(() => {
        setTimeout(() => {
            setRefreshCamera(false);
        }, 500);
    }, []);

    return (
        <ScrollView style={globalStyles.container}>
            {/* Kamera untuk scan barcode */}
            {!scanned && !refreshCamera ? (
                <TouchableOpacity
                    style={{ height: 100, marginBottom: 20, marginTop: -20 }}
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
                        // marginTop: 20,
                        // marginBottom: -10,
                        height: 100,
                        backgroundColor: getSecondaryColor(),
                    }}>
                    <ActivityIndicator
                        size="large"
                        color={getPrimaryColor()}
                        style={{ marginTop: 30 }}
                    />
                </View>
            )}
            {userDataLocal?.role === "admin" && (
                <>
                    <Text style={globalStyles.label}>Perusahaan</Text>
                    <View
                        style={[
                            globalStyles.input,
                            { padding: 0, height: 50 },
                        ]}>
                        <Picker
                            selectedValue={perusahaanId}
                            onValueChange={setPerusahaanId}>
                            <Picker.Item
                                label="-- Pilih Perusahaan --"
                                value=""
                            />
                            {perusahaanList.map((item) => (
                                <Picker.Item
                                    key={item.id}
                                    label={item.nama}
                                    value={item.id}
                                />
                            ))}
                        </Picker>
                    </View>
                </>
            )}
            <Text style={globalStyles.label}>Nama Produk</Text>
            <TextInput
                placeholder="Nama Produk"
                style={globalStyles.input}
                value={nama}
                onChangeText={setNama}
            />
            <Text style={globalStyles.label}>Harga Beli</Text>
            <TextInput
                placeholder="Harga Beli"
                style={globalStyles.input}
                keyboardType="numeric"
                value={hargaBeli}
                onChangeText={setHargaBeli}
            />
            <Text style={globalStyles.label}>Harga Jual</Text>
            <TextInput
                placeholder="Harga Jual"
                style={globalStyles.input}
                keyboardType="numeric"
                value={harga}
                onChangeText={setHarga}
            />
            <Text style={globalStyles.label}>Stok Awal</Text>
            <TextInput
                placeholder="Stok Awal"
                style={globalStyles.input}
                keyboardType="numeric"
                value={stokAwal}
                onChangeText={setStokAwal}
            />
            <Text style={globalStyles.label}>No Barcode</Text>
            <TextInput
                placeholder="No Barcode"
                style={[
                    globalStyles.input,
                    { backgroundColor: getSecondaryColor() },
                ]}
                value={barcode}
                editable={false}
            />

            {/* Gambar Produk */}
            {/* <TouchableOpacity
                style={globalStyles.buttonSecondary}
                onPress={pickImage}>
                <Text style={globalStyles.buttonText}>
                    {gambar ? "Ganti Gambar" : "Pilih Gambar"}
                </Text>
            </TouchableOpacity>
            {gambar && (
                <Image
                    source={{ uri: gambar }}
                    style={{ width: 100, height: 100, marginTop: 10 }}
                />
            )} */}
            <TouchableOpacity onPress={pickImage}>
                <Text style={globalStyles.label}>Pilih Logo (Opsional)</Text>
                <Image
                    source={
                        gambar
                            ? { uri: gambar }
                            : require("@/assets/default-image.png")
                    }
                    style={globalStyles.imagePreview}
                />
            </TouchableOpacity>

            {/* Tombol Simpan */}
            <TouchableOpacity
                style={[
                    loading
                        ? globalStyles.buttonSecondary
                        : globalStyles.buttonPrimary,
                    { marginTop: 20, marginBottom: 30 },
                ]}
                disabled={loading}
                onPress={handleSave}>
                {loading ? (
                    <ActivityIndicator size="small" color={getPrimaryColor()} />
                ) : (
                    <Text style={globalStyles.buttonText}>Simpan Produk</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}
