import { globalStyles } from "@/constants/styles";
import { TPegawai } from "@/types/pegawai_repositories";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
    const router = useRouter();
    const [userDataLocal, setUserDataLocal] = useState<TPegawai | null>(null);
    useEffect(() => {
        getUserData();
    }, []);
    const getUserData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem("user");
            if (jsonValue != null) {
                setUserDataLocal(JSON.parse(jsonValue));
            }
        } catch (e) {
            console.log("Error loading user data", e);
        }
    };
    return (
        <View style={[globalStyles.container, { paddingTop: 40 }]}>
            {/* <Text style={globalStyles.text}>Selamat Datang</Text> */}
            <TouchableOpacity
                style={globalStyles.homeCard}
                onPress={() => router.push("/scan")}>
                <Ionicons
                    name="scan"
                    size={30}
                    style={{ textAlign: "center" }}
                />
                <Text style={[globalStyles.text, { marginBottom: 0 }]}>
                    Scan
                </Text>
            </TouchableOpacity>
            {(userDataLocal?.role === "admin" ||
                userDataLocal?.role === "admin_perusahaan") && (
                <View style={globalStyles.homeCardHalfContainer}>
                    <TouchableOpacity
                        style={globalStyles.homeCardHalf}
                        onPress={() => router.push("/pegawai")}>
                        <Ionicons
                            name="people"
                            size={30}
                            style={{ textAlign: "center" }}
                        />
                        <Text style={[globalStyles.text, { marginBottom: 0 }]}>
                            Pegawai
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={globalStyles.homeCardHalf}
                        onPress={() => router.push("/stok")}>
                        <Ionicons
                            name="cube"
                            size={30}
                            style={{ textAlign: "center" }}
                        />
                        <Text style={[globalStyles.text, { marginBottom: 0 }]}>
                            Stok
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
            {(userDataLocal?.role === "admin" ||
                userDataLocal?.role === "admin_perusahaan") && (
                <View style={globalStyles.homeCardHalfContainer}>
                    {userDataLocal?.role === "admin" && (
                        <TouchableOpacity
                            style={globalStyles.homeCardHalf}
                            onPress={() => router.push("/perusahaan")}>
                            <Ionicons
                                name="business"
                                size={30}
                                style={{ textAlign: "center" }}
                            />
                            <Text
                                style={[
                                    globalStyles.text,
                                    { marginBottom: 0 },
                                ]}>
                                Perusahaan
                            </Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={globalStyles.homeCardHalf}
                        onPress={() => router.push("/keuangan")}>
                        <Ionicons
                            name="wallet"
                            size={30}
                            style={{ textAlign: "center" }}
                        />
                        <Text style={[globalStyles.text, { marginBottom: 0 }]}>
                            Keuangan
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
