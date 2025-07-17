import { globalStyles } from "@/constants/styles";
import { auth, db } from "@/services/firebase";
import { TPegawai } from "@/types/pegawai_repositories";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collectionGroup, doc, getDoc, getDocs } from "firebase/firestore";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    /*************  ✨ Windsurf Command ⭐  *************/
    /**
     * Handle login user
     * @param {string} email email user
     * @param {string} password password user
     * @returns {Promise<void>}
     */
    /*******  09e32d9f-1519-4cf1-b83a-e079122ec7a8  *******/
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Email dan password wajib diisi");
            return;
        }

        setLoading(true);
        try {
            await signInWithEmailAndPassword(
                auth,
                email,
                password.toLocaleLowerCase()
            );

            // Cari pegawai di semua perusahaan
            const querySnapshot = await getDocs(collectionGroup(db, "pegawai"));
            let pegawaiData: TPegawai = {
                id: "",
                perusahaanId: "",
                nama: "",
                jabatan: "",
                role: "staff",
                no_hp: "",
                email: "",
                foto: "",
                auth_uid: "",
                perusahaan: {
                    id: "",
                    nama: "",
                    alamat: "",
                    telepon: "",
                    logo: "",
                },
            };

            querySnapshot.forEach((doc) => {
                if (doc.data().email === email) {
                    pegawaiData = {
                        id: doc.id,
                        perusahaanId: doc.data().perusahaanId,
                        nama: doc.data().nama,
                        jabatan: doc.data().jabatan,
                        role: doc.data().role,
                        no_hp: doc.data().no_hp,
                        email: doc.data().email,
                        foto: doc.data().foto,
                        auth_uid: doc.data().auth_uid,
                    };
                }
            });

            if (!pegawaiData) {
                Alert.alert("Error", "Pegawai tidak ditemukan di database");
                return;
            } else {
                if (pegawaiData.perusahaanId) {
                    const getPerusahaan = await getDoc(
                        doc(db, "perusahaan", pegawaiData.perusahaanId)
                    );
                    if (getPerusahaan.exists()) {
                        pegawaiData.perusahaan = {
                            alamat: getPerusahaan.data().alamat,
                            nama: getPerusahaan.data().nama,
                            telepon: getPerusahaan.data().telepon,
                            id: getPerusahaan.data().id,
                            logo: getPerusahaan.data().logo,
                        };
                    }
                }
            }
            console.log(pegawaiData);

            await AsyncStorage.setItem("user", JSON.stringify(pegawaiData));

            router.replace("/(tabs)");
        } catch (error: any) {
            console.log("Login error:", error);
            Alert.alert("Error", "Login gagal. Periksa email & password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[globalStyles.container, { justifyContent: "center" }]}>
            <Text
                style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    marginBottom: 20,
                    alignSelf: "center",
                }}>
                Login
            </Text>

            <TextInput
                placeholder="Email"
                style={[globalStyles.input, { marginBottom: 12 }]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Password"
                style={globalStyles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity
                style={[
                    globalStyles.buttonSuccess,
                    {
                        marginTop: 20,
                        backgroundColor: loading
                            ? globalStyles.buttonSecondary.backgroundColor
                            : globalStyles.buttonSuccess.backgroundColor,
                    },
                ]}
                onPress={handleLogin}
                disabled={loading}>
                <Text style={globalStyles.buttonText}>
                    {loading ? "Loading..." : "Login"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
