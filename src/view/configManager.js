const path = require("path");
const fs = require("fs");

const Create = (settings) => {
	if (path.basename(settings.path) !== settings.RoomConfig.name.toString())
		settings.path = path.join(
			settings.path,
			settings.RoomConfig.name.toString()
		);
	CreateImages(settings.path, settings.RoomConfig);
	settings.RoomConfig.imgsData = undefined;
	settings.RoomConfig.name = undefined;
	fs.writeFileSync(
		path.join(settings.path, "/room.json"),
		JSON.stringify(settings.RoomConfig)
	);
};

const Load = (config, pathToRoomsFolder) => {};

const CreateImages = (roomPath, RoomConfig) => {
	const ParseBase64 = (data) => {
		return {
			data: (() => {
				let base64Data = data.replace(/^data:image\/.*;base64,/, "");
				base64Data += base64Data.replace("+", " ");
				return new Buffer(base64Data, "base64").toString("binary");
			})(),
			extname: data
				.match(/^data:image\/.*;base64,/g)[0]
				.replace("data:image/", "")
				.replace("base64,", ""),
		};
	};

	const { imgs, imgsData } = RoomConfig;
	if (!fs.existsSync(roomPath)) fs.mkdirSync(roomPath, { recursive: true });
	for (let i = 0; i < imgs.length; i++) {
		const { data, extname } = ParseBase64(
			imgsData[i].src.toString("base64")
		);
		fs.writeFileSync(
			path.join(roomPath, imgs[i]),
			data,
			"binary",
			console.error
		);
	}
};

module.exports = { Create, Load };
