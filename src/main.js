import QRCodeStyling from "qr-code-styling";
import "./style.css";

const preview = document.querySelector("#preview");
const urlInput = document.querySelector("#url");

const qr = new QRCodeStyling({
  width: 280,
  height: 280,
  type: "svg",
  data: urlInput.value,
  dotsOptions: {
    type: "square",
    color: "#111111",
  },
  backgroundOptions: {
    color: "#ffffff",
  },
});

qr.append(preview);

urlInput.addEventListener("input", () => {
  const data = urlInput.value.trim();
  if (!data) return;
  qr.update({ data });
});
