const { ipcRenderer } = require("electron");

const path = require("path");

const CFGManager = require("./configManager");

const ROOMS_PATH = path.join(__dirname + "..\\..\\testRooms");

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const GetImage = (path) => {
	const img = new Image();
	img.src = ipcRenderer.sendSync("getImageData", path);

	return img;
};

let _canvas_image = null;
const ChangeCanvasImage = (img) => {
	img =
		img ||
		_canvas_image ||
		GetImage(path.join(__dirname, "assets", "startImg.jpg"));
	if (_canvas_image) _canvas_image.remove();
	_canvas_image = img;

	const Draw = () => {
		const imgSize = {
			x: canvas.width,
			y: (canvas.width / img.width) * img.height,
		};

		canvas.height = imgSize.y;

		ctx.drawImage(img, 0, 0, imgSize.x, imgSize.y);
	};

	if (img.width === 0 || img.height === 0) {
		img.onload = Draw;
	} else {
		Draw();
	}
};

const ResizeHandler = () => {
	const size = { x: window.innerWidth - 220, y: window.innerHeight };

	console.info(size);

	canvas.width = size.x;
	canvas.height = size.y;

	ChangeCanvasImage(_canvas_image);
};

const DropManager = (callback) => {
	if (typeof callback !== "function") callback = () => {};

	const target = document.querySelector("body");
	document.addEventListener("dragover", (e) => {
		e.preventDefault();
		e.stopPropagation();
	});

	document.addEventListener("dragenter", (event) => {
		console.log("File is in the Drop Space");
	});

	document.addEventListener("dragleave", (event) => {
		console.log("File has left the Drop Space");
	});
	document.addEventListener("drop", (event) => {
		event.preventDefault();
		event.stopPropagation();
		for (const f of event.dataTransfer.files) {
			// Using the path attribute to get absolute file path
			console.log("File: ", f);
			console.log("File Path of dragged files: ", f.path);
			ChangeCanvasImage(GetImage(f.path));
			StartImage(f.name, GetImage(f.path));
		}
	});
};

const CanvasCrossManager = {
	Enable: () => {
		if (!CanvasCrossManager._enable) {
			let doorF = false;
			const ProcClick = (event) => {
				return {
					x: event.offsetX / canvas.width,
					y: event.offsetY / canvas.height,
				};
			};
			const DrawDoor = () => {
				const DrawRect = (settings) => {
					ctx.rect(
						canvas.width * settings.x,
						canvas.height * settings.y,
						canvas.width * settings.w,
						canvas.height * settings.h
					);
				};

				if (RoomConfig.doors.length !== 0) {
					ctx.beginPath();
					ctx.strokeStyle = "#f0f";
					RoomConfig.doors.forEach((door) =>
						door.imgId === StartImage.id
							? DrawRect(door)
							: undefined
					);
					ctx.stroke();
				}
				if (DoorSettings.x != -1 && DoorSettings.h != -1) {
					ctx.beginPath();
					ctx.strokeStyle = "#f00";
					DrawRect(DoorSettings);
					ctx.stroke();
				}
			};
			CanvasCrossManager._enable = true;
			CanvasCrossManager._mm = (event) => {
				ChangeCanvasImage();
				ctx.strokeStyle = "#fff";
				ctx.beginPath();
				ctx.moveTo(0, event.offsetY);
				ctx.lineTo(canvas.width, event.offsetY);
				ctx.moveTo(event.offsetX, 0);
				ctx.lineTo(event.offsetX, canvas.height);
				ctx.stroke();
				DrawDoor();
			};
			CanvasCrossManager._ml = (event) => {
				ChangeCanvasImage();
				DrawDoor();
			};
			CanvasCrossManager._md = (event) => {
				const pos = ProcClick(event);
				if (doorF) {
					DoorSettings.w = pos.x - DoorSettings.x;
					DoorSettings.h = pos.y - DoorSettings.y;
					doorF = false;
				} else {
					DoorSettings.x = pos.x;
					DoorSettings.y = pos.y;
					doorF = true;
				}
				CanvasCrossManager._mm(event);
				console.log(DoorSettings);
			};
			canvas.addEventListener("mousemove", CanvasCrossManager._mm);
			canvas.addEventListener("mouseleave", CanvasCrossManager._ml);
			canvas.addEventListener("mousedown", CanvasCrossManager._md);
		}
	},
	Disable: () => {
		if (CanvasCrossManager._enable) {
			CanvasCrossManager._enable = false;
			canvas.removeEventListener(CanvasCrossManager._mm);
			canvas.removeEventListener(CanvasCrossManager._ml);
			canvas.removeEventListener(CanvasCrossManager._md);
			CanvasCrossManager._ml();
		}
	},
};
CanvasCrossManager.Enable();

let RoomConfig = undefined;

const StartRoom = () => {
	RoomConfig = { imgs: [], imgsData: [], doors: [] };
	StartImage.id = -1;
};

const EndRoom = () => {
	RoomConfig.version = 2;
	RoomConfig.name = document.querySelector("#room-id").value;
	RoomConfig.imgId = document.querySelector("#img-id-start").value || 0;
	RoomConfig.imgLoop = document.querySelector("#image-loop").checked;

	console.log(RoomConfig);
	CFGManager.Create({
		path: ROOMS_PATH,
		RoomConfig,
	});
	RoomConfig = undefined;
};

const StartImage = (imgName, img) => {
	if (!RoomConfig) new Error("No RoomConfig started!");
	StartImage.id += 1;
	RoomConfig.imgs.push(imgName);
	RoomConfig.imgsData.push(img);

	ChangeCanvasImage(img);
};
const EndImage = () => {};

let DoorSettings = { x: -1, y: -1, h: -1, w: -1 };
const SaveDoor = (settings) => {
	if (!settings) {
		settings = {};
	}
	settings.room = document.querySelector("#door-room-id").value;
	settings.description = document.querySelector("#door-description").value;
	settings.color = document.querySelector("#door-color").value;
	settings.img = document.querySelector("#door-image").value;
	settings.opacity = document.querySelector("#door-opacity").value;
	const cfg = {
		imgId: StartImage.id,
		...settings,
		...DoorSettings,
	};
	console.log(cfg);
	RoomConfig.doors.push(cfg);
	DoorSettings = { x: -1, y: -1, h: -1, w: -1 };
};

const DrawInputs = () => {
	const CreateInput = (name, id, type = "text") => {
		const input = document.createElement("input");
		input.type = type;
		input.id = id;
		input.classList = ["settings-input"];

		const span = document.createElement("span");
		span.id = "input-name";
		span.textContent = name;

		const sCon = document.createElement("div");
		sCon.id = "input-box";
		sCon.appendChild(span);
		sCon.appendChild(input);

		return sCon;
	};

	const inputs = [
		CreateInput("Room ID", "room-id"),
		CreateInput("Start Image ID", "img-id-start"),
		CreateInput("Image loop", "image-loop", "checkbox"),
		(() => {
			const l = document.createElement("label");
			l.innerText = "Door Settings";
			return l;
		})(),
		CreateInput("Room ID", "door-room-id"),
		CreateInput("Description", "door-description"),
		CreateInput("Image", "door-image"),
		CreateInput("Opacity", "door-opacity"),
		CreateInput("Color", "door-color"),
	];

	inputs.forEach((input) =>
		document.querySelector("#manage-box").appendChild(input)
	);

	const bCreate = document.createElement("button");
	bCreate.innerText = "Create";
	document.querySelector("#manage-box").appendChild(bCreate);

	const bCreateDoor = document.createElement("button");
	bCreateDoor.innerText = "Create Door";
	document.querySelector("#manage-box").appendChild(bCreateDoor);

	const bSaveRoom = document.createElement("button");
	bSaveRoom.innerText = "End Room";
	document.querySelector("#manage-box").appendChild(bSaveRoom);

	//TODO: Це кнопочки эвенты нажатия
	bCreate.onclick = () => {
		EndImage();
		StartImage();
	};
	bCreateDoor.onclick = () => {
		SaveDoor();
	};
	bSaveRoom.onclick = () => {
		EndRoom();
	};
};

window.onresize = ResizeHandler;

DrawInputs();
ResizeHandler();
DropManager();
StartRoom();
