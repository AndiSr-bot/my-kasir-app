import {
    getPrimary2ndColor,
    getPrimaryColor,
    getSecondaryColor,
    getWhiteColor,
} from "@/constants/Colors";
import { globalStyles } from "@/constants/styles";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import DetailStokTab from "./detail_stok";
import EditStokTab from "./edit_stok";
import RestockStokTab from "./restock_stok";

export default function EditStokScreen() {
    const { perusahaanId, id } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState(0);
    const [kodeActiveTab, setKodeActiveTab] = useState("detail");

    const tabs = [
        {
            kode: "detail",
            name: "Detail",
        },
        {
            kode: "edit",
            name: "Edit",
        },
        {
            kode: "restock",
            name: "Restock",
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
                            onPress={() => {
                                setKodeActiveTab(tabs[index].kode);
                                setActiveTab(index);
                            }}>
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
                {tabs[activeTab].kode === "detail" && (
                    <DetailStokTab
                        id={id as string}
                        perusahaanId={perusahaanId as string}
                        kodeActiveTab={kodeActiveTab}
                    />
                )}
                {tabs[activeTab].kode === "edit" && (
                    <EditStokTab
                        id={id as string}
                        perusahaanId={perusahaanId as string}
                        kodeActiveTab={kodeActiveTab}
                    />
                )}
                {tabs[activeTab].kode === "restock" && (
                    <RestockStokTab
                        id={id as string}
                        perusahaanId={perusahaanId as string}
                        kodeActiveTab={kodeActiveTab}
                    />
                )}
                {/* </View> */}
            </View>
        </>
    );
}
