// HTML要素を取得 (変更なし)
const sequentialModeBtn = document.getElementById('sequential-mode-btn');
const randomModeBtn = document.getElementById('random-mode-btn');
const cardWrapper = document.getElementById('card-wrapper');
const progressTracker = document.getElementById('progress-tracker');
const historyTracker = document.getElementById('history-tracker');
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

// 変数の初期化 (変更なし)
let sisterProblems = [], brotherProblems = [], currentProblems = [];
let currentProblem = {}, currentProblemIndex = -1, isAnswering = false;
let questionsAnsweredInSession = 0, correctAnswersInSession = 0;
let moleScore = 0, timeLeft = 15, moleTimerId = null, gameTimerId = null;

// 問題生成関数 (変更なし)
function generateSisterProblems() { const p = []; for (let i = 0; i <= 10; i++) { for (let j = 0; j <= 10; j++) { if (i + j > 0 && i + j <= 10) { p.push({ q: `${i} + ${j} =`, a: i + j }); } } } for (let i = 0; i <= 10; i++) { for (let j = 0; j < i; j++) { p.push({ q: `${i} - ${j} =`, a: i - j }); } } return p.map(p => ({ question: p.q, answer: p.a })); }
function generateBrotherProblems() { const p = []; for (let i = 0; i < 20; i++) { const n1 = Math.floor(Math.random() * 40) + 10, n2 = Math.floor(Math.random() * 8) + 2; p.push({ q: `${n1} × ${n2} =`, a: n1 * n2 }); } for (let i = 0; i < 20; i++) { const d = Math.floor(Math.random() * 8) + 2, r = Math.floor(Math.random() * 15) + 2, n1 = d * r; if (n1 >= 10 && n1 < 100) p.push({ q: `${n1} ÷ ${d} =`, a: r }); } for (let i = 0; i < 20; i++) { const n1 = (Math.floor(Math.random() * 90) + 10) / 10, n2 = (Math.floor(Math.random() * 90) + 10) / 10; if (Math.random() > 0.5) { p.push({ q: `${n1} + ${n2} =`, a: parseFloat((n1 + n2).toFixed(1)) }); } else { const [m1, m2] = [Math.max(n1, n2), Math.min(n1, n2)]; p.push({ q: `${m1} - ${m2} =`, a: parseFloat((m1 - m2).toFixed(1)) }); } } return p.map(p => ({ question: p.q, answer: p.a })); }
function generateSpecificProblems() { const op = document.querySelector('.op-btn.active').dataset.op, num = parseInt(numberSelect.value), p = []; if (op === 'add') { for (let i = 0; i <= 10 - num; i++) { if (num + i !== 0) p.push({ q: `${num} + ${i} =`, a: num + i }); } } else { for (let i = 0; i < num; i++) { p.push({ q: `${num} - ${i} =`, a: num - i }); } } return p.map(p => ({ question: p.q, answer: p.a })); }

// UI更新関数 (変更なし)
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
    const correctAnswer = currentProblem.answer; const options = [correctAnswer];
    while (options.length < 4) {
        let wrongAnswer;
        if (Number.isInteger(correctAnswer)) { wrongAnswer = correctAnswer + Math.floor(Math.random() * 20) - 10; }
        else { wrongAnswer = parseFloat((correctAnswer + (Math.floor(Math.random() * 20) - 10) / 10).toFixed(1)); }
        if (!options.includes(wrongAnswer) && wrongAnswer >= 0) { options.push(wrongAnswer); }
    }
    options.sort(() => Math.random() - 0.5); optionsContainer.innerHTML = '';
    options.forEach(option => { const button = document.createElement('button'); button.className = 'option-btn'; button.textContent = option; button.onclick = () => checkAnswer(option, button); optionsContainer.appendChild(button); });
}
function switchView(mode) {
    if (mode === 'sequential-setup') { sequentialSettings.classList.remove('hidden'); cardWrapper.classList.add('hidden'); sequentialModeBtn.classList.add('active'); randomModeBtn.classList.remove('active'); }
    else { sequentialSettings.classList.add('hidden'); cardWrapper.classList.remove('hidden'); if (mode === 'random') { sequentialModeBtn.classList.remove('active'); randomModeBtn.classList.add('active'); } }
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
    summaryComment.textContent = comment; summaryScore.textContent = `せいかいすう: 10もんちゅう ${correct}もん`;
    playGameBtn.onclick = () => startGame(gameDuration);
    moleGame.classList.add('hidden'); gameResult.classList.add('hidden'); mathResult.classList.remove('hidden'); sessionSummary.classList.remove('hidden');
}

// イベント処理関数 (変更なし)
function checkAnswer(selectedAnswer, button) {
    if (isAnswering) return;
    isAnswering = true;
    const historyIcon = document.createElement('span'); historyIcon.classList.add('history-icon');
    if (selectedAnswer === currentProblem.answer) {
        correctAnswersInSession++; correctSound.play(); button.classList.add('correct');
        historyIcon.textContent = '◯'; historyIcon.classList.add('history-correct');
    } else {
        incorrectSound.play(); button.classList.add('incorrect');
        historyIcon.textContent = '☓'; historyIcon.classList.add('history-incorrect');
    }
    historyTracker.appendChild(historyIcon);
    setTimeout(() => {
        questionsAnsweredInSession++;
        if (!randomModeBtn.classList.contains('active')) { currentProblemIndex = (currentProblemIndex + 1) % currentProblems.length; }
        if (questionsAnsweredInSession >= 10) { showMathSummary(); } else { displayProblem(); }
    }, 1000);
}
function resetSession() { questionsAnsweredInSession = 0; correctAnswersInSession = 0; historyTracker.innerHTML = ''; }

// ゲーム関数 (変更なし)
function startGame(duration) {
    fanfareSound.load(); mathResult.classList.add('hidden'); gameResult.classList.add('hidden'); moleGame.classList.remove('hidden');
    moleScore = 0; timeLeft = duration; moleScoreSpan.textContent = moleScore; timeLeftSpan.textContent = timeLeft;
    const moleInterval = document.body.classList.contains('brother-mode') ? 650 : 800;
    moleTimerId = setInterval(randomMole, moleInterval);
    gameTimerId = setInterval(() => { timeLeft--; timeLeftSpan.textContent = timeLeft; if (timeLeft < 0) { endGame(); } }, 1000);
}
function endGame() {
    clearInterval(moleTimerId); clearInterval(gameTimerId); moleGame.classList.add('hidden');
    fanfareSound.currentTime = 0; fanfareSound.play();
    setTimeout(() => { gameResult.classList.remove('hidden'); gameScoreResult.textContent = `モグラを ${moleScore}ひき たたいた！`; }, 1000);
}
function randomMole() {
    const holes = document.querySelectorAll('.hole');
    holes.forEach(hole => hole.innerHTML = '');
    const randomIndex = Math.floor(Math.random() * holes.length); const randomHole = holes[randomIndex];
    const moleEl = document.createElement('div'); moleEl.classList.add('mole');
    randomHole.appendChild(moleEl);
    moleEl.addEventListener('click', (e) => {
        e.stopPropagation(); whackSound.currentTime = 0; whackSound.play(); moleScore++;
        moleScoreSpan.textContent = moleScore; randomHole.classList.add('whacked');
        setTimeout(() => randomHole.classList.remove('whacked'), 200);
        moleEl.remove();
    }, { once: true });
}

// ▼▼▼ 初期化とイベントリスナーのロジックを修正 ▼▼▼

// 現在のモードに応じてUIと問題を設定する関数
function setupMode(isBrother) {
    if (isBrother) {
        appTitle.textContent = 'せんちゃん さんすうチャレンジ';
        switchModeBtn.textContent = '妹モードへ';
        currentProblems = brotherProblems;
        // お兄ちゃんモードは常に「らんだむ」
        switchView('random');
        currentProblemIndex = -1;
        resetSession();
        displayProblem();
    } else {
        appTitle.textContent = 'しのちゃん スーパーさんすうカード';
        switchModeBtn.textContent = '妹モードへ';
        // 妹モードでは、まずモード選択画面を表示
        sequentialSettings.classList.add('hidden');
        cardWrapper.classList.add('hidden');
        // デフォルトで「らんだむ」を選択状態にする
        randomModeBtn.classList.add('active');
        sequentialModeBtn.classList.remove('active');
    }
}

// アプリケーションの初期化
function init() {
    // 問題リストを最初に一度だけ生成
    sisterProblems = generateSisterProblems();
    brotherProblems = generateBrotherProblems();

    // --- 各ボタンの役割を明確にする ---

    // モード切り替えボタン（兄/妹）
    switchModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('brother-mode');
        setupMode(document.body.classList.contains('brother-mode'));
    });

    // 「じゅんばん」ボタン（妹モード専用）
    sequentialModeBtn.addEventListener('click', () => {
        switchView('sequential-setup');
    });

    // 「らんだむ」ボタン（妹モード専用）
    randomModeBtn.addEventListener('click', () => {
        currentProblems = sisterProblems; // 妹の問題をセット
        switchView('random');
        currentProblemIndex = -1;
        resetSession();
        displayProblem();
    });

    // 「このじょうけんで はじめる」ボタン（じゅんばんモード内）
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

    // 結果画面のボタン
    continueBtn.addEventListener('click', () => { sessionSummary.classList.add('hidden'); resetSession(); displayProblem(); });
    newProblemBtn.addEventListener('click', () => {
        sessionSummary.classList.add('hidden');
        resetSession();
        // 現在のモード（兄/妹）に応じて初期画面に戻る
        setupMode(document.body.classList.contains('brother-mode'));
    });
    
    // 計算方法選択ボタン（じゅんばんモード内）
    opBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            opBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // --- アプリの初回起動処理 ---
    // 1. 妹モードで開始
    currentProblems = sisterProblems;
    // 2. ご要望通り、ランダムな設定の「じゅんばん」モードで自動開始
    (function startWithRandomSequential() {
        sequentialModeBtn.classList.add('active');
        randomModeBtn.classList.remove('active');
        opBtns.forEach(b => b.classList.remove('active'));
        const randomOpBtn = Math.random() < 0.5 ? opBtns[0] : opBtns[1];
        randomOpBtn.classList.add('active');
        do {
            const randomIndex = Math.floor(Math.random() * numberSelect.options.length);
            numberSelect.selectedIndex = randomIndex;
            currentProblems = generateSpecificProblems();
        } while (currentProblems.length === 0);
        
        currentProblemIndex = 0;
        resetSession();
        switchView('practice');
        displayProblem();
    })();
}

init();
