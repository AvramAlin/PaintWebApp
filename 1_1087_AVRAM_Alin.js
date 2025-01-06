/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const alegeCuloarea = document.getElementById("alege-culoarea");
const alegeBackground = document.getElementById("alege-background");
const grosimeBrush = document.getElementById("grosime-brush");
const grosimeBrushValue = document.getElementById("grosime-brush-value");
const stivaUndo = [];

//Setez dimensiune canvas
canvas.width = 1100;
canvas.height = 700;
adaugaFundal(alegeBackground.value);

//Variabile desen
let isDrawing = false; // boolean pentru a stabili daca se deseneaza sau nu
let toolCurent = ""; //specifica tool-ul folosit pe canvas
let startX;
let startY;

//Canvas temporar pentru previzualizare
const canvasTemporar = document.createElement("canvas");
const contextTemporar = canvasTemporar.getContext("2d");
canvasTemporar.width = canvas.width;
canvasTemporar.height = canvas.height;

//dimensiune pensula actualizare
grosimeBrush.addEventListener("input", function () {
  grosimeBrushValue.textContent = this.value + "px";
});

//functii pentru alegerea tool-ului
document.getElementById("creion").addEventListener("click", () => {
  toolCurent = "creion";
  document
    .querySelectorAll(".butoane button")
    .forEach((btn) => btn.classList.remove("selectat"));
  document.getElementById("creion").classList.add("selectat");
});
document.getElementById("radiera").addEventListener("click", () => {
  toolCurent = "radiera";
  document
    .querySelectorAll(".butoane button")
    .forEach((btn) => btn.classList.remove("selectat"));
  document.getElementById("radiera").classList.add("selectat");
});
document.getElementById("dreptunghi").addEventListener("click", () => {
  toolCurent = "dreptunghi";
  document
    .querySelectorAll(".butoane button")
    .forEach((btn) => btn.classList.remove("selectat"));
  document.getElementById("dreptunghi").classList.add("selectat");
});
document.getElementById("cerc").addEventListener("click", () => {
  toolCurent = "cerc";
  document
    .querySelectorAll(".butoane button")
    .forEach((btn) => btn.classList.remove("selectat"));
  document.getElementById("cerc").classList.add("selectat");
});
document.getElementById("linie").addEventListener("click", () => {
  toolCurent = "linie";
  document
    .querySelectorAll(".butoane button")
    .forEach((btn) => btn.classList.remove("selectat"));
  document.getElementById("linie").classList.add("selectat");
});
document.getElementById("elipsa").addEventListener("click", () => {
  toolCurent = "elipsa";
  document
    .querySelectorAll(".butoane button")
    .forEach((btn) => btn.classList.remove("selectat"));
  document.getElementById("elipsa").classList.add("selectat");
});
document.getElementById("stergeTot").addEventListener("click", () => {
  toolCurent = "";
  context.clearRect(0, 0, canvas.width, canvas.height);
  document
    .querySelectorAll(".butoane button")
    .forEach((btn) => btn.classList.remove("selectat"));
  adaugaFundal(alegeBackground.value);
});

function getPozitieMouseReala(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function startDesenare(event) {
  isDrawing = true;
  const pozitie = getPozitieMouseReala(canvas, event);
  startX = pozitie.x;
  startY = pozitie.y;

  salvareStarePentruUndo();
  // salvez starea curenta canvas principal
  contextTemporar.clearRect(0, 0, canvasTemporar.width, canvasTemporar.height);
  contextTemporar.drawImage(canvas, 0, 0);

  if (toolCurent === "creion" || toolCurent === "radiera") {
    context.beginPath();
    context.moveTo(startX, startY);
  }
}

function deseneaza(event) {
  if (!isDrawing) return;

  const pozitie = getPozitieMouseReala(canvas, event);
  const x = pozitie.x;
  const y = pozitie.y;

  context.strokeStyle =
    toolCurent === "radiera" ? alegeBackground.value : alegeCuloarea.value;
  context.lineWidth = grosimeBrush.value;
  context.lineCap = "round";

  switch (toolCurent) {
    case "creion":
    case "radiera":
      context.lineTo(x, y);
      context.stroke();
      break;
    case "dreptunghi":
      //restaurez starea salvata si desenez forma noua de dreptunghi
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(canvasTemporar, 0, 0);
      context.beginPath();
      context.rect(startX, startY, x - startX, y - startY);
      context.stroke();
      break;

    case "cerc":
      const radius = Math.sqrt(
        Math.pow(x - startX, 2) + Math.pow(y - startY, 2)
      );
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(canvasTemporar, 0, 0);
      context.beginPath();
      context.arc(startX, startY, radius, 0, Math.PI * 2);
      context.stroke();
      break;

    case "elipsa":
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(canvasTemporar, 0, 0);
      context.beginPath();

      //pentru a calcula elipsa aflam centrul si razele elipsei
      const centerX = (startX + x) / 2;
      const centerY = (startY + y) / 2;
      const radiusX = Math.abs(x - startX) / 2;
      const radiusY = Math.abs(y - startY) / 2;

      context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      context.stroke();
      break;

    case "linie":
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(canvasTemporar, 0, 0);
      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(x, y);
      context.stroke();
      break;
  }
}

function stopDesen() {
  isDrawing = false;
  context.beginPath();
}

function adaugaFundal(culoare) {
  context.fillStyle = culoare;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function salvareStarePentruUndo() {
  const dataCanvas = context.getImageData(0, 0, canvas.width, canvas.height);
  stivaUndo.push(dataCanvas);
}
function undo() {
  if (stivaUndo.length > 0) {
    const ultimaStare = stivaUndo.pop();
    context.putImageData(ultimaStare, 0, 0);
  }
}

function exportSVG() {
  // Obținem datele PNG din canvas
  const pngData = canvas.toDataURL("image/png");

  // Creăm SVG-ul care va conține imaginea PNG
  const svgContent = `
  <svg 
      xmlns="http://www.w3.org/2000/svg" 
      xmlns:xlink="http://www.w3.org/1999/xlink"
      width="${canvas.width}" 
      height="${canvas.height}">
      <image
          width="${canvas.width}"
          height="${canvas.height}"
          xlink:href="${pngData}"/>
  </svg>`;

  // Creăm și descărcăm fișierul SVG
  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "canvasVectorial.svg";
  link.click();

  // Curățăm URL-ul creat
  URL.revokeObjectURL(url);
}

alegeBackground.addEventListener("input", (e) => {
  adaugaFundal(e.target.value);
});

// desenare

canvas.addEventListener("mousedown", startDesenare);
canvas.addEventListener("mousemove", deseneaza);
canvas.addEventListener("mouseup", stopDesen);
canvas.addEventListener("mouseout", stopDesen);

//Implementare salvare canvas in format JPEG
document.getElementById("salveazaJpeg").addEventListener("click", () => {
  const data = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = data;
  link.download = "canvasRaster.png";
  link.click();
});

//implementare salvare canvas in format svg
document.getElementById("salveazaSvg").addEventListener("click", exportSVG);

document.getElementById("undo").addEventListener("click", undo);
