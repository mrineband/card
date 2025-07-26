// HTML要素を取得 (historyTrackerを追加)
const historyTracker = document.getElementById('history-tracker');
// (他の要素取得は変更なし)
const sequentialModeBtn = document.getElementById('sequential-mode-btn');
const randomModeBtn = document.getElementById('random-mode-btn');
const cardWrapper = document.getElementById('card-wrapper');
const progressTracker = document.getElementById('progress-tracker');
const questionEl = document.getElementById('question').querySelector('p');
const optionsContainer = document.getElementById('options-container');
const sequentialSettings = document.getElementById('sequential-settings');
const opBtns = document.querySelectorAll('.op-btn');
const numberSelect = document.getElementById('number-select');
const startBtn = document.getElementById('start-btn');
const correctSound = document.getElementById('correct-sound');
const incorrectSound = document.getElementById('incorrect-sound');
const whackSound = document.getElementById('whack-sound');
const fanfareSound = document.getElementById('fanfare-sound');
const sessionSummary = document.getElementById('session-summary');
const mathResult = document.getElementById('math-result');
const summaryComment = document.getElementById('summary-comment');
const summaryScore = document.getElementById('summary-score');
const playGameBtn = document.getElementById('play-game-btn');
const moleGame = document.getElementById('mole-game');
const gameResult = document.getElementById('game-result');
const moleScoreSpan = document.getElementById('mole-score');
const timeLeftSpan = document.getElementById('time-left');
const gameBoard = document.getElementById('game-board');
const gameScoreResult = document.getElementById('game-score-result');
const continueBtn = document.getElementById('continue-btn');
const newProblemBtn = document.getElementById('new-problem-btn');
const appTitle = document.getElementById('app-title');
const switchModeBtn = document.getElementById('switch-mode-btn');


// (変数の初期化は変更なし)
let sisterProblems = [], brotherProblems = [], currentProblems = [];
let currentProblem = {}, currentProblemIndex = -1, isAnswering = false;
let questionsAnsweredInSession = 0, correctAnswersInSession = 0;
let moleScore = 0, timeLeft = 15, moleTimerId = null, gameTimerId = null;

// (問題生成関数は変更なし)
function generateSisterProblems() {
    const problems = [];
    for (let i = 0; i <= 10; i++) { for (let j = 0; j <= 10; j++) { if (i + j > 0 && i + j <= 10) { problems.push({ question: `${i} + ${j} =`, answer: i + j }); } } }
    for (let i = 0; i <= 10; i++) { for (let j = 0; j < i; j++) { problems.push({ question: `${i} - ${j} =`, answer: i - j }); } }
    return problems;
}
function generateBrotherProblems() {
    const problems = [];
    for (let i = 0; i < 20; i++) { const num1 = Math.floor(Math.random() * 40) + 10; const num2 = Math.floor(Math.random() * 8) + 2; problems.push({ question: `${num1} × ${num2} =`, answer: num1 * num2 }); }
    for (let i = 0; i < 20; i++) { const divisor = Math.floor(Math.random() * 8) + 2; const result = Math.floor(Math.random() * 15) + 2; const dividend = divisor * result; if (dividend >= 10 && dividend < 100) { problems.push({ question: `${dividend} ÷ ${divisor} =`, answer: result }); } }
    for (let i = 0; i < 20; i++) { const num1 = (Math.floor(Math.random() * 90) + 10) / 10; const num2 = (Math.floor(Math.random() * 90) + 10) / 10; if (Math.random() > 0.5) { problems.push({ question: `${num1} + ${num2} =`, answer: parseFloat((num1 + num2).toFixed(1)) }); } else { const [n1, n2] = [Math.max(num1, num2), Math.min(num1, num2)]; problems.push({ question: `${n1} - ${n2} =`, answer: parseFloat((n1 - n2).toFixed(1)) }); } }
    return problems;
}
function generateSpecificProblems() {
    const selectedOp = document.querySelector('.op-btn.active').dataset.op;
    const selectedNum = parseInt(numberSelect.value);
    const generatedProblems = [];
    if (selectedOp === 'add') { for (let i = 0; i <= 10 - selectedNum; i++) { if (selectedNum + i !== 0) { generatedProblems.push({ question: `${selectedNum} + ${i} =`, answer: selectedNum + i }); } } }
    else { for (let i = 0; i < selectedNum; i++) { generatedProblems.push({ question: `${selectedNum} - ${i} =`, answer: selectedNum - i }); } }
    return generatedProblems;
}

// (UI更新関数は変更なし)
function displayProblem() {
    isAnswering = false;
    if (randomModeBtn.classList.contains('active')) {
        let newIndex;
        do { newIndex = Math.floor(Math.random() * currentProblems.length); } while (currentProblems.length > 1 && newIndex === currentProblemIndex);
        currentProblemIndex = newIndex;
    }
    currentProblem = currentProblems[currentProblemIndex];
    if (!currentProblem) { console.error("問題が見つかりません！"); return; }
    questionEl.textContent = currentProblem.question;
    progressTracker.textContent = `${questionsAnsweredInSession + 1} / 10 もんめ`;
    const correctAnswer = currentProblem.answer;
    const options = [correctAnswer];
    while (options.length < 4) {
        let wrongAnswer;
        if (Number.isInteger(correctAnswer)) {
            const offset = Math.floor(Math.random() * 20) - 10;
            wrongAnswer = correctAnswer + offset;
        } else {
            const offset = (Math.floor(Math.random() * 20) - 10) / 10;
            wrongAnswer = parseFloat((correctAnswer + offset).toFixed(1));
        }
        if (!options.includes(wrongAnswer) && wrongAnswer >= 0) { options.push(wrongAnswer); }
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
function showMathSummary() {
    let comment, gameDuration = 15;
    const correct = correctAnswersInSession;
    if (correct === 10) { comment = 'すごい！ぜんぶせいかいだ！てんさいだね！🎉'; gameDuration = 18; }
    else if (correct >= 8) comment = 'おしい！あとすこしでパーフェクト！すごい！✨';
    else if (correct >= 5) comment = 'すごい、はんぶんいじょう せいかいだ！そのちょうし！💪';
    else comment = 'よくがんばったね！つづければもっとできるようになるよ！😊';
    if (correct === 10 && document.body.classList.contains('brother-mode')) { comment = '全問正解！さすがだ！ボーナスタイムだ！'; }
    else if (correct === 10) { comment = 'パーフェクト！🎉 ボーナスタイム！'; }
    summaryComment.textContent = comment;
    summaryScore.textContent = `せいかいすう: 10もんちゅう ${correct}もん`;
    playGameBtn.onclick = () => startGame(gameDuration);
    moleGame.classList.add('hidden');
    gameResult.classList.add('hidden');
    mathResult.classList.remove('hidden');
    sessionSummary.classList.remove('hidden');
}

// ▼▼▼ checkAnswer関数を修正 ▼▼▼
function checkAnswer(selectedAnswer, button) {
    if (isAnswering) return;
    isAnswering = true;

    // 履歴アイコンを作成
    const historyIcon = document.createElement('span');
    historyIcon.classList.add('history-icon');

    if (selectedAnswer === currentProblem.answer) {
        correctAnswersInSession++;
        correctSound.play();
        button.classList.add('correct');
        // 履歴アイコンを◯に設定
        historyIcon.textContent = '◯';
        historyIcon.classList.add('history-correct');
    } else {
        incorrectSound.play();
        button.classList.add('incorrect');
        // 履歴アイコンを☓に設定
        historyIcon.textContent = '☓';
        historyIcon.classList.add('history-incorrect');
    }
    
    // 作成した履歴アイコンを表示エリアに追加
    historyTracker.appendChild(historyIcon);

    setTimeout(() => {
        questionsAnsweredInSession++;
        if (!randomModeBtn.classList.contains('active')) {
            currentProblemIndex = (currentProblemIndex + 1) % currentProblems.length;
        }
        if (questionsAnsweredInSession >= 10) {
            showMathSummary();
        } else {
            displayProblem();
        }
    }, 1000);
}

// ▼▼▼ resetSession関数を修正 ▼▼▼
function resetSession() {
    questionsAnsweredInSession = 0;
    correctAnswersInSession = 0;
    historyTracker.innerHTML = ''; // 履歴表示を空にする
}

// (ゲーム関数は変更なし)
function startGame(duration) {
    fanfareSound.load();
    mathResult.classList.add('hidden');
    gameResult.classList.add('hidden');
    moleGame.classList.remove('hidden');
    moleScore = 0;
    timeLeft = duration;
    moleScoreSpan.textContent = moleScore;
    timeLeftSpan.textContent = timeLeft;
    const moleInterval = document.body.classList.contains('brother-mode') ? 650 : 800;
    moleTimerId = setInterval(randomMole, moleInterval);
    gameTimerId = setInterval(() => {
        timeLeft--;
        timeLeftSpan.textContent = timeLeft;
        if (timeLeft < 0) { endGame(); }
    }, 1000);
}
function endGame() {
    clearInterval(moleTimerId);
    clearInterval(gameTimerId);
    moleGame.classList.add('hidden');
    fanfareSound.currentTime = 0;
    fanfareSound.play();
    setTimeout(() => {
        gameResult.classList.remove('hidden');
        gameScoreResult.textContent = `モグラを ${moleScore}ひき たたいた！`;
    }, 1000);
}
function randomMole() {
    const holes = document.querySelectorAll('.hole');
    holes.forEach(hole => hole.innerHTML = '');
    const randomIndex = Math.floor(Math.random() * holes.length);
    const randomHole = holes[randomIndex];
    const moleEl = document.createElement('div');
    moleEl.classList.add('mole');
    randomHole.appendChild(moleEl);
    moleEl.addEventListener('click', (e) => {
        e.stopPropagation();
        whackSound.currentTime = 0;
        whackSound.play();
        moleScore++;
        moleScoreSpan.textContent = moleScore;
        randomHole.classList.add('whacked');
        setTimeout(() => randomHole.classList.remove('whacked'), 200);
        moleEl.remove();
    }, { once: true });
}

// (初期化関数は変更なし)
function init() {
    sisterProblems = generateSisterProblems();
    brotherProblems = generateBrotherProblems();
    switchModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('brother-mode');
        initializeMode();
    });
    sequentialModeBtn.addEventListener('click', () => { switchView('sequential-setup'); });
    randomModeBtn.addEventListener('click', () => {
        switchView('random');
        currentProblemIndex = -1;
        resetSession();
        displayProblem();
    });
    startBtn.addEventListener('click', () => {
        currentProblems = generateSpecificProblems();
        if (currentProblems.length === 0) { alert('このじょうけんのもんだいは ありません。'); return; }
        sequentialModeBtn.classList.add('active');
        randomModeBtn.classList.remove('active');
        currentProblemIndex = 0;
        resetSession();
        switchView('practice');
        displayProblem();
    });
    continueBtn.addEventListener('click', () => { sessionSummary.classList.add('hidden'); resetSession(); displayProblem(); });
    newProblemBtn.addEventListener('click', () => {
        sessionSummary.classList.add('hidden');
        resetSession();
        initializeMode();
    });
    initializeMode();
}
function initializeMode() {
    if (document.body.classList.contains('brother-mode')) {
        appTitle.textContent = 'せんちゃん さんすうチャレンジ';
        switchModeBtn.textContent = 'いもうとモードへ';
        currentProblems = brotherProblems;
        randomModeBtn.click();
    } else {
        appTitle.textContent = 'しのちゃん さんすうカード';
        switchModeBtn.textContent = 'お兄ちゃんモードへ';
        currentProblems = sisterProblems;
        randomModeBtn.click();
    }
}
init();
