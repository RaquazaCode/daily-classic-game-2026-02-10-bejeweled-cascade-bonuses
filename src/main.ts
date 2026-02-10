import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("App root missing");
}

app.innerHTML = `
  <div class="shell">
    <canvas id="game" width="960" height="720"></canvas>
  </div>
`;
