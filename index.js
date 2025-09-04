const graph = {
  "Main Entrance": { "Reception": 16.8 },
  "Reception": {
    "Main Entrance": 16.8,
    "Computer Lab": 9.1,
    "Library": 10.7,
    "Class Room (South)": 32.8,
    "Electronics Lab": 6.1,
    "Mass Media Studio": 87.6
  },
  "Computer Lab": { "Reception": 9.1 },
  "Library": { "Reception": 10.7, "Lecture Theatre": 5.0 },
  "Lecture Theatre": { "Library": 5.0, "Class Room (West)": 3.0 },
  "Class Room (West)": { "Lecture Theatre": 3.0 },
  "Class Room (South)": { "Reception": 32.8 },
  "Electronics Lab": { "Reception": 6.1, "Physics Lab": 27.0 },
  "Physics Lab": { "Electronics Lab": 27.0, "HM Classroom": 15.3 },
  "HM Classroom": { "Physics Lab": 15.3, "HM Lounge": 4.8 },
  "HM Lounge": { "HM Classroom": 4.8, "Restaurant": 7.6, "Cafeteria": 22.3 },
  "Restaurant": { "HM Lounge": 7.6, "HM Kitchen": 3.0 },
  "HM Kitchen": { "Restaurant": 3.0 },
  "Cafeteria": { "HM Lounge": 22.3 },
  "Mass Media Studio": { "Reception": 87.6 }
};

const speed = 1.4; // m/s
const historyBox = document.getElementById("historyList");

function swapInputs() {
  const temp = document.getElementById("startInput").value;
  document.getElementById("startInput").value = document.getElementById("endInput").value;
  document.getElementById("endInput").value = temp;
}

function toggleTheme() {
  document.body.classList.toggle("light");
}

function speak(text) {
  if ('speechSynthesis' in window) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
  }
}

function showLoader(show) {
  document.getElementById("loader").style.display = show ? "block" : "none";
}

function dijkstra(graph, start, end) {
  const queue = [[0, start, []]];
  const visited = new Set();
  while (queue.length) {
    queue.sort((a, b) => a[0] - b[0]);
    const [cost, node, path] = queue.shift();
    if (visited.has(node)) continue;
    visited.add(node);
    const newPath = [...path, node];
    if (node === end) return [cost, newPath];
    for (let neighbor in graph[node]) {
      if (!visited.has(neighbor)) {
        queue.push([cost + graph[node][neighbor], neighbor, newPath]);
      }
    }
  }
  return [Infinity, []];
}

function updateHistory(start, end) {
  const key = `📍 ${start} ➡ ${end}`;
  let history = JSON.parse(localStorage.getItem("pathHistory") || "[]");
  history = history.filter(h => h !== key);
  history.unshift(key);
  history = history.slice(0, 5);
  localStorage.setItem("pathHistory", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("pathHistory") || "[]");
  historyBox.innerHTML = "";
  history.forEach(h => {
    const span = document.createElement("span");
    span.textContent = h;
    span.onclick = () => {
      const [start, end] = h.replace("📍 ", "").split(" ➡ ");
      document.getElementById("startInput").value = start;
      document.getElementById("endInput").value = end;
      findPath();
    };
    historyBox.appendChild(span);
  });
}

function findPath() {
  const start = document.getElementById("startInput").value.trim();
  const end = document.getElementById("endInput").value.trim();
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "";
  showLoader(true);

  setTimeout(() => {
    showLoader(false);
    if (!graph[start] || !graph[end]) {
      resultDiv.innerHTML = "<p>❌ Invalid location(s).</p>";
      return;
    }
    if (start === end) {
      resultDiv.innerHTML = "<p>⚠️ Start and destination are the same.</p>";
      return;
    }

    const [cost, path] = dijkstra(graph, start, end);
    if (!path.length) {
      resultDiv.innerHTML = "<p>🚫 No path found.</p>";
      return;
    }

    const timeSec = Math.round(cost / speed);
    resultDiv.innerHTML += `<p><strong>✅ Total Distance:</strong> ${cost.toFixed(1)} meters<br/>
                            <strong>⏱️ Time:</strong> ~${timeSec} sec</p>`;

    let speakText = `The total distance is ${cost.toFixed(1)} meters. Estimated time is ${timeSec} seconds.`;
    speak(speakText);
    updateHistory(start, end);
  }, 600);
}

renderHistory();
