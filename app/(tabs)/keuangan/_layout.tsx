import { Stack } from "expo-router";

export default function KeuanganLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{ title: "Keuangan", headerShown: false }}
            />
        </Stack>
    );
}
