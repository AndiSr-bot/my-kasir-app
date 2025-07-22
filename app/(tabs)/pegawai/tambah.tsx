import { getPrimaryColor, getSecondaryColor } from "@/constants/Colors";
import { globalStyles } from "@/constants/styles";
import { auth, db } from "@/services/firebase";
import { TPegawai, TPegawaiCreate } from "@/types/pegawai_repositories";
import { TPerusahaan } from "@/types/perusahaan_repositories";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
    addDoc,
    collection,
    collectionGroup,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

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
    const [userDataLocal, setUserDataLocal] = useState<TPegawai | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPerusahaan();
        getUserData();
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
            setFoto(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);

        if (!nama || !jabatan || !role || !perusahaanId || !email) {
            alert("Semua field harus diisi");
            setLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                "12345678"
            );

            const uid = userCredential.user.uid;

            const dataPegawai: TPegawaiCreate = {
                perusahaanId,
                nama,
                jabatan,
                role: role as "admin" | "staff",
                no_hp: noHp,
                email,
                foto: foto || null,
                auth_uid: uid,
            };

            await addDoc(
                collection(db, "perusahaan", perusahaanId, "pegawai"),
                dataPegawai
            );

            alert("Pegawai berhasil ditambahkan");
            router.back();
        } catch (error: any) {
            if (error.code === "auth/email-already-in-use") {
                console.log("Email sudah terdaftar di Auth. Cek Firestore...");
                try {
                    const pegawaiRef = collectionGroup(db, "pegawai");
                    const q = query(pegawaiRef, where("email", "==", email));
                    const snapshot = await getDocs(q);

                    if (!snapshot.empty) {
                        alert("Email sudah terdaftar sebagai pegawai!");
                    } else {
                        const dataPegawai: TPegawaiCreate = {
                            perusahaanId,
                            nama,
                            jabatan,
                            role: role as "admin" | "staff",
                            no_hp: noHp,
                            email,
                            foto: foto || null,
                            auth_uid: "unknown",
                        };

                        await addDoc(
                            collection(
                                db,
                                "perusahaan",
                                perusahaanId,
                                "pegawai"
                            ),
                            dataPegawai
                        );
                        alert("Pegawai berhasil ditambahkan");
                        router.back();
                    }
                } catch (firestoreError) {
                    console.log("Error cek Firestore:", firestoreError);
                    alert(
                        "Terjadi kesalahan saat memeriksa email di Firestore."
                    );
                }
            } else {
                console.log("Error adding pegawai:", error);
                alert("Terjadi kesalahan: " + error.message);
            }
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
                if (JSON.parse(jsonValue).role !== "admin") {
                    setRole("staff");
                }
            }
        } catch (e) {
            console.log("Error loading user data", e);
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
                            backgroundColor: getSecondaryColor(),
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
                placeholder="Nama Pegawai"
                style={globalStyles.input}
                value={nama}
                onChangeText={setNama}
                autoCapitalize="words"
                textContentType="name"
                returnKeyType="next"
            />
            <Text style={globalStyles.label}>Email</Text>
            <TextInput
                placeholder="Email"
                style={globalStyles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <Text style={globalStyles.label}>No HP</Text>
            <TextInput
                placeholder="No HP"
                style={globalStyles.input}
                value={noHp}
                onChangeText={setNoHp}
                keyboardType="phone-pad"
                maxLength={15}
            />

            <Text style={globalStyles.label}>Jabatan</Text>
            <TextInput
                style={globalStyles.input}
                value={jabatan}
                onChangeText={setJabatan}
                placeholder="Jabatan"
                autoCapitalize="words"
                textContentType="name"
                returnKeyType="next"
            />
            {userDataLocal?.role === "admin" && (
                <>
                    <Text style={globalStyles.label}>Role</Text>
                    <View
                        style={[
                            globalStyles.input,
                            { padding: 0, height: 50 },
                        ]}>
                        <Picker selectedValue={role} onValueChange={setRole}>
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
            <TouchableOpacity
                disabled={loading}
                style={
                    loading
                        ? globalStyles.buttonSecondary
                        : globalStyles.buttonPrimary
                }
                onPress={handleSubmit}>
                {loading ? (
                    <ActivityIndicator size="small" color={getPrimaryColor()} />
                ) : (
                    <Text style={globalStyles.buttonText}>Simpan</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}
