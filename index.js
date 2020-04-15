const { World, Engine, Runner, Render, Bodies, Body, Events } = Matter;

const width = window.innerWidth,
	height = window.innerHeight,
	rows = 20,
	columns = 28;

const unitLengthHor = width / columns;
const unitLengthVer = height / rows;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		wireframes: false,
		width,
		height
	}
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
	Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
	Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
	Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
	Bodies.rectangle(width, height / 2, 2, height, { isStatic: true })
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

		cellsIteration(nextRow, nextColumn);
	}
};

cellsIteration(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
	row.forEach((open, columnIndex) => {
		if (open) {
			return;
		}

		const wall = Bodies.rectangle(
			columnIndex * unitLengthHor + unitLengthHor / 2,
			rowIndex * unitLengthVer + unitLengthVer,
			unitLengthHor,
			10,
			{
				label: 'wall',
				isStatic: true,
				render: {
					fillStyle: 'red'
				}
			}
		);
		World.add(world, wall);
	});
});

verticals.forEach((row, rowIndex) => {
	row.forEach((open, columnIndex) => {
		if (open) {
			return;
		}

		const wall = Bodies.rectangle(
			columnIndex * unitLengthHor + unitLengthHor,
			rowIndex * unitLengthVer + unitLengthVer / 2,
			10,
			unitLengthVer,
			{
				label: 'wall',
				isStatic: true,
				render: {
					fillStyle: 'red'
				}
			}
		);
		World.add(world, wall);
	});
});

//Goal
const goal = Bodies.rectangle(
	width - unitLengthHor / 2,
	height - unitLengthVer / 2,
	0.8 * unitLengthHor,
	0.8 * unitLengthVer,
	{
		label: 'Goal',
		isStatic: true,
		render: {
			fillStyle: 'green'
		}
	}
);
World.add(world, goal);

//Ball
const ballRadius = Math.min(unitLengthHor, unitLengthVer) / 4;
const ball = Bodies.circle(unitLengthHor / 2, unitLengthVer / 2, ballRadius, {
	label: 'Ball',
	render: {
		fillStyle: 'blue'
	}
});
World.add(world, ball);

document.addEventListener('keydown', (event) => {
	const { x, y } = ball.velocity;

	if (event.keyCode === 87) {
		Body.setVelocity(ball, { x, y: y - 5 });
	} else if (event.keyCode === 68) {
		Body.setVelocity(ball, { x: x + 5, y });
	}
	if (event.keyCode === 83) {
		Body.setVelocity(ball, { x, y: y + 5 });
	}
	if (event.keyCode === 65) {
		Body.setVelocity(ball, { x: x - 5, y });
	}
});

//Win Condition

Events.on(engine, 'collisionStart', (event) => {
	event.pairs.forEach((collision) => {
		const labels = [ 'Ball', 'Goal' ];

		if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
			document.querySelector('.winner').classList.remove('hidden');
			world.gravity.y = 1;
			world.bodies.forEach((body) => {
				if (body.label === 'wall') {
					Body.setStatic(body, false);
				}
			});
		}
	});
});
