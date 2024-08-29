import CodeBlock from "../components/CodeBlock";
import { Highlight } from "../components/HightLight";

const BACKTICKS_REGEX = /`{3}/;
const SINGLE_BACKTICKS_REGEX = /`(?!`+)/;
const LANGUAGE_IN_CODE_BLOCK_REGEX = /^\w+(?=\n)/;

const createCodeBlock = (block, language = "") => (
  <CodeBlock code={block} language={language} />
);
const createHighlightBlock = (text) => <Highlight>{text}</Highlight>;

const addHighlighting = (textBlocks) => {
  return textBlocks.flatMap((part) => {
    if (typeof part !== "string") return part;

    const formattedParts = part
      .split(SINGLE_BACKTICKS_REGEX)
      .map((subPart, index) => {
        return index % 2 === 0 ? subPart : createHighlightBlock(subPart);
      });

    return formattedParts;
  });
};

const addCodeBlocks = (text) => {
  const blocks = text.split(BACKTICKS_REGEX);

  return blocks.map((part, index) => {
    if (index % 2 === 1) {
      const language = part.match(LANGUAGE_IN_CODE_BLOCK_REGEX)?.[0];
      if (language) {
        const partWithoutLanguage = part.replace(language, "");
        return createCodeBlock(partWithoutLanguage, language);
      }
    }

    return part;
  });
};

export const getFormattedText = (text) => {
  //special case for uploaded image
  // console.log("text::", parseImageAndText(text));
  const dataImage = parseImageAndText(text);
  if (dataImage) {
    return (
      <div>
        <img
          src={`${dataImage.imageUrl}`}
          alt="image-generate"
          style={{
            maxWidth: "100%",
          }}
        />
        <h1> {dataImage.text} </h1>
      </div>
    );
  }

  let formattedText = addCodeBlocks(text);

  if (SINGLE_BACKTICKS_REGEX.test(text)) {
    formattedText = addHighlighting(formattedText);
  }

  return formattedText;
};

export function parseImageAndText(inputString) {
  // Kiểm tra chuỗi đầu vào có đúng định dạng hay không
  if (
    !inputString.includes("uploaded_image:") ||
    !inputString.includes("-text:")
  ) {
    return null;
  }

  // Sử dụng regular expression để tách chuỗi theo định dạng
  const imageRegex = /uploaded_image:(.+?)-text:/;
  const textRegex = /-text:(.+)/;

  // Tìm và trích xuất URL của ảnh
  const imageUrlMatch = inputString.match(imageRegex);
  const imageUrl = imageUrlMatch ? imageUrlMatch[1] : null;

  // Tìm và trích xuất đoạn text
  const textMatch = inputString.match(textRegex);
  const text = textMatch ? textMatch[1] : null;

  // Trả về một object chứa cả hai giá trị hoặc null nếu không có giá trị
  if (imageUrl && text) {
    return { imageUrl, text };
  } else {
    return null;
  }
}

// Hàm tải ảnh từ liên kết
function fetchImage(url) {
  return fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.blob();
  });
}

// Hàm chuyển đổi Blob thành Data URL
export function imageURLToDataURL(url) {
  return fetchImage(url).then((blob) => {
    // Tạo đối tượng File từ Blob
    const file = new File([blob], "image.jpg", { type: blob.type });

    // Sử dụng hàm fileToDataURL
    return fileToDataURL(file);
  });
}

// Hàm chuyển đổi File thành Data URL
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function fetchImageAsDataURL(url) {
  try {
    // Tải ảnh từ URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const blob = await response.blob();

    // Tạo đối tượng File từ Blob
    const file = new File([blob], "image.png", { type: blob.type });

    // Chuyển đối tượng File thành Data URL
    const dataURL = await fileToDataURL(file);
    return dataURL;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

// Liên kết của ảnh
// const imageUrl =
//   "http://res.cloudinary.com/dayrqfwxo/image/upload/v1724533627/Code2Death/Screenshot_5_bgl1ux.png";

// // Gọi hàm để lấy Data URL
// fetchImageAsDataURL(imageUrl)
//   .then((dataURL) => {
//     if (dataURL) {
//       console.log("dataURL:::", dataURL); // In Data URL của ảnh ra console
//     }
//   })
//   .catch((error) => {
//     console.error("Error:", error);
//   });
