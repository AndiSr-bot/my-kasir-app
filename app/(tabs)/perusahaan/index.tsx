/* eslint-disable react-hooks/exhaustive-deps */
import SearchComponent from "@/components/searchComponent";
import { getPrimaryColor } from "@/constants/Colors";
import { globalStyles } from "@/constants/styles";
import { db } from "@/services/firebase";
import { TPerusahaan } from "@/types/perusahaan_repositories";
import { useFocusEffect, useRouter } from "expo-router";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
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
    const [dataSearched, setDataSearched] = useState<TPerusahaan[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const fetchData = async () => {
        setSearchQuery("");
        setData([]);
        try {
            setLoading(true);
            const querySnapshot = await getDocs(
                query(collection(db, "perusahaan"), orderBy("nama", "asc"))
            );
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
            setDataSearched(perusahaanList);
        } catch (error) {
            console.log("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (searchQuery === "") {
            setDataSearched(data);
        } else {
            const filteredData = data.filter((item) =>
                item.nama.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setDataSearched(filteredData);
        }
    };

    useEffect(() => {
        handleSearch();
    }, [searchQuery]);
    useEffect(() => {
        fetchData();
    }, []);
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

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
                <SearchComponent
                    onPress={() => router.push("/perusahaan/tambah")}
                    placeholder="Cari perusahaan..."
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            </View>
            <View style={globalStyles.containerCard}>
                <FlatList
                    data={dataSearched}
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
                                color={getPrimaryColor()}
                                style={{ marginTop: 20 }}
                            />
                        )
                    }
                />
            </View>
        </>
    );
}
