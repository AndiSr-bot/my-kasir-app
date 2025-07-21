import { Stack } from "expo-router";
import { View } from "react-native";

export default function PegawaiLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: "Daftar Pegawai",
                    headerTintColor: "#ffffff",
                    headerBackground: () => (
                        <View
                            style={{
                                backgroundColor: "#2675ffff",
                                height: 90,
                            }}></View>
                    ),
                }}
            />
            <Stack.Screen
                name="tambah"
                options={{
                    title: "Tambah Pegawai",
                    headerTintColor: "#ffffff",
                    headerBackground: () => (
                        <View
                            style={{
                                backgroundColor: "#2675ffff",
                                height: 90,
                            }}></View>
                    ),
                }}
            />
            <Stack.Screen
                name="[id]"
                options={{
                    title: "Edit Pegawai",
                    headerTintColor: "#ffffff",
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
