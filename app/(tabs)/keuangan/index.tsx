import {
    getPrimary2ndColor,
    getPrimaryColor,
    getSecondaryColor,
    getWhiteColor,
} from "@/constants/Colors";
import { globalStyles } from "@/constants/styles";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import DetailKeuanganScreen from "./detail_keuangan";
import DetailTransaksiScreen from "./detail_transaksi";

export default function KeuanganScreen() {
    const [activeTab, setActiveTab] = useState(0);

    const tabs = [
        {
            kode: "keuangan",
            name: "Statistik",
        },
        {
            kode: "transaksi",
            name: "Transaksi",
        },
    ];

    return (
        <>
            <View
                style={[
                    globalStyles.container,
                    {
                        paddingTop: 5,
                        padding: 0,
                        backgroundColor: getWhiteColor(),
                    },
                ]}>
                {/* Tab Header */}
                <View
                    style={{
                        flexDirection: "row",
                        backgroundColor: getWhiteColor(),
                        borderRadius: 8,
                        overflow: "hidden",
                    }}>
                    {tabs.map((tab, index) => (
                        <TouchableOpacity
                            key={index}
                            style={{
                                flex: 1,
                                paddingVertical: 10,
                                backgroundColor:
                                    activeTab !== index
                                        ? getWhiteColor()
                                        : getPrimary2ndColor(),
                                borderTopLeftRadius:
                                    activeTab === index ? 10 : 0,
                                borderTopRightRadius:
                                    activeTab === index ? 10 : 0,
                                borderBottomWidth: activeTab !== index ? 1 : 0,
                                borderLeftWidth: activeTab === index ? 1 : 0,
                                borderRightWidth: activeTab === index ? 1 : 0,
                                borderTopWidth: activeTab === index ? 1 : 0,
                                borderColor: getSecondaryColor(),
                            }}
                            onPress={() => setActiveTab(index)}>
                            <Text
                                style={{
                                    textAlign: "center",
                                    fontWeight:
                                        activeTab === index ? "bold" : "normal",
                                    color: getPrimaryColor(),
                                    fontSize: 16,
                                }}>
                                {tab.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={globalStyles.containerCard}>
                {/* <View style={{ padding: 15, marginTop: 10 }}> */}
                {/* <Text style={{ fontWeight: "bold" }}>
                    {tabs[activeTab].name}
                </Text>
                <Text style={{ marginTop: 5 }}>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Voluptates, deserunt minima? Ut facere minus, ipsa dolore
                    animi quis alias eos, porro corporis quod esse quidem.
                </Text> */}
                {tabs[activeTab].kode === "keuangan" && (
                    <DetailKeuanganScreen />
                )}
                {tabs[activeTab].kode === "transaksi" && (
                    <DetailTransaksiScreen />
                )}
                {/* </View> */}
            </View>
        </>
    );
}
