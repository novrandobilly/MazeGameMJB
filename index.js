const { World, Engine, Runner, Render, Bodies } = Matter;

const width = 600,
	height = 600,
	rows = 7,
	columns = 7;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		wireframes: true,
		width,
		height
	}
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
	Bodies.rectangle(width / 2, 0, width, 40, { isStatic: true }),
	Bodies.rectangle(width / 2, height, width, 40, { isStatic: true }),
	Bodies.rectangle(0, height / 2, 40, height, { isStatic: true }),
	Bodies.rectangle(width, height / 2, 40, height, { isStatic: true })
];
World.add(world, walls);

//Maze Generation

const shuffle = (arr) => {
	let len = arr.length;

	while (len > 0) {
		const index = Math.floor(Math.random() * len);
		len--;

		const temp = arr[len];
		arr[len] = arr[index];
		arr[index] = temp;
	}
	return arr;
};

const grid = Array(rows).fill(null).map(() => Array(columns).fill(false));
const verticals = Array(rows).fill(null).map(() => Array(columns - 1).fill(false));
const horizontals = Array(rows - 1).fill(null).map(() => Array(columns).fill(false));

const startRow = Math.floor(Math.random() * rows);
const startColumn = Math.floor(Math.random() * columns);

const cellsIteration = (row, column) => {
	//If I have visited the cell at [row, column], then return
	if (grid[row][column]) {
		return;
	}

	//Mark this cell as being visited
	grid[row][column] = true;

	//Assemble randomly-ordered list of neighbors
	const neighbors = shuffle([
		[ row - 1, column, 'UP' ],
		[ row, column - 1, 'LEFT' ],
		[ row + 1, column, 'DOWN' ],
		[ row, column + 1, 'RIGHT' ]
	]);

	//For each neighbors
	for (let neighbor of neighbors) {
		const [ nextRow, nextColumn, direction ] = neighbor;

		//See if that neighbor is out of bound
		if (nextRow < 0 || nextRow >= rows || nextColumn < 0 || nextColumn >= columns) {
			continue;
		}

		//If we have visited that neighbor, continue to next neighbor
		if (grid[nextRow][nextColumn]) {
			continue;
		}

		//Remove a wall from either horizontals or veticals
		if (direction === 'LEFT') {
			verticals[row][column - 1] = true;
		} else if (direction === 'RIGHT') {
			verticals[row][column] = true;
		} else if (direction === 'UP') {
			horizontals[row - 1][column] = true;
		} else if (direction === 'DOWN') {
			horizontals[row][column] = true;
		}
	}
};

cellsIteration(1, 1);

console.log(grid);
console.log(verticals);
console.log(horizontals);
