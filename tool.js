let lastMethod = null;
let lastPath = null;
let lastBaseUrl = null;
let currentFormat = "fetch";

function setLoading(isLoading) {
  const loader = document.getElementById("loadingIndicator");
  if (loader) loader.classList.toggle("visible", isLoading);
}

function fetchOpenAPI() {
  const url = document.getElementById("urlInput").value;
  if (!url) return alert("Please enter a valid URL");

  setLoading(true);
  fetch(url)
    .then(res => res.json())
    .then(data => renderOpenAPI(data, url))
    .catch(err => alert("❌ Failed to load spec."))
    .finally(() => setLoading(false));
}

function loadFromFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      renderOpenAPI(data, "http://localhost");
    } catch (err) {
      alert("❌ Invalid JSON file");
    }
  };
  reader.readAsText(file);
}

function renderOpenAPI(data, baseUrl) {
  const output = document.getElementById("output");
  const endpointsDiv = document.getElementById("endpoints");
  output.value = JSON.stringify(data, null, 2);
  endpointsDiv.innerHTML = "";

  for (const path in data.paths) {
    for (const method in data.paths[path]) {
      const item = document.createElement("li");
      item.textContent = `${method.toUpperCase()} ${path}`;
      item.onclick = () => {
        document.querySelectorAll("#endpoints li").forEach(li => li.classList.remove("selected"));
        item.classList.add("selected");
        lastMethod = method.toUpperCase();
        lastPath = path;
        lastBaseUrl = baseUrl;
        const showBody = ["POST", "PUT", "PATCH"].includes(lastMethod);
        document.getElementById("bodyInputContainer").style.display = showBody ? "block" : "none";
        showCode(generateSnippet(baseUrl, lastMethod, path));
      };
      endpointsDiv.appendChild(item);
    }
  }
}

function generateSnippet(baseUrl, method, path) {
  const fullUrl = new URL(baseUrl).origin + path;
  return `fetch("${fullUrl}", {\n  method: "${method}",\n  headers: {\n    "Content-Type": "application/json"\n  }\n})`;
}

function showCode(snippet) {
  document.getElementById("codeSnippet").textContent = snippet;
}

function copySnippet() {
  navigator.clipboard.writeText(document.getElementById("codeSnippet").textContent)
    .then(() => alert("✅ Copied!"))
    .catch(() => alert("❌ Copy failed."));
}

function exportSnippets() {
  const blob = new Blob([document.getElementById("codeSnippet").textContent], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "snippet.txt";
  a.click();
}

function tryRequest() {
  if (!lastMethod || !lastPath || !lastBaseUrl) return alert("❗ Select an endpoint first.");
  const url = new URL(lastBaseUrl).origin + lastPath;
  const headers = { "Content-Type": "application/json" };
  const options = { method: lastMethod, headers };
  if (["POST", "PUT", "PATCH"].includes(lastMethod)) {
    const bodyInput = document.getElementById("bodyInput").value;
    try {
      options.body = JSON.stringify(JSON.parse(bodyInput));
    } catch (e) {
      return alert("⚠️ Invalid JSON body");
    }
  }
  fetch(url, options)
    .then(res => res.text())
    .then(text => document.getElementById("responseBox").textContent = text)
    .catch(err => document.getElementById("responseBox").textContent = "Request failed: " + err);
}

function updateSnippetFormat() {
  currentFormat = document.getElementById("formatSelect").value;
  if (lastMethod && lastPath && lastBaseUrl) {
    showCode(generateSnippet(lastBaseUrl, lastMethod, lastPath));
  }
}
document.getElementById('fileInput').addEventListener('change', function () {
  const fileName = this.files[0]?.name || 'No file chosen';
  document.getElementById('fileName').textContent = fileName;
});
document.getElementById('fileInput').addEventListener('change', function () {
  const fileName = this.files[0]?.name || 'No file chosen';
  document.getElementById('fileName').textContent = fileName;
});
<script src="tool.js"></script>
