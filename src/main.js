import QRCodeStyling from "qr-code-styling";
import qrcode from "qrcode-generator";
import "./style.css";

const QUIET_ZONE_MODULES = 4;
const ERROR_CORRECTION = "Q";

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

function encodingMode(data) {
  if (/^[0-9]*$/.test(data)) return "Numeric";
  if (/^[0-9A-Z $%*+\-./:]*$/.test(data)) return "Alphanumeric";
  return "Byte";
}

function moduleCount(data) {
  const code = qrcode(0, ERROR_CORRECTION);
  code.addData(data, encodingMode(data));
  code.make();
  return code.getModuleCount();
}

// qr-code-styling's margin is pixels, and it floors each module to a whole pixel.
// Pick a margin that leaves at least four modules of background on every side.
function quietZoneMargin(size, count) {
  const dotSize = Math.max(1, Math.floor(size / (count + QUIET_ZONE_MODULES * 2)));
  const maxMargin = Math.floor((size - dotSize * count) / 2);
  if (maxMargin <= 0) return 0;

  const minMargin = Math.max(0, Math.floor((size - (dotSize + 1) * count) / 2) + 1);
  const preferred = QUIET_ZONE_MODULES * dotSize;
  return Math.min(maxMargin, Math.max(preferred, minMargin));
}

function toQrOptions({ data, shape, foreground, background, size }) {
  const rounded = shape === "rounded";

  return {
    width: size,
    height: size,
    type: "svg",
    data,
    margin: quietZoneMargin(size, moduleCount(data)),
    qrOptions: {
      errorCorrectionLevel: ERROR_CORRECTION,
    },
    dotsOptions: {
      type: rounded ? "extra-rounded" : "square",
      color: foreground,
      roundSize: true,
    },
    cornersSquareOptions: {
      type: rounded ? "extra-rounded" : "square",
    },
    cornersDotOptions: {
      type: rounded ? "dot" : "square",
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
