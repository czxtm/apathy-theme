export {};

// 1. color palette
const colors = {
	white: "#d1d3d9",
	flatWhite: "#a7a4af",
	vanilla: "#f5e0dc",
	nepal: "#91aac0",
	regentGray: "#829297",
	celery: "#b1d36d",
	purple: "#8564d8",
	lavender: "#cba6f7",
	scooter: "#33b3cc",
	stormgray: "#767a92",
	mint: "#73bf9c",
	gold: "#ffcb6b",
	lightOrchid: "#e0a2d3",
	watermelon: "#FF6188",
	razzmatazz: "#E60063",
};

// 2. assign them to internal token types
const _assignments = {
	// default color for all tokens
	source: colors.flatWhite,
	comments: colors.regentGray,
	// operators are used in expressions
	operators: {
		default: colors.razzmatazz,
		// +, -, /. etc
		arithmetic: colors.razzmatazz,
		// =, +=, -=, etc
		assignment: colors.razzmatazz,
		logical: colors.razzmatazz,
		wordlike: colors.razzmatazz,
	},
	// literals are fixed values
	literals: {
		default: colors.scooter,
		string: colors.celery,
		number: colors.gold,
		boolean: colors.scooter,
		null: colors.purple,
		undefined: colors.purple,
	},
	keyword: {
		default: colors.stormgray,
		import: colors.lightOrchid,
	},
	constant: {
		default: colors.nepal,
		numeric: colors.scooter,
	},
	variable: {
		default: colors.flatWhite,
	},
	strings: {
		default: colors.celery,
		regex: colors.watermelon,
	},
	punctuation: {
		default: colors.stormgray,
	},
	meta: {
		default: colors.stormgray,
	},
	entity: {
		default: colors.flatWhite,
	},
};

const _semantic = {
	namespace: colors.flatWhite,
	class: {
		default: colors.lightOrchid,
	},
	property: {
		default: colors.lightOrchid,
		definition: colors.lavender,
	},
};
