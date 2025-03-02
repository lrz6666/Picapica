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

    checkMobile();
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
        // vintage effect - FIXED version
        for (let i = 0; i < data.length; i += 4) {
          // Get original RGB values
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Apply grayscale first (no need to store in avg variable yet)
          const grayValue = (r + g + b) / 3;
          
          // Apply contrast and brightness
          const factor = 1.2; // Contrast factor
          const brightness = 28; // Brightness boost (110%)
          const adjustedValue = Math.min(255, Math.max(0, (grayValue - 128) * factor + 128 + brightness));
          
          // Apply sepia at 30%
          const sepiaFactor = 0.3;
          const normalFactor = 0.7;
          
          // Calculate sepia values
          const sepiaR = (r * 0.393) + (g * 0.769) + (b * 0.189);
          const sepiaG = (r * 0.349) + (g * 0.686) + (b * 0.168);
          const sepiaB = (r * 0.272) + (g * 0.534) + (b * 0.131);
          
          // Mix regular grayscale with sepia tones
          data[i] = Math.min(255, adjustedValue * normalFactor + sepiaR * sepiaFactor);
          data[i + 1] = Math.min(255, adjustedValue * normalFactor + sepiaG * sepiaFactor);
          data[i + 2] = Math.min(255, adjustedValue * normalFactor + sepiaB * sepiaFactor);
        }
        break;
        
      case "brightness(130%) contrast(105%) saturate(80%) blur(0.3px)":
        // soft effect
        for (let i = 0; i < data.length; i += 4) {
          // Get original RGB values
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];
          
          // Apply brightness
          const brightness = 1.3; // 130%
          r = r * brightness;
          g = g * brightness;
          b = b * brightness;
          
          // Apply contrast
          const contrast = 1.05; // 105%
          r = (r - 128) * contrast + 128;
          g = (g - 128) * contrast + 128;
          b = (b - 128) * contrast + 128;
          
          // Apply saturation (80%)
          const avg = (r + g + b) / 3;
          const satFactor = 0.8; // 80% saturation
          
          data[i] = Math.min(255, Math.max(0, r * satFactor + avg * (1 - satFactor)));
          data[i + 1] = Math.min(255, Math.max(0, g * satFactor + avg * (1 - satFactor)));
          data[i + 2] = Math.min(255, Math.max(0, b * satFactor + avg * (1 - satFactor)));
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
      console.log("Device detected as:", isMobile ? "Mobile" : "Desktop");
      console.log("Current filter:", filter);

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

        context.clearRect(0, 0, canvas.width, canvas.height);

        // Flip canvas for mirroring
        context.save();

        // Only use CSS filters on desktop
        if (!isMobile && filter != 'none') {
          context.filter = filter;
          console.log("Desktop: Applying CSS filter");
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
    return null;
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
            style={{ filter: !isMobile ? filter : 'none' }}/>        
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
