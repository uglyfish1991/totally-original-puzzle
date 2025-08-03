//* #-------------------------------------------------------------------------------#
//* #                                   Variables                                   #
//* #-------------------------------------------------------------------------------# 
// #-------------------------------------------------------------------------------#
// # Word options and letter rows                                                  #
// #-------------------------------------------------------------------------------# 

const word_options = [
    "lenny", "quail", "order", "rigby", "bevvy", "sound", "liver",
    "ferry", "music", "halls", "camps", "clear", "goose", "atoms",
    "tesco", "train", "figgy", "purse", "cress", "onion", "radio",
    "viola", "plant", "salts", "herbs", "sugar", "tango", "grain"
];

const keys = [
    "QWERTYUIOP".split(""),
    [..."ASDFGHJKL".split(""), "←"],
    [..."ZXCVBNM".split(""), "ENTER"]
];

// #-------------------------------------------------------------------------------#
// # "Day zero" to determine the word from                                         #
// #-------------------------------------------------------------------------------# 

const startDate = new Date("2025-08-01T00:00:00Z");
const now = new Date();
const msPerDay = 1000 * 60 * 60 * 24;
const daysSinceStart = Math.floor((now - startDate) / msPerDay);

// #-------------------------------------------------------------------------------#
// # I would need a way to obsfucate the word - not really sure how to do this.    #
// #-------------------------------------------------------------------------------# 

const wordOfTheDay = word_options[daysSinceStart % word_options.length];

// #-------------------------------------------------------------------------------#
// # Rows and columns set through JS - easier to iterate over this way. We have    #
// # six rows, of five squares.                                                    #
// #-------------------------------------------------------------------------------# 

const totalRows = 6;
const wordLength = 5;

// #-------------------------------------------------------------------------------#
// # Grab the divs from the page and assign to variables, so we can update the     #
// # content based on the game events.                                             #
// #-------------------------------------------------------------------------------# 

const board = document.getElementById("game-board");
const message = document.getElementById("message");

let currentRow = 0;
let currentGuess = "";

//* #-------------------------------------------------------------------------------#
//* #                                Functions                                      #
//* #-------------------------------------------------------------------------------# 

// #-------------------------------------------------------------------------------#
// # Creates the game board, 6 rows of 5 squares. The row gets made first, then    #
// # the boxes, then the next row, then its boxes....etc                           #
// #-------------------------------------------------------------------------------# 

function createBoard() {
    for (let i = 0; i < totalRows; i++) {
        const row = document.createElement("div");
        row.classList.add("row");

        // #-------------------------------------------------------------------------------#
        // # Creates the boxes. One box for each letter of the word. At the end of making  #
        // # those boxes, they are added as children of their row                          #
        // #-------------------------------------------------------------------------------# 
        for (let i = 0; i < wordLength; i++) {
            const box = document.createElement("div");
            box.classList.add("box");
            row.appendChild(box);
        }
        board.appendChild(row);
    }
}

// #-------------------------------------------------------------------------------#
// # Even with the game keyboard, you can still type. Maybe get rid of this?       #
// # e represents the event object made by the keypress.                           #
// # If the game is over, no more key presses are registered (if currentRow..)     #
// #-------------------------------------------------------------------------------# 
function handleKeyPress(e) {
    if (currentRow >= totalRows) return;

    const key = e.key.toUpperCase();

    // #-------------------------------------------------------------------------------#
    // # If backspace is hit, take the current guess, and make it equal the current    #
    // # guess, without the last last. REMEMBER slice always returns an array          #
    // # Then call updateRow() to refresh the display                                  #
    // #-------------------------------------------------------------------------------# 
    if (key === "BACKSPACE") {
        currentGuess = currentGuess.slice(0, -1);
        updateRow();
    }
    // #-------------------------------------------------------------------------------#
    // # Regex, checking the entry is one uppercase letter from A-Z. This must be true #
    // # and we must still have enough guesses.                                        #
    // #-------------------------------------------------------------------------------# 
    else if (/^[A-Z]$/.test(key) && currentGuess.length < wordLength) {
        currentGuess += key;
        updateRow();
    }

    // #-------------------------------------------------------------------------------#
    // # Submits the guess into the game to be checked, or prompts the user if the     #
    // # word is not long enough.                                                      #
    // #-------------------------------------------------------------------------------# 

    else if (key === "ENTER") {
        if (currentGuess.length === wordLength) {
            submitGuess();
        } else {
            showMessage("Please enter 5-letter word");
        }
    }
}


function updateRow() {

    // #-------------------------------------------------------------------------------#
    // # The current square the user is typing in is light grey to help the user       #
    // # keep track. This initial loop removes any other grey box. This is because the #
    // # last square of every row kept staying grey, which was ugly and weird.         #
    // #-------------------------------------------------------------------------------# 


    for (let r = 0; r < totalRows; r++) {
        const row = board.children[r];
        for (let c = 0; c < wordLength; c++) {
            row.children[c].classList.remove("current-square");
        }
    }
    const row = board.children[currentRow];

    // #-------------------------------------------------------------------------------#
    // # The current square the user is typing in is light grey to help the user       #
    // # keep track. This initial loop removes any other grey box. This is because the #
    // # last square of every row kept staying grey, which was ugly and weird.         #
    // #-------------------------------------------------------------------------------# 

    for (let i = 0; i < wordLength; i++) {
        const box = row.children[i];

        box.classList.remove("current-square");

        if (i < currentGuess.length) {
            box.textContent = currentGuess[i];
        } else {
            box.textContent = "";
        }

        if (i === currentGuess.length) {
            box.classList.add("current-square");
        }
    }

    if (currentGuess.length === wordLength) {
        row.children[wordLength - 1].classList.add("current-square");
    }
}


function submitGuess() {
    const row = board.children[currentRow];
    const guess = currentGuess.toUpperCase();
    const target = wordOfTheDay.toUpperCase();

    const letterCount = {};
    for (let char of target) {
        letterCount[char] = (letterCount[char] || 0) + 1;
    }

    for (let i = 0; i < wordLength; i++) {
        const box = row.children[i];
        box.classList.add("checking")
        if (guess[i] === target[i]) {
            box.classList.add("correct");
            letterCount[guess[i]]--;
        }
    }

    for (let i = 0; i < wordLength; i++) {
        const box = row.children[i];

        if (!box.classList.contains("correct")) {
            if (letterCount[guess[i]] > 0) {
                box.classList.add("wrong-place");
                letterCount[guess[i]]--;
            } else {
                markKeyAsBurned(guess[i].toUpperCase());
            }
        }
    }

    if (guess === target) {
        showMessage("You guessed it!");
        document.removeEventListener("keydown", handleKeyPress);
    }
    else {
        currentRow++;
        currentGuess = "";

        if (currentRow === totalRows) {
            showMessage(`Game over. The word was: ${wordOfTheDay}`);
            document.removeEventListener("keydown", handleKeyPress);
        }
    }
}


function showMessage(msg) {
    // #-------------------------------------------------------------------------------#
    // # A function for changing the message part of the page. The message is sent     #
    // # over with the function call as msg, and the textContent property of the div   #
    // # assigned to message is updated, and then set back to nothing after 3 seconds  #
    // #-------------------------------------------------------------------------------# 
    message.textContent = msg;
    setTimeout(() => {
        message.textContent = "";
    }, 3000);
}

// #-------------------------------------------------------------------------------#
// # A function for changing the apperance of letters that have already been tried #
// # and are not in the word. It doesn't stop them being pressed again, it is      #
// # just appearance. Used an attribute to match, I feel like this is              #
// # over-engineered but I can't get it to work any other way.                     #
// #-------------------------------------------------------------------------------# 

function markKeyAsBurned(letter) {
    const keyboard = document.getElementById("keyboard");
    const buttons = keyboard.querySelectorAll(".key");

    buttons.forEach(button => {
        const key = button.getAttribute("data-key");

        if (
            key.toUpperCase() === letter &&
            !button.classList.contains("correct") &&
            !button.classList.contains("wrong-place")
        ) {
            button.classList.add("burned_letter");
        }
    });
}

// #-------------------------------------------------------------------------------#
// # Creates the on-screen keyboard. Makes a new div for each item in the keys     #
// # array. Ternery operator: if the key is the left arrow, set it to the big      #
// # arrow, else set it to the key. Also adds the key class for css.               #
// # Added the setAttribute because I couldn't marked dead letters properly        #
// #-------------------------------------------------------------------------------# 

function createKeyboard() {
    const keyboard = document.getElementById("keyboard");

    keys.flat().forEach((key) => {
        const button = document.createElement("div");
        button.setAttribute("data-key", key);
        button.textContent = key === "←" ? "⌫" : key;
        button.classList.add("key");

        // #-------------------------------------------------------------------------------#
        // # Enter key is wide. Might change this.                                         #
        // #-------------------------------------------------------------------------------# 

        if (key === "ENTER") {
            button.classList.add("wide");
        }

        // #-------------------------------------------------------------------------------#
        // # Adds a click event listener on each button to trigger the handleKey function  #
        // #-------------------------------------------------------------------------------# 

        button.addEventListener("click", () => handleVirtualKey(key));
        keyboard.appendChild(button);
    });
}

// #-------------------------------------------------------------------------------#
// # Does similar to the typing function, but for clicking.                        #
// #-------------------------------------------------------------------------------# 

function handleVirtualKey(key) {
    if (currentRow >= totalRows) return;

    if (key === "←") {
        currentGuess = currentGuess.slice(0, -1);
        updateRow();
    } else if (key === "ENTER") {
        if (currentGuess.length === wordLength) {
            submitGuess();
        } else {
            showMessage("Enter 5-letter word");
        }
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < wordLength) {
        currentGuess += key;
        updateRow();
    }
}

createBoard();
createKeyboard();
document.addEventListener("keydown", handleKeyPress);
