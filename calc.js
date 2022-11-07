if (!process.argv[3]) {
	console.log('Needs 2 or 3 arguments:\nFile To Load\nComponent to calculate costs for\nMultiplier/Number of component required')
	process.exit(1)
}

const fs = require('fs')
const jsonRaw = JSON.parse(fs.readFileSync(process.argv[2]))

const settings = jsonRaw.settings
const components = jsonRaw.components

mainComponent = components[process.argv[3]]

if (!mainComponent) {
	console.log("\n" + process.argv[3] + " Is not a component located in " + process.argv[2] + " Maybe it's a raw resource?\n")
	process.exit(1)
}

costs = {}

mainComponentNames = Object.keys(mainComponent)
mainComponentNum = 1

if (process.argv[4]) {
	mainComponentNum = parseInt(process.argv[4])
}

// TODO: Actually allow this to be a thing and maybe list unused components
// If set up in a non-optimal way, run the calculations over and over again with dereferencing(for if a component produces multiple of itself non-negotiably)
if (!settings.optimized) {
	for (i = 0; i !== mainComponentNum; i++) {
		mainComponentNames.forEach(n => {
			dereferenceCosts(n, process.argv[3], 1)
		})
	}
} else {
	// Else, if all components can be made cleanly without being batched we can just multiply the costs
	mainComponentNames.forEach(n => {
		dereferenceCosts(n, process.argv[3], 1)
	})
	costKeys = Object.keys(costs)
	costValues = Object.values(costs)

	costKeys.forEach((name) => {
		costs[name] = costs[name] * mainComponentNum
	})
}

console.log(costs)

function dereferenceCosts(name, reference, amount) {
	if (!components[name]) {
		if (!costs[name]) {
			costs[name] = 0
		}
		costs[name] = costs[name] + components[reference][name] * amount
	} else {
		names = Object.keys(components[name])
		names.forEach(compName => {
			amount += components[reference][name]
			dereferenceCosts(compName, name, amount)
		});
	}
}
