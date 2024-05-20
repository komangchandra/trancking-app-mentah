import React, { Component } from "react";
import "leaflet/dist/leaflet.css";
import { db } from "../config/Firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  where,
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
      isLanjutPerjalanan: false,
      isMencariLokasi: false,
      isProses: false,
      hariIni: "",
      trips: [],
      trip: {},
    };
  }

  componentDidMount = async () => {
    await this.getHariIni();
    await this.getPerjalananHariIni();
  };

  getHariIni = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    this.setState({ hariIni: formattedDate });
  };

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
      this.setState({ isMencariLokasi: false });
    }
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const {
        alasan,
        jamBerangkat,
        lokasiAwal,
        status,
        user,
        namaLokasi,
        hariIni,
      } = this.state;

      const tripRef = collection(db, "trips");
      const userRef = doc(db, "User", user);
      const newTrip = await addDoc(tripRef, {
        alasan,
        status,
        refUser: userRef,
        tanggal: hariIni,
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

  getPerjalananHariIni = async () => {
    const { user, hariIni } = this.state;
    try {
      const userRef = doc(db, "User", user);
      const tripsCollection = collection(db, "trips");
      const userTripsQuery = query(
        tripsCollection,
        where("refUser", "==", userRef),
        where("tanggal", "==", hariIni),
        where("status", "==", "Selesai")
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

      console.log({ trips: this.state.trips });
    } catch (error) {
      console.error("Error fetching data: ", error);
      throw error;
    }
  };

  handleTripsId = async (e) => {
    const id = e.target.value;
    const trip = this.state.trips.filter((trip) => trip.id === id);
    await new Promise((resolve) => {
      this.setState({ trip: trip }, resolve);
    });
  };

  handlePerjalananBaru = async (e) => {
    e.preventDefault();
    try {
      const { alasan, jamBerangkat, status, user, namaLokasi, hariIni, trip } =
        this.state;

      console.log(trip[0].lokasiAkhir[0]);

      const lokasiAwal = trip[0].lokasiAkhir[0];

      const tripRef = collection(db, "trips");
      const userRef = doc(db, "User", user);
      const newTrip = await addDoc(tripRef, {
        alasan,
        status,
        refUser: userRef,
        tanggal: hariIni,
        durasi: null,
        fotoBukti: null,
        jarak: null,
      });

      // Menyimpan data lokasiAwal di dalam subkoleksi
      const lokasiAwalRef = collection(newTrip, "lokasiAwal");
      await addDoc(lokasiAwalRef, lokasiAwal);
      Swal.fire({
        title: "Berhasil",
        text: "Berhasil menambah lanjut perjalanan",
        icon: "success",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = `/perjalanan`;
        }
      });

      console.log("berhasil");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  render() {
    return (
      <div>
        <h3>Form tambah perjalanan</h3>
        <button
          onClick={() =>
            this.setState({
              isLanjutPerjalanan: !this.state.isLanjutPerjalanan,
            })
          }>
          {this.state.isLanjutPerjalanan
            ? "Gajadi deng"
            : "Saya mau lanjut perjalanan"}
        </button>
        <hr />

        {this.state.isLanjutPerjalanan && (
          <select onChange={this.handleTripsId}>
            <option>Pilih lokasi</option>
            {this.state.trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.alasan} -{trip.lokasiAkhir[0].alamat}
              </option>
            ))}
          </select>
        )}

        <form action="">
          <div>
            <input type="date" className="bg-blue-500" />
            <input type="date" className="bg-blue-500" />
            <label>Alasan</label>
            <textarea
              type="text"
              onChange={(e) => this.setState({ alasan: e.target.value })}
            />
          </div>
          <select onChange={this.handleTripsId}>
            <option>Pilih lokasi</option>
            <option value="Dalam Kota">Da</option>
          </select>
          <div>
            <label>Jam Berangkat</label>
            <input
              type="time"
              onChange={(e) => this.setState({ jamBerangkat: e.target.value })}
            />
          </div>

          {this.state.isLanjutPerjalanan ? (
            ""
          ) : (
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
          )}

          {this.state.isLanjutPerjalanan ? (
            <button
              disabled={this.state.isProses}
              onClick={this.handlePerjalananBaru}>
              Lanjut perjalanan
            </button>
          ) : (
            <button disabled={this.state.isProses} onClick={this.handleSubmit}>
              Simpan
            </button>
          )}
        </form>
      </div>
    );
  }
}

export default withRouter(TambahPerjalanan);
