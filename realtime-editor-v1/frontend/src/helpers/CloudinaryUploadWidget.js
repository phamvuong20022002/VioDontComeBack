import { createContext, useEffect, useState, useRef } from "react";
import { TbCloudUpload } from "react-icons/tb";

// Create a context to manage the script loading state
const CloudinaryScriptContext = createContext();

function CloudinaryUploadWidget({
  uwConfig,
  setPublicId,
  setThumbnailUrl,
  setPublicUrl,
}) {
  const [loaded, setLoaded] = useState(false);
  const widgetRef = useRef(null);

  useEffect(() => {
    // Check if the script is already loaded
    if (!loaded) {
      const uwScript = document.getElementById("uw");
      if (!uwScript) {
        // If not loaded, create and load the script
        const script = document.createElement("script");
        script.setAttribute("async", "");
        script.setAttribute("id", "uw");
        script.src = "https://upload-widget.cloudinary.com/global/all.js";
        script.addEventListener("load", () => setLoaded(true));
        document.body.appendChild(script);
      } else {
        // If already loaded, update the state
        setLoaded(true);
      }
    }
  }, [loaded]);

  useEffect(() => {
    if (loaded && !widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        uwConfig,
        (error, result) => {
          if (!error && result && result.event === "success") {
            console.log("Done! Here is the image info: ", result.info);
            setPublicId(result.info.public_id);
            setPublicUrl(result.info.url);
            setThumbnailUrl(result.info.thumbnail_url);
          }
        }
      );
    }
  }, [loaded, uwConfig, setPublicId]);

  const handleClick = () => {
    if (widgetRef.current) {
      widgetRef.current.open();
    }
  };

  return (
    <CloudinaryScriptContext.Provider value={{ loaded }}>
      <div
        id="upload_widget"
        // className="cloudinary-button"
        onClick={handleClick}
      >
        <TbCloudUpload title="Upload image" />
      </div>
    </CloudinaryScriptContext.Provider>
  );
}

export default CloudinaryUploadWidget;
export { CloudinaryScriptContext };
