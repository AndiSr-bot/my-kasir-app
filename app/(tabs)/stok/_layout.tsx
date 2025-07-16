import { Stack } from "expo-router";

export default function PegawaiLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "Daftar Stok" }} />
            <Stack.Screen name="tambah" options={{ title: "Tambah Stok" }} />
            <Stack.Screen name="[id]" options={{ title: "Edit Stok" }} />
        </Stack>
    );
}
