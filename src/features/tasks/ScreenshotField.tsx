import { Typography, Button } from "antd";
import {
  labelStyle,
  screenshotZoneStyle,
  screenshotThumbStyle,
  screenshotDeleteBtnStyle,
} from "./tasks.constants";
import { useScreenshotHandlers } from "../../hooks";

const { Text } = Typography;

interface ScreenshotFieldProps {
  screenshots: string[];
  onChange: (screenshots: string[]) => void;
}

export default function ScreenshotField({
  screenshots,
  onChange,
}: ScreenshotFieldProps) {
  const { fileInputRef, handlePaste, handleFileUpload } = useScreenshotHandlers(
    (base64s) => onChange([...screenshots, ...base64s]),
  );

  const remove = (i: number) =>
    onChange(screenshots.filter((_, idx) => idx !== i));

  return (
    <div>
      <Text style={labelStyle}>Скриншоты</Text>
      <div onPaste={handlePaste} style={screenshotZoneStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: screenshots.length ? 12 : 0,
          }}
        >
          <span style={{ fontSize: 13 }}>
            Ctrl+V / Cmd+V — вставить скриншот
          </span>
          <Button size="small" onClick={() => fileInputRef.current?.click()}>
            Загрузить файл
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {screenshots.map((src, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img
                src={src}
                alt={`скриншот ${i + 1}`}
                style={screenshotThumbStyle}
              />
              <button
                onClick={() => remove(i)}
                style={screenshotDeleteBtnStyle}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
