/* eslint-disable react-hooks/exhaustive-deps */
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";

export default function TabLayout() {
    const router = useRouter();
    const middleware = async () => {
        const user: any = await AsyncStorage.getItem("user");
        const userData: any = JSON.parse(user);
        if (!userData.id) {
            router.replace("/login");
            return;
        } else {
            router.replace("/(tabs)");
            return;
        }
    };
    useEffect(() => {
        middleware();
    }, []);
    return (
        <Tabs>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Beranda",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="perusahaan"
                options={{
                    title: "Perusahaan",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="business" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="pegawai"
                options={{
                    title: "Pegawai",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="stok"
                options={{
                    title: "Stok",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="cube" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profil"
                options={{
                    title: "Profil",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" color={color} size={size} />
                    ),
                }}
            />
            {/* 
            <Tabs.Screen
                name="transaksi"
                options={{
                    title: "Transaksi",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="cart" color={color} size={size} />
                    ),
                }}
            /> 
            */}
        </Tabs>
    );
}
