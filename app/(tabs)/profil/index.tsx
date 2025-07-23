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
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}>
                    <Text style={[globalStyles.text, { fontWeight: "bold" }]}>
                        Nama
                    </Text>
                    <Text style={globalStyles.title}>{user.nama}</Text>
                </View>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}>
                    <Text style={[globalStyles.text, { fontWeight: "bold" }]}>
                        Jabatan
                    </Text>
                    <Text style={globalStyles.title}>{user.jabatan}</Text>
                </View>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}>
                    <Text style={[globalStyles.text, { fontWeight: "bold" }]}>
                        Email
                    </Text>
                    <Text style={globalStyles.title}>{user.email}</Text>
                </View>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}>
                    <Text style={[globalStyles.text, { fontWeight: "bold" }]}>
                        No HP
                    </Text>
                    <Text style={globalStyles.title}>{user.no_hp}</Text>
                </View>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}>
                    <Text style={[globalStyles.text, { fontWeight: "bold" }]}>
                        Role
                    </Text>
                    <Text style={globalStyles.title}>
                        {user.role.replace("_", " ")}
                    </Text>
                </View>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}>
                    <Text style={[globalStyles.text, { fontWeight: "bold" }]}>
                        Perusahaan
                    </Text>
                    <Text style={globalStyles.title}>
                        {user.perusahaan?.nama}
                    </Text>
                </View>
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
