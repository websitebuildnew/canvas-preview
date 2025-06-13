// --- Real-time Canvas Preview ---
const editor = document.getElementById('editor');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let userState = {};

function runUserCode() {
  try {
    const code = editor.innerText;
    const func = new Function('canvas', 'ctx', 'state', code + '\nfor(let k in state)this[k]=state[k];return this;');
    userState = func.call(userState, canvas, ctx, userState) || {};
  } catch (e) {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'red';
    ctx.font = '16px sans-serif';
    ctx.fillText('Error: ' + e.message, 10, 30);
  }
}
function loop() {
  runUserCode();
  requestAnimationFrame(loop);
}
editor.addEventListener('input', () => {
  userState = {};
  Prism.highlightElement(editor);
});
loop();

// --- Syntax highlighting with Prism.js ---
editor.addEventListener('focus', () => Prism.highlightElement(editor));
editor.addEventListener('blur', () => Prism.highlightElement(editor));

// --- Code Sharing ---
function encodeCode(code) {
  return btoa(encodeURIComponent(code));
}
function decodeCode(data) {
  try {
    return decodeURIComponent(atob(data));
  } catch {
    return '';
  }
}
function updateShareLink() {
  const base = window.location.origin + window.location.pathname;
  const code = editor.innerText;
  const encoded = encodeCode(code);
  shareLink.value = `${base}?c=${encoded}`;
}
function loadSharedCode() {
  const params = new URLSearchParams(window.location.search);
  const data = params.get('c');
  if (data) {
    editor.innerText = decodeCode(data);
    Prism.highlightElement(editor);
  }
}
const shareBtn = document.getElementById('shareBtn');
const shareLink = document.getElementById('shareLink');
shareBtn.onclick = () => {
  updateShareLink();
  shareLink.select();
  shareLink.setSelectionRange(0, 99999);
  document.execCommand('copy');
  shareBtn.innerText = "Copied!";
  setTimeout(() => shareBtn.innerText = "Share", 1500);
};
window.addEventListener('DOMContentLoaded', loadSharedCode);
