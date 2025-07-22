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
                    headerTintColor: "#ffffff",
                    // headerBackground: () =>
                    //     userDataLocal?.role === "admin_perusahaan" ? (
                    //         <View
                    //             style={{
                    //                 backgroundColor: "#2675ffff",
                    //                 height: 90,
                    //                 flexDirection: "row",
                    //                 justifyContent: "flex-start",
                    //                 alignItems: "flex-end",
                    //                 paddingBottom: 16,
                    //                 paddingLeft: 17,
                    //             }}>
                    //             <TouchableOpacity
                    //                 onPress={() => router.replace("/(tabs)")}
                    //                 style={{ backgroundColor: "red" }}>
                    //                 <Ionicons
                    //                     name="arrow-back"
                    //                     size={23}
                    //                     style={{
                    //                         textAlign: "left",
                    //                         color: "#ffffff",
                    //                     }}
                    //                 />
                    //             </TouchableOpacity>
                    //             <Text
                    //                 style={{
                    //                     textAlign: "left",
                    //                     color: "#ffffff",
                    //                     fontSize: 20,
                    //                     fontWeight: "500",
                    //                     paddingBottom: 1,
                    //                     paddingLeft: 32,
                    //                 }}>
                    //                 Keuangan
                    //             </Text>
                    //         </View>
                    //     ) : (
                    //         <View
                    //             style={{
                    //                 backgroundColor: "#2675ffff",
                    //                 height: 90,
                    //             }}></View>
                    //     ),
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
                                            color: "#ffffff",
                                            paddingLeft: 1,
                                        }}
                                    />
                                </TouchableOpacity>
                                <Text
                                    style={{
                                        textAlign: "left",
                                        color: "#ffffff",
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
                                backgroundColor: "#2675ffff",
                                height: 90,
                            }}></View>
                    ),
                }}
            />
        </Stack>
    );
}
