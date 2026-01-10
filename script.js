var currentSheetID = "1hpWKGV0q74t77vxGrHAujag-i2OTquEi_0U4eOcsPKM";
var raceQuestions = [];
var racePositions = [1, 1, 1, 1]; 
var raceIndexSoal = [0, 0, 0, 0]; 
var isRaceActive = false;

function playSound(id) {
    const s = document.getElementById(id);
    if(s) { s.currentTime = 0; s.play().catch(e => {}); }
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log("Error Fullscreen");
        });
    } else {
        if (document.exitFullscreen) { document.exitFullscreen(); }
    }
}

async function updateSheetID() {
    playSound('snd-click'); 
    let inputID = document.getElementById('sheet-id-input').value.trim();
    const notif = document.getElementById('notif-load');
    if(!inputID) { notif.innerText = "Masukkan ID Sheet!"; notif.style.color = "red"; return; }
    notif.innerText = "Sedang memuat..."; notif.style.color = "blue";
    currentSheetID = inputID;
    const ok = await loadQuestions();
    if(ok) { notif.innerText = "Soal Berhasil Dimuat!"; notif.style.color = "green"; } 
    else { notif.innerText = "Gagal! Periksa ID Sheet."; notif.style.color = "red"; }
}

async function loadQuestions() {
    let url = "https://docs.google.com/spreadsheets/d/" + currentSheetID + "/gviz/tq?tqx=out:json";
    try {
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        raceQuestions = json.table.rows.map(r => ({
            q: r.c[0] ? String(r.c[0].v) : "...",
            a: r.c[1] ? String(r.c[1].v) : "-",
            b: r.c[2] ? String(r.c[2].v) : "-",
            c: r.c[3] ? String(r.c[3].v) : "-",
            k: r.c[4] ? String(r.c[4].v).toUpperCase().trim() : "A"
        }));
        return true;
    } catch(err) { return false; }
}

function startCountdown() {
    playSound('snd-click');
    if(raceQuestions.length === 0) {
        loadQuestions().then(ok => {
            if(ok) runCountdownLogic();
            else alert("Klik ENTER dulu untuk muat soal!");
        });
    } else { runCountdownLogic(); }
}

function runCountdownLogic() {
    document.getElementById('layar-putih').style.display = 'none';
    const lHitam = document.getElementById('layar-hitam');
    const cdText = document.getElementById('cd-text');
    lHitam.style.display = 'flex';
    playSound('snd-countdown'); 
    let sequence = ["3", "2", "GO!"];
    let i = 0;
    cdText.innerText = sequence[i];
    let timer = setInterval(() => {
        i++;
        if(i < sequence.length) { cdText.innerText = sequence[i]; } 
        else {
            clearInterval(timer);
            lHitam.style.display = 'none';
            playSound('bg-music');
            isRaceActive = true;
            for(let p=1; p<=4; p++) updateTampilanSoal(p);
        }
    }, 1100); 
}

function updateTampilanSoal(p) {
    const d = raceQuestions[raceIndexSoal[p-1]];
    if(!d) return;
    document.getElementById("q"+p).innerText = d.q;
    const optArea = document.getElementById("opt" + p);
    optArea.innerHTML = ''; 
    ['A','B','C'].forEach(l => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.innerText = l + ". " + d[l.toLowerCase()];
        btn.onclick = () => {
            if(!isRaceActive) return;
            if(l === d.k) {
                playSound('snd-ok');
                racePositions[p-1] += 8;
                document.getElementById("d"+p).style.left = racePositions[p-1] + "%";
                if(racePositions[p-1] >= 85) {
                    isRaceActive = false;
                    document.getElementById('bg-music').pause();
                    playSound('snd-win');
                    confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
                    document.getElementById('win-text').innerText = "🏆 BEBEK " + p + " JUARA! 🏆";
                    document.getElementById('win-notif').style.display = 'block';
                    document.getElementById('reset-button-container').style.display = 'block';
                } else {
                    raceIndexSoal[p-1] = (raceIndexSoal[p-1] + 1) % raceQuestions.length;
                    updateTampilanSoal(p);
                }
            } else { playSound('snd-no'); }
        };
        optArea.appendChild(btn);
    });
}

function resetGame() {
    playSound('snd-click');
    location.reload(); 
}
