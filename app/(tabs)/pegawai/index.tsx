/* eslint-disable react-hooks/exhaustive-deps */
import { globalStyles } from "@/constants/styles";
import { db } from "@/services/firebase";
import { TPegawai } from "@/types/pegawai_repositories";
import { TPerusahaan } from "@/types/perusahaan_repositories";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

export default function PegawaiTab() {
    const [data, setData] = useState<TPegawai[]>([]);
    const [loading, setLoading] = useState(false);
    const [perusahaanId, setPerusahaanId] = useState("");
    const [perusahaanList, setPerusahaanList] = useState<TPerusahaan[]>([]);
    const router = useRouter();

    const fetchData = async () => {
        try {
            if (!perusahaanId) {
                setData([]);
            } else {
                setLoading(true);
                const querySnapshot = await getDocs(
                    collection(db, "perusahaan", perusahaanId, "pegawai")
                );
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
            }
        } catch (error) {
            console.log("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [perusahaanId]);
    useFocusEffect(
        useCallback(() => {
            setPerusahaanId("");
            fetchData();
        }, [])
    );
    useEffect(() => {
        fetchPerusahaan();
    }, []);

    const fetchPerusahaan = async () => {
        try {
            const snapshot = await getDocs(collection(db, "perusahaan"));
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
        <View style={globalStyles.container}>
            <View
                style={[
                    globalStyles.input,
                    { padding: 0, height: 50, marginBottom: 12 },
                ]}>
                <Picker
                    selectedValue={perusahaanId}
                    onValueChange={setPerusahaanId}
                    style={{ color: "#000" }}>
                    <Picker.Item label="-- Pilih Perusahaan --" value="" />
                    {perusahaanList.map((item) => (
                        <Picker.Item
                            key={item.id}
                            label={item.nama}
                            value={item.id}
                        />
                    ))}
                </Picker>
            </View>
            <TouchableOpacity
                style={globalStyles.buttonPrimary}
                onPress={() => router.push("/pegawai/tambah")}>
                <Text style={globalStyles.buttonText}>+ Tambah Pegawai</Text>
            </TouchableOpacity>

            <FlatList
                data={data}
                keyExtractor={(item) => item.id || ""}
                renderItem={renderItem}
                refreshing={loading}
                onRefresh={fetchData}
                ListEmptyComponent={
                    <Text style={globalStyles.emptyText}>
                        {perusahaanId
                            ? "Belum ada pegawai"
                            : "Silahkan pilih perusahaan"}
                    </Text>
                }
            />
        </View>
    );
}
