import React, { Component } from "react";
import "leaflet/dist/leaflet.css";
import { db } from "../config/Firebase";
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  doc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import withRouter from "../function/wihRouter";

class TambahPerjalanan extends Component {
  constructor(props) {
    super(props);
    const { uid } = this.props.params;
    this.state = {
      alasan: null,
      jamBerangkat: null,
      lokasiAwal: {},
      namaLokasi: {},
      user: uid,
      status: "Belum selesai",
      isMencariLokasi: false,
      isProses: false,
      displayName: "",
    };
  }

  handleLokasiAwal = async () => {
    this.setState({ isMencariLokasi: true });
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const { latitude, longitude } = position.coords;
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
      const response = await fetch(url);
      const data = await response.json();

      await new Promise((resolve) => {
        this.setState(
          { lokasiAwal: { latitude, longitude }, namaLokasi: data.address },
          resolve
        );
      });
      console.log(
        { lokasiAwal: this.state.lokasiAwal },
        { namaLokasi: this.state.namaLokasi }
      );

      this.setState({ isMencariLokasi: false });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { alasan, jamBerangkat, lokasiAwal, status, user, namaLokasi } =
        this.state;

      const tripRef = collection(db, "trips");
      const userRef = doc(db, "User", user);
      const newTrip = await addDoc(tripRef, {
        alasan,
        status,
        refUser: userRef,
        durasi: null,
        fotoBukti: null,
        jarak: null,
      });

      // Menyimpan data lokasiAwal di dalam subkoleksi
      const lokasiAwalRef = collection(newTrip, "lokasiAwal");
      await addDoc(lokasiAwalRef, {
        jamMulai: jamBerangkat,
        latitude: lokasiAwal.latitude,
        longitude: lokasiAwal.longitude,
        alamat: namaLokasi.village,
        lokasi: namaLokasi.city,
      });
      Swal.fire({
        title: "Berhasil",
        text: "Data dokter berhasil ditambah",
        icon: "success",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = `/perjalanan`;
        }
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  render() {
    return (
      <div>
        <h3>Form tambah perjalanan - {this.state.displayName}</h3>
        <form action="">
          <div>
            <label>Alasan</label>
            <textarea
              type="text"
              onChange={(e) => this.setState({ alasan: e.target.value })}
            />
          </div>
          <div>
            <label>Jam Berangkat</label>
            <input
              type="time"
              onChange={(e) => this.setState({ jamBerangkat: e.target.value })}
            />
          </div>
          <div>
            <label>Lokasi awal</label>
            <input
              type="text"
              readOnly
              value={`${this.state.lokasiAwal.latitude},${this.state.lokasiAwal.longitude}`}
            />
            <button
              disabled={this.state.isMencariLokasi}
              onClick={this.handleLokasiAwal}>
              pilih lokasi
            </button>
          </div>

          <button disabled={this.state.isProses} onClick={this.handleSubmit}>
            Simpan
          </button>
        </form>
      </div>
    );
  }
}

export default withRouter(TambahPerjalanan);
