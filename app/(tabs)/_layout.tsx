import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Beranda",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="perusahaan"
                options={{
                    title: "Perusahaan",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="business" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="pegawai"
                options={{
                    title: "Pegawai",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="stok"
                options={{
                    title: "Stok",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="cube" color={color} size={size} />
                    ),
                }}
            />
            {/* 
            <Tabs.Screen
                name="transaksi"
                options={{
                    title: "Transaksi",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="cart" color={color} size={size} />
                    ),
                }}
            /> 
            */}
        </Tabs>
    );
}
