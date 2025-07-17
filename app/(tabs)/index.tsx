import { globalStyles } from "@/constants/styles";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
    const router = useRouter();

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.text}>Selamat Datang</Text>
            <TouchableOpacity
                style={globalStyles.homeCard}
                onPress={() => router.push("/scan")}>
                <Text style={globalStyles.text}>Scan</Text>
            </TouchableOpacity>
        </View>
    );
}
