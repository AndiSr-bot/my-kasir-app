/* eslint-disable react-hooks/exhaustive-deps */
import { getPrimaryColor, getSecondaryColor } from "@/constants/Colors";
import { globalStyles } from "@/constants/styles";
import { db } from "@/services/firebase";
import { TStokUpdate } from "@/types/stok_repositories";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    deleteDoc,
    doc,
    getDoc,
    serverTimestamp,
    updateDoc,
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

export default function EditStokScreen() {
    const router = useRouter();
    const { perusahaanId, id } = useLocalSearchParams();

    const [loading, setLoading] = useState(true);
    const [nama, setNama] = useState("");
    const [harga, setHarga] = useState("");
    const [stokAwal, setStokAwal] = useState("");
    const [stokSisa, setStokSisa] = useState("");
    const [stokTerjual, setStokTerjual] = useState(0);
    const [barcode, setBarcode] = useState("");
    const [gambar, setGambar] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
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

    const handleUpdate = async () => {
        setSubmitting(true);
        if (!nama || !harga || !stokAwal) {
            Alert.alert("Error", "Lengkapi semua field!");
            return;
        }

        try {
            const stokAwalInt = parseInt(stokAwal);
            const newStokSisa = stokAwalInt - stokTerjual;

            const docRef = doc(
                db,
                "perusahaan",
                perusahaanId as string,
                "stok",
                id as string
            );
            const dataStok: TStokUpdate = {
                nama,
                harga: parseFloat(harga),
                stok_awal: stokAwalInt,
                stok_sisa: newStokSisa,
                gambar: gambar || null,
                updated_at: serverTimestamp(),
            };
            await updateDoc(docRef, {
                ...dataStok,
            });

            Alert.alert("Sukses", "Produk berhasil diperbarui");
            router.back();
        } catch (error) {
            console.log("Error update:", error);
            Alert.alert("Error", "Gagal update produk");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert("Hapus Produk", "Yakin ingin menghapus produk ini?", [
            { text: "Batal", style: "cancel" },
            {
                text: "Hapus",
                style: "destructive",
                onPress: async () => {
                    setSubmitting(true);
                    try {
                        const docRef = doc(
                            db,
                            "perusahaan",
                            perusahaanId as string,
                            "stok",
                            id as string
                        );
                        await deleteDoc(docRef);
                        Alert.alert("Sukses", "Produk dihapus");
                        router.back();
                    } catch (error) {
                        console.log("Error delete:", error);
                    } finally {
                        setSubmitting(false);
                    }
                },
            },
        ]);
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
        <ScrollView style={globalStyles.container}>
            <TouchableOpacity
                onPress={pickImage}
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
            </TouchableOpacity>
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
            <TextInput
                placeholder="Nama Produk"
                style={globalStyles.input}
                value={nama}
                onChangeText={setNama}
            />

            {/* Harga */}
            <Text style={globalStyles.label}>Harga</Text>
            <TextInput
                placeholder="Harga"
                style={globalStyles.input}
                keyboardType="numeric"
                value={harga}
                onChangeText={setHarga}
            />

            {/* Barcode */}
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

            <TouchableOpacity
                disabled={submitting}
                style={
                    submitting
                        ? globalStyles.buttonSecondary
                        : globalStyles.buttonPrimary
                }
                onPress={handleUpdate}>
                {submitting ? (
                    <ActivityIndicator size="small" color={getPrimaryColor()} />
                ) : (
                    <Text style={globalStyles.buttonText}>
                        Simpan Perubahan
                    </Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                disabled={submitting}
                style={
                    submitting
                        ? globalStyles.buttonSecondary
                        : globalStyles.buttonDanger
                }
                onPress={handleDelete}>
                {submitting ? (
                    <ActivityIndicator size="small" color={getPrimaryColor()} />
                ) : (
                    <Text style={globalStyles.buttonText}>Hapus Stok</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}
