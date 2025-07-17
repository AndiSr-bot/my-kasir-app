import { globalStyles } from "@/constants/styles";
import { db } from "@/services/firebase";
import { TPegawaiCreate } from "@/types/pegawai_repositories";
import { TPerusahaan } from "@/types/perusahaan_repositories";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function TambahPegawai() {
    const router = useRouter();
    const [nama, setNama] = useState("");
    const [noHp, setNoHp] = useState("");
    const [email, setEmail] = useState("");
    const [jabatan, setJabatan] = useState("");
    const [role, setRole] = useState("");
    const [perusahaanId, setPerusahaanId] = useState("");
    const [foto, setFoto] = useState("");
    const [perusahaanList, setPerusahaanList] = useState<TPerusahaan[]>([]);

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

    const pilihFoto = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled) {
            setFoto(result.assets[0].uri); // Simpan path gambar lokal
        }
    };

    const handleSubmit = async () => {
        if (!nama || !jabatan || !role || !perusahaanId) {
            alert("Semua field harus diisi");
            return;
        }

        try {
            // TPegawaiCreate
            const dataPegawai: TPegawaiCreate = {
                perusahaanId,
                nama,
                jabatan,
                role: role as "admin" | "staff",
                no_hp: noHp,
                email,
                foto: foto || null,
            };
            await addDoc(
                collection(db, "perusahaan", perusahaanId, "pegawai"),
                dataPegawai
            );
            alert("Pegawai berhasil ditambahkan");
            router.back();
        } catch (error) {
            console.log("Error adding pegawai:", error);
        }
    };

    return (
        <View style={globalStyles.container}>
            <TouchableOpacity onPress={pilihFoto}>
                {foto ? (
                    <Image
                        source={{ uri: foto }}
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            marginBottom: 10,
                        }}
                    />
                ) : (
                    <View
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            backgroundColor: "#ccc",
                            justifyContent: "center",
                            alignItems: "center",
                            marginBottom: 10,
                        }}>
                        <Text>Pilih Foto</Text>
                    </View>
                )}
            </TouchableOpacity>

            <Text style={globalStyles.label}>Nama Pegawai</Text>
            <TextInput
                style={globalStyles.input}
                value={nama}
                onChangeText={setNama}
            />
            <Text style={globalStyles.label}>Email</Text>
            <TextInput
                style={globalStyles.input}
                value={noHp}
                onChangeText={setEmail}
            />
            <Text style={globalStyles.label}>No HP</Text>
            <TextInput
                style={globalStyles.input}
                value={noHp}
                onChangeText={setNoHp}
            />

            <Text style={globalStyles.label}>Jabatan</Text>
            <TextInput
                style={globalStyles.input}
                value={jabatan}
                onChangeText={setJabatan}
            />

            <Text style={globalStyles.label}>Role</Text>
            <View style={[globalStyles.input, { padding: 0, height: 50 }]}>
                <Picker
                    selectedValue={role}
                    onValueChange={setRole}
                    style={{ color: "#000" }}>
                    <Picker.Item label="-- Pilih Role --" value="" />
                    <Picker.Item label="Admin" value="admin" />
                    <Picker.Item
                        label="Admin Perusahaan"
                        value="admin_perusahaan"
                    />
                    <Picker.Item label="Staff" value="staff" />
                </Picker>
            </View>

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

            <TouchableOpacity
                style={globalStyles.buttonSuccess}
                onPress={handleSubmit}>
                <Text style={globalStyles.buttonText}>Simpan</Text>
            </TouchableOpacity>
        </View>
    );
}
