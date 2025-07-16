import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
    },
    card: {
        flexDirection: "row",
        gap: 12,
        marginVertical: 8,
        padding: 12,
        borderRadius: 8,
        backgroundColor: "#f2f2f2",
    },
    title: {
        fontWeight: "bold",
        fontSize: 16,
    },
    image: {
        width: 64,
        height: 64,
        borderRadius: 8,
    },
    buttonPrimary: {
        backgroundColor: "#1e90ff",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    buttonText: {
        color: "white",
        textAlign: "center",
    },
    emptyText: {
        textAlign: "center",
        marginTop: 16,
        fontStyle: "italic",
    },
    label: {
        marginTop: 12,
        marginBottom: 4,
        fontWeight: "bold",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 8,
        backgroundColor: "#fff",
    },
    buttonSuccess: {
        backgroundColor: "#24953eff",
        padding: 12,
        borderRadius: 8,
        marginTop: 24,
    },
    buttonDanger: {
        backgroundColor: "#d43545ff",
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginTop: 8,
    },
});
