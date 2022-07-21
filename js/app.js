"use strict";

//--------------------------------------------------CONST and VARS
const FLAG = "🚩";
const MINE = "🧨";

var gBoard;
var gBoardPositions;
var gLevel;
var gGame;
var gStartTime;
var gGameInterval;
var flagCounter;
var livesCounter;

//-----Frequently used html elements-----//
const elTimer = document.querySelector(".timer");
const elResetBtn = document.querySelector(".restart-btn");
const elMinesLeft = document.querySelector(".mines-counter");
const elLivesLeft = document.querySelector(".lives");

//--------------------------------------------------Functions
//-----Reset game settings-----//
function init() {
  setNewGame();
  createLevel();
  renderBoard();
  clearInterval(gGameInterval);
  elTimer.innerText = "Time Passed: 0";
  elMinesLeft.innerText = `Mines Left: ${flagCounter}`;
  elLivesLeft.innerText = `Lives Left: ${livesCounter}`;
  elResetBtn.innerHTML = "🙂";
}

//-----Generate game based on difficulty-----//
function startGame(cell) {
  if (!gGame.isOn) {
    gBoard = buildBoard(gLevel.SIZE, gLevel.MINES);

    setRandomMines(gLevel.MINES, cell);
    gBoardPositions = applyNeighbors();
    for (var i = 0; i < gBoardPositions.length; i++) {
      setNeighbors(gBoardPositions[i]);
    }

    gGame.isOn = true;
    setTimer();
  }
}

//-----Implement new game structure-----//
function setNewGame() {
  gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    timer: 0,
  };
}

//-----Creates new level and resets the mine counter-----//
function createLevel() {
  gLevel = {
    SIZE: 0,
    MINES: 0,
  };
  setDifficulty();
  flagCounter = gLevel.MINES;
  livesCounter = 3;
}

//-----Build a new board structure-----//
function buildBoard(size) {
  var tempBoard = [];

  for (var i = 0; i < size; i++) {
    var row = [];
    for (var j = 0; j < size; j++) {
      var tempCell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      };
      row.push(tempCell);
    }
    tempBoard.push(row);
  }

  return tempBoard;
}

//-----Renders the board to the user-----//
function renderBoard() {
  const elBoard = document.querySelector(".board");
  var htmlStr = `<table><tbody>`;

  for (var i = 0; i < gLevel.SIZE; i++) {
    var rowStr = "<tr>";
    for (var j = 0; j < gLevel.SIZE; j++) {
      var cellStr = `<td onclick="cellClicked(this)" onmouseup="rightClick(event, this)"
             data-i="${i}" data-j="${j}" class="cell cell-${i}-${j}"
              oncontextmenu="event.preventDefault();"></td>`;
      rowStr += cellStr;
    }
    rowStr += "</tr>";
    htmlStr += rowStr;
  }

  htmlStr += `</table></tbody>`;
  elBoard.innerHTML = htmlStr;
}

//-----Difficulty based on radio checked-----//
function setDifficulty() {
  const elRadio = document.getElementsByName("radio");

  if (elRadio[0].checked) {
    gLevel.SIZE = 4;
    gLevel.MINES = 2;
    flagCounter = 2;
  }
  if (elRadio[1].checked) {
    gLevel.SIZE = 8;
    gLevel.MINES = 12;
    flagCounter = 12;
  }
  if (elRadio[2].checked) {
    gLevel.SIZE = 12;
    gLevel.MINES = 30;
    flagCounter = 30;
  }
}

//-----gets number of mines and a specific cell coordinates//
//and creates random mines array based on 1st degree cell's neighbors-----//
function setRandomMines(minesNumber, cell) {
  const tempCell = { i: +cell.i, j: +cell.j };
  var tempMines = [];

  for (var i = tempCell.i - 1; i <= tempCell.i + 1; i++) {
    if (i < 0 || i >= gLevel.SIZE) {
      continue;
    }
    for (var j = tempCell.j - 1; j <= tempCell.j + 1; j++) {
      if (j < 0 || j >= gLevel.SIZE) {
        continue;
      }
      tempMines.push({ i: i, j: j });
    }
  }

  while (tempMines.length < minesNumber + 9) {
    var randomI = getRandomInt(0, gBoard.length);
    var randomJ = getRandomInt(0, gBoard.length);
    var newMine = {
      i: randomI,
      j: randomJ,
    };
    const isFound = tempMines.some((element) => {
      if (element.i === newMine.i && element.j === newMine.j) {
        return true;
      }
      return false;
    });
    if (!isFound) {
      tempMines.unshift(newMine);
    }
  }

  for (var i = 0; i < minesNumber; i++) {
    gBoard[tempMines[i].i][tempMines[i].j].isMine = true;
  }
}

function applyNeighbors() {
  var cellPositions = [];
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      cellPositions.push({
        i: i,
        j: j,
      });
    }
  }
  return cellPositions;
}

function setNeighbors(currCell) {
  var tempI = +currCell.i;
  var tempJ = +currCell.j;

  var mineCount = 0;

  for (var i = tempI - 1; i <= tempI + 1; i++) {
    if (i < 0 || i >= gLevel.SIZE) {
      continue;
    }
    for (var j = tempJ - 1; j <= tempJ + 1; j++) {
      if (j < 0 || j >= gLevel.SIZE) {
        continue;
      }
      if (i == tempI && j == tempJ) {
        continue;
      }
      if (gBoard[i][j].isMine) {
        mineCount++;
      }
    }
  }
  gBoard[tempI][tempJ].minesAroundCount = mineCount;
}

//-----Left click event-----//
function cellClicked(ev) {
  const cell = {
    i: ev.dataset.i,
    j: ev.dataset.j,
  };
  startGame(cell);
  var currCellClicked = gBoard[cell.i][cell.j];

  if (currCellClicked.isMarked) {
    return;
  }
  if (currCellClicked.isMine) {
    livesCounter--;
    ev.classList.add("mine-clicked");
    elLivesLeft.innerText = `Lives Left: ${livesCounter}`;
    if (livesCounter === 0) {
      showMines(ev);
      return;
    }
  }
  checkifMine(cell);
}

//-----Right click functionality-----//
function rightClick(event, el) {
  const cellI = el.dataset.i;
  const cellJ = el.dataset.j;
  const currCell = {
    i: +cellI,
    j: +cellJ,
  };

  if (event.button === 2) {
    if (gBoard[currCell.i][currCell.j].isShown) {
    } else if (gBoard[currCell.i][currCell.j].isMarked) {
      gBoard[currCell.i][currCell.j].isMarked = false;
      flagCounter++;
      if (gBoard[currCell.i][currCell.j].isMarked) {
        el.innerText = FLAG;
      } else {
        el.innerText = "";
      }
    } else {
      gBoard[currCell.i][currCell.j].isMarked = true;
      flagCounter--;
      if (gBoard[currCell.i][currCell.j].isMarked) {
        el.innerText = FLAG;
      } else {
        el.innerText = "";
      }
    }
    elMinesLeft.innerText = "Mines left: " + flagCounter;
  }
  if (flagCounter === 0) {
    checkVictory();
  }
}

//-----check and mark mines-----//
function checkifMine(cell) {
  const currCellI = +cell.i;
  const currCellJ = +cell.j;

  const elCurrCell = document.querySelector(`.cell-${currCellI}-${currCellJ}`);
  if (!gBoard[currCellI][currCellJ].isMine) {
    if (gBoard[currCellI][currCellJ].isMarked) {
      return;
    }

    gBoard[currCellI][currCellJ].isShown = true;
    document
      .querySelector(`.cell-${currCellI}-${currCellJ}`)
      .classList.add("marked");

    if (gBoard[currCellI][currCellJ].minesAroundCount === 0) {
      elCurrCell.innerText = " ";
      for (var i = currCellI - 1; i <= currCellI + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) {
          continue;
        }
        for (var j = currCellJ - 1; j <= currCellJ + 1; j++) {
          if (j < 0 || j >= gLevel.SIZE) {
            continue;
          }
          if (gBoard[i][j].isShown) {
            continue;
          }
          const susCell = {
            i: i,
            j: j,
          };
          checkifMine(susCell);
        }
      }
    }
    if (gBoard[currCellI][currCellJ].minesAroundCount === 0) {
      elCurrCell.innerHTML = " ";
    } else {
      elCurrCell.innerText = gBoard[currCellI][currCellJ].minesAroundCount;
    }
  }
}

//-----Mine triggered-----//
function showMines(cell) {
  cell.classList.add("mine-clicked");
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      if (gBoard[i][j].isMine) {
        var elCell = document.querySelector(`.cell-${i}-${j}`);
        elCell.innerText = MINE;
      }
    }
  }
  livesCounter--;
  console.log("lives:", livesCounter);
  if (livesCounter <= 0) {
    loss();
  }
  console.log("you lose");
}

//-----Timer settings-----//
function setTimer() {
  var startingTime = new Date().getTime();

  gGameInterval = setInterval(function () {
    var now = new Date().getTime();
    var timeLeft = now - startingTime;
    elTimer.innerText = `Time Passed: ${Math.floor(timeLeft / 1000)}`;
  }, 1000);
}

function startTimer() {
  gStartTime = Date.now();
  gGameInterval = setInterval(setTimer, 10);
}

function pauseTimer() {
  clearInterval(gGameInterval);
  gGameInterval = null; //clean myInterval
}

//-----Check loss-----//
function loss() {
  gGame.isOn = false;
  clearInterval(gGameInterval);
  var elCell = document.querySelectorAll(`.cell`);
  for (var i = 0; i < elCell.length; i++) {
    elCell[i].removeAttribute("onclick");
    elCell[i].removeAttribute("onmouseup");
  }
  elResetBtn.innerHTML = "😫";
}

//-----Check victory-----//
function checkVictory() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      var cellElement = gBoard[i][j];
      if (cellElement.isMine !== cellElement.isMarked) {
        loss();
        return;
      }
    }
  }

  gGame.isOn = false;
  clearInterval(gGameInterval);
  var elCell = document.querySelectorAll(`.cell`);
  for (var i = 0; i < elCell.length; i++) {
    elCell[i].removeAttribute("onclick");
    elCell[i].removeAttribute("onmouseup");
  }
  elResetBtn.innerHTML = "😎";
}

//-----Get random int-----//
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}
