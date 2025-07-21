import { globalStyles } from "@/constants/styles";
import { db } from "@/services/firebase";
import { TPerusahaan } from "@/types/perusahaan_repositories";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function PerusahaanListScreen() {
    const [data, setData] = useState<TPerusahaan[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const fetchData = async () => {
        setData([]);
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "perusahaan"));
            const perusahaanList: TPerusahaan[] = [];
            querySnapshot.forEach((doc) => {
                perusahaanList.push({
                    id: doc.id,
                    alamat: doc.data().alamat,
                    nama: doc.data().nama,
                    telepon: doc.data().telepon,
                    logo: doc.data().logo,
                });
            });
            setData(perusahaanList);
        } catch (error) {
            console.log("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const renderItem = ({ item }: { item: TPerusahaan }) => (
        <TouchableOpacity
            style={globalStyles.card}
            onPress={() => router.push(`/perusahaan/${item.id}`)}>
            <Image
                source={
                    item.logo
                        ? { uri: item.logo }
                        : require("@/assets/default-logo.png")
                }
                style={globalStyles.image}
            />
            <View style={{ flex: 1 }}>
                <Text style={globalStyles.title}>{item.nama}</Text>
                <Text>{item.alamat}</Text>
                <Text>{item.telepon}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <>
            <View style={globalStyles.container}>
                <TouchableOpacity
                    style={[
                        globalStyles.buttonPrimary,
                        { marginBottom: 8, marginTop: 0 },
                    ]}
                    onPress={() => router.push("/perusahaan/tambah")}>
                    <Text style={globalStyles.buttonText}>
                        + Tambah Perusahaan
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={globalStyles.containerCard}>
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.id || ""}
                    renderItem={renderItem}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={fetchData}
                        />
                    }
                    ListEmptyComponent={
                        !loading ? (
                            <Text style={globalStyles.emptyText}>
                                Belum ada perusahaan
                            </Text>
                        ) : (
                            <ActivityIndicator
                                size="large"
                                style={{ marginTop: 20 }}
                            />
                        )
                    }
                />
            </View>
        </>
    );
}
