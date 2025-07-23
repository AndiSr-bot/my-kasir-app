import { getPrimaryColor } from "@/constants/Colors";
import { globalStyles } from "@/constants/styles";
import { version } from "@/package.json";
import { TPegawai } from "@/types/pegawai_repositories";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState<TPegawai | null>(null);

    useEffect(() => {
        getUserData();
    }, []);

    const getUserData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem("user");
            if (jsonValue != null) {
                setUser(JSON.parse(jsonValue));
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

    if (!user) {
        return (
            <View style={globalStyles.container}>
                <ActivityIndicator size="large" color={getPrimaryColor()} />
            </View>
        );
    }
    return (
        <View style={[globalStyles.containerCard, { paddingTop: 20 }]}>
            {/* Bagian Header (Logout di kanan atas) */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    margin: 20,
                    marginBottom: 120,
                }}>
                <TouchableOpacity onPress={handleLogout}>
                    <Ionicons
                        name="log-out"
                        size={30}
                        color={globalStyles.buttonDanger.backgroundColor}
                    />
                </TouchableOpacity>
            </View>

            {/* Card Profil */}
            <View
                style={[globalStyles.profileCard, { flexDirection: "column" }]}>
                <Image
                    source={
                        user.foto
                            ? { uri: user.foto }
                            : require("@/assets/default-avatar.png")
                    }
                    style={{
                        width: 100,
                        height: 100,
                        borderRadius: 50,
                        alignSelf: "center",
                        marginBottom: 20,
                    }}
                />
                <Text style={globalStyles.text}>Nama : {user.nama}</Text>
                <Text style={globalStyles.text}>Jabatan : {user.jabatan}</Text>
                <Text style={globalStyles.text}>Email : {user.email}</Text>
                <Text style={globalStyles.text}>No HP : {user.no_hp}</Text>
                <Text style={globalStyles.text}>Role : {user.role}</Text>
                <Text style={globalStyles.text}>
                    perusahaan : {user.perusahaan?.nama}
                </Text>
            </View>
            {/* versi */}
            <View style={{ justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: "#AAAAAA" }}>
                    Versi Aplikasi : {version}
                </Text>
            </View>
        </View>
    );
}
