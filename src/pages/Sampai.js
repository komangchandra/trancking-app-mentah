import React, { Component } from "react";
import "leaflet/dist/leaflet.css";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, dbImage } from "../config/Firebase";
import withRouter from "../function/wihRouter";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";

class Sampai extends Component {
  constructor(props) {
    super(props);
    this.fileInputRef = React.createRef();
    const { id } = this.props.params;
    this.state = {
      isOpenCamera: false,
      isProses: false,
      documentId: id,
      lokasiAkhir: {},
      namaLokasi: {},
      namaLokasi: "",
      fotoBukti: "",
      durasi: null,
      jarak: null,
      lokasiAwal: {},
    };
  }

  componentDidMount = async () => {
    await this.getDataPerjalanan();
    await this.handleHitungDurasi();
  };

  getDataPerjalanan = async () => {
    const { documentId } = this.state;

    try {
      // Mendapatkan data trip utama
      const tripDoc = doc(db, "trips", documentId);
      const tripSnapshot = await getDoc(tripDoc);

      if (tripSnapshot.exists()) {
        const tripData = tripSnapshot.data();
        this.setState({ trip: tripData });

        // Mendapatkan data dari subkoleksi 'lokasiAwal'
        const lokasiAwalRef = collection(tripDoc, "lokasiAwal");
        const lokasiAwalSnapshot = await getDocs(lokasiAwalRef);

        const lokasiAwalData = [];
        lokasiAwalSnapshot.forEach((lokasiDoc) => {
          lokasiAwalData.push(lokasiDoc.data());
        });

        await new Promise((resolve) => {
          this.setState({ lokasiAwal: lokasiAwalData }, resolve);
        });

        console.log(this.state.lokasiAwal);
      } else {
        console.log("Dokumen tidak ditemukan.");
      }
    } catch (error) {
      console.error("Error fetching trip details:", error);
    }
  };
  //   const imageSrc = this.webcamRef.current.getScreenshot();
  //   this.setState({ fotoBukti: imageSrc });
  // };

  handleKamera = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    this.handleFoto(file);
  };

  handleFoto = async (file) => {
    const storageRef = ref(dbImage, `trip/${Date.now()}.jpg`);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(
        ref(dbImage, snapshot.ref.fullPath)
      );

      this.setState({ fotoBukti: downloadURL, isOpenCamera: false }, () => {
        console.log("Foto berhasil diunggah:", this.state.fotoBukti);
      });
    } catch (error) {
      console.error("Gagal mengunggah foto:", error);
    }
  };

  handleLokasiAkhir = async () => {
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
          { lokasiAkhir: { latitude, longitude }, namaLokasi: data.address },
          resolve
        );
      });
      console.log(
        { lokasiAkhir: this.state.lokasiAkhir },
        { namaLokasi: this.state.namaLokasi }
      );

      await this.handleHitungJarak();

      this.setState({ isMencariLokasi: false });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  handleHitungDurasi = async () => {
    const date = new Date();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const jamSelesai = `${hours}:${minutes}`;

    const { lokasiAwal } = this.state;
    const jamMulai = lokasiAwal[0].jamMulai;

    // Mengonversi waktu string menjadi menit
    const [jamMulaiHours, jamMulaiMinutes] = jamMulai.split(":").map(Number);
    const [jamSelesaiHours, jamSelesaiMinutes] = jamSelesai
      .split(":")
      .map(Number);

    const totalMenitMulai = jamMulaiHours * 60 + jamMulaiMinutes;
    const totalMenitSelesai = jamSelesaiHours * 60 + jamSelesaiMinutes;

    // Menghitung selisih waktu dalam menit
    const durasi = totalMenitSelesai - totalMenitMulai;

    await new Promise((resolve) => {
      this.setState({ durasi: durasi }, resolve);
    });
  };

  handleHitungJarak = async () => {
    const { lokasiAwal, lokasiAkhir } = this.state;
    // Lokasi awal
    const latitudeAwal = lokasiAwal[0].latitude;
    const longitudeAwal = lokasiAwal[0].longitude;

    // lokasi akhir
    const latitudeAkhir = lokasiAkhir.latitude;
    const longitudeAkhir = lokasiAkhir.longitude;

    const r = 6371; // radius bumi (km)
    const toRadians = (degree) => degree * (Math.PI / 180);

    const dLat = toRadians(latitudeAkhir - latitudeAwal);
    const dLon = toRadians(longitudeAkhir - longitudeAwal);
    const radLat1 = toRadians(latitudeAwal);
    const radLat2 = toRadians(latitudeAkhir);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(radLat1) *
        Math.cos(radLat2) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const jarak = r * c;

    await new Promise((resolve) => {
      this.setState({ jarak: jarak }, resolve);
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Berjalan");

    const { documentId, lokasiAkhir, namaLokasi, fotoBukti, durasi, jarak } =
      this.state;

    const date = new Date();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const jam = `${hours}:${minutes}`;
    const status = "Selesai";

    try {
      await updateDoc(doc(db, "trip", documentId), {
        fotoBukti,
        durasi,
        jarak,
        status,
      });

      // Add a new document to the lokasiAkhir subcollection
      const lokasiAkhirRef = collection(db, "trip", documentId, "lokasiAkhir");
      await addDoc(lokasiAkhirRef, {
        jamSampai: jam,
        latitude: lokasiAkhir.latitude,
        longitude: lokasiAkhir.longitude,
        alamat: namaLokasi.village,
        lokasi: namaLokasi.city,
      });
      console.log("selesai");
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
      console.error(error);
    }
  };

  render() {
    return (
      <div>
        <h3>Sampai dilokasi</h3>
        <div>
          <div>
            <input
              type="file"
              accept="image/*"
              capture="camera"
              ref={this.fileInputRef}
              onChange={this.handleKamera}
            />
          </div>
          <div>
            <label>Lokasi awal</label>
            <input
              type="text"
              readOnly
              value={`${this.state.lokasiAkhir.latitude},${this.state.lokasiAkhir.longitude}`}
            />
            <button
              disabled={this.state.isMencariLokasi}
              onClick={this.handleLokasiAkhir}>
              pilih lokasi
            </button>
          </div>
          <button disabled={this.state.isProses} onClick={this.handleSubmit}>
            Simpan
          </button>
        </div>
      </div>
    );
  }
}

export default withRouter(Sampai);
