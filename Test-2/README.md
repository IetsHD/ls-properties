# LS Properties — Tools

Een statische, meerdelige website met makelaarstools: een dashboard, een aankoop-configurator, een stash-upgrade-calculator, een shell-bezichtiging met lightbox, en een handleiding. Alles pure HTML/CSS/JS, geen build-stap of dependencies.

## Bestanden

| Pagina | Bestanden |
|---|---|
| **Dashboard** (startpagina) | `index.html`, `dashboard.css`, `dashboard.js` |
| **Aankoop Eigendom** (configurator) | `aankoop.html`, `script.js` |
| **Stash Upgrade** (calculator) | `stash.html`, `stash.css`, `stash.js` |
| **Bezichtiging Shells** (galerij + lightbox) | `gallery.html`, `gallery.css`, `gallery.js` |
| **Makelaar Handleiding** | `handleiding.html`, `handleiding.css`, `handleiding.js` |
| **Gedeeld** | `style.css` (thema, tokens, header, knoppen, panelen — door alle pagina's gebruikt) |

`index.html` is nu het dashboard met de 4 tool-kaarten en linkt door naar de andere pagina's. Elke pagina heeft een klikbaar logo linksboven en/of een "← Terug naar Dashboard"-link om terug te navigeren.

## Inhoud aanpassen
- **Aankoop Eigendom**: `CONFIG`-object bovenaan `script.js` (shells, tuinen, locatieklasses, afwerking, stash-prijzen, korting).
- **Stash Upgrade**: standaardwaarden in `DEFAULTS` bovenaan `stash.js`; de rekenregel staat in `calculate()`.
- **Bezichtiging Shells**: `SHELLS`-array bovenaan `gallery.js` (naam, verdiepingen, prijs, foto's). Foto's zijn nu placeholders (`photoUrl()`); vervang deze functie door je eigen afbeeldingspaden zodra je eigen renders hebt.
- **Dashboard**: tool-kaarten staan direct in `index.html` binnen `<main class="tools-grid">` — een kaart toevoegen/verwijderen is een kwestie van een `<a class="tool-card">`-blok kopiëren/aanpassen.

## Lokaal bekijken
Dubbelklik op `index.html`, of start een simpele server in deze map:

```bash
python3 -m http.server 8000
```

en open `http://localhost:8000`.

## Op GitHub Pages zetten
1. Maak een nieuwe (of gebruik een bestaande) GitHub-repository.
2. Zet alle bestanden uit deze map in de root van de repository (of in `/docs`).
3. Ga naar **Settings → Pages**.
4. Kies bij **Source** de branch (meestal `main`) en de map (`/root` of `/docs`).
5. Sla op — na een minuut is de site live op `https://<gebruikersnaam>.github.io/<repository-naam>/`, met `index.html` (het dashboard) als startpagina.
