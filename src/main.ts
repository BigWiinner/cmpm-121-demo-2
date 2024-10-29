import "./style.css";

const APP_NAME = "My Spooky Sketchpad!";
const app = document.querySelector<HTMLDivElement>("#app")!;
const sketchpad = document.querySelector<HTMLCanvasElement>("#sketchpad")!;
const thick = document.querySelector<HTMLDivElement>("#thick")!;
const pair = document.querySelector<HTMLDivElement>("#pair")!;
const colorSliders = document.querySelector<HTMLDivElement>("#slider")!;

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
  placedIcons.splice(0, placedIcons.length);
  redoLines.splice(0, redoLines.length);
  redoIcons.splice(0, redoIcons.length);
  undoOrder.splice(0, undoOrder.length);
  redoOrder.splice(0, redoOrder.length);
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

sketchpad.append(canvas);
sketchpad.style.position = "absolute";
sketchpad.style.top = "10%";
sketchpad.style.left = "50%";
sketchpad.style.transform = "translate(-50%, 50%)";

thick.append(
  thinButton,
  thickButton,
);

const addSticker = document.createElement("button");
addSticker.innerHTML = "Add sticker";
thick.append(addSticker);

const exportButton = document.createElement("button");
exportButton.innerHTML = "export";
thick.append(exportButton);

function createButton(sticker: string) {
  const button = document.createElement("button");
  button.innerHTML = sticker;

  button.addEventListener("click", () => {
    icon = button.innerHTML;
    canvas.dispatchEvent(toolEvent);
  });

  addSticker.parentNode?.insertBefore(button, addSticker);
}

const stickers: string[] = ["🎃", "💀", "👻", "🦇", "🧟", "🧛"];

for (let i = 0; i < stickers.length; i++) {
  createButton(stickers[i]);
}

addSticker.addEventListener("click", () => {
  const text = prompt("Add emoji below", "👻");
  if (text && !stickers.find((e) => e === text)) {
    createButton(text);
  }
});

thick.style.position = "absolute";
thick.style.top = "62%";
thick.style.left = "50%";
thick.style.transform = "translate(-50%, 50%)";

pair.append(clearButton, undoButton, redoButton);
pair.style.position = "absolute";
pair.style.top = "55%";
pair.style.left = "50%";
pair.style.transform = "translate(-50%, 50%)";

let r = 0;
let g = 0;
let b = 0;
function createRange(value: string) {
  const slider = document.createElement("input");
  slider.type = "range";
  slider.name = value;
  slider.setAttribute("title", value);
  slider.min = "0";
  slider.max = "255";
  slider.value = "0";
  slider.addEventListener("input", () => {
    if (slider.name === "red") {
      r = Number(slider.value);
    } else if (value === "green") {
      g = Number(slider.value);
    } else if (value === "blue") {
      b = Number(slider.value);
    }
    ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
    console.log(ctx.strokeStyle);
  });
  colorSliders.append(slider);
}

const colors: string[] = ["red", "green", "blue"];
for (let i = 0; i < colors.length; i++) {
  createRange(colors[i]);
}

colorSliders.style.position = "absolute";
colorSliders.style.top = "61%";
colorSliders.style.left = "50%";
colorSliders.style.transform = "translate(-50%, 50%)";

// interface Displayable and createLine were given by Brace
// when asked what the prompt in step 5 of D2 meant
interface Displayable {
  display(context: CanvasRenderingContext2D): void;
}

type Point = {
  x: number;
  y: number;
  width: number;
  color: string | CanvasGradient | CanvasPattern;
};

// Icon and its uses inspired by Brace when prompted with my code from
// step 7 with the question:
// "What's a good way for me to track placed icons to use
//  the redraw method on later?"
type Icon = {
  x: number;
  y: number;
  emoji: string;
  width: number;
  color: string | CanvasGradient | CanvasPattern;
};

let multiple = 1;

const createLine = (points: Point[]): Displayable => ({
  display: (context: CanvasRenderingContext2D) => {
    context.beginPath();
    const { x, y, width, color } = points[0];
    ctx.strokeStyle = color;
    console.log("Color = " + color);
    context.lineWidth = width * multiple;
    context.moveTo(x * multiple, y * multiple);
    for (const { x, y } of points) {
      context.lineTo(x * multiple, y * multiple);
    }
    context.stroke();
  },
});

let icon = "*";
const createPointer = (points: Point[]): Displayable => ({
  display: (context: CanvasRenderingContext2D) => {
    const { x, y, width } = points[0];
    canvas.style.cursor = "none";
    context.font = 31 + 1.5 * width + "px monospace";
    context.fillStyle = ctx.strokeStyle;
    context.fillText(icon, x - 8 - width / 2, y + 16 + width);
  },
});

const lines: Displayable[] = [];
const redoLines: Displayable[] = [];
const placedIcons: Icon[] = [];
const redoIcons: Icon[] = [];
const undoOrder: string[] = [];
const redoOrder: string[] = [];

const cursor = { active: false, x: 0, y: 0 };

const event = new Event("drawing-changed");

canvas.addEventListener("drawing-changed", redraw);

const toolEvent = new Event("tool-moved");

canvas.addEventListener("tool-moved", redraw);

let currentLine: {
  x: number;
  y: number;
  width: number;
  color: string | CanvasGradient | CanvasPattern;
}[] | null = null;

let cursorCommand: Displayable | null = null;
let currentPointer: {
  x: number;
  y: number;
  width: number;
  color: string | CanvasGradient | CanvasPattern;
}[] | null = null;

canvas.addEventListener("mouseenter", (e) => {
  currentPointer = [{
    x: e.offsetX,
    y: e.offsetY,
    width: ctx.lineWidth,
    color: ctx.strokeStyle,
  }];
  console.log("Mouseenter: " + ctx.strokeStyle);
  cursorCommand = createPointer(currentPointer);
  console.log("Mouseenter END: " + ctx.strokeStyle);
  canvas.dispatchEvent(toolEvent);
  console.log("REDRAW END: " + ctx.strokeStyle);
});

canvas.addEventListener("mouseout", () => {
  currentPointer = null;
  cursorCommand = null;
  canvas.dispatchEvent(event);
});

canvas.addEventListener("mousedown", (e) => {
  if (icon !== "*") {
    placedIcons.push({
      x: e.offsetX - 8,
      y: e.offsetY + 16,
      emoji: icon,
      width: ctx.lineWidth,
      color: ctx.strokeStyle,
    });
    ctx.fillText(icon, e.offsetX - 8, e.offsetY + 16);
    undoOrder.push("emoji");
  } else {
    cursor.active = true;
    currentLine = [{
      x: e.offsetX,
      y: e.offsetY,
      width: ctx.lineWidth,
      color: ctx.strokeStyle,
    }];
    lines.push(createLine(currentLine));
    canvas.dispatchEvent(event);
    undoOrder.push("line");
  }
  icon = "*";
});

canvas.addEventListener("mousemove", (e) => {
  currentPointer = [{
    x: e.offsetX,
    y: e.offsetY,
    width: ctx.lineWidth,
    color: ctx.strokeStyle,
  }];
  cursorCommand = createPointer(currentPointer);
  canvas.dispatchEvent(toolEvent);
  if (cursor.active && currentLine) {
    currentPointer = null;
    cursorCommand = null;
    currentLine.push({
      x: e.offsetX,
      y: e.offsetY,
      width: ctx.lineWidth,
      color: ctx.strokeStyle,
    });
    canvas.dispatchEvent(event);

    if (redoLines) {
      redoLines.splice(0, redoLines.length);
    }
  }
  canvas.dispatchEvent(event);
});

canvas.addEventListener("mouseup", (e) => {
  currentPointer = [{
    x: e.offsetX,
    y: e.offsetY,
    width: ctx.lineWidth,
    color: ctx.strokeStyle,
  }];
  cursorCommand = createPointer(currentPointer);
  cursor.active = false;
  currentLine = null;
  canvas.dispatchEvent(toolEvent);
  canvas.dispatchEvent(event);
});

function redraw() {
  ctx.fillStyle = "orange";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const tempWidth: number = ctx.lineWidth;
  const tempColor: string | CanvasGradient | CanvasPattern = ctx.strokeStyle;
  if (cursorCommand) {
    cursorCommand.display(ctx);
  }
  for (const line of lines) {
    line.display(ctx);
  }
  for (const icon of placedIcons) {
    ctx.font = icon.width + 31 + "px monospace";
    ctx.fillText(icon.emoji, icon.x, icon.y);
  }
  ctx.lineWidth = tempWidth;
  ctx.strokeStyle = tempColor;
}

undoButton.addEventListener("click", () => {
  if (undoOrder[undoOrder.length - 1] === "emoji") {
    redoIcons.push(placedIcons.pop()!);
    redoOrder.push(undoOrder.pop()!);
  } else if (undoOrder[undoOrder.length - 1] === "line") {
    redoLines.push(lines.pop()!);
    redoOrder.push(undoOrder.pop()!);
  }
  canvas.dispatchEvent(event);
  console.log(redoOrder);
});

redoButton.addEventListener("click", () => {
  if (redoOrder[redoOrder.length - 1] === "emoji") {
    placedIcons.push(redoIcons.pop()!);
    undoOrder.push(redoOrder.pop()!);
  } else if (redoOrder[redoOrder.length - 1] === "line") {
    lines.push(redoLines.pop()!);
    undoOrder.push(redoOrder.pop()!);
  }
  canvas.dispatchEvent(event);
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

exportButton.addEventListener("click", () => {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = 1024;
  tempCanvas.height = 1024;
  const tempCtx = tempCanvas.getContext("2d")!;
  tempCtx.fillStyle = "orange";
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  ctx.save();
  ctx.scale(4, 4);

  multiple = 4;
  for (const line of lines) {
    line.display(tempCtx);
  }
  multiple = 1;

  for (const icon of placedIcons) {
    tempCtx.font = (icon.width + 31) * 4 + "px monospace";
    tempCtx.fillText(icon.emoji, icon.x * 4, icon.y * 4);
  }

  const anchor = document.createElement("a");
  anchor.href = tempCanvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();

  tempCanvas.remove();

  ctx.restore();
});
