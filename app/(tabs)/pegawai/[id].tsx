/* eslint-disable react-hooks/exhaustive-deps */
import { globalStyles } from "@/constants/styles";
import { db } from "@/services/firebase";
import { TPegawai, TPegawaiUpdate } from "@/types/pegawai_repositories";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function EditPegawai() {
    const router = useRouter();
    const { id, perusahaanId } = useLocalSearchParams();

    const [nama, setNama] = useState("");
    const [noHp, setNoHp] = useState("");
    const [email, setEmail] = useState("");
    const [jabatan, setJabatan] = useState("");
    const [role, setRole] = useState("");
    const [foto, setFoto] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [userDataLocal, setUserDataLocal] = useState<TPegawai | null>(null);

    useEffect(() => {
        loadData();
        getUserData();
    }, []);
    const getUserData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem("user");
            if (jsonValue != null) {
                setUserDataLocal(JSON.parse(jsonValue));
                if (JSON.parse(jsonValue).role !== "admin") {
                    setRole("staff");
                }
            }
        } catch (e) {
            console.log("Error loading user data", e);
        }
    };
    const loadData = async () => {
        try {
            const docRef = doc(
                db,
                "perusahaan",
                String(perusahaanId),
                "pegawai",
                String(id)
            );
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setNama(data.nama);
                setNoHp(data.no_hp);
                setEmail(data.email);
                setJabatan(data.jabatan);
                setRole(data.role);
                setFoto(data.foto || "");
            } else {
                Alert.alert("Error", "Data pegawai tidak ditemukan");
                router.back();
            }
        } catch (error) {
            console.log("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const pilihFoto = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled) {
            const sourceUri = result.assets[0].uri;
            const fileName = sourceUri.split("/").pop();
            const newPath = FileSystem.documentDirectory || "" + fileName;

            await FileSystem.copyAsync({ from: sourceUri, to: newPath });
            setFoto(newPath);
        }
    };

    const handleSave = async () => {
        setSubmitting(true);
        try {
            const docRef = doc(
                db,
                "perusahaan",
                String(perusahaanId),
                "pegawai",
                String(id)
            );
            const dataPegawai: TPegawaiUpdate = {
                perusahaanId: String(perusahaanId),
                nama,
                jabatan,
                role: role as "admin" | "staff",
                no_hp: noHp,
                foto: foto || null,
            };
            await updateDoc(docRef, {
                ...dataPegawai,
            });
            Alert.alert("Sukses", "Pegawai diperbarui");
            router.back();
        } catch (error) {
            console.log("Update error:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = () => {
        Alert.alert("Hapus Pegawai", "Yakin ingin menghapus?", [
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
                            String(perusahaanId),
                            "pegawai",
                            String(id)
                        );
                        await deleteDoc(docRef);
                        Alert.alert("Sukses", "Pegawai dihapus");
                        router.back();
                    } catch (error) {
                        console.log("Delete error:", error);
                    } finally {
                        setSubmitting(false);
                    }
                },
            },
        ]);
    };

    if (loading)
        return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

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
                style={[globalStyles.input, { backgroundColor: "#f0f0f0" }]}
                value={email}
                onChangeText={setEmail}
                editable={false}
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
            {userDataLocal?.role === "admin" && (
                <>
                    <Text style={globalStyles.label}>Role</Text>
                    <View
                        style={[
                            globalStyles.input,
                            { padding: 0, height: 50 },
                        ]}>
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
                </>
            )}

            <TouchableOpacity
                disabled={submitting}
                style={
                    submitting
                        ? globalStyles.buttonSecondary
                        : globalStyles.buttonSuccess
                }
                onPress={handleSave}>
                {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
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
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={globalStyles.buttonText}>Hapus Pegawai</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}
