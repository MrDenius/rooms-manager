const path = require("path");
const fs = require("fs");

const Create = (settings) => {};

const Load = (config) => {};

const CreateImages = (path, imageData) => {
	const ParseBase64 = (data) => {
		return {
			data: (() => {
				let base64Data = data.replace(/^data:image\/.*;base64,/, ""); //XXX: ещё не доделано!!
			})(),
			extname: data
				.match(/^data:image\/.*;base64,/g)
				.replace("data:image/", "")
				.replace("base64,", ""),
		};
	};

	if (!fs.existsSync(path)) fs.mkdirSync(path);
};

module.exports = { Create, Load };
