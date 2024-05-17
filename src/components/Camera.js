import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

const Camera = () => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    // Simpan gambar di sini
    saveImage(imageSrc);
  };

  const saveImage = (imageSrc) => {
    // Buat blob dari base64 encoded image
    const blob = dataURItoBlob(imageSrc);

    // Buat objek URL dari blob
    const url = URL.createObjectURL(blob);

    // Buat elemen <a> untuk mengunduh gambar
    const a = document.createElement("a");
    a.href = url;
    a.download = "captured_image.jpg"; // Nama file yang ingin disimpan
    document.body.appendChild(a);
    a.click();

    // Hapus elemen <a> setelah pengunduhan selesai
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const dataURItoBlob = (dataURI) => {
    // Potong bagian base64
    const byteString = atob(dataURI.split(",")[1]);

    // Tentukan tipe MIME
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

    // Buat blob
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    return new Blob([arrayBuffer], { type: mimeString });
  };

  return (
    <div>
      <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
      <button onClick={capture}>Capture</button>
      {capturedImage && (
        <img
          src={capturedImage}
          alt="Captured"
          style={{ width: "100%", marginTop: "20px" }}
        />
      )}
    </div>
  );
};

export default Camera;
