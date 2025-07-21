import { Stack } from "expo-router";
import { View } from "react-native";

export default function KeuanganLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: "Keuangan",
                    // headerShown: false,
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
