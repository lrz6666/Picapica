import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* G */
const PhotoBooth = ({ setCapturedImages }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImages, setImages] = useState([]);
  const [filter, setFilter] = useState("none");
  const [countdown, setCountdown] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    startCamera();

    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex = /android|ipad|iphone|ipod|windows phone/i;
      setIsMobile(mobileRegex.test(userAgent));
    };

  
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
  }, [isMobile]);

useEffect(() => {
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (e) {
    console.error("AdSense error:", e);
  }
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
              width: { ideal: isMobile ? 1280 : 1280 }, 
               height: { ideal: isMobile ? 720 : 720 },
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


  // apply fitler using canvas api
  const applyFilterToCanvas = (sourceCanvas, filterType) => {
    const ctx = sourceCanvas.getContext("2d");
    
    // Save the original image data before applying filters
    const imageData = ctx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    const data = imageData.data;
    
    switch(filterType) {
      case "grayscale(100%)":
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = data[i + 1] = data[i + 2] = avg;
        }
        break;
      case "sepia(100%)":
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
          data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
          data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }
        break;
      case "grayscale(100%) contrast(120%) brightness(110%) sepia(30%) hue-rotate(10deg) blur(0.4px)":
        // vintage effect
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const factor = 1.2; 
          const r = Math.min(255, (avg - 128) * factor + 128 + 25);           
          data[i] = Math.min(255, r * 1.07); 
          data[i + 1] = Math.min(255, r * 0.95); 
          data[i + 2] = Math.min(255, r * 0.8); 
        }
        break;
      case "brightness(130%) contrast(105%) saturate(80%) blur(0.3px)":
        // soft effect
        for (let i = 0; i < data.length; i += 4) {
          const r = Math.min(255, data[i] * 1.3 * 1.05);
          const g = Math.min(255, data[i + 1] * 1.3 * 1.05);
          const b = Math.min(255, data[i + 2] * 1.3 * 1.05);
          const avg = (r + g + b) / 3;
          data[i] = r * 0.8 + avg * 0.2;
          data[i + 1] = g * 0.8 + avg * 0.2;
          data[i + 2] = b * 0.8 + avg * 0.2;
        }
        break;
      case "brightness(125%) contrast(105%) saturate(110%) hue-rotate(-4deg)":
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          let newR = r * 1.25;
          let newG = g * 1.25;
          let newB = b * 1.25;
          newR = 128 + (newR - 128) * 1.05;
          newG = 128 + (newG - 128) * 1.05;
          newB = 128 + (newB - 128) * 1.05;
        const gray = 0.2989 * newR + 0.5870 * newG + 0.1140 * newB;
          newR = gray + (newR - gray) * 1.1;
          newG = gray + (newG - gray) * 1.1;
          newB = gray + (newB - gray) * 1.1;
          const cos = Math.cos(-4 * Math.PI / 180);
          const sin = Math.sin(-4 * Math.PI / 180);
          const newR2 = newR * cos - newG * sin;
          const newG2 = newR * sin + newG * cos;
          newR = newR2;
          newG = newG2;
          data[i] = Math.min(255, Math.max(0, newR));
          data[i + 1] = Math.min(255, Math.max(0, newG));
          data[i + 2] = Math.min(255, Math.max(0, newB));
        }
        break;
      default:
        break;
    }
    
    ctx.putImageData(imageData, 0, 0);
    return sourceCanvas;
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
          // If navigation fails, at least display the images
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

    if (video && canvas) {
        const context = canvas.getContext("2d");

        const targetWidth = 1280;
        const targetHeight = 720;

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const videoRatio = video.videoWidth / video.videoHeight;
        const targetRatio = targetWidth / targetHeight;
        
        let drawWidth = video.videoWidth;
        let drawHeight = video.videoHeight;
        let startX = 0;
        let startY = 0;

        if (videoRatio > targetRatio) {
            drawWidth = drawHeight * targetRatio;
            startX = (video.videoWidth - drawWidth) / 2;
        } else {
            drawHeight = drawWidth / targetRatio;
            startY = (video.videoHeight - drawHeight) / 2;
        }

        // Flip canvas for mirroring
        context.save();

        // Only use CSS filters on desktop
        if (!isMobile && filter != 'none') {
          context.filter = filter;
        }

        context.translate(canvas.width, 0);
        context.scale(-1, 1);

        context.drawImage(
            video,
            startX, startY, drawWidth, drawHeight,  
            0, 0, targetWidth, targetHeight        
        );
        context.restore();

       // mobile devices, apply filter manually with canvas api
       if (isMobile && filter !== 'none') {
        applyFilterToCanvas(canvas, filter);
       }

        return canvas.toDataURL("image/png");
    }
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
            style={{ filter }}/>        
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
        <button onClick={() => setFilter("grayscale(100%)")} disabled={capturing}>Grayscale</button>
        <button onClick={() => setFilter("sepia(100%)")} disabled={capturing}>Sepia</button>
        <button onClick={() => setFilter("grayscale(100%) contrast(120%) brightness(110%) sepia(30%) hue-rotate(10deg) blur(0.4px)")} disabled={capturing}>Vintage</button>
        <button onClick={() => setFilter("brightness(130%) contrast(105%) saturate(80%) blur(0.3px)")} disabled={capturing}>Soft</button>
        <button onClick={() => setFilter("brightness(125%) contrast(105%) saturate(110%) hue-rotate(-4deg)")} disabled={capturing}>Polaroid</button>
      </div>

      {/* Google AdSense Ad Unit */}
      <div className="ad-container" style={{ marginTop: "15px", width: "100%", maxWidth: "500px", margin: "0 auto" }}>
        <ins className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-7810675993668366"
            data-ad-slot="6002586974"
            data-ad-format="auto"
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
