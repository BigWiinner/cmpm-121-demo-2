import "./style.css";

const APP_NAME = "My Spooky Sketchpad!";
const app = document.querySelector<HTMLDivElement>("#app")!;
const sketchpad = document.querySelector<HTMLCanvasElement>("#sketchpad")!;
const thick = document.querySelector<HTMLDivElement>("#thick")!;
const pair = document.querySelector<HTMLDivElement>("#pair")!;

const title = document.createElement("h1");
title.innerHTML = APP_NAME;
title.style.position = "fixed";
title.style.top = "-1%";
title.style.left = "50%";
title.style.transform = "translate(-50%, 50%)";
app.append(title);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = 256;
canvas.height = 256;
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

const thinButton = document.createElement("button");
thinButton.innerHTML = "thin lines";

const thickButton = document.createElement("button");
thickButton.innerHTML = "thick lines";

sketchpad.append(canvas, thinButton, thickButton);
sketchpad.style.position = "absolute";
sketchpad.style.top = "10%";
sketchpad.style.left = "50%";
sketchpad.style.transform = "translate(-50%, 50%)";

thick.append(thinButton, thickButton);
thick.style.position = "absolute";
thick.style.top = "55%";
thick.style.left = "50%";
thick.style.transform = "translate(-50%, 50%)";

pair.append(clearButton, undoButton, redoButton);
pair.style.position = "absolute";
pair.style.top = "60.5%";
pair.style.left = "50%";
pair.style.transform = "translate(-50%, 50%)";

// interface Displayable and createLine were given by Brace
// when asked what the prompt in step 5 of D2 meant
interface Displayable {
  display(context: CanvasRenderingContext2D): void;
}

type Point = { x: number; y: number; width: number };

const createLine = (points: Point[]): Displayable => ({
  display: (context: CanvasRenderingContext2D) => {
    context.beginPath();
    const { x, y, width } = points[0];
    ctx.lineWidth = width;
    context.moveTo(x, y);
    for (const { x, y } of points) {
      context.lineTo(x, y);
    }
    context.stroke();
  },
});

const createPointer = (points: Point[]): Displayable => ({
  display: (context: CanvasRenderingContext2D) => {
    const { x, y, width } = points[0];
    canvas.style.cursor = "none";
    console.log(width);
    context.font = 31 + 1.5 * width + "px monospace";
    context.fillStyle = "black";
    context.fillText("*", x - 8 - width / 2, y + 16 + width);
  },
});

const lines: Displayable[] = [];
const redoLines: Displayable[] = [];

const cursor = { active: false, x: 0, y: 0 };

const event = new Event("drawing-changed");

canvas.addEventListener("drawing-changed", redraw);

const toolEvent = new Event("tool-moved");

canvas.addEventListener("tool-moved", redraw);

let currentLine: { x: number; y: number; width: number }[] | null = null;

let cursorCommand: Displayable | null = null;
let currentPointer: { x: number; y: number; width: number }[] | null = null;

canvas.addEventListener("mouseenter", (e) => {
  currentPointer = [{ x: e.offsetX, y: e.offsetY, width: ctx.lineWidth }];
  cursorCommand = createPointer(currentPointer);
  canvas.dispatchEvent(toolEvent);
});

canvas.addEventListener("mouseout", () => {
  currentPointer = null;
  cursorCommand = null;
  canvas.dispatchEvent(event);
});

canvas.addEventListener("mousedown", (e) => {
  currentPointer = null;
  cursorCommand = null;
  cursor.active = true;
  currentLine = [{ x: e.offsetX, y: e.offsetY, width: ctx.lineWidth }];
  lines.push(createLine(currentLine));
  canvas.dispatchEvent(event);
});

canvas.addEventListener("mousemove", (e) => {
  currentPointer = [{ x: e.offsetX, y: e.offsetY, width: ctx.lineWidth }];
  cursorCommand = createPointer(currentPointer);
  canvas.dispatchEvent(toolEvent);
  if (cursor.active && currentLine) {
    currentPointer = null;
    cursorCommand = null;
    currentLine.push({ x: e.offsetX, y: e.offsetY, width: ctx.lineWidth });
    canvas.dispatchEvent(event);

    if (redoLines) {
      redoLines.splice(0, redoLines.length);
    }
  }
  canvas.dispatchEvent(event);
});

canvas.addEventListener("mouseup", (e) => {
  currentPointer = [{ x: e.offsetX, y: e.offsetY, width: ctx.lineWidth }];
  cursorCommand = createPointer(currentPointer);
  cursor.active = false;
  currentLine = null;
  canvas.dispatchEvent(toolEvent);
  canvas.dispatchEvent(event);
});

function redraw() {
  ctx.fillStyle = "orange";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const temp: number = ctx.lineWidth;
  if (cursorCommand) {
    cursorCommand.display(ctx);
  }
  for (const line of lines) {
    line.display(ctx);
  }
  ctx.lineWidth = temp;
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

thinButton.addEventListener("click", () => {
  if (ctx.lineWidth > 1) {
    ctx.lineWidth -= 1;
  }
});

thickButton.addEventListener("click", () => {
  if (ctx.lineWidth < 10) {
    ctx.lineWidth += 1;
  }
});
