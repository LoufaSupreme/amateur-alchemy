const qrContainer = document.querySelector('#qr-code');
const link = document.querySelector('.url');
const qr_link = document.querySelector('.qr-url');
const article_num = link.dataset.article_num;

// set url span
const targetURL = `${window.location.protocol}//${window.location.host}/articles/${article_num}/triangle-test`;
link.innerText = targetURL;
link.href = `/articles/${article_num}/triangle-test`;
qr_link.href = `/articles/${article_num}/triangle-test`;

// generate QR Code
// uses https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js
new QRCode(qrContainer, {
  text: targetURL,
  width: 2000,
  height: 2000,
  correctLevel: QRCode.CorrectLevel.H,
  colorDark: "#12212c",
  colorLight: "#ffffff"
});