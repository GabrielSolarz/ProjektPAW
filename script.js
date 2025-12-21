const routes = {
  "/": renderHome,
  "/drivers": renderDrivers,     
  "/constructors": renderConstructors, 
  "/circuits": renderCircuits,     
  "/calendar": renderCalendar,
  "/standings": renderStandings,
  "/winners": renderWinners,
  "/basics": renderBasics,        
};
window.addEventListener("DOMContentLoaded", () => {
  handleRoute();
  document.body.addEventListener("click", onNavClick);
  window.addEventListener("popstate", handleRoute);
});

function onNavClick(e) {
  const link = e.target.closest("a[data-route]");
  if (!link) return;
  e.preventDefault();
  const url = link.getAttribute("href");
  history.pushState(null, "", url);
  handleRoute();
}

function handleRoute() {
  const path = window.location.pathname;
  const view = routes[path] || renderNotFound;
  view();
  const navLinks = document.querySelectorAll("nav a[data-route]");

  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === path) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}
function renderHome() {
  document.getElementById("app").innerHTML = `
    <section>
      <h2>Witaj w F1 Season Summary</h2>
      <p>Ta aplikacja prezentuje dane o sezonie Formuły 1 z <a href="https://openf1.org">OpenF1 API</a>.</p>
      <ul>
          <li><a href="/drivers" data-route>Lista Kierowców</a></li> 
          <li><a href="/constructors" data-route>Lista Konstruktorów</a></li> 
          <li><a href="/circuits" data-route>Lista Torów</a></li>
          <li><a href="/calendar" data-route>Kalendarz</a></li>
          <li><a href="/standings" data-route>Klasyfikacje</a></li>
          <li><a href="/winners" data-route>Zwycięzcy</a></li>
          <li><a href="/basics" data-route>F1 Dla początkujących</a></li> </ul>
      </ul>
    </section>
  `;
}
function renderCalendar() {
  document.getElementById("app").innerHTML = "<h2>Kalendarz sezonu</h2><p>Ładowanie...</p>";
}

function renderStandings() {
  document.getElementById("app").innerHTML = "<h2>Klasyfikacje</h2><p>Ładowanie...</p>";
}

function renderWinners() {
  document.getElementById("app").innerHTML = "<h2>Zwycięzcy wyścigów</h2><p>Ładowanie...</p>";
}
function renderDrivers() {
  document.getElementById("app").innerHTML = "<h2>Dane kierowców</h2><p>Ładowanie danych o kierowcach...</p>";
}

function renderConstructors() {
  document.getElementById("app").innerHTML = "<h2>Dane konstruktorów</h2><p>Ładowanie danych o konstruktorach...</p>";
}

function renderCircuits() {
  document.getElementById("app").innerHTML = "<h2>Dane torów</h2><p>Ładowanie danych o torach wyścigowych...</p>";
}

function renderBasics() {
  document.getElementById("app").innerHTML = "<h2>Podstawowa wiedza F1</h2><p>Tutaj znajdziesz podstawowe informacje o Formule 1.</p>";
}

function renderNotFound() {
  document.getElementById("app").innerHTML = `
    <h2>404 – Strona nie znaleziona</h2>
    <p>Wróć do <a href="/" data-route>strony głównej</a>.</p>
  `;
}