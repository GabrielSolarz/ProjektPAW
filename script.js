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
      <h1>Czym jest F1Results?</h1>
      <p>F1Results to aplikacja, która pozwala na przeglądanie danych z wyścigów Formuły 1. Możesz tutaj znaleźć informacje
      o kierowcach, zespołach, torach, kalendarzu sezonu, klasyfikacjach i zwycięzcach wyścigów.</p>
      <p>Dodatkowo, w sekcji "F1 dla Topornych" znajdziesz słowniczek pojęć, które pomogą Ci zrozumieć świat Formuły 1.</p>
      <h3>Jak korzystać z aplikacji?</h3>
      <p>Wybierz jedną z sekcji powyżej, aby przeglądać dane.</p>
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
let allDriversCached = [];

async function renderDrivers(page = 1) {
  const app = document.getElementById("app");
  const API_SPORTS_KEY = "f8d0ae2e7bb139f17feecd13494c1d44";
  const itemsPerPage = 10;

  app.innerHTML = "<h2>Kierowcy</h2><p>Ładowanie strony ${page}...</p>";

  try {

    if (allDriversCached.length === 0) {
      const openF1Res = await fetch('https://api.openf1.org/v1/drivers?session_key=latest');
      const openF1Data = await openF1Res.json();
      allDriversCached = Array.from(new Map(openF1Data.map(d => [d.driver_number, d])).values());
    }
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const driversToShow = allDriversCached.slice(start, end);

    let html = `<h2>Kierowcy F1 (Strona ${page})</h2><div class="drivers-grid">`;
    for (const d of driversToShow) {
      const sportsRes = await fetch(`https://v1.formula-1.api-sports.io/drivers?search=${d.last_name}`, {
        method: "GET",
        headers: {
          "x-rapidapi-key": API_SPORTS_KEY,
          "x-rapidapi-host": "v1.formula-1.api-sports.io"
        }
      });
      const sportsData = await sportsRes.json();
      const sportsDetail = (sportsData.response && sportsData.response.length > 0) ? sportsData.response[0] : null;

      const driverImg = sportsDetail ? sportsDetail.image : 'https://placehold.co/200x200/15151e/white?text=No+Photo';

      html += `
        <div class="driver-card" style="border-left: 6px solid #${d.team_colour}">
          <div class="driver-content">
            <img src="${driverImg}" class="driver-photo" alt="${d.full_name}">
            <div class="driver-info">
              <span class="driver-number">#${d.driver_number}</span>
              <h3 class="driver-name">${d.full_name}</h3>
              <p class="driver-team">${d.team_name}</p>
              ${sportsDetail ? `
                <div class="driver-stats-extra">
                  <span>Tytuły: <strong>${sportsDetail.world_championships}</strong></span>
                  <span>Podia: <strong>${sportsDetail.podiums}</strong></span>
                </div>` : ''}
            </div>
          </div>
        </div>`;
    }

    html += `</div><div class="pagination-container">`;
    if (page > 1) html += `<button onclick="renderDrivers(${page - 1})" class="nav-btn">Poprzednia 10</button>`;
    if (end < allDriversCached.length) html += `<button onclick="renderDrivers(${page + 1})" class="nav-btn">Następna 10</button>`;
    html += `</div>`;

    app.innerHTML = html;

  } catch (error) {
    app.innerHTML = "<p>Błąd ładowania. Możliwe, że wyczerpałeś limit 10 zapytań na minutę. Odczekaj chwilę.</p>";
  }
}
async function renderConstructors() {
  const app = document.getElementById("app");
  app.innerHTML = "<h2>Konstruktorzy</h2><p>Łączenie danych z wielu źródeł...</p>";

  const API_SPORTS_KEY = "f8d0ae2e7bb139f17feecd13494c1d44"

  try {
    const openF1Res = await fetch('https://api.openf1.org/v1/drivers?session_key=latest');
    const openF1Data = await openF1Res.json();
    const openF1Teams = new Map();
    openF1Data.forEach(d => {
      if (!openF1Teams.has(d.team_name)) {
        openF1Teams.set(d.team_name, { name: d.team_name, color: d.team_colour });
      }
    });

    const sportsRes = await fetch('https://v1.formula-1.api-sports.io/teams', {
      method: "GET",
      headers: {
        "x-rapidapi-key": API_SPORTS_KEY,
        "x-rapidapi-host": "v1.formula-1.api-sports.io"
      }
    });
    const sportsData = await sportsRes.json();
    const allTeamsFromSports = sportsData.response;

    let html = '<h2>Zespoły Formuły 1</h2><div class="constructors-list">';

    openF1Teams.forEach(openTeam => {
      const sportsDetail = allTeamsFromSports.find(t => 
        openTeam.name.toLowerCase().includes(t.name.toLowerCase()) || 
        t.name.toLowerCase().includes(openTeam.name.toLowerCase())
      );
      html += `
        <div class="constructor-card" style="border-left-color: #${openTeam.color}">
          <div class="constructor-header">
            ${sportsDetail ? `<img src="${sportsDetail.logo}" class="team-logo" alt="Logo ${openTeam.name}">` : ''}
            <div>
              <h3 class="constructor-name">${openTeam.name}</h3>
              <p class="constructor-info">Baza: ${sportsDetail ? sportsDetail.base : 'Brak danych'}</p>
            </div>
          </div>
          ${sportsDetail ? `
            <div class="team-tech-details">
              <p><strong>Szef:</strong> ${sportsDetail.director}</p>
              <p><strong>Silnik:</strong> ${sportsDetail.engine}</p>
              <p><strong>Nazwa bolidu:</strong> ${sportsDetail.chassis}</p>
            </div>
          ` : ''}
        </div>`;
    });

    app.innerHTML = html + "</div>";
  } catch (error) {
    console.error("Błąd podczas łączenia API:", error);
    app.innerHTML = "<p>Błąd podczas pobierania danych zespołów.</p>";
  }
}

async function renderCircuits() {
  const app = document.getElementById("app");
  app.innerHTML = "<h2>Tory wyścigowe</h2><p>Pobieranie szczegółowych danych z API-Sports...</p>";

  const API_KEY = "f8d0ae2e7bb139f17feecd13494c1d44"

  try {
    const response = await fetch('https://v1.formula-1.api-sports.io/circuits', {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'v1.formula-1.api-sports.io'
      }
    });

    const result = await response.json();
    const circuits = result.response;

    let html = '<h2>Tory Formuły 1 (Również te historyczne)</h2><div class="circuits-grid">';

    circuits.forEach(circuit => {
      const trackName = circuit.name;
      const trackImg = circuit.image;
      const location = `${circuit.competition.location.city}, ${circuit.competition.location.country}`;
      const lapRecord = circuit.lap_record;

      html += `
        <div class="circuit-card">
          <div class="circuit-image-container">
            <img src="${trackImg}" 
                 alt="Nitka toru ${trackName}" 
                 class="circuit-image"
                 onerror="this.onerror=null; this.src='https://placehold.co/400x200/15151e/white?text=F1+Circuit';">
          </div>
          <div class="circuit-details">
            <span class="circuit-name">${trackName}</span>
            <span class="circuit-location">${location}</span>
            <div class="circuit-stats">
              <p><strong>Długość:</strong> ${circuit.length}</p>
              <p><strong>Liczba okrążeń:</strong> ${circuit.laps}</p>
              ${lapRecord.time ? `
                <div class="lap-record">
                  <strong>Rekord:</strong> ${lapRecord.time} 
                  <small>(${lapRecord.driver}, ${lapRecord.year})</small>
                </div>
              ` : ''}
            </div>
          </div>
        </div>`;
    });

    app.innerHTML = html + "</div>";
  } catch (error) {
    console.error("Błąd API-Sports:", error);
    app.innerHTML = "<h2>Błąd</h2><p>Nie udało się pobrać danych. Sprawdź swój klucz API.</p>";
  }
  footer.innerHTML ="<p> Dane pochodzą z <a>api-sports.io</a></p>"
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