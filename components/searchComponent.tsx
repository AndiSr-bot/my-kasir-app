import { globalStyles } from "@/constants/styles";
import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SearchComponent({
    onPress,
    placeholder,
    searchQuery,
    setSearchQuery,
}: {
    onPress: () => void;
    placeholder: string;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}) {
    return (
        <View style={globalStyles.actionContainer}>
            {/* search component */}
            <View style={globalStyles.searchContainer}>
                <TextInput
                    style={globalStyles.searchInput}
                    placeholder={placeholder}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            <TouchableOpacity
                style={[
                    globalStyles.buttonPrimary,
                    { marginBottom: 1, marginTop: 0 },
                ]}
                onPress={onPress}>
                <Text style={globalStyles.buttonText}>
                    <Ionicons name="add" size={20} />
                </Text>
            </TouchableOpacity>
        </View>
    );
}
