import { useEffect } from "react";

export function CarbonAd() {
  useEffect(() => {
    // Load Carbon Ads script
    const script = document.createElement("script");
    script.async = true;
    script.id = "_carbonads_js";
    script.src = "//cdn.carbonads.com/carbon.js?serve=CESIC53I&placement=example";

    // Insert the script into the carbon wrapper
    const carbonWrapper = document.getElementById("carbon-wrapper");
    if (carbonWrapper) {
      carbonWrapper.appendChild(script);
    }

    return () => {
      // Cleanup on unmount
      if (carbonWrapper) {
        const ads = carbonWrapper.getElementsByTagName("script");
        Array.from(ads).forEach(ad => ad.remove());
      }
    };
  }, []);

  return (
    <div 
      id="carbon-wrapper" 
      className="fixed bottom-4 right-4 w-[330px] h-[100px] bg-card border rounded-lg shadow-sm overflow-hidden"
    />
  );
}