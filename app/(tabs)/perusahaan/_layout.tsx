import { Stack } from "expo-router";

export default function PerusahaanLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "Perusahaan" }} />
            <Stack.Screen
                name="tambah"
                options={{ title: "Tambah Perusahaan" }}
            />
            <Stack.Screen name="[id]" options={{ title: "Edit Perusahaan" }} />
        </Stack>
    );
}
