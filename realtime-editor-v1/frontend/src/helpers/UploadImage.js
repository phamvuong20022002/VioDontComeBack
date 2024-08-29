import { useEffect, useState } from "react";
// import CloudinaryUploadWidget from "./CloudinaryUploadWidget";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage, responsive, placeholder } from "@cloudinary/react";

// import "./styles.css";
import CloudinaryUploadWidget from "./CloudinaryUploadWidget";

// secret settings
const cloudName = "dayrqfwxo";
const uploadPreset = "ijczc4rh";

export default function UploadImageCloudinary({ setUploadedImageUrls }) {
  const [publicId, setPublicId] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [publicUrl, setPublicUrl] = useState("");

  // Upload Widget Configuration
  // Remove the comments from the code below to add
  // additional functionality.
  // Note that these are only a few examples, to see
  // the full list of possible parameters that you
  // can add see:
  //   https://cloudinary.com/documentation/upload_widget_reference

  const uwConfig = {
    cloudName,
    uploadPreset,
    // cropping: true, //add a cropping step
    // showAdvancedOptions: true,  //add advanced options (public_id and tag)
    // sources: [ "local", "url"], // restrict the upload sources to URL and local files
    multiple: false, //restrict upload to a single file
    // folder: "user_images", //upload files to the specified folder
    // tags: ["users", "profile"], //add the given tags to the uploaded files
    // context: {alt: "user_uploaded"}, //add the given context data to the uploaded files
    clientAllowedFormats: ["png", "jpg", "jpeg"], //restrict uploading to image files only
    maxImageFileSize: 5000000, //restrict file size to less than 5MB
    // maxImageWidth: 2000, //Scales the image down to a width of 2000 pixels before uploading
    // theme: "purple", //change to a purple theme
  };

  // Create a Cloudinary instance and set your cloud name.
  const cld = new Cloudinary({
    cloud: {
      cloudName,
    },
  });

  useEffect(() => {
    // console.log("Uploaded Image:::", thumbnailUrl, "\n", publicUrl);
    if (!publicUrl || !thumbnailUrl || !publicUrl) {
      return;
    } else {
      setUploadedImageUrls([publicId, thumbnailUrl, publicUrl]);
    }
  }, [publicId, thumbnailUrl, publicUrl]);

  return (
    <div className="">
      <CloudinaryUploadWidget
        uwConfig={uwConfig}
        setPublicId={setPublicId}
        setThumbnailUrl={setThumbnailUrl}
        setPublicUrl={setPublicUrl}
      />
    </div>
  );
}
