import JSZip from "jszip";
import { saveAs } from "file-saver";

export function createFilesAndZip(data) {
  const zip = new JSZip();

  data.forEach((item) => {
    const fileName = `${item.title}.${
      item.type === "xml"
        ? "html"
        : item.type === "javascript" || item.type === "babel"
        ? "js"
        : item.type
    }`;
    zip.file(fileName, item.value);
  });

  zip
    .generateAsync({ type: "blob" })
    .then(function (content) {
      saveAs(content, "output.zip");
    })
    .catch(function (err) {
      console.error("Error creating zip file:", err);
    });
}
