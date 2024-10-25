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

// interface Displayable and createLine were given by Brace
// when asked what the prompt in step 5 of D2 meant
interface Displayable {
    display(context: CanvasRenderingContext2D): void;
}

type Point = { x: number; y: number };

const createLine = (points: Point[]): Displayable => ({
    display: (context: CanvasRenderingContext2D) => {
        context.beginPath();
        const { x, y } = points[0];
        context.moveTo(x, y);
        for (const { x, y } of points) {
            context.lineTo(x, y);
        }
        context.stroke();
    },
});

const lines: Displayable[] = [];
const redoLines: Displayable[] = [];

const cursor = { active: false, x: 0, y: 0 };

const event = new Event("drawing-changed");

canvas.addEventListener("drawing-changed", () => {
    redraw();
});

let currentLine: { x: number; y: number }[] | null = null;
canvas.addEventListener("mousedown", (e) => {
    cursor.active = true;
    currentLine = [{ x: e.offsetX, y: e.offsetY }];
    lines.push(createLine(currentLine));
    canvas.dispatchEvent(event);
});

canvas.addEventListener("mousemove", (e) => {
    if (cursor.active && currentLine) {
        currentLine.push({ x: e.offsetX, y: e.offsetY });
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
        line.display(ctx);
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
