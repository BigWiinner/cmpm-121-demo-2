import "./style.css";

const APP_NAME = "My Spooky Sketchpad!";
const app = document.querySelector<HTMLDivElement>("#app")!;

const title = document.createElement("h1");
title.innerHTML = APP_NAME;
app.append(title);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = 256;
canvas.height = 256.;
const ctx = canvas.getContext("2d");

if (ctx) {
    ctx.fillStyle = "orange";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// lines 22 - 53 used from step 2 example on assignment
// https://quant-paint.glitch.me/paint0.html
const cursor = { active: false, x: 0, y: 0 };

canvas.addEventListener("mousedown", (e) => {
    cursor.active = true;
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
});

canvas.addEventListener("mousemove", (e) => {
    if (cursor.active && ctx) {
        ctx.beginPath();
        ctx.moveTo(cursor.x, cursor.y);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        cursor.x = e.offsetX;
        cursor.y = e.offsetY;
    }
});

canvas.addEventListener("mouseup", () => {
    cursor.active = false;
});

const clear = document.createElement("button");
clear.innerHTML = "clear";
document.body.append(clear);

clear.addEventListener("click", () => {
    if (ctx) {
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
});
