import { getPrimaryColor, getWhiteColor } from "@/constants/Colors";
import { globalStyles } from "@/constants/styles";
import { TPegawai } from "@/types/pegawai_repositories";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

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
    const handleLogout = async () => {
        Alert.alert("Konfirmasi", "Yakin ingin logout?", [
            { text: "Batal", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    try {
                        await AsyncStorage.removeItem("user");
                        router.replace("/login");
                    } catch (e) {
                        console.log("Error logout", e);
                    }
                },
            },
        ]);
    };
    return (
        <View style={globalStyles.containerCard}>
            <View
                style={{
                    backgroundColor: getPrimaryColor(),
                    paddingTop: 40,
                    paddingBottom: 15,
                    paddingHorizontal: 16,
                    marginBottom: 12,
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}>
                <View>
                    <Text
                        style={{
                            color: getWhiteColor(),
                            fontSize: 14,
                            marginTop: 4,
                        }}>
                        Selamat Datang,
                    </Text>
                    <Text
                        style={{
                            color: getWhiteColor(),
                            fontSize: 24,
                            fontWeight: "bold",
                        }}>
                        {userDataLocal?.perusahaan?.nama || "Toko Anda"}
                    </Text>
                </View>
                <View style={{ justifyContent: "flex-end" }}>
                    <TouchableOpacity onPress={handleLogout}>
                        <Ionicons
                            name="log-out"
                            size={25}
                            style={{
                                color: getWhiteColor(),
                            }}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity
                style={[globalStyles.homeCard, { marginHorizontal: 16 }]}
                onPress={() => router.push("/scan")}>
                <Ionicons
                    name="scan"
                    size={40}
                    style={{ textAlign: "center", color: getWhiteColor() }}
                />
                <Text
                    style={[
                        globalStyles.text,
                        { marginBottom: 0, color: getWhiteColor() },
                    ]}>
                    Scan
                </Text>
            </TouchableOpacity>
            {(userDataLocal?.role === "admin" ||
                userDataLocal?.role === "admin_perusahaan") && (
                <View style={globalStyles.homeCardHalfContainer}>
                    <TouchableOpacity
                        style={[globalStyles.homeCardHalf, { marginLeft: 16 }]}
                        onPress={() => router.push("/pegawai")}>
                        <Ionicons
                            name="people"
                            size={40}
                            style={{
                                textAlign: "center",
                                color: getWhiteColor(),
                            }}
                        />
                        <Text
                            style={[
                                globalStyles.text,
                                { marginBottom: 0, color: getWhiteColor() },
                            ]}>
                            Pegawai
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[globalStyles.homeCardHalf, { marginRight: 16 }]}
                        onPress={() => router.push("/stok")}>
                        <Ionicons
                            name="cube"
                            size={40}
                            style={{
                                textAlign: "center",
                                color: getWhiteColor(),
                            }}
                        />
                        <Text
                            style={[
                                globalStyles.text,
                                { marginBottom: 0, color: getWhiteColor() },
                            ]}>
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
                            style={[
                                globalStyles.homeCardHalf,
                                { marginLeft: 16 },
                            ]}
                            onPress={() => router.push("/perusahaan")}>
                            <Ionicons
                                name="business"
                                size={40}
                                style={{
                                    textAlign: "center",
                                    color: getWhiteColor(),
                                }}
                            />
                            <Text
                                style={[
                                    globalStyles.text,
                                    { marginBottom: 0, color: getWhiteColor() },
                                ]}>
                                Perusahaan
                            </Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[
                            globalStyles.homeCardHalf,
                            userDataLocal?.role === "admin"
                                ? { marginRight: 16 }
                                : { marginHorizontal: 16 },
                        ]}
                        onPress={() => router.push("/keuangan")}>
                        <Ionicons
                            name="wallet"
                            size={40}
                            style={{
                                textAlign: "center",
                                color: getWhiteColor(),
                            }}
                        />
                        <Text
                            style={[
                                globalStyles.text,
                                { marginBottom: 0, color: getWhiteColor() },
                            ]}>
                            Keuangan
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
