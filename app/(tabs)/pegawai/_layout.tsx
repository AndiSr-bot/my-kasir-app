import { Stack } from "expo-router";

export default function PegawaiLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "Daftar Pegawai" }} />
            <Stack.Screen name="tambah" options={{ title: "Tambah Pegawai" }} />
            <Stack.Screen name="[id]" options={{ title: "Edit Pegawai" }} />
        </Stack>
    );
}
