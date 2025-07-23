import { getPrimaryColor } from "@/constants/Colors";
import { globalStyles } from "@/constants/styles";
import { auth, db } from "@/services/firebase";
import { TPegawai } from "@/types/pegawai_repositories";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
    collectionGroup,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

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

            const querySnapshot = await getDocs(
                query(
                    collectionGroup(db, "pegawai"),
                    where("email", "==", email)
                )
            );
            if (querySnapshot.empty) {
                Alert.alert("Error", "Data pegawai tidak ditemukan");
                return;
            }
            const getPerusahaan = await getDoc(
                doc(db, "perusahaan", querySnapshot.docs[0].data().perusahaanId)
            );
            if (!getPerusahaan.exists()) {
                Alert.alert("Error", "Data pegawai tidak ditemukan");
                return;
            }
            const pegawaiData: TPegawai = {
                id: querySnapshot.docs[0].id,
                perusahaanId: querySnapshot.docs[0].data().perusahaanId,
                nama: querySnapshot.docs[0].data().nama,
                jabatan: querySnapshot.docs[0].data().jabatan,
                role: querySnapshot.docs[0].data().role,
                no_hp: querySnapshot.docs[0].data().no_hp,
                email: querySnapshot.docs[0].data().email,
                foto: querySnapshot.docs[0].data().foto,
                auth_uid: querySnapshot.docs[0].data().auth_uid,
                perusahaan: {
                    id: getPerusahaan.data().id,
                    nama: getPerusahaan.data().nama,
                    alamat: getPerusahaan.data().alamat,
                    telepon: getPerusahaan.data().telepon,
                    logo: getPerusahaan.data().logo,
                },
            };
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
        <View
            style={[
                globalStyles.containerCard,
                { justifyContent: "center", padding: 16 },
            ]}>
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
                autoCapitalize="none"
            />

            <TouchableOpacity
                style={[
                    globalStyles.buttonPrimary,
                    {
                        marginTop: 20,
                        backgroundColor: loading
                            ? globalStyles.buttonSecondary.backgroundColor
                            : globalStyles.buttonPrimary.backgroundColor,
                    },
                ]}
                onPress={handleLogin}
                disabled={loading}>
                <Text style={globalStyles.buttonText}>
                    {loading ? (
                        <ActivityIndicator
                            size="small"
                            color={getPrimaryColor()}
                        />
                    ) : (
                        "Login"
                    )}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
