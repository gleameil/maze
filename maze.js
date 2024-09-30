// Dividers are at present 2 pixels wide; this may change if (for example) I end up using lines of poetry instead of solid divs
const DIVIDER_PIXELS = 2;

// Think of the maze as a grid where any pair of cells may or may not be separated by dividers; these represent the number of cells in the grid in each dimension
const WIDTH = 25;
const HEIGHT = 13;

/*
This is an example of the format in which I envision storing the maze in localStorage, before hydrating it into a 2D array.
It's a bit confusing but the best I could come up with quickly.
- Each number represents *either* a divider *or* a cell, so, if we assume rows and columns zero-indexed,
- odd-indexed rows and columns are cells and even-indexed rows and columns are dividers.
- (If a number is "doubly" a divider (even-indexed in both row and column) it's the tiny corner piece where two dividers meet.)
- The `|` character in the string marks the end of one row and the start of the next. 
- The backslashes are to illustrate that the rows are of uniform length and helped me translate my drawing of a maze into this representation.

A diagram!:

01234
0*-*-*
1| | |
2*-*-*
3| | |
4*-*-*

*/
const temporaryMazeString = 
'111111111111111111111111111111111111111111111111111\
|100000000000000000000000000000000000000000000000001\
|101110111011111011111111111111100011111111111111111\
|101010101010001010000000000000100010000000000000001\
|101010101011111011111000001110100010111111101111101\
|101010101000000000001000001010000010100000101000101\
|101011101110111011101011111011111110101110101110101\
|101000000010101010101010000000000000101010100000101\
|101111111010101010101010111111101111101010111111101\
|100000001010101010101010100000101000001010000000001\
|101111101010101110101010111110101011111000101110111\
|101000101000100000101010000010101000000000101010101\
|101011101110101111101010111010111011111110101010101\
|101010000010101000000010100010000000000010100010101\
|101010111110101011101110111110111111111010111110111\
|101010100000101010101000000000100000001010000000001\
|101010101111101010101111101111101111111010111111101\
|101000100000000010100000101000001000000010100000101\
|101110111111111010111111101011111011101110101110101\
|100010000000001010000000001010000010101000001010101\
|101110111111101011111111111010111110101011101010101\
|101000100000101000000000000010100000101000101010101\
|101110111111101111111111111110111110101111101010101\
|100010000000000000000000000000000010100000001010101\
|101110111110111111111111111111111110111111111011101\
|101000100010100000000000000000000000000000000000001\
|111111111111111111111111111111111111111111111111111'

/* This may be even more confusing, but for startingX, startingY, goalX, and goalY, envision a grid made of the cells **but not** the dividers:
an array of length HEIGHT containing are arrays of length WIDTH;
*/

// startingX and startingY are at present the upper lefthand corner of the grid,
// but I would like to be able to choose a location in the grid randomly and build the maze from there
const startingX = 0;
const startingY = 0;

// I want the goal to be the center of the maze for symbolic reasons
// Note that floor division gets us to the center here because our imaginary arrays of cells are zero-indexed
const goalX = Math.floor(WIDTH / 2)
const goalY = Math.floor(HEIGHT / 2)

function parseMazeString(mazeString) {
  // Imagine a mazeString of `1111111|1010101|1111111|1010101|1111111|1010101|1111111`, so a grid of WIDTH 3 cells and HEIGHT 3 cells
  // (Note: this particular string is a grid and in no way a maze, but it should illustrate what I'm doing)

  let rows = mazeString.split('|') // ['1111111', '1010101', '1111111', '1010101', '1111111', '1010101', '1111111' ]
  return rows.map(row => row.split('').map(character => character === '1')); // This turns each string of numbers into an array of numbers and coerces each number into a boolean, which is basically what they are
  // Theoretically one would do Boolean(Number('1')) instead, but given the complexities of type coercion in js this seems more readable
  // In addition, I could, theoretically, eventually, if I wanted, store the user location as a '2' or something
}

// Reverses `parseMazeString`
function storeMazeString(maze) {
  const rowStrings = maze.map(row => {
    let rowString = '';
    row.forEach(bool => {
      rowString += (bool ? '1' : '0');
    });
    return rowString;
  });
  localStorage.setItem('maze', rowStrings.join('|'));
}

// This is what I most need help with
// The below makes a WIDTH-and-HEIGHT-sized version of the example grid in `parseMazeString` and is a placeholder that is not yet in use
function makeMaze() {
  let maze = [];
  for (let i = 0; i <= HEIGHT * 2; i++) { // <= is correct; we want one *more* than twice the width because boundaries are also represented in the array 
    let row = []
    for (let j = 0; j <= WIDTH * 2; j++) {
      row.push(i % 2 === 0 || j % 2 == 0);
    }
    maze.push(row);
  }
  storeMazeString(maze);
  return maze;
}

// This is called whenever the user hits an arrow key or `WASD` 
// `player` is at present a black dot
function movePlayer(keyboardEvent) {
  const player = document.getElementById('player');
  const parent = player.parentElement; // the cell the player occupies
  const playerLocationArr = parent.id.split('-'); // the id of each element is set as `{rowIndex}-{columnIndex}` in the grid that **does** include dividers, so `y-x`
  const playerX = parseInt(playerLocationArr[1]);
  const playerY = parseInt(playerLocationArr[0]);
  
  switch (keyboardEvent.key) {
    case 'a':
    case 'ArrowLeft':
      // check the divider immediately to the player's left. If it is 'obstructed,' aka if it's shaded, aka there's a wall, this is false
      // Note that the outer edge of the maze should be solid 
      // May eventually add NPCs in other cells, in which case this will check the cell with id `{playerY}-{playerX-2}` for children as well
      const canGoLeft = !document.getElementById(`${playerY}-${playerX - 1}`).classList.contains('obstructed');
      if (canGoLeft) {
        parent.removeChild(player);
        // move the player to the *cell* immediately to the left (skipping the divider)
        const left = document.getElementById(`${playerY}-${playerX - 2}`);
        left.append(player);
      }
      break;
    case 'w':
    case 'ArrowUp':
      const canGoUp = !document.getElementById(`${playerY - 1}-${playerX}`)?.classList.contains('obstructed');
      if (canGoUp) {
        parent.removeChild(player);
        const up = document.getElementById(`${playerY - 2}-${playerX}`);
        up.append(player);
      }
      break;
    case 'd':
    case 'ArrowRight':
      const canGoRight = !document.getElementById(`${playerY}-${playerX + 1}`)?.classList.contains('obstructed');
      if (canGoRight) {
        parent.removeChild(player);
        const right = document.getElementById(`${playerY}-${playerX + 2}`);
        right.append(player);
      }
      break;
    case 's':
    case 'ArrowDown':
      const canGoDown = !document.getElementById(`${playerY + 1}-${playerX}`)?.classList.contains('obstructed');
      if (canGoDown) {
        parent.removeChild(player);
        const down = document.getElementById(`${playerY + 2}-${playerX}`);
        down.append(player);
      }
      break;
    default:
      break;
  }
}

function showMaze(maze) {
  const container = document.createElement('div');
  container.id = 'mazeContainer';

  for (let i = 0; i < maze.length; i++) {
    const row = document.createElement('div');
    row.classList.add('row');
    row.id = `row${i}`;
    // if the row is a divider row, make it divider height; otherwise make it a rounded-down-to-account-for-dividers version of 1/HEIGHT of the container height
    if (i % 2 === 0) {
      row.style.height = `${DIVIDER_PIXELS}px`;
    } else {
      row.style.height = `${Math.floor(100 / HEIGHT)}%`;
    }
    for (let j = 0; j < maze[i].length; j++) {
      const piece = document.createElement('div');
      piece.classList.add('piece');
      
      // This is where we assign the id ({rowIndex}-{columnIndex}/{y}-{x}) referenced in `showMaze`
      piece.id = `${i}-${j}`;
      piece.style.height = '100%';
      if (j % 2 === 0) {
        piece.style.width = `${DIVIDER_PIXELS}px`;
      } else {
        piece.style.width = `${Math.floor(100 / WIDTH)}%`;
      }

      // This maze[i][j] is the boolean that represents whether that piece of the maze is passable,
      // namely the boolean to which we turn the 1s and 0s in parseMazeString
      if (maze[i][j]) {
        piece.classList.add('obstructed');
      }
      
      if (i % 2 !== 0 && j % 2 !== 0) { // if, that is, we're looking at a cell and not a divider
         // we find the cell's index in the semi-imaginary dividerless cell grid
        const cellX = Math.floor(j / 2);
        const cellY = Math.floor(i / 2);

        if (cellX === goalX && cellY === goalY) {
          piece.classList.add('goal'); // at present, highlights the cell in yellow so we know that's where we're trying to go
        }

        // puts the player in the starting place (will eventually store player location in localStorage too)
        if (cellX === startingX && cellY === startingY) {
          const player = document.createElement('div');
          player.id = 'player';
          // if the user taps any key, send the event information to this event handler
          document.addEventListener('keydown', keyboardEvent => movePlayer(keyboardEvent));
          piece.append(player);
        }
      }
      row.append(piece);
    }
    container.append(row);
  }
  document.getElementsByTagName('html')[0].append(container);
}

window.onload = () => {
  /* When a user first comes to the page, a new maze should be generated using `makeMaze`
  If a user leaves in the middle of the maze, the maze and their position should be stored in localStorage as string (see format and discussion above)
  When they come back, the previous maze and their position will be restored from localStorage
  If a user leaves **after** having solved the maze, localStorage should be cleared and they should get a fresh maze on returning */

  const mazeString = temporaryMazeString // localStorage.getItem('maze');
  const maze = mazeString ? parseMazeString(mazeString) : makeMaze();
  showMaze(maze);
}