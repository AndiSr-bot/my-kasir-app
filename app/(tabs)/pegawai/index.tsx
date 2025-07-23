/* eslint-disable react-hooks/exhaustive-deps */
import SearchComponent from "@/components/searchComponent";
import { getPrimaryColor } from "@/constants/Colors";
import { globalStyles } from "@/constants/styles";
import { db } from "@/services/firebase";
import { TPegawai } from "@/types/pegawai_repositories";
import { TPerusahaan } from "@/types/perusahaan_repositories";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useRouter } from "expo-router";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function PegawaiTab() {
    const router = useRouter();
    const [data, setData] = useState<TPegawai[]>([]);
    const [dataSearched, setDataSearched] = useState<TPegawai[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [perusahaanId, setPerusahaanId] = useState("");
    const [userDataLocal, setUserDataLocal] = useState<TPegawai | null>(null);
    const [perusahaanList, setPerusahaanList] = useState<TPerusahaan[]>([]);
    const getUserData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem("user");
            if (jsonValue != null) {
                setPerusahaanId(JSON.parse(jsonValue).perusahaanId);
                setUserDataLocal(JSON.parse(jsonValue));
            }
        } catch (e) {
            console.log("Error loading user data", e);
        }
    };
    const fetchData = async () => {
        setData([]);
        setSearchQuery("");
        try {
            if (
                !perusahaanId ||
                !userDataLocal?.email ||
                userDataLocal?.role === "staff"
            ) {
                setData([]);
            } else {
                setLoading(true);
                const options =
                    userDataLocal?.role === "admin_perusahaan"
                        ? ["staff"]
                        : ["staff", "admin_perusahaan", "admin"];
                const q = query(
                    collection(db, "perusahaan", perusahaanId, "pegawai"),
                    where("role", "in", options),
                    orderBy("nama", "asc")
                );
                const querySnapshot = await getDocs(q);
                const pegawaiList: TPegawai[] = [];
                querySnapshot.forEach((doc) => {
                    pegawaiList.push({
                        id: doc.id,
                        perusahaanId: perusahaanId,
                        nama: doc.data().nama,
                        jabatan: doc.data().jabatan,
                        role: doc.data().role,
                        no_hp: doc.data().no_hp,
                        email: doc.data().email,
                        foto: doc.data().foto,
                        auth_uid: doc.data().auth_uid,
                    });
                });
                setData(pegawaiList);
                setDataSearched(pegawaiList);
            }
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

    const fetchPerusahaan = async () => {
        try {
            const snapshot = await getDocs(
                query(collection(db, "perusahaan"), orderBy("nama", "asc"))
            );
            const list: TPerusahaan[] = [];
            snapshot.forEach((doc) => {
                list.push({
                    id: doc.id,
                    nama: doc.data().nama,
                    alamat: doc.data().alamat,
                    telepon: doc.data().telepon,
                });
            });
            setPerusahaanList(list);
        } catch (error) {
            console.log("Error fetching perusahaan:", error);
        }
    };

    useEffect(() => {
        handleSearch();
    }, [searchQuery]);
    useEffect(() => {
        fetchData();
    }, [perusahaanId]);
    useFocusEffect(
        useCallback(() => {
            setPerusahaanId("");
            fetchData();
            getUserData();
        }, [])
    );
    useEffect(() => {
        fetchPerusahaan();
    }, []);

    const renderItem = ({ item }: { item: TPegawai }) => (
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
        <>
            <View style={globalStyles.container}>
                {userDataLocal?.role === "admin" && (
                    <View
                        style={[
                            globalStyles.input,
                            { padding: 0, height: 50, marginBottom: 12 },
                        ]}>
                        <Picker
                            selectedValue={perusahaanId}
                            onValueChange={setPerusahaanId}>
                            <Picker.Item
                                label="-- Pilih Perusahaan --"
                                value=""
                            />
                            {perusahaanList.map((item) => (
                                <Picker.Item
                                    key={item.id}
                                    label={item.nama}
                                    value={item.id}
                                />
                            ))}
                        </Picker>
                    </View>
                )}
                {/* <TouchableOpacity
                    style={[
                        globalStyles.buttonPrimary,
                        { marginBottom: 8, marginTop: 0 },
                    ]}
                    onPress={() => router.push("/pegawai/tambah")}>
                    <Text style={globalStyles.buttonText}>
                        + Tambah Pegawai
                    </Text>
                </TouchableOpacity> */}
                <SearchComponent
                    onPress={() => router.push("/pegawai/tambah")}
                    placeholder="Cari pegawai..."
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            </View>
            <View style={globalStyles.containerCard}>
                <FlatList
                    data={dataSearched}
                    keyExtractor={(item) => item.id || ""}
                    renderItem={renderItem}
                    refreshing={loading}
                    onRefresh={fetchData}
                    ListEmptyComponent={
                        !loading ? (
                            <Text style={globalStyles.emptyText}>
                                {perusahaanId
                                    ? "Belum ada pegawai"
                                    : "Silahkan pilih perusahaan"}
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
