/* eslint-disable react-hooks/exhaustive-deps */
import { getPrimaryColor, getWhiteColor } from "@/constants/Colors";
import { TPegawai } from "@/types/pegawai_repositories";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function TabLayout() {
    const [userDataLocal, setUserDataLocal] = useState<TPegawai | null>(null);
    const router = useRouter();
    const middleware = async () => {
        const user: any = await AsyncStorage.getItem("user");
        const userData: any = JSON.parse(user);
        if (!userData.id) {
            router.replace("/login");
            return;
        } else {
            setUserDataLocal(userData);
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
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name="home"
                            color={color}
                            size={focused ? 30 : 19}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="perusahaan"
                options={{
                    title: "Perusahaan",
                    href: userDataLocal?.role === "admin" ? undefined : null,
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name="business"
                            color={color}
                            size={focused ? 30 : 19}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="pegawai"
                options={{
                    title: "Pegawai",
                    href:
                        userDataLocal?.role === "admin" ||
                        userDataLocal?.role === "admin_perusahaan"
                            ? undefined
                            : null,
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name="people"
                            color={color}
                            size={focused ? 30 : 19}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="scan"
                options={{
                    title: "",
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <View
                            style={{
                                width: focused ? 70 : 60,
                                height: focused ? 70 : 60,
                                backgroundColor: getPrimaryColor(),
                                borderRadius: 40,
                                justifyContent: "center",
                                alignItems: "center",
                            }}>
                            <Ionicons
                                name="scan"
                                color={getWhiteColor()}
                                size={focused ? 40 : 30}
                            />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="stok"
                options={{
                    title: "Stok",
                    href:
                        userDataLocal?.role === "admin" ||
                        userDataLocal?.role === "admin_perusahaan"
                            ? undefined
                            : null,
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name="cube"
                            color={color}
                            size={focused ? 30 : 19}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="keuangan"
                options={{
                    title: "Keuangan",
                    headerShown: false,
                    href: userDataLocal?.role === "admin" ? undefined : null,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name="wallet"
                            color={color}
                            size={focused ? 30 : 19}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profil"
                options={{
                    title: "Profil",
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name="person"
                            color={color}
                            size={focused ? 30 : 19}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
