const API = "https://api.openf1.org/v1";


const YEAR = 2025;

async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Błąd HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Błąd podczas pobierania danych:", error);
    return [];
  }
}

async function loadCalendar() {
  const listContainer = document.getElementById("races");
  listContainer.innerHTML = "<p>Ładowanie danych...</p>";

  const data = await fetchJSON(`${API}/meetings?year=${YEAR}`);

  listContainer.innerHTML = "";

  if (!data || data.length === 0) {
    listContainer.innerHTML = "<p>Brak danych o sezonie.</p>";
    return;
  }

  data.forEach((race) => {
    const div = document.createElement("div");
    div.className = "item";
    div.textContent = `${race.meeting_name} (${race.country_name})`;
    listContainer.appendChild(div);
  });
}

function init() {
  console.log("Inicjalizacja aplikacji");
  loadCalendar();
}

init();