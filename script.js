// HTML要素を取得
const sequentialModeBtn = document.getElementById('sequential-mode-btn');
const randomModeBtn = document.getElementById('random-mode-btn');
const cardWrapper = document.getElementById('card-wrapper');
const questionEl = document.getElementById('question').querySelector('p');
const optionsContainer = document.getElementById('options-container');
const sequentialSettings = document.getElementById('sequential-settings');
const opBtns = document.querySelectorAll('.op-btn');
const numberSelect = document.getElementById('number-select');
const startBtn = document.getElementById('start-btn');
const correctSound = document.getElementById('correct-sound');
const incorrectSound = document.getElementById('incorrect-sound');

// 結果画面の要素
const sessionSummary = document.getElementById('session-summary');
const summaryComment = document.getElementById('summary-comment');
const summaryScore = document.getElementById('summary-score');
const continueBtn = document.getElementById('continue-btn');
const newProblemBtn = document.getElementById('new-problem-btn');

// 変数の初期化
let allProblems = [];
let currentProblems = [];
let currentProblem = {};
let currentProblemIndex = 0;
let isAnswering = false;

// 10問ごとのカウンター
let questionsAnsweredInSession = 0;
let correctAnswersInSession = 0;

// ■ 問題を生成する関数
// ランダムモード用の全問題リストを生成
function generateAllProblems() {
    const generatedProblems = [];
    // たし算
    for (let i = 0; i <= 10; i++) {
        for (let j = 0; j <= 10; j++) {
            // ↓「i + j」が0でなく、10以下の場合のみ問題を追加
            if (i + j > 0 && i + j <= 10) {
                generatedProblems.push({ question: `${i} + ${j} =`, answer: i + j });
            }
        }
    }
    // ひき算
    for (let i = 0; i <= 10; i++) {
        // ↓「j < i」にすることで、「i - i」の問題を除外
        for (let j = 0; j < i; j++) {
            generatedProblems.push({ question: `${i} - ${j} =`, answer: i - j });
        }
    }
    return generatedProblems;
}

// じゅんばんモード用の特定の問題リストを生成
function generateSpecificProblems() {
    const selectedOp = document.querySelector('.op-btn.active').dataset.op;
    const selectedNum = parseInt(numberSelect.value);
    const generatedProblems = [];

    if (selectedOp === 'add') { // たし算
        for (let i = 0; i <= 10 - selectedNum; i++) {
            // ↓ 答えが0になる「0 + 0」を除外
            if (selectedNum + i !== 0) {
                generatedProblems.push({ question: `${selectedNum} + ${i} =`, answer: selectedNum + i });
            }
        }
    } else { // ひき算
        // ↓ ループの開始を「selectedNum + 1」にして、「x - x」の問題を除外
        for (let i = selectedNum + 1; i <= 10; i++) {
            generatedProblems.push({ question: `${i} - ${selectedNum} =`, answer: i - selectedNum });
        }
    }
    return generatedProblems;
}

// ■ UI（画面表示）を更新する関数
// (このセクションの displayProblem, switchView, showSessionSummary 関数に変更はありません)
function displayProblem() {
    isAnswering = false;
    if (currentProblems.length > 10 && randomModeBtn.classList.contains('active')) {
        currentProblemIndex = Math.floor(Math.random() * currentProblems.length);
    }
    currentProblem = currentProblems[currentProblemIndex];
    questionEl.textContent = currentProblem.question;

    const correctAnswer = currentProblem.answer;
    const options = [correctAnswer];
    while (options.length < 4) {
        const wrongAnswer = Math.floor(Math.random() * 19 - 9);
        if (!options.includes(wrongAnswer) && wrongAnswer >= 0 && wrongAnswer <= 18 && wrongAnswer !== correctAnswer) {
            options.push(wrongAnswer);
        }
    }
    options.sort(() => Math.random() - 0.5);

    optionsContainer.innerHTML = '';
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.onclick = () => checkAnswer(option, button);
        optionsContainer.appendChild(button);
    });
}

function switchView(mode) {
    if (mode === 'sequential-setup') {
        sequentialSettings.classList.remove('hidden');
        cardWrapper.classList.add('hidden');
        sequentialModeBtn.classList.add('active');
        randomModeBtn.classList.remove('active');
    } else {
        sequentialSettings.classList.add('hidden');
        cardWrapper.classList.remove('hidden');
        if (mode === 'random') {
            sequentialModeBtn.classList.remove('active');
            randomModeBtn.classList.add('active');
        }
    }
}

function showSessionSummary() {
    let comment = '';
    const correct = correctAnswersInSession;
    if (correct === 10) {
        comment = 'すごい！ぜんぶせいかいだ！てんさいだね！🎉';
    } else if (correct >= 8) {
        comment = 'おしい！あとすこしでパーフェクト！すごい！✨';
    } else if (correct >= 5) {
        comment = 'すごい、はんぶんいじょう せいかいだ！そのちょうし！💪';
    } else {
        comment = 'よくがんばったね！つづければもっとできるようになるよ！😊';
    }
    summaryComment.textContent = comment;
    summaryScore.textContent = `せいかいすう: 10もんちゅう ${correct}もん`;
    sessionSummary.classList.remove('hidden');
}


// ■ イベント処理の関数
// (このセクションの checkAnswer, resetSession 関数に変更はありません)
function checkAnswer(selectedAnswer, button) {
    if (isAnswering) return;
    isAnswering = true;

    questionsAnsweredInSession++;

    if (selectedAnswer === currentProblem.answer) {
        correctAnswersInSession++;
        correctSound.play();
        button.classList.add('correct');
        setTimeout(() => {
            currentProblemIndex++;
            if (currentProblemIndex >= currentProblems.length) {
                currentProblemIndex = 0; // ループさせる
            }

            if (questionsAnsweredInSession >= 10) {
                showSessionSummary();
            } else {
                displayProblem();
            }
        }, 1000);
    } else {
        incorrectSound.play();
        button.classList.add('incorrect');
        setTimeout(() => {
            currentProblemIndex++;
            if (currentProblemIndex >= currentProblems.length) {
                currentProblemIndex = 0;
            }
            if (questionsAnsweredInSession >= 10) {
                showSessionSummary();
            } else {
                displayProblem();
            }
        }, 1000);
    }
}

function resetSession() {
    questionsAnsweredInSession = 0;
    correctAnswersInSession = 0;
}


// ■ 初期化とイベントリスナーの設定
// (このセクションの init 関数に変更はありません)
function init() {
    randomModeBtn.addEventListener('click', () => {
        switchView('random');
        currentProblems = [...allProblems].sort(() => Math.random() - 0.5);
        currentProblemIndex = 0;
        resetSession();
        displayProblem();
    });
    sequentialModeBtn.addEventListener('click', () => {
        switchView('sequential-setup');
    });
    opBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            opBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    startBtn.addEventListener('click', () => {
        currentProblems = generateSpecificProblems();
        if (currentProblems.length === 0) {
            alert('このじょうけんのもんだいは ありません。');
            return;
        }
        currentProblemIndex = 0;
        resetSession();
        switchView('practice');
        displayProblem();
    });
    
    continueBtn.addEventListener('click', () => {
        sessionSummary.classList.add('hidden');
        resetSession();
        displayProblem();
    });
    newProblemBtn.addEventListener('click', () => {
        sessionSummary.classList.add('hidden');
        resetSession();
        switchView('sequential-setup');
    });

    allProblems = generateAllProblems();
    randomModeBtn.click();
}

init();