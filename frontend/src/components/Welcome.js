import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";


/* S */
const Welcome = () => {
  const navigate = useNavigate();
  useEffect(() => {
    try {
      const adsbygoogle = window.adsbygoogle || [];
      adsbygoogle.push({});
      adsbygoogle.push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div className="welcome-container">
      <h1>Welcome!</h1>
      <p>
        You have <strong>3 seconds</strong> for each shot – no retakes! <br />
        This photobooth captures <strong>4 pictures</strong> in a row, so strike your best pose and have fun!
      </p>
      <p>
        After the session, <span style={{ color: "pink" }}></span> download your digital copy and share the fun!
      </p>
      <button onClick={() => navigate("/photobooth")}>START</button>

      {/* ads side by side */}
      <div className="side-by-side-ads" style={{ 
        display: "flex", 
        flexDirection: "row", 
        flexWrap: "wrap", 
        justifyContent: "center",
        gap: "20px",
        marginTop: "30px", 
        width: "100%" 
      }}>

      {/* Google AdSense Ad Unit */}
      <div className="ad-container" style={{ flex: "1", minWidth: "300px" }}>
        <ins className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-7810675993668366"
          data-ad-slot="4993591788"
          data-ad-format="auto"
          data-full-width-responsive="true"></ins>
     </div>

      <div className="ad-container" style={{ flex: "1", minWidth: "300px" }}>
        <ins className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-7810675993668366"
          data-ad-slot="5843876703"
          data-ad-format="auto"
          data-full-width-responsive="true"></ins>
      </div>
    </div>
    </div>
  );
};

export default Welcome;
