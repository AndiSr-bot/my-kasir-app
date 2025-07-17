import { Stack } from "expo-router";

export default function TransaksiLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{ title: "Transaksi", headerShown: false }}
            />
        </Stack>
    );
}
