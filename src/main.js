const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

global.ROOMS_PATH = "X:\\Develop\\Web\\PicturesWithDoors\\core\\src\\Rooms\\";

const RoomsManager = require("./roomsManager")(global.ROOMS_PATH);
require("dotenv").config();

function createWindow() {
	const win = new BrowserWindow({
		height: 800,
		width: 1200,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			contextIsolation: false,
		},
		icon: path.join(__dirname, "assets", "img", "icon.png"),
		title: "My App",
	});

	win.setTitle("My App");
	win.loadFile("view\\index.html");
	win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

const InitListeners = () => {
	ipcMain.on("getImageData", (event, imgPath) => {
		var _img = fs.readFileSync(imgPath).toString("base64");
		let dataType = "image/" + path.extname(imgPath).replace(".", "");
		var _out = `data:${dataType};base64,` + _img;
		event.returnValue = _out;
	});
};
InitListeners();
