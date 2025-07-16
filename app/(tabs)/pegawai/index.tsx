import { globalStyles } from "@/constants/styles";
import { db } from "@/services/firebase";
import { useFocusEffect, useRouter } from "expo-router";
import { collectionGroup, getDocs } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

export default function PegawaiTab() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const fetchData = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collectionGroup(db, "pegawai"));
            const pegawaiList: any[] = [];
            querySnapshot.forEach((doc) => {
                pegawaiList.push({ id: doc.id, ...doc.data() });
            });
            setData(pegawaiList);
        } catch (error) {
            console.log("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            style={[
                globalStyles.card,
                { flexDirection: "row", alignItems: "center" },
            ]}
            onPress={() =>
                router.push(
                    `/pegawai/${item.id}?perusahaanId=${item.perusahaanId}`
                )
            }>
            <Image
                source={
                    item.foto
                        ? { uri: item.foto }
                        : require("@/assets/default-avatar.png")
                }
                style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    marginRight: 10,
                }}
            />
            <View>
                <Text style={globalStyles.title}>{item.nama}</Text>
                <Text>
                    {item.jabatan} • {item.role}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={globalStyles.container}>
            <TouchableOpacity
                style={globalStyles.buttonPrimary}
                onPress={() => router.push("/pegawai/tambah")}>
                <Text style={globalStyles.buttonText}>+ Tambah Pegawai</Text>
            </TouchableOpacity>

            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                refreshing={loading}
                onRefresh={fetchData}
                ListEmptyComponent={
                    <Text style={globalStyles.emptyText}>
                        Belum ada pegawai
                    </Text>
                }
            />
        </View>
    );
}
