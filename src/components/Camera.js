import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

const Camera = () => {
  const [image, setImage] = useState(null);

  const handleInputChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        capture="camera"
        onChange={handleInputChange}
      />
      {image && <img src={image} alt="Captured" />}
    </div>
  );
};

export default Camera;
