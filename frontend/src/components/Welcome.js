import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";


/* S */
const Welcome = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
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

      {/* Google AdSense Ad Unit */}
      <ins className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-7810675993668366"
            data-ad-slot="7012809521"
            data-ad-format="auto"
            data-full-width-responsive="true"></ins>

        <script>
          {`(adsbygoogle = window.adsbygoogle || []).push({});`}
        </script>
    </div>
  );
};

export default Welcome;
