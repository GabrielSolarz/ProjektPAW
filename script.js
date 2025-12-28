const routes = {
  "/": renderHome,
  "/index.html": renderHome,
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
      <h2>Witaj w F1Results</h2>
      <div id="countdown" style="background: #111; color: #e10600; padding: 1rem; border-radius: 8px; text-align: center; margin-bottom: 1rem; font-family: monospace; font-size: 1.5rem;">
        Ładowanie czasu do GP...
      </div>
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
  startCountdown();
}
function startCountdown() {
  const target = new Date("March 8, 2026 15:00:00").getTime();
  setInterval(() => {
    const now = new Date().getTime();
    const diff = target - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    const el = document.getElementById("countdown");
    if (el) el.innerHTML = `Do następnego GP: ${days}d ${hours}h ${mins}m ${secs}s`;
  }, 1000);
}
async function renderCalendar() {
  const app = document.getElementById("app");
  app.innerHTML = "<h2>Kalendarz sezonu</h2><p>Pobieranie harmonogramu wyścigów 2025...</p>";

  try {
    const response = await fetch('https://api.openf1.org/v1/sessions?year=2025');
    const sessions = await response.json();

    const races = sessions
      .filter(s => s.session_name === "Race")
      .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));

    if (races.length === 0) {
        app.innerHTML = "<h2>Kalendarz F1 2025</h2><p>Harmonogram na sezon 2025 nie jest jeszcze dostępny w API.</p>";
        return;
    }

    let html = '<h2>Kalendarz F1 2025</h2><div class="calendar-list">';

    races.forEach(race => {
      const raceDate = new Date(race.date_start).toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit'
      });

      html += `
        <div class="race-card">
          <div class="race-date">${raceDate}</div>
          <div class="race-info">
            <div class="race-main-info">
              <span class="race-location">${race.location}</span>
              <span class="race-country">${race.country_name}</span>
            </div>
            <span class="race-circuit">Nazwa toru: ${race.circuit_short_name}</span>
          </div>
        </div>`;
    });

    app.innerHTML = html + "</div>";
  } catch (error) {
    app.innerHTML = "<h2>Błąd</h2><p>Nie udało się załadować danych.</p>";
  }
}
function renderStandings() {
  document.getElementById("app").innerHTML = "<h2>Klasyfikacje</h2><p>Ładowanie...</p>";
}

function renderWinners() {
  document.getElementById("app").innerHTML = "<h2>Zwycięzcy wyścigów</h2><p>Ładowanie...</p>";
}
async function renderDrivers() {
  const app = document.getElementById("app");
  app.innerHTML = "<h2>Kierowcy</h2><p>Pobieranie danych z toru...</p>";

  try {
    const response = await fetch('https://api.openf1.org/v1/drivers?session_key=latest');
    const drivers = await response.json();


    const uniqueDrivers = Array.from(new Map(drivers.map(d => [d.driver_number, d])).values());

    let html = "<h2>Kierowcy (Ostatnia sesja)</h2><div class='grid'>";
    uniqueDrivers.forEach(d => {
      html += `
        <div class="driver-card" style="border-left-color: #${d.team_colour}">
          <a> </a><strong> ${d.full_name}</strong> (${d.driver_number})<br>
          <small>${d.team_name}</small>
        </div>`;
    });
    app.innerHTML = html + "</div>";
  } catch (e) {
    app.innerHTML = "<p>Błąd ładowania kierowców. Sprawdź połączenie.</p>";
  }
}

async function renderConstructors() {
  const app = document.getElementById("app");
  app.innerHTML = "<h2>Konstruktorzy</h2><p>Pobieranie listy zespołów...</p>";

  try {
    const response = await fetch('https://api.openf1.org/v1/drivers?session_key=latest');
    const data = await response.json();
    const teamsMap = new Map();
    data.forEach(d => {
      if (!teamsMap.has(d.team_name)) {
        teamsMap.set(d.team_name, { name: d.team_name, color: d.team_colour });
      }
    });

    let html = '<h2>Zespoły F1 (Sezon 2025)</h2><div class="constructors-list">';

    teamsMap.forEach(team => {

      html += `
        <div class="constructor-card" style="border-left-color: #${team.color}">
          <h3 class="constructor-name">${team.name}</h3>
          <p class="constructor-info">Official F1 Constructor</p>
        </div>`;
    });

    app.innerHTML = html + "</div>";
  } catch (error) {
    app.innerHTML = "<p>Błąd pobierania danych o konstruktorach.</p>";
  }
}

function renderCircuits() {
  document.getElementById("app").innerHTML = "<h2>Dane torów</h2><p>Ładowanie danych o torach wyścigowych...</p>";
}

function renderBasics() {
  const app = document.getElementById("app");

  const glossary = [
    { term: "Airbox", definition: "Wlot powietrza silnika i zarazem element wykorzystywany jako obręcz dachowania." },
    { term: "Aleja serwisowa", definition: "Wydzielony obszar z pasem serwisowym i garażami, gdzie kierowcy wymieniają opony, naprawiają bolidy i zmieniają ustawienia." },
    { term: "Blistering", definition: "Zjawisko „łuszczenia się” opon na skutek przegrzania, prowadzące do odpadania kawałków gumy." },
    { term: "CFD", definition: "Computational Fluid Dynamics – technologia symulacji przepływu powietrza, wspierająca prace w tunelu aerodynamicznym." },
    { term: "Deflektor", definition: "Element między przednimi kołami a środkiem auta, kierujący strugi powietrza w celu poprawy aerodynamiki." },
    { term: "DRS", definition: "Drag Reduction System – system ruchomego skrzydła redukujący opór powietrza, ułatwiający wyprzedzanie na prostych." },
    { term: "FIA", definition: "Federation Internationale del’Automobile – międzynarodowa federacja samochodowa regulująca wyścigi F1." },
    { term: "HANS", definition: "Head And Neck Support – system z włókna węglowego chroniący głowę i kark kierowcy podczas wypadków." },
    { term: "KERS", definition: "System hamowania rekuperacyjnego, odzyskujący energię kinetyczną podczas hamowania." },
    { term: "Nadsterowność", definition: "Utrata przyczepności tylnej osi w zakręcie, powodująca uciekanie tyłu bolidu na zewnątrz." },
    { term: "Opona slick", definition: "Gładkie ogumienie bez bieżnika, przeznaczone do jazdy po suchej nawierzchni dla maksymalnej przyczepności." },
    { term: "Pit Stop", definition: "Zjazd do alei serwisowej na wymianę opon lub naprawę, trwający zazwyczaj około 2-3 sekundy." },
    { term: "Pole Position", definition: "Pierwsze miejsce na starcie wyścigu, zdobywane przez najszybszego kierowcę w kwalifikacjach." },
    { term: "Safety car", definition: "Samochód bezpieczeństwa prowadzący stawkę i ograniczający tempo w razie niebezpieczeństwa na torze." },
    { term: "Telemetria", definition: "System zdalnego przesyłania danych z czujników bolidu do inżynierów w czasie rzeczywistym." }
  ];

  // Sortowanie alfabetyczne
  glossary.sort((a, b) => a.term.localeCompare(b.term));

  let html = `
    <h2>Słowniczek pojęć F1</h2>
    <p>Opanuj techniczny język Formuły 1. Oto kluczowe terminy, które musisz znać:</p>
    <div class="glossary-container">
  `;

  glossary.forEach(item => {
    html += `
      <div class="term-card">
        <span class="term-title">${item.term}</span>
        <p class="term-definition">${item.definition}</p>
      </div>
    `;
  });

  app.innerHTML = html + "</div>";
}

function renderNotFound() {
  document.getElementById("app").innerHTML = `
    <h2>404 – Strona nie znaleziona</h2>
    <p>Wróć do <a href="/" data-route>strony głównej</a>.</p>
  `;
}