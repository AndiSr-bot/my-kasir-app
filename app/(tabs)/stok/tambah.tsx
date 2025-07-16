import { globalStyles } from "@/constants/styles";
import { db } from "@/services/firebase";
import { Picker } from "@react-native-picker/picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
    addDoc,
    collection,
    getDocs,
    serverTimestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function TambahStokScreen() {
    // const { perusahaanId } = useLocalSearchParams();
    const router = useRouter();

    const [nama, setNama] = useState("");
    const [harga, setHarga] = useState("");
    const [stokAwal, setStokAwal] = useState("");
    const [barcode, setBarcode] = useState("");
    const [gambar, setGambar] = useState<string | null>(null);
    const [perusahaanId, setPerusahaanId] = useState("");
    const [perusahaanList, setPerusahaanList] = useState<any[]>([]);

    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);
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

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (!scanned) {
            setBarcode(data);
            setScanned(true);
            Alert.alert("Barcode Terdeteksi", `Kode: ${data}`);
        }
    };

    const handleSave = async () => {
        if (!nama || !harga || !stokAwal || !barcode) {
            Alert.alert("Error", "Lengkapi semua field dan scan barcode!");
            return;
        }

        try {
            await addDoc(
                collection(db, "perusahaan", perusahaanId as string, "stok"),
                {
                    nama,
                    harga: parseFloat(harga),
                    stok_awal: parseInt(stokAwal),
                    stok_terjual: 0,
                    stok_sisa: parseInt(stokAwal),
                    no_barcode: barcode,
                    gambar: gambar || null,
                    created_at: serverTimestamp(),
                    updated_at: serverTimestamp(),
                }
            );
            Alert.alert("Sukses", "Produk berhasil ditambahkan");
            router.back();
        } catch (error) {
            console.log("Error simpan produk:", error);
            Alert.alert("Error", "Gagal menyimpan produk");
        }
    };

    return (
        <View style={globalStyles.container}>
            {/* Kamera untuk scan barcode */}
            {!scanned && (
                <CameraView
                    style={{ height: 100, marginBottom: 10 }}
                    onBarcodeScanned={handleBarCodeScanned}
                />
            )}
            <Text style={globalStyles.label}>Perusahaan</Text>
            <View style={[globalStyles.input, { padding: 0, height: 50 }]}>
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
            <Text style={globalStyles.label}>Nama Produk</Text>
            <TextInput
                placeholder="Nama Produk"
                style={globalStyles.input}
                value={nama}
                onChangeText={setNama}
            />
            <Text style={globalStyles.label}>Harga</Text>
            <TextInput
                placeholder="Harga"
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
                style={[globalStyles.input, { backgroundColor: "#f0f0f0" }]}
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
                style={[globalStyles.buttonPrimary, { marginTop: 20 }]}
                onPress={handleSave}>
                <Text style={globalStyles.buttonText}>Simpan Produk</Text>
            </TouchableOpacity>
        </View>
    );
}
