const userService = require("./user.service");

const getMyProfile = async (req, res, next) => {
	try {
		const profile = await userService.getMyProfile(req.user.id);

		return res.status(200).json({
			data: profile
		});
	} catch (error) {
		next(error);
	}
};

const searchUsers = async (req, res, next) => {
	try {
		const users = await userService.searchUsers({
			query: req.query.q,
			requesterId: req.user.id
		});

		return res.status(200).json({
			data: users
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	getMyProfile,
	searchUsers
};
