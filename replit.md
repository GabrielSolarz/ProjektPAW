# F1 Season Summary 2025

## Overview
Strona podsumowująca sezon Formuły 1 2025 z informacjami o:
- Kalendarzu wyścigów
- Klasyfikacji kierowców
- Klasyfikacji konstruktorów
- Zwycięzcach wyścigów

Dane pochodzą z [OpenF1 API](https://openf1.org)

## Technology Stack
- **Frontend**: HTML5, CSS3, vanilla JavaScript
- **Server**: Python http.server (static file serving)
- **Port**: 5000 (Replit frontend)

## Project Structure
```
.
├── index.html          # Główny plik HTML
├── style.css          # Stylesheet
├── script.js          # Logika JavaScript (pobieranie danych z API)
├── server.py          # Serwer HTTP do hostowania
└── replit.md          # Ta dokumentacja
```

## Setup Instructions
1. Projekt jest już skonfigurowany do uruchomienia na porcie 5000
2. Workflow `F1 Server` obsługuje serwowanie aplikacji
3. Serwer automatycznie zostanie uruchomiony po wdrożeniu

## Current Status
- ✅ Struktura HTML przygotowana
- ✅ Serwer HTTP skonfigurowany
- ⏳ CSS i JavaScript do uzupełnienia
- ⏳ Integracja z OpenF1 API do implementacji

## Running Locally
```bash
python3 server.py
# Serwer będzie dostępny na http://0.0.0.0:5000
```

## Next Steps
1. Uzupełnić `style.css` stylem dla aplikacji
2. Uzupełnić `script.js` logią pobierania danych z API
3. Testować funkcjonalność
