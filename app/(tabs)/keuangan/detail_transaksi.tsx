/* eslint-disable react-hooks/exhaustive-deps */
import { globalStyles } from "@/constants/styles";
import { namaBulan } from "@/constants/time";
import { db } from "@/services/firebase";
import { TPegawai } from "@/types/pegawai_repositories";
import { TTransaksiGrouped } from "@/types/transaksi_repositories";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function DetailTransaksiScreen() {
    const [perusahaanId, setPerusahaanId] = useState("");
    const [userDataLocal, setUserDataLocal] = useState<TPegawai | null>(null);
    const [tanggal, setTanggal] = useState("1");
    const [bulan, setBulan] = useState("Januari");
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [transaksiGrouped, setTransaksiGrouped] = useState<
        TTransaksiGrouped[]
    >([]);
    const [transaksiGroupedSelected, setTransaksiGroupedSelected] =
        useState<TTransaksiGrouped | null>(null);
    const tanggalOptions = Array.from({ length: 31 }, (_, i) =>
        (i + 1).toString()
    );
    const bulanOptions = namaBulan;
    const tahunOptions = Array.from({ length: 5 }, (_, i) =>
        (new Date().getFullYear() - i).toString()
    );
    const getNow = () => {
        const now = new Date();
        setTanggal(String(now.getDate()));
        setBulan(namaBulan[now.getMonth()]);
        setTahun(String(now.getFullYear()));
    };

    useEffect(() => {
        fetchData();
    }, [tanggal, bulan, tahun]);
    useEffect(() => {
        getNow();
        getUserData();
    }, []);
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
        setLoading(true);
        try {
            if (!perusahaanId) return;
            const transaksiRef = collection(
                db,
                "perusahaan",
                perusahaanId,
                "transaksi"
            );
            const q = query(
                transaksiRef,
                where("tanggal", "==", tanggal),
                where("bulan", "==", bulan),
                where("tahun", "==", tahun)
            );

            const snapshot = await getDocs(q);

            const listTransaksiTemp: TTransaksiGrouped[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                const index = listTransaksiTemp.findIndex(
                    (item) => item.kode === data.kode
                );
                if (index !== -1) {
                    listTransaksiTemp[index].transaksi.push({
                        id: doc.id,
                        harga: data.harga,
                        jumlah: data.jumlah,
                        kode: data.kode,
                        tanggal: data.tanggal,
                        bulan: data.bulan,
                        tahun: data.tahun,
                        hari: data.hari,
                        nama: data.nama,
                        perusahaanId: data.perusahaanId,
                        stokId: data.stokId,
                        gambar: data.gambar,
                        created_at: data.created_at,
                        updated_at: data.updated_at,
                    });
                } else {
                    listTransaksiTemp.push({
                        namaPerusahaan: userDataLocal?.perusahaan?.nama || "",
                        total: (data.harga * data.jumlah).toLocaleString(
                            "id-ID"
                        ),
                        kode: data.kode,
                        //datetime firebase to epoch
                        //tanggal: new Date(data.created_at.toDate()).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
                        tanggal: new Date(
                            data.created_at.toDate()
                        ).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                        }),
                        transaksi: [
                            {
                                id: doc.id,
                                harga: data.harga,
                                jumlah: data.jumlah,
                                kode: data.kode,
                                tanggal: data.tanggal,
                                bulan: data.bulan,
                                tahun: data.tahun,
                                hari: data.hari,
                                nama: data.nama,
                                perusahaanId: data.perusahaanId,
                                stokId: data.stokId,
                                gambar: data.gambar,
                                created_at: data.created_at,
                                updated_at: data.updated_at,
                            },
                        ],
                    });
                }
            });

            // setTotalSales(total);
            // setJumlahTransaksi(kodeSet.size);
            // setJumlahProduk(jumlah);
            setTransaksiGrouped(listTransaksiTemp);
        } catch (error) {
            console.error("Error fetching transaksi:", error);
        } finally {
            setLoading(false);
        }
    };
    const renderItem = ({ item }: { item: TTransaksiGrouped }) => (
        <TouchableOpacity
            style={[
                globalStyles.card,
                {
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                },
            ]}
            onPress={() => {
                setTransaksiGroupedSelected(item);
                setModalVisible(true);
            }}>
            <View>
                <Text style={globalStyles.title}>
                    ID Transaksi: {item.kode}
                </Text>
                <Text style={[{ fontSize: globalStyles.title.fontSize }]}>
                    {item.tanggal}
                </Text>
                <Text style={[{ fontWeight: globalStyles.title.fontWeight }]}>
                    Total: Rp {item.total}
                </Text>
                {/* icon nota */}
            </View>
            <View style={{ marginEnd: 10 }}>
                <Ionicons name="receipt" size={20} />
            </View>
        </TouchableOpacity>
    );
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };
    return (
        <View>
            {/* Picker Tanggal/Bulan/Tahun */}
            <View style={globalStyles.pickerRow}>
                <View
                    style={{
                        borderWidth: 1,
                        borderColor: "#ccc",
                        borderRadius: 8,
                    }}>
                    <Picker
                        selectedValue={tanggal}
                        onValueChange={(value) => setTanggal(value)}
                        style={[globalStyles.picker]}>
                        {tanggalOptions.map((t) => (
                            <Picker.Item key={t} label={t} value={t} />
                        ))}
                    </Picker>
                </View>

                <View
                    style={{
                        borderWidth: 1,
                        borderColor: "#ccc",
                        borderRadius: 8,
                    }}>
                    <Picker
                        selectedValue={bulan}
                        onValueChange={(value) => setBulan(value)}
                        style={globalStyles.picker}>
                        {bulanOptions.map((b) => (
                            <Picker.Item key={b} label={b} value={b} />
                        ))}
                    </Picker>
                </View>

                <View
                    style={{
                        borderWidth: 1,
                        borderColor: "#ccc",
                        borderRadius: 8,
                    }}>
                    <Picker
                        selectedValue={tahun}
                        onValueChange={(value) => setTahun(value)}
                        style={globalStyles.picker}>
                        {tahunOptions.map((y) => (
                            <Picker.Item key={y} label={y} value={y} />
                        ))}
                    </Picker>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={transaksiGrouped}
                    keyExtractor={(item) => item.kode || ""}
                    renderItem={renderItem}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={
                        !loading ? (
                            <Text style={globalStyles.emptyText}>
                                {perusahaanId
                                    ? "Belum ada produk"
                                    : "Silahkan pilih perusahaan"}
                            </Text>
                        ) : (
                            <ActivityIndicator
                                size="large"
                                style={{ marginTop: 20 }}
                            />
                        )
                    }
                />
            )}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        justifyContent: "center",
                        padding: 20,
                    }}>
                    <View
                        style={{
                            backgroundColor: "#fff",
                            borderRadius: 10,
                            padding: 20,
                            maxHeight: "80%",
                        }}>
                        {/* HEADER STRUK */}
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                textAlign: "center",
                                marginBottom: 4,
                            }}>
                            {transaksiGroupedSelected?.namaPerusahaan}
                        </Text>
                        <Text
                            style={{
                                fontSize: 12,
                                textAlign: "center",
                                marginBottom: 10,
                            }}>
                            {transaksiGroupedSelected?.tanggal}
                        </Text>
                        <Text
                            style={{
                                fontSize: 12,
                                textAlign: "center",
                                marginBottom: 15,
                            }}>
                            ID Transaksi: {transaksiGroupedSelected?.kode}
                        </Text>

                        {/* DETAIL BELANJA */}
                        <ScrollView style={{ marginBottom: 20 }}>
                            {transaksiGroupedSelected?.transaksi.map(
                                (item, idx) => (
                                    <View
                                        key={idx}
                                        style={{
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            marginBottom: 5,
                                        }}>
                                        <Text>
                                            {item.nama} ({item.jumlah}x) @ Rp{" "}
                                            {item.harga.toLocaleString("id-ID")}
                                        </Text>
                                        <Text>
                                            Rp{" "}
                                            {(
                                                item.jumlah * item.harga
                                            ).toLocaleString("id-ID")}
                                        </Text>
                                    </View>
                                )
                            )}
                        </ScrollView>

                        {/* TOTAL */}
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                marginBottom: 15,
                                textAlign: "right",
                            }}>
                            Total: Rp {transaksiGroupedSelected?.total}
                        </Text>

                        {/* ACTION BUTTONS */}
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "flex-end",
                            }}>
                            <TouchableOpacity
                                style={globalStyles.buttonModalDanger}
                                onPress={() => setModalVisible(false)}>
                                <Text
                                    style={{
                                        color: "#fff",
                                        fontWeight: "bold",
                                    }}>
                                    Tutup
                                </Text>
                            </TouchableOpacity>
                            <View style={{ width: 10 }} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
