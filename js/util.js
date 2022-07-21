//----Matrix
function createBoard(ROWS, COLS) {
  var board = [];
  for (var i = 0; i < ROWS; i++) {
    board[i] = [];
    for (var j = 0; j < COLS; j++) {
      board[i][j] = "";
    }
  }
  return board;
}

//----Render Board
function renderBoard(board) {
  var elBallsCollected = document.querySelector(".balls-counter");
  elBallsCollected.innerText = `Balls Collected: ${gCollectedBalls}`;

  var strHTML = "";
  for (var i = 0; i < board.length; i++) {
    strHTML += "<tr>\n";
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];

      var cellClass = getClassName({ i: i, j: j });

      // TODO - change to short if statement
      if (currCell.type === FLOOR) cellClass += " floor";
      else if (currCell.type === WALL) cellClass += " wall";

      strHTML += `\t<td class="cell ${cellClass}"  >\n`;

      // TODO - change to switch case statement
      if (currCell.gameElement === GAMER) {
        strHTML += GAMER_IMG;
      } else if (currCell.gameElement === BALL) {
        strHTML += BALL_IMG;
      }

      strHTML += "\t</td>\n";
    }
    strHTML += "</tr>\n";
  }

  var elBoard = document.querySelector(".board");
  elBoard.innerHTML = strHTML;
}

//----Count Neighbors
var gUser = "🦄";
var gOccupiedNegs = "✨";
function countNegsAround(mat, rowIdx, colIdx) {
  var negsCount = 0;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (i === rowIdx && j === colIdx) continue;
      var cell = mat[i][j];
      if (cell === gOccupiedNegs) negsCount++;
    }
  }
  return negsCount;
}

//----Primary Diagonal
function printPrimaryDiagonal(squareMat) {
  for (var d = 0; d < squareMat.length; d++) {
    var item = squareMat[d][d];
    console.log(item);
  }
}

//----Secondary Diagonal
function printSecondaryDiagonal(squareMat) {
  for (var d = 0; d < squareMat.length; d++) {
    var item = squareMat[d][squareMat.length - d - 1];
    console.log(item);
  }
}

//----Render Child (DOM)
function renderChild() {
  var strHTML = "";
  for (var i = 0; i < gChild.length; i++) {
    strHTML += `<div class="child child${i}">This is an example</div>`;
  }

  var elParent = document.querySelector(".parent");
  elParent.innerHTML = strHTML;
}

//----Timer
var gGameInterval;
var gStartTime;
var gTime;

function setTimer() {
  var diffTime = (Date.now() - gStartTime) / 1000;
  var displayTime = diffTime.toFixed(3);
  document.querySelector(".clock").innerHTML = displayTime;
  // time = time /6000
  gTime += 0.001;
}

function startTimer() {
  gStartTime = Date.now();
  gGameInterval = setInterval(setTimer, 10);
}

function pauseTimer() {
  clearInterval(gGameInterval);
  gGameInterval = null; //clean myInterval
}

//----Handle Keys
// var gGamerPos = {
//   i: 0,
//   j: 0,
// };

function handleKeys(e) {
  var i = gGamerPos.i;
  var j = gGamerPos.j;

  switch (e.key) {
    case "ArrowLeft":
      moveTo(i, j - 1);
      break;
    case "ArrowRight":
      moveTo(i, j + 1);
      break;
    case "ArrowUp":
      moveTo(i - 1, j);
      break;
    case "ArrowDown":
      moveTo(i + 1, j);
      break;
  }
}

//----Get Random Int
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}
