import QRCodeStyling from "qr-code-styling";
import "./style.css";

const preview = document.querySelector("#preview");
const form = document.querySelector("#options");

function readOptions() {
  const data = new FormData(form);
  return {
    data: String(data.get("url") ?? "").trim(),
    shape: String(data.get("shape")),
    foreground: String(data.get("foreground")),
    background: String(data.get("background")),
    size: Number(data.get("size")),
  };
}

function toQrOptions({ data, shape, foreground, background, size }) {
  return {
    width: size,
    height: size,
    type: "svg",
    data,
    dotsOptions: {
      type: shape,
      color: foreground,
    },
    backgroundOptions: {
      color: background,
    },
  };
}

const initial = readOptions();
let lastData = initial.data;

const qr = new QRCodeStyling(toQrOptions(initial));
qr.append(preview);

form.addEventListener("input", () => {
  const options = readOptions();
  if (options.data) lastData = options.data;
  if (!lastData) return;
  if (!Number.isInteger(options.size) || options.size < 128 || options.size > 1024) return;

  qr.update(toQrOptions({ ...options, data: lastData }));
});
