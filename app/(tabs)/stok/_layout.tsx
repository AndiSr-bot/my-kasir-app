import { Stack } from "expo-router";
import { View } from "react-native";

export default function PegawaiLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: "Daftar Stok",
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
                    title: "Tambah Stok",
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
                    title: "Edit Stok",
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
