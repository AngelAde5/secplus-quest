/* Security+ Quest (SY0-701) - local browser game
   - Daily Dungeon (10 adaptive Qs)
   - Flashcard Frenzy (spaced repetition-ish)
   - Scenario Mode (mini stories)
   - Domain Boss Fight (mixed + harder)
   Saves to localStorage.
*/

const LS_KEY = "secplus_quest_v1";

const DOMAINS = [
  { id: "D1", name: "Domain 1: General Security Concepts" },
  { id: "D2", name: "Domain 2: Threats, Vulnerabilities & Mitigations" },
  { id: "D3", name: "Domain 3: Security Architecture" },
  { id: "D4", name: "Domain 4: Security Operations" },
  { id: "D5", name: "Domain 5: Security Program Mgmt & Oversight" },
];

// --- Question bank (starter set). You can expand this easily. ---
const BANK = [
  // D1
  q("D1","Which is an administrative control?","A security policy",["Firewall","CCTV","Encryption"]),
  q("D1","Which CIA principle is most impacted by a DDoS?","Availability",["Integrity","Confidentiality","Non-repudiation"]),
  q("D1","AAA: What comes after authentication?","Authorization",["Accounting","Encryption","Auditing"]),
  q("D1","Non-repudiation is best provided by:","Digital signatures",["RAID","Hashing alone","WEP"]),
  q("D1","Risk is best described as:","Threat exploiting a vulnerability",["A firewall rule","A password policy","A patch"]),

  // D2
  q("D2","A worm is malware that:","Spreads without user action",["Encrypts files for money","Looks like legitimate software","Requires opening a file"]),
  q("D2","Credential stuffing usually happens when:","People reuse passwords across sites",["DNS is poisoned","A firewall is misconfigured","WPA3 is enabled"]),
  q("D2","XSS mainly targets:","Users’ browsers via injected scripts",["Databases directly","Routers only","Physical servers"]),
  q("D2","A targeted phishing email to one person is:","Spear phishing",["Whaling","Smishing","Tailgating"]),
  q("D2","Best mitigation for password attacks?","MFA + strong passwords",["WEP","Open guest Wi-Fi","Disable logging"]),

  // D3
  q("D3","A DMZ is used to:","Host public-facing services with limited internal access",["Store backups only","Replace encryption","Disable firewalls"]),
  q("D3","VLANs primarily help by:","Segmenting networks into smaller security zones",["Encrypting emails","Replacing MFA","Stopping all malware"]),
  q("D3","Secure replacement for Telnet:","SSH",["FTP","HTTP","SNMPv1"]),
  q("D3","In cloud security, the shared responsibility model means:","Provider secures infrastructure; customer secures configuration/data",["Customer secures everything","Provider secures everything","No one is responsible"]),
  q("D3","RBAC grants access based on:","Job role",["Time of day only","Device battery","Keyboard type"]),

  // D4
  q("D4","A SIEM primarily helps by:","Collecting/correlating logs and alerting",["Replacing firewalls","Encrypting disks","Blocking all phishing"]),
  q("D4","In incident response, containment means:","Stop spread and limit damage",["Write final report","Restore from backup","Hire new staff"]),
  q("D4","RPO describes:","Maximum acceptable data loss",["How fast systems return","Number of incidents","Password length"]),
  q("D4","EDR is used for:","Detecting/responding to endpoint threats",["Replacing routers","Physical access control","DNS hosting"]),
  q("D4","Chain of custody matters in forensics to:","Prove evidence wasn’t altered",["Make Wi-Fi faster","Lower CVSS","Increase bandwidth"]),

  // D5
  q("D5","A policy is best described as:","High-level rule/intent",["Step-by-step instructions","A software patch","A firewall log"]),
  q("D5","Third-party risk refers to:","Vendors/partners affecting your security",["Only insiders","Only nation-states","Only DDoS"]),
  q("D5","Data classification helps determine:","How much protection data needs",["Wi-Fi speed","CPU usage","Which keyboard to buy"]),
  q("D5","Security metrics are used to:","Measure and report security performance",["Remove malware automatically","Replace training","Disable audits"]),
  q("D5","An audit mainly checks:","Evidence that controls and processes are followed",["How fun training is","Only password strength","Only physical locks"]),
];

// Scenario mini-bank
const SCENARIOS = [
  {
    title: "🎭 Scenario: The Suspicious Login",
    domain: "D4",
    prompt:
      "You see 12 failed logins, then 1 successful login to an admin account from a country your company doesn’t operate in. What’s your BEST next action?",
    correct: "Containment: disable account / block IP and investigate",
    choices: [
      "Containment: disable account / block IP and investigate",
      "Ignore it — could be a user typo",
      "Delete all logs so attackers can’t see them",
      "Post about it on social media",
    ],
    teach:
      "This is a classic alert pattern (brute force then success). In IR, you contain first to stop further damage, then investigate with logs.",
  },
  {
    title: "🎭 Scenario: The Public Cloud Bucket",
    domain: "D3",
    prompt:
      "A storage bucket is accidentally set to public and contains customer files. What is this MOST closely an example of?",
    correct: "Security misconfiguration",
    choices: ["Security misconfiguration","DDoS","Rootkit","Whaling"],
    teach:
      "Many cloud breaches happen because customers misconfigure access settings. Shared responsibility: you configure access; provider runs the infrastructure.",
  },
  {
    title: "🎭 Scenario: “Urgent! Pay Now!”",
    domain: "D2",
    prompt:
      "Your phone gets a message: “Your parcel is held. Pay £2.99 now” with a link. What is this called and what should you do?",
    correct: "Smishing; don’t click, report it",
    choices: ["Smishing; don’t click, report it","Whaling; pay quickly","XSS; clear cookies","Worm; reboot phone"],
    teach:
      "SMS-based phishing is smishing. The defense is awareness + reporting, not panic-clicking links.",
  },
];

const SOC_SCENARIOS = [
  // D4-heavy but cross-domain learning inside explanations
  {
    title: "🚨 Admin Login From Abroad",
    domain: "D4",
    prompt: "You see multiple failed logins then a successful admin login from an unusual country. What’s the BEST next step?",
    correct: "Contain: disable the account/block IP, then investigate logs",
    choices: [
      "Contain: disable the account/block IP, then investigate logs",
      "Wait and see if it happens again",
      "Delete the logs to prevent attacker tracking",
      "Email everyone their passwords were leaked"
    ],
    teach: "SOC thinking: contain first to stop damage (IR step). Then pull logs/SIEM context to confirm scope and root cause."
  },
  {
    title: "🧪 Suspicious PowerShell Activity",
    domain: "D4",
    prompt: "EDR flags PowerShell running encoded commands on a user laptop. What does this suggest and what action fits containment?",
    correct: "Possible malware/LOLBins; isolate the endpoint and capture evidence",
    choices: [
      "Possible malware/LOLBins; isolate the endpoint and capture evidence",
      "It’s normal — ignore EDR",
      "Disable antivirus permanently",
      "Open all firewall ports for troubleshooting"
    ],
    teach: "Encoded PowerShell is a common attacker technique. Isolate quickly (containment), preserve evidence for forensics."
  },

  // D2 attack understanding inside SOC workflow
  {
    title: "🎣 CEO Receives Targeted Email",
    domain: "D2",
    prompt: "An email to your CEO requests an urgent wire transfer and looks tailored. What is it and best response?",
    correct: "Whaling/spear phishing; verify out-of-band and report",
    choices: [
      "Whaling/spear phishing; verify out-of-band and report",
      "Approve it quickly to avoid delay",
      "Forward it to everyone to warn them (without reporting)",
      "Reply asking the attacker for more details"
    ],
    teach: "Targeted exec scams are whaling. SOC response: report, block indicators, and verify via a trusted channel (call/Teams)."
  },

  // D3 architecture helps prevent spread
  {
    title: "🧱 Malware Spreading Laterally",
    domain: "D3",
    prompt: "Multiple endpoints show the same infection. What architectural control best limits spread inside the network?",
    correct: "Network segmentation/VLANs (limit lateral movement)",
    choices: [
      "Network segmentation/VLANs (limit lateral movement)",
      "Using HTTP instead of HTTPS",
      "Disabling MFA",
      "Storing passwords in plain text"
    ],
    teach: "Architecture matters: segmentation reduces blast radius. It won’t stop infection, but it stops one compromise becoming many."
  },

  // D1 fundamentals show up in decision-making
  {
    title: "🔺 DDoS On Public Website",
    domain: "D1",
    prompt: "A DDoS is hitting your public website. Which CIA principle is MOST impacted?",
    correct: "Availability",
    choices: ["Availability","Integrity","Confidentiality","Non-repudiation"],
    teach: "DDoS aims to make a service unavailable. SOC will coordinate mitigation (rate limiting, WAF, CDN, scrubbing)."
  },

  // D5 governance + reporting in SOC life
  {
    title: "📝 After the Incident",
    domain: "D5",
    prompt: "Post-incident, leadership asks how you’ll prevent repeats. What should you produce?",
    correct: "Lessons learned report + updated controls/policies and metrics",
    choices: [
      "Lessons learned report + updated controls/policies and metrics",
      "Only delete evidence to move on",
      "Tell staff not to talk about it",
      "Change nothing and hope it won’t happen again"
    ],
    teach: "Domain 5 is real SOC life: document, improve controls, update policies, and track metrics so security gets better over time."
  }
];


// --- State ---
const defaultState = {
  profile: { name: "Player", examDate: "", difficulty: "normal", focus: "balanced" },
  stats: {
    xp: 0,
    streak: 0,
    lastPlay: "",
    attempts: 0,
    correct: 0,
    domainPerf: { D1:{a:0,c:0}, D2:{a:0,c:0}, D3:{a:0,c:0}, D4:{a:0,c:0}, D5:{a:0,c:0} },
  },
  cards: [], // spaced repetition cards derived from wrong answers
};

let state = loadState();

// --- UI refs ---
const pillName = byId("pillName");
const pillStreak = byId("pillStreak");
const pillXP = byId("pillXP");
const todayDue = byId("todayDue");
const weakDom = byId("weakDom");
const accuracy = byId("accuracy");

const nameInput = byId("nameInput");
const dateInput = byId("dateInput");
const difficultyInput = byId("difficultyInput");
const focusInput = byId("focusInput");

const btnSave = byId("btnSave");
const btnReset = byId("btnReset");

const btnDaily = byId("btnDaily");
const btnFlash = byId("btnFlash");
const btnScenario = byId("btnScenario");
const btnBoss = byId("btnBoss");
const btnSoc = byId("btnSoc");


const modeTitle = byId("modeTitle");
const modeHint = byId("modeHint");
const gameArea = byId("gameArea");
const gameControls = byId("gameControls");
const btnNext = byId("btnNext");
const btnQuit = byId("btnQuit");

let session = null;

// --- Init ---
renderProfileInputs();
renderHeader();
renderTodayPanel();

btnSave.onclick = () => {
  state.profile.name = nameInput.value.trim() || "Player";
  state.profile.examDate = dateInput.value || "";
  state.profile.difficulty = difficultyInput.value;
  state.profile.focus = focusInput.value;
  saveState();
  renderHeader();
  toast("Saved!");
};

btnReset.onclick = () => {
  if (!confirm("Reset all progress in this browser?")) return;
  state = structuredClone(defaultState);
  saveState();
  renderProfileInputs();
  renderHeader();
  renderTodayPanel();
  setWelcome();
};

btnDaily.onclick = () => startQuizMode("Daily Dungeon", makeQuiz(10, false));
btnBoss.onclick  = () => startQuizMode("Domain Boss Fight", makeQuiz(15, true));
btnFlash.onclick = () => startFlashcards();
btnScenario.onclick = () => startScenario();
btnSoc.onclick = () => startSocShift();


btnNext.onclick = () => nextStep();
btnQuit.onclick = () => setWelcome();

setWelcome();

// --- Core helpers ---
function q(domain, prompt, answer, distractors){
  const choices = shuffle([answer, ...distractors]);
  return { id: cryptoId(), domain, prompt, answer, choices, explain: buildExplain(domain, prompt, answer) };
}

function buildExplain(domain, prompt, answer){
  // Friendly micro-explanations
  const map = {
    D1: "Domain 1 is your foundation: controls, CIA, risk, and principles.",
    D2: "Domain 2 is about attacks and how to reduce risk (mitigations).",
    D3: "Domain 3 is about secure design: segmentation, cloud models, protocols.",
    D4: "Domain 4 is SOC-life: logs, SIEM, incident response, recovery.",
    D5: "Domain 5 is running security: policies, risk registers, audits, compliance.",
  };
  return `${map[domain]} Key takeaway: **${answer}** is the best match for this question.`;
}

function startQuizMode(title, quiz){
  ensureStreakUpdate();
  modeTitle.textContent = title;
  modeHint.textContent = "Answer, learn, and earn XP. Wrong answers become flashcards due tomorrow.";
  session = { type:"quiz", title, quiz, i:0, locked:false };
  gameControls.classList.remove("hidden");
  btnNext.textContent = "Next ➜";
  renderQuestion();
}

function startFlashcards(){
  ensureStreakUpdate();
  modeTitle.textContent = "Flashcard Frenzy";
  modeHint.textContent = "These are your personal weak points. Rate how well you remembered to schedule the next review.";
  session = { type:"flash", i:0, cards: getDueCards() };
  gameControls.classList.remove("hidden");
  btnNext.textContent = "Next ➜";
  renderFlashcard();
}

function startScenario(){
  ensureStreakUpdate();
  modeTitle.textContent = "Scenario Mode";
  modeHint.textContent = "Mini real-world stories. Great for exam-style thinking.";
  const pick = pickScenario();
  session = { type:"scenario", data: pick, locked:false };
  gameControls.classList.remove("hidden");
  btnNext.textContent = "Next ➜";
  renderScenario();
}

function startSocShift(){
  ensureStreakUpdate();
  modeTitle.textContent = "🧯 SOC Shift";
  modeHint.textContent = "3 quick SOC scenarios. Balanced across domains, but ops-heavy (like a real shift).";
  session = { type:"socshift", round:0, locked:false, data: pickSocScenario() };
  gameControls.classList.remove("hidden");
  btnNext.textContent = "Next ➜";
  renderSocScenario();
}


function nextStep(){
  if (!session) return;
  if (session.type === "quiz"){
    if (session.i >= session.quiz.length - 1){
      endQuiz();
    } else {
      session.i++;
      session.locked = false;
      renderQuestion();
    }
  } else if (session.type === "flash"){
    if (session.i >= session.cards.length - 1){
      endFlash();
    } else {
      session.i++;
      renderFlashcard();
    }
  } else if (session.type === "scenario"){
    // new scenario
    session.data = pickScenario();
    session.locked = false;
    renderScenario();
  }   else if (session.type === "socshift"){
    if (session.round >= 2){
      modeTitle.textContent = "SOC Shift Complete ✅";
      gameArea.innerHTML = `<p class="q">Nice work. You finished today’s shift.</p><p class="hint">Do Flashcards next to lock it in.</p>`;
      gameControls.classList.add("hidden");
      saveState();
      renderTodayPanel();
    } else {
      session.round++;
      session.locked = false;
      session.data = pickSocScenario();
      renderSocScenario();
    }
  }

}

function renderQuestion(){
  const item = session.quiz[session.i];
  gameArea.innerHTML = `
    <div class="tagRow">
      <span class="tag">${domainName(item.domain)}</span>
      <span class="tag">Q ${session.i+1} / ${session.quiz.length}</span>
      <span class="tag">Difficulty: ${state.profile.difficulty}</span>
    </div>
    <p class="q">${item.prompt}</p>
    <div class="choices">
      ${item.choices.map(c => `<button class="choice" data-choice="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join("")}
    </div>
    <p class="hint" id="explain"></p>
  `;

  const explainEl = byId("explain");
  gameArea.querySelectorAll(".choice").forEach(btn=>{
    btn.onclick = () => {
      if (session.locked) return;
      session.locked = true;

      const choice = btn.getAttribute("data-choice");
      const correct = (choice === item.answer);

      // mark
      gameArea.querySelectorAll(".choice").forEach(b=>{
        const c = b.getAttribute("data-choice");
        if (c === item.answer) b.classList.add("correct");
        if (!correct && c === choice) b.classList.add("wrong");
      });

      // teach
      explainEl.innerHTML = `${item.explain}`;

      // stats + cards
      recordAttempt(item.domain, correct);
      if (!correct) addCard(item);

      // XP
      addXP(correct ? 12 : 5);

      renderHeader();
      renderTodayPanel();
    };
  });
}

function renderFlashcard(){
  const cards = session.cards;
  if (cards.length === 0){
    gameArea.innerHTML = `<p class="q">No cards due today 🎉</p><p class="hint">Do a Daily Dungeon to generate new cards based on weak areas.</p>`;
    return;
  }

  const card = cards[session.i];
  gameArea.innerHTML = `
    <div class="tagRow">
      <span class="tag">${domainName(card.domain)}</span>
      <span class="tag">Card ${session.i+1} / ${cards.length}</span>
      <span class="tag">Due: ${fmtDate(card.due)}</span>
    </div>
    <p class="q"><strong>Prompt:</strong> ${escapeHtml(card.prompt)}</p>
    <p class="q"><strong>Answer:</strong> <span class="good">${escapeHtml(card.answer)}</span></p>
    <p class="hint">${escapeHtml(card.tip)}</p>
    <div class="actions">
      <button id="rateEasy">😄 Easy (3 days)</button>
      <button id="rateOk">🙂 Ok (2 days)</button>
      <button id="rateHard">😅 Hard (1 day)</button>
    </div>
  `;

  byId("rateEasy").onclick = () => rateCard(card.id, 3);
  byId("rateOk").onclick   = () => rateCard(card.id, 2);
  byId("rateHard").onclick = () => rateCard(card.id, 1);
}

function renderScenario(){
  const s = session.data;
  gameArea.innerHTML = `
    <div class="tagRow">
      <span class="tag">${domainName(s.domain)}</span>
      <span class="tag">Scenario</span>
    </div>
    <p class="q"><strong>${escapeHtml(s.title)}</strong></p>
    <p class="q">${escapeHtml(s.prompt)}</p>
    <div class="choices">
      ${s.choices.map(c => `<button class="choice" data-choice="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join("")}
    </div>
    <p class="hint" id="teach"></p>
  `;

  const teachEl = byId("teach");
  gameArea.querySelectorAll(".choice").forEach(btn=>{
    btn.onclick = () => {
      if (session.locked) return;
      session.locked = true;
      const choice = btn.getAttribute("data-choice");
      const correct = (choice === s.correct);

      gameArea.querySelectorAll(".choice").forEach(b=>{
        const c = b.getAttribute("data-choice");
        if (c === s.correct) b.classList.add("correct");
        if (!correct && c === choice) b.classList.add("wrong");
      });

      teachEl.innerHTML = `${escapeHtml(s.teach)}<br><br><strong>Best answer:</strong> ${escapeHtml(s.correct)}`;

      recordAttempt(s.domain, correct);
      addXP(correct ? 14 : 6);
      if (!correct){
        // turn scenario into a card
        addCard({ domain:s.domain, prompt:s.prompt, answer:s.correct });
      }

      renderHeader();
      renderTodayPanel();
    };
  });
}

function renderSocScenario(){
  const s = session.data;

  gameArea.innerHTML = `
    <div class="tagRow">
      <span class="tag">${domainName(s.domain)}</span>
      <span class="tag">SOC Shift</span>
      <span class="tag">Round ${session.round+1} / 3</span>
    </div>
    <p class="q"><strong>${escapeHtml(s.title)}</strong></p>
    <p class="q">${escapeHtml(s.prompt)}</p>
    <div class="choices">
      ${s.choices.map(c => `<button class="choice" data-choice="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join("")}
    </div>
    <p class="hint" id="teach"></p>
  `;

  const teachEl = byId("teach");

  gameArea.querySelectorAll(".choice").forEach(btn=>{
    btn.onclick = () => {
      if (session.locked) return;
      session.locked = true;

      const choice = btn.getAttribute("data-choice");
      const correct = (choice === s.correct);

      gameArea.querySelectorAll(".choice").forEach(b=>{
        const c = b.getAttribute("data-choice");
        if (c === s.correct) b.classList.add("correct");
        if (!correct && c === choice) b.classList.add("wrong");
      });

      teachEl.innerHTML = `${escapeHtml(s.teach)}<br><br><strong>Best answer:</strong> ${escapeHtml(s.correct)}`;

      recordAttempt(s.domain, correct);
      addXP(correct ? 18 : 8);

      // turn missed scenario into flashcard
      if (!correct){
        addCard({ domain:s.domain, prompt:s.prompt, answer:s.correct });
      }

      renderHeader();
      renderTodayPanel();
    };
  });
}


function endQuiz(){
  const total = session.quiz.length;
  const lastN = session.quiz.map(it => it.domain);
  modeTitle.textContent = "Run Complete ✅";
  gameArea.innerHTML = `
    <p class="q"><strong>Nice!</strong> You completed ${escapeHtml(session.title)}.</p>
    <p class="hint">Keep your streak alive by playing once a day. Flashcards will focus on your weak areas.</p>
    <div class="tagRow">
      ${[...new Set(lastN)].map(d => `<span class="tag">${domainName(d)}</span>`).join("")}
    </div>
  `;
  gameControls.classList.add("hidden");
  saveState();
  renderTodayPanel();
}

function endFlash(){
  modeTitle.textContent = "Flashcards Done ✅";
  gameArea.innerHTML = `<p class="q">Great job. Your reviews are scheduled.</p>`;
  gameControls.classList.add("hidden");
  saveState();
  renderTodayPanel();
}

function setWelcome(){
  session = null;
  modeTitle.textContent = "Welcome";
  modeHint.textContent = "Pick a mode above. Your progress saves automatically in this browser.";
  gameArea.innerHTML = `
    <p class="q">🎮 Your daily game plan:</p>
    <div class="tagRow">
      <span class="tag">1) Daily Dungeon</span>
      <span class="tag">2) Flashcards</span>
      <span class="tag">3) Scenario Mode</span>
    </div>
    <p class="hint">Tip: Choose “Weakest-first” focus to target your lowest domain and level up faster.</p>
  `;
  gameControls.classList.add("hidden");
  saveState();
  renderTodayPanel();
}

function makeQuiz(n, hard){
  // Choose questions based on focus mode + weakness
  const pool = BANK.slice();
  const focus = state.profile.focus;
  let chosen = [];

  const weakest = getWeakestDomainId();
  const pickFrom = (domainId) => pool.filter(x=>x.domain===domainId);

  function pickOne(fromArr){
    if (fromArr.length === 0) return null;
    return fromArr[Math.floor(Math.random()*fromArr.length)];
  }

  for (let i=0;i<n;i++){
    let domainPick = null;

    if (focus === "weak" && weakest){
      // 60% weakest, else balanced
      domainPick = (Math.random()<0.6) ? weakest : randomDomainId();
    } else if (focus === "d2d4"){
      domainPick = ["D2","D3","D4"][Math.floor(Math.random()*3)];
    } else {
      domainPick = randomDomainId();
    }

    let candidate = pickOne(pickFrom(domainPick)) || pickOne(pool);
    if (!candidate) candidate = pool[Math.floor(Math.random()*pool.length)];
    // hard mode: prefer scenario-ish wording by choosing longer prompts if available (simple heuristic)
    chosen.push(candidate);
  }

  // difficulty tweaks: for "easy", reduce choices to 3; for "hard", keep 4 but add "trap" explanation style
  const diff = state.profile.difficulty;
  return chosen.map(item => {
    const copy = structuredClone(item);
    if (diff === "easy"){
      // keep correct + 2 distractors
      const distract = copy.choices.filter(c=>c!==copy.answer);
      copy.choices = shuffle([copy.answer, ...distract.slice(0,2)]);
    } else if (diff === "hard" && hard){
      // no change to choices, but could be extended later
    }
    return copy;
  });
}

function addXP(amount){
  state.stats.xp += amount;
  saveState();
}

function levelFromXP(xp){
  // simple curve
  return Math.max(1, Math.floor(xp/120) + 1);
}

function recordAttempt(domain, correct){
  state.stats.attempts += 1;
  if (correct) state.stats.correct += 1;
  const dp = state.stats.domainPerf[domain];
  dp.a += 1;
  if (correct) dp.c += 1;
  saveState();
}

function addCard(item){
  const tomorrow = addDays(todayISO(), 1);
  const id = cryptoId();
  const tip = friendlyTip(item.domain, item.answer);
  state.cards.push({
    id,
    domain: item.domain,
    prompt: item.prompt,
    answer: item.answer,
    tip,
    due: tomorrow,
  });
  saveState();
}

function friendlyTip(domain, answer){
  const tips = {
    D1: `Think foundations: controls, CIA, risk. Anchor: **${answer}**.`,
    D2: `Think attacker path + mitigation. Anchor: **${answer}**.`,
    D3: `Think design choices: segmentation, secure protocols, cloud model. Anchor: **${answer}**.`,
    D4: `Think SOC flow: logs → SIEM → IR steps. Anchor: **${answer}**.`,
    D5: `Think program: policies, compliance, audits, vendors. Anchor: **${answer}**.`,
  };
  return tips[domain] || `Anchor: ${answer}`;
}

function rateCard(cardId, days){
  const card = state.cards.find(c => c.id === cardId);
  if (!card) return;
  card.due = addDays(todayISO(), days);
  addXP(8);
  saveState();
  renderHeader();
  renderTodayPanel();
  toast(`Scheduled in ${days} day(s)`);
}

function pickScenario(){
  // focus scenarios towards weakest domain sometimes
  const weak = getWeakestDomainId();
  if (weak && Math.random() < 0.6){
    const candidates = SCENARIOS.filter(s=>s.domain===weak);
    if (candidates.length) return candidates[Math.floor(Math.random()*candidates.length)];
  }
  return SCENARIOS[Math.floor(Math.random()*SCENARIOS.length)];
}

function pickSocScenario(){
  // Weighted towards D4, but still rotates through all domains
  const weights = [
    "D4","D4","D4","D4",
    "D2","D2",
    "D3","D3",
    "D1",
    "D5"
  ];
  const target = weights[Math.floor(Math.random()*weights.length)];
  const pool = SOC_SCENARIOS.filter(s => s.domain === target);
  const list = pool.length ? pool : SOC_SCENARIOS;
  return list[Math.floor(Math.random()*list.length)];
}


function getWeakestDomainId(){
  let worst = null;
  let worstScore = 1; // accuracy (0..1)
  for (const d of DOMAINS){
    const perf = state.stats.domainPerf[d.id];
    const a = perf.a;
    const c = perf.c;
    const acc = (a===0) ? 1 : (c/a);
    // We want lowest accuracy among attempted domains; if none attempted, return null later
    if (a>0 && acc <= worstScore){
      worstScore = acc;
      worst = d.id;
    }
  }
  return worst;
}

function getDueCards(){
  const t = todayISO();
  return state.cards.filter(c => c.due <= t)
    .sort((a,b)=>a.due.localeCompare(b.due));
}

function ensureStreakUpdate(){
  const today = todayISO();
  if (state.stats.lastPlay === today) return;

  const last = state.stats.lastPlay;
  if (!last){
    state.stats.streak = 1;
  } else {
    const diffDays = daysBetweenISO(last, today);
    if (diffDays === 1) state.stats.streak += 1;
    else state.stats.streak = 1;
  }
  state.stats.lastPlay = today;
  saveState();
  renderHeader();
  renderTodayPanel();
}

// --- Renderers ---
function renderHeader(){
  const name = state.profile.name || "Player";
  pillName.textContent = `👤 ${name}`;
  pillStreak.textContent = `🔥 Streak: ${state.stats.streak}`;

  const xp = state.stats.xp;
  const lv = levelFromXP(xp);
  pillXP.textContent = `⭐ XP: ${xp} (Lv ${lv})`;
}

function renderProfileInputs(){
  nameInput.value = state.profile.name || "";
  dateInput.value = state.profile.examDate || "";
  difficultyInput.value = state.profile.difficulty || "normal";
  focusInput.value = state.profile.focus || "balanced";
}

function renderTodayPanel(){
  todayDue.textContent = String(getDueCards().length);

  const w = getWeakestDomainId();
  weakDom.textContent = w ? w : "—";

  const a = state.stats.attempts;
  const c = state.stats.correct;
  accuracy.textContent = a ? `${Math.round((c/a)*100)}%` : "—";
}

// --- Storage ---
function loadState(){
  const raw = localStorage.getItem(LS_KEY);
  if (!raw){
    const s = structuredClone(defaultState);
    // seed name from previous context if user types it later
    return s;
  }
  try{
    const parsed = JSON.parse(raw);
    return deepMerge(structuredClone(defaultState), parsed);
  } catch(e){
    return structuredClone(defaultState);
  }
}

function saveState(){
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

// --- Utils ---
function byId(id){ return document.getElementById(id); }
function domainName(id){ return DOMAINS.find(d=>d.id===id)?.name || id; }

function randomDomainId(){
  return DOMAINS[Math.floor(Math.random() * DOMAINS.length)].id;
}

function fmtDate(iso){
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
}


function shuffle(arr){
  const a = arr.slice();
  for (let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function todayISO(){
  const d = new Date();
  return d.toISOString().slice(0,10);
}

function addDays(iso, n){
  const d = new Date(iso+"T00:00:00Z");
  d.setUTCDate(d.getUTCDate()+n);
  return d.toISOString().slice(0,10);
}

function daysBetweenISO(a,b){
  const da = new Date(a+"T00:00:00Z");
  const db = new Date(b+"T00:00:00Z");
  return Math.round((db-da)/(1000*60*60*24));
}

function cryptoId(){
  // not cryptographically important here, just unique-ish
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function escapeHtml(s){
  return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}

function deepMerge(base, extra){
  for (const k of Object.keys(extra)){
    if (extra[k] && typeof extra[k] === "object" && !Array.isArray(extra[k])){
      base[k] = deepMerge(base[k] ?? {}, extra[k]);
    } else {
      base[k] = extra[k];
    }
  }
  return base;
}

function toast(msg){
  // tiny “toast” using alert-ish but nicer
  const el = document.createElement("div");
  el.textContent = msg;
  el.style.position="fixed";
  el.style.bottom="16px";
  el.style.left="50%";
  el.style.transform="translateX(-50%)";
  el.style.padding="10px 12px";
  el.style.borderRadius="12px";
  el.style.background="rgba(0,0,0,.65)";
  el.style.border="1px solid rgba(255,255,255,.18)";
  el.style.color="white";
  el.style.zIndex="9999";
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 1200);
}
