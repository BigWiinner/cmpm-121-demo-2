import "./style.css";

const APP_NAME = "My Spooky Sketchpad!";
const app = document.querySelector<HTMLDivElement>("#app")!;
const sketchpad = document.querySelector<HTMLCanvasElement>("#sketchpad")!;
const pair = document.querySelector<HTMLDivElement>("#pair")!;

const title = document.createElement("h1");
title.innerHTML = APP_NAME;
app.append(title);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = 256;
canvas.height = 256.;
const ctx = canvas.getContext("2d")!;

ctx.fillStyle = "orange";
ctx.fillRect(0, 0, canvas.width, canvas.height);

const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";

clearButton.addEventListener("click", () => {
    lines.splice(0, lines.length);
    redraw();
});

const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";

const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";

sketchpad.append(canvas);
sketchpad.style.position = "absolute";
sketchpad.style.top = "-10%";
sketchpad.style.left = "50%";
sketchpad.style.transform = "translate(-50%, 50%)";

pair.append(clearButton, undoButton, redoButton);
pair.style.position = "absolute";
pair.style.top = "35%";
pair.style.left = "50%";
pair.style.transform = "translate(-50%, 50%)";

const lines: { x: number; y: number }[][] = [];
const redoLines: { x: number; y: number }[][] = [];

let currentLine: Array<{ x: number; y: number }> | null = null;

const cursor = { active: false, x: 0, y: 0 };

const event = new Event("drawing-changed");

canvas.addEventListener("drawing-changed", () => {
    redraw();
});

canvas.addEventListener("mousedown", (e) => {
    cursor.active = true;
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;

    currentLine = [];
    lines.push(currentLine);
    currentLine.push({ x: cursor.x, y: cursor.y });
    canvas.dispatchEvent(event);
});

canvas.addEventListener("mousemove", (e) => {
    if (cursor.active && currentLine) {
        cursor.x = e.offsetX;
        cursor.y = e.offsetY;
        currentLine.push({ x: cursor.x, y: cursor.y });
        canvas.dispatchEvent(event);

        if (redoLines) {
            redoLines.splice(0, redoLines.length);
        }
    }
});

canvas.addEventListener("mouseup", () => {
    cursor.active = false;
    currentLine = null;
    canvas.dispatchEvent(event);
});

function redraw() {
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const line of lines) {
        ctx.beginPath();
        const { x, y } = line[0];
        ctx.moveTo(x, y);
        for (const { x, y } of line) {
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}

undoButton.addEventListener("click", () => {
    if (lines.length > 0) {
        redoLines.push(lines.pop()!);
        canvas.dispatchEvent(event);
    }
});

redoButton.addEventListener("click", () => {
    if (redoLines.length > 0) {
        lines.push(redoLines.pop()!);
        canvas.dispatchEvent(event);
    }
});
