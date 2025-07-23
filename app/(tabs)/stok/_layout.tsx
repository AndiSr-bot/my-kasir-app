import { getPrimaryColor, getWhiteColor } from "@/constants/Colors";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function PegawaiLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: "Daftar Stok",
                    headerTintColor: getWhiteColor(),
                    headerBackground: () => (
                        <View
                            style={{
                                backgroundColor: getPrimaryColor(),
                                height: 90,
                            }}></View>
                    ),
                }}
            />
            <Stack.Screen
                name="tambah"
                options={{
                    title: "Tambah Stok",
                    headerTintColor: getWhiteColor(),
                    headerBackground: () => (
                        <View
                            style={{
                                backgroundColor: getPrimaryColor(),
                                height: 90,
                            }}></View>
                    ),
                }}
            />
            <Stack.Screen
                name="[id]"
                options={{
                    title: "Detail Stok",
                    headerTintColor: getWhiteColor(),
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
