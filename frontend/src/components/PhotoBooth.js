import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PhotoBooth = ({ setCapturedImages }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImages, setImages] = useState([]);
  const [filter, setFilter] = useState("none");
  const [countdown, setCountdown] = useState(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    startCamera();
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        startCamera();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Start Camera
  const startCamera = async () => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        return; 
      }

      const constraints = {
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 } 
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (err) {
          console.error("Error playing video:", err);
        }
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access your camera. Please ensure camera permissions are granted in your browser settings.");
    }
  };

  // Simple filter functions
  const applyGrayscale = (data) => {
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;     // Red
      data[i + 1] = avg; // Green
      data[i + 2] = avg; // Blue
    }
  };

  const applySepia = (data) => {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));     // Red
      data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168)); // Green
      data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131)); // Blue
    }
  };

  const applyVintage = (data) => {
    for (let i = 0; i < data.length; i += 4) {
      // Apply a simple vintage effect (grayscale with warmer tones)
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      
      data[i] = Math.min(255, avg * 1.2);       // Red (boost red for warmth)
      data[i + 1] = Math.min(255, avg * 1.0);   // Green
      data[i + 2] = Math.min(255, avg * 0.8);   // Blue (reduce blue for warmth)
    }
  };

  const applySoft = (data) => {
    for (let i = 0; i < data.length; i += 4) {
      // Simple soft effect (increase brightness)
      data[i] = Math.min(255, data[i] * 1.3);       // Red
      data[i + 1] = Math.min(255, data[i + 1] * 1.3); // Green
      data[i + 2] = Math.min(255, data[i + 2] * 1.3); // Blue
    }
  };

  // Countdown to take 4 pictures automatically
  const startCountdown = () => {
    if (capturing) return;
    setCapturing(true);
  
    setImages([]);
    
    let photosTaken = 0;
    const newCapturedImages = [];
    
    const captureSequence = async () => {
      if (photosTaken >= 4) {
        setCountdown(null);
        setCapturing(false);

        try {
          setCapturedImages([...newCapturedImages]);
          setTimeout(() => {
            navigate("/preview");
          }, 300);
        } catch (error) {
          console.error("Error navigating to preview:", error);
          setImages([...newCapturedImages]);
        }
        return;
      }
      
      let timeLeft = 3;
      setCountdown(timeLeft);
  
      const timer = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
  
        if (timeLeft === 0) {
          clearInterval(timer);
          const imageUrl = capturePhoto();
          if (imageUrl) {
            newCapturedImages.push(imageUrl);
            setImages((prevImages) => [...prevImages, imageUrl]);
          }
          photosTaken += 1;
          setTimeout(captureSequence, 1000);
        }
      }, 1000);
    };
  
    captureSequence();
  };

  // Capture Photo
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return null;

    const context = canvas.getContext("2d");
    
    // Set canvas dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear the canvas first
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw video frame to canvas (mirrored)
    context.save();
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.restore();
    
    // Apply filter if selected
    if (filter !== "none") {
      try {
        // Get image data
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Apply the appropriate filter
        switch(filter) {
          case "grayscale":
            applyGrayscale(data);
            break;
          case "sepia":
            applySepia(data);
            break;
          case "vintage":
            applyVintage(data);
            break;
          case "soft":
            applySoft(data);
            break;
          default:
            break;
        }
        
        // Put modified image data back on canvas
        context.putImageData(imageData, 0, 0);
      } catch (error) {
        console.error("Error applying filter:", error);
      }
    }
    
    // Convert canvas to image URL
    return canvas.toDataURL("image/png");
  };

  return (
    <div className="photo-booth">
      {countdown !== null && <h2 className="countdown animate">{countdown}</h2>}

      <div className="photo-container">
        <div className="camera-container">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            disablePictureInPicture 
            disableRemotePlayback
            className="video-feed" 
          />        
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="preview-side">
          {capturedImages.map((image, index) => (
            <img 
              key={index} 
              src={image} 
              alt={`Captured ${index + 1}`} 
              className="side-preview"
            />
          ))}      
        </div>
      </div>
      
      <div className="controls">
        <button onClick={startCountdown} disabled={capturing}>
          {capturing ? "Capturing..." : "Start Capture :)"}
        </button>
      </div>

      <p className="filter-prompt">Choose a filter before starting capture!</p>

      <div className="filters">
        <button onClick={() => setFilter("none")} disabled={capturing}>No Filter</button>
        <button onClick={() => setFilter("grayscale")} disabled={capturing}>Grayscale</button>
        <button onClick={() => setFilter("sepia")} disabled={capturing}>Sepia</button>
        <button onClick={() => setFilter("vintage")} disabled={capturing}>Vintage</button>
        <button onClick={() => setFilter("soft")} disabled={capturing}>Soft</button>
      </div>

      <div className="ad-container" style={{ marginTop: "20px", textAlign: "center" }}>
        <ins className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-7810675993668366"
          data-ad-slot="3099521224"
          data-ad-format="horizontal"
          data-full-width-responsive="true"></ins>
      </div>

      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
      <script>
        (adsbygoogle = window.adsbygoogle || []).push({});
      </script>
    </div>
  );
};

export default PhotoBooth;