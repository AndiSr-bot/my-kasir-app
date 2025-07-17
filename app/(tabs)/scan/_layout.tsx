import { Stack } from "expo-router";

export default function ScanLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{ title: "Scan", headerShown: false }}
            />
        </Stack>
    );
}
