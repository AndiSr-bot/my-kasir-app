/* eslint-disable react-hooks/exhaustive-deps */
import { getPrimaryColor } from "@/constants/Colors";
import { globalStyles } from "@/constants/styles";
import { db } from "@/services/firebase";
import { TPerusahaanUpdate } from "@/types/perusahaan_repositories";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function EditPerusahaan() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [nama, setNama] = useState("");
    const [alamat, setAlamat] = useState("");
    const [telepon, setTelepon] = useState("");
    const [logo, setLogo] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, "perusahaan", String(id));
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setNama(data.nama);
                setAlamat(data.alamat);
                setTelepon(data.telepon);
                setLogo(data.logo);
            } else {
                alert("Data tidak ditemukan");
                router.back();
            }
        } catch (error) {
            console.log("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.5,
        });

        if (!result.canceled) {
            setLogo(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        setSubmitting(true);
        try {
            const docRef = doc(db, "perusahaan", String(id));
            const dataPerusahaan: TPerusahaanUpdate = {
                nama,
                alamat,
                telepon,
                logo,
            };
            await updateDoc(docRef, { ...dataPerusahaan });
            alert("Perusahaan berhasil diperbarui");
            router.back();
        } catch (error) {
            console.log("Update error:", error);
        } finally {
            setSubmitting(false);
        }
    };

    // const handleDelete = () => {
    //     Alert.alert("Hapus Perusahaan", "Yakin ingin menghapus?", [
    //         { text: "Batal", style: "cancel" },
    //         {
    //             text: "Hapus",
    //             style: "destructive",
    //             onPress: async () => {
    //                 setSubmitting(true);
    //                 try {
    //                     const docRef = doc(db, "perusahaan", String(id));
    //                     await deleteDoc(docRef);
    //                     alert("Perusahaan berhasil dihapus");
    //                     router.replace("/perusahaan");
    //                 } catch (error) {
    //                     console.log("Delete error:", error);
    //                 } finally {
    //                     setSubmitting(false);
    //                 }
    //             },
    //         },
    //     ]);
    // };

    if (loading)
        return (
            <ActivityIndicator
                size="large"
                color={getPrimaryColor()}
                style={{ marginTop: 20 }}
            />
        );

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.label}>Nama Perusahaan</Text>
            <TextInput
                style={globalStyles.input}
                value={nama}
                onChangeText={setNama}
            />

            <Text style={globalStyles.label}>Alamat</Text>
            <TextInput
                style={globalStyles.input}
                value={alamat}
                onChangeText={setAlamat}
            />

            <Text style={globalStyles.label}>No. Telepon</Text>
            <TextInput
                style={globalStyles.input}
                value={telepon}
                onChangeText={setTelepon}
                keyboardType="phone-pad"
            />

            <TouchableOpacity onPress={pickImage}>
                <Text style={globalStyles.label}>Ganti Logo</Text>
                <Image
                    source={
                        logo
                            ? { uri: logo }
                            : require("@/assets/default-logo.png")
                    }
                    style={globalStyles.imagePreview}
                />
            </TouchableOpacity>

            <TouchableOpacity
                disabled={submitting}
                style={
                    submitting
                        ? globalStyles.buttonSecondary
                        : globalStyles.buttonPrimary
                }
                onPress={handleSave}>
                {submitting ? (
                    <ActivityIndicator size="small" color={getPrimaryColor()} />
                ) : (
                    <Text style={globalStyles.buttonText}>
                        Simpan Perubahan
                    </Text>
                )}
            </TouchableOpacity>

            {/* <TouchableOpacity
                disabled={submitting}
                style={
                    submitting
                        ? globalStyles.buttonSecondary
                        : globalStyles.buttonDanger
                }
                onPress={handleDelete}>
                {submitting ? (
                    <ActivityIndicator size="small" color={getWhiteColor()} />
                ) : (
                    <Text style={globalStyles.buttonText}>
                        Hapus Perusahaan
                    </Text>
                )}
            </TouchableOpacity> */}
        </View>
    );
}
