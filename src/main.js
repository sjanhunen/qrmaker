import QRCodeStyling from "qr-code-styling";
import "./style.css";

const preview = document.querySelector("#preview");

const qr = new QRCodeStyling({
  width: 280,
  height: 280,
  type: "svg",
  data: "https://example.com",
  dotsOptions: {
    type: "square",
    color: "#111111",
  },
  backgroundOptions: {
    color: "#ffffff",
  },
});

qr.append(preview);
