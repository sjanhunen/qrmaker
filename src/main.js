import QRCodeStyling from "qr-code-styling";
import qrcode from "qrcode-generator";
import "./style.css";

const QUIET_ZONE_MODULES = 4;
const ERROR_CORRECTION = "Q";
const MIN_SIZE = 128;
const MAX_SIZE = 1024;
const SIZE_STEP = 16;

const preview = document.querySelector("#preview");
const form = document.querySelector("#options");
const sizeInput = document.querySelector("#size");
const sizeReadout = document.querySelector("#size-readout");
const sizeDecrease = document.querySelector("#size-decrease");
const sizeIncrease = document.querySelector("#size-increase");
const downloadPng = document.querySelector("#download-png");
const copyPng = document.querySelector("#copy-png");
const exportStatus = document.querySelector("#export-status");

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

function formatSize(size) {
  return `${size} × ${size} px`;
}

function syncSizeControls(size) {
  sizeReadout.textContent = formatSize(size);
  sizeDecrease.disabled = size <= MIN_SIZE;
  sizeIncrease.disabled = size >= MAX_SIZE;
}

function setSize(size) {
  const next = Math.min(MAX_SIZE, Math.max(MIN_SIZE, size));
  sizeInput.value = String(next);
  syncSizeControls(next);
  sizeInput.dispatchEvent(new Event("input", { bubbles: true }));
}

sizeDecrease.addEventListener("click", () => {
  setSize(Number(sizeInput.value) - SIZE_STEP);
});

sizeIncrease.addEventListener("click", () => {
  setSize(Number(sizeInput.value) + SIZE_STEP);
});

const initial = readOptions();
let lastData = initial.data;
syncSizeControls(initial.size);

const qr = new QRCodeStyling(toQrOptions(initial));
qr.append(preview);

function pngBlob() {
  const options = readOptions();
  // A fresh instance: qr-code-styling keeps the first PNG canvas after later updates.
  const code = new QRCodeStyling(toQrOptions({ ...options, data: options.data || lastData }));
  return code.getRawData("png").then((raw) => {
    if (!(raw instanceof Blob)) throw new Error("Could not render the QR code.");
    return raw.type === "image/png" ? raw : new Blob([raw], { type: "image/png" });
  });
}

let pngUrl;

function savePng(blob) {
  if (pngUrl) URL.revokeObjectURL(pngUrl);
  pngUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = pngUrl;
  link.download = "qr.png";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

window.addEventListener("pagehide", () => {
  if (!pngUrl) return;
  URL.revokeObjectURL(pngUrl);
  pngUrl = "";
});

downloadPng.addEventListener("click", async () => {
  try {
    savePng(await pngBlob());
    exportStatus.textContent = "Saved qr.png";
  } catch {
    exportStatus.textContent = "Download failed";
  }
});

copyPng.addEventListener("click", async () => {
  try {
    // Pass the blob promise straight through so the write stays inside the click gesture.
    await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob() })]);
    exportStatus.textContent = "Copied";
  } catch {
    exportStatus.textContent = "Copy failed";
  }
});

form.addEventListener("input", () => {
  exportStatus.textContent = "";
  const options = readOptions();
  if (options.data) lastData = options.data;
  if (!lastData) return;
  if (!Number.isInteger(options.size) || options.size < MIN_SIZE || options.size > MAX_SIZE) return;
  if ((options.size - MIN_SIZE) % SIZE_STEP !== 0) return;

  qr.update(toQrOptions({ ...options, data: lastData }));
});
