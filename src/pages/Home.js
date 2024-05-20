import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import React, { Component } from "react";
import { db } from "../config/Firebase";

const lokasi = [
  { label: "Kantor Pusat", value: "Kantor Pusat" },
  { label: "Klinik Palapa", value: "Klinik Palapa" },
  { label: "Klinik Urip", value: "Klinik Urip" },
  { label: "Klinik Tugu", value: "Klinik Tugu" },
  { label: "Klinik Tirtayasa", value: "Klinik Tirtayasa" },
  { label: "Klinik Sumber Waras", value: "Klinik Sumber Waras" },
  { label: "Klinik Kemiling", value: "Klinik Kemiling" },
  { label: "Klinik Bugis", value: "Klinik Bugis" },
  { label: "GTS Tirtayasa", value: "GTS Tirtayasa" },
  { label: "GTS Kemiling", value: "GTS Kemiling" },
  { label: "Kosasih Rajabasa", value: "Kosasih Rajabasa" },
  { label: "Lainnya", value: "Lainnya" },
];

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount = () => {
    this.fetchAllLokasi();
  };

  logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    window.location.href = `/login`;
  };

  handleSubmit = async () => {
    const lokasiCollection = collection(db, "lokasi");

    try {
      const batchPromises = lokasi.map(async (lokasiItem) => {
        await addDoc(lokasiCollection, lokasiItem);
      });

      await Promise.all(batchPromises);
      console.log("Semua data berhasil ditambahkan");
    } catch (error) {
      console.error("Error menambahkan data: ", error);
    }
  };

  fetchAllLokasi = async () => {
    const lokasiCollection = collection(db, "lokasi");
    try {
      const querySnapshot = await getDocs(lokasiCollection);
      const lokasiList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.setState({ lokasi: lokasiList });
      console.log("Data lokasi berhasil diambil:", lokasiList);
    } catch (error) {
      console.error("Error mengambil data lokasi: ", error);
    }
  };

  deleteAllLokasi = async () => {
    const lokasiCollection = collection(db, "lokasi");
    try {
      const querySnapshot = await getDocs(lokasiCollection);
      const deletePromises = querySnapshot.docs.map((document) =>
        deleteDoc(doc(db, "lokasi", document.id))
      );
      await Promise.all(deletePromises);
      console.log("Semua dokumen dalam koleksi 'lokasi' telah dihapus.");
    } catch (error) {
      console.error("Error menghapus dokumen: ", error);
    }
  };

  render() {
    return (
      <>
        <div>Welcome to hello world</div>
        <button onClick={this.logout}>logout</button>

        <button onClick={this.handleSubmit}>masukan data</button>
        <button onClick={this.deleteAllLokasi}>hapus data</button>
      </>
    );
  }
}

export default Home;
