import { getPrimaryColor, getWhiteColor } from "@/constants/Colors";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function PerusahaanLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: "Perusahaan",
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
                    title: "Tambah Perusahaan",
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
            <Stack.Screen name="[id]" options={{ title: "Edit Perusahaan" }} />
        </Stack>
    );
}
