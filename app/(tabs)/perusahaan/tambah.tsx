import { globalStyles } from "@/constants/styles";
import { db } from "@/services/firebase";
import { TPerusahaanCreate } from "@/types/perusahaan_repositories";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function TambahPerusahaan() {
    const [nama, setNama] = useState("");
    const [alamat, setAlamat] = useState("");
    const [telepon, setTelepon] = useState("");
    const [logo, setLogo] = useState("");
    const router = useRouter();

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.5,
        });

        if (!result.canceled) {
            setLogo(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!nama.trim()) return alert("Nama perusahaan wajib diisi.");

        try {
            const dataPerusahaan: TPerusahaanCreate = {
                nama,
                alamat,
                telepon,
                logo,
            };
            await addDoc(collection(db, "perusahaan"), dataPerusahaan);
            router.replace("/perusahaan");
        } catch (error) {
            console.log("Error adding document:", error);
        }
    };

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
                <Text style={globalStyles.label}>Pilih Logo (Opsional)</Text>
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
                style={globalStyles.buttonSuccess}
                onPress={handleSubmit}>
                <Text style={globalStyles.buttonText}>Simpan</Text>
            </TouchableOpacity>
        </View>
    );
}
