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
    buttonSecondary: {
        backgroundColor: "#f2f2f2",
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    text: {
        fontSize: 16,
        marginBottom: 8,
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
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginTop: 8,
    },
    stokRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 15,
        gap: 10,
    },
    stokItem: {
        alignItems: "center",
        flex: 1,
        backgroundColor: "#f2f2f2",
        borderRadius: 8,
        padding: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    stokLabel: {
        fontWeight: "bold",
        fontSize: 14,
    },
    stokValue: {
        fontSize: 14,
        marginTop: 4,
    },
    homeCard: {
        flexDirection: "row",
        gap: 12,
        marginVertical: 8,
        padding: 12,
        borderRadius: 8,
        backgroundColor: "#f2f2f2",
    },
    buttonModalPrimary: {
        backgroundColor: "#1e90ff",
        padding: 8,
        borderRadius: 6,
    },
    buttonModalSuccess: {
        backgroundColor: "#24953eff",
        padding: 8,
        borderRadius: 6,
    },
    buttonModalDanger: {
        backgroundColor: "#d43545ff",
        padding: 8,
        borderRadius: 6,
    },
});
