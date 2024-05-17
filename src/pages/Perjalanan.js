import React, { Component } from "react";
import { auth } from "../config/Firebase";
import { Link } from "react-router-dom";
import { db } from "../config/Firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

class Perjalanan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      trips: [],
      displayName: "",
      user: {},
    };
  }

  componentDidMount = async () => {
    const userEmail = localStorage.getItem("userEmail");
    await this.setState({ displayName: userEmail });
    await this.getAllTripsByUid();
  };

  getUserLogin = async (email) => {
    try {
      const userRef = collection(db, "User");
      const q = query(userRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }
      const userData = querySnapshot.docs[0].data();

      await new Promise((resolve) => {
        this.setState({ user: userData }, resolve);
      });

      return userData;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  // import { collection, query, where, getDocs } from "firebase/firestore";

  getAllTripsByUid = async () => {
    await this.getUserLogin(this.state.displayName);
    const { user } = this.state;
    try {
      const userRef = doc(db, "User", user.uid);
      const tripsCollection = collection(db, "trips");
      const userTripsQuery = query(
        tripsCollection,
        where("refUser", "==", userRef)
      );
      const querySnapshot = await getDocs(userTripsQuery);

      const tripList = [];
      for (const doc of querySnapshot.docs) {
        const tripData = doc.data();
        // Ambil data dari subkoleksi 'lokasiAwal'
        const lokasiAwalRef = collection(doc.ref, "lokasiAwal");
        const lokasiAwalSnapshot = await getDocs(lokasiAwalRef);
        const lokasiAwalData = lokasiAwalSnapshot.docs.map((lokasiDoc) =>
          lokasiDoc.data()
        );

        // Tambahkan data lokasiAwal ke dalam data perjalanan
        tripData.lokasiAwal = lokasiAwalData;

        const lokasiAkhirRef = collection(doc.ref, "lokasiAkhir");
        const lokasiAkhirSnapshot = await getDocs(lokasiAkhirRef);
        const lokasiAkhirData = lokasiAkhirSnapshot.docs.map((lokasiDoc) =>
          lokasiDoc.data()
        );

        // Tambahkan data lokasiAkhir ke dalam data perjalanan
        tripData.lokasiAkhir = lokasiAkhirData;

        tripList.push({ id: doc.id, ...tripData });
      }

      await new Promise((resolve) => {
        this.setState({ trips: tripList }, resolve);
      });

      console.log(this.state.trips);
    } catch (error) {
      console.error("Error fetching data: ", error);
      throw error;
    }
  };

  handleDelete = async (id) => {
    try {
      const result = window.confirm("Apakah Anda yakin ingin menghapus?");
      if (result === true) {
        await deleteDoc(doc(db, "trips", id));
        alert("Data berhasil dihapus.");
        this.getAllTripsByUid();
      }
    } catch (error) {
      console.error("Error menghapus data:", error);
      alert("Gagal menghapus data.");
    }
  };

  render() {
    return (
      <div>
        <h3>Perjalananmu - {this.state.user.display_name}</h3>
        <Link to={`/perjalanan/${this.state.user.uid}`}>
          <button>Tambah perjalanan</button>
        </Link>

        <table>
          <thead>
            <tr>
              <th>Alasan</th>
              <th>Lokasi Awal</th>
              <th>Lokasi Akhir</th>
              <th>Durasi</th>
              <th>Jarak</th>
              <th>Foto</th>
              <th>Status</th>
              <th>Hapus</th>
            </tr>
          </thead>
          <tbody>
            {this.state.trips.map((trip) => (
              <tr key={trip.id}>
                <td>{trip.alasan}</td>
                <td>
                  {trip.lokasiAwal.map((lokasi, index) => (
                    <ul key={index}>
                      <li>Jam Mulai: {lokasi.jamMulai}</li>
                      <li>Alamat: {lokasi.alamat}</li>
                      <li>Lokasi: {lokasi.lokasi}</li>
                      <li>Latitude: {lokasi.latitude}</li>
                      <li>Longitude: {lokasi.longitude}</li>
                    </ul>
                  ))}
                </td>
                <td>
                  {trip.lokasiAkhir.map((lokasi, index) => (
                    <ul key={index}>
                      <li>Jam Sampai: {lokasi.jamSampai} WIB</li>
                      <li>Alamat: {lokasi.alamat}</li>
                      <li>Lokasi: {lokasi.lokasi}</li>
                      <li>Latitude: {lokasi.latitude}</li>
                      <li>Longitude: {lokasi.longitude}</li>
                    </ul>
                  ))}
                </td>
                <td>{trip.durasi} menit</td>
                <td>{trip.jarak} meter</td>
                <td>
                  <img src={trip.fotoBukti} alt="" />
                </td>
                <td>
                  {trip.status == "Belum selesai" ? (
                    <Link to={`/sampai/${trip.id}`}>
                      <button>Belum sampai</button>
                    </Link>
                  ) : (
                    trip.status
                  )}
                </td>
                <td>
                  <button onClick={() => this.handleDelete(trip.id)}>
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Perjalanan;
