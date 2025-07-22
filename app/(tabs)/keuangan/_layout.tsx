import { getPrimaryColor, getWhiteColor } from "@/constants/Colors";
import { TPegawai } from "@/types/pegawai_repositories";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function KeuanganLayout() {
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
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: userDataLocal?.role === "admin" ? "Keuangan" : "",
                    // headerShown: false,
                    headerTintColor: getWhiteColor(),
                    headerLeft: () =>
                        userDataLocal?.role === "admin_perusahaan" && (
                            <>
                                <TouchableOpacity
                                    onPress={() => router.replace("/(tabs)")}>
                                    <Ionicons
                                        name="arrow-back"
                                        size={23}
                                        style={{
                                            textAlign: "left",
                                            color: getWhiteColor(),
                                            paddingLeft: 1,
                                        }}
                                    />
                                </TouchableOpacity>
                                <Text
                                    style={{
                                        textAlign: "left",
                                        color: getWhiteColor(),
                                        fontSize: 20,
                                        fontWeight: "500",
                                        paddingBottom: 1,
                                        paddingLeft: 32,
                                    }}>
                                    Keuangan
                                </Text>
                            </>
                        ),
                    headerBackground: () => (
                        <View
                            style={{
                                backgroundColor: getPrimaryColor(),
                                height: 90,
                            }}></View>
                    ),
                }}
            />
        </Stack>
    );
}
