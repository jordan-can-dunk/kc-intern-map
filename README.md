## Project History

This branch (`original-design`) is the original, hand-built version of the KC Intern Map — I built it manually, going through the code chunk by chunk and file by file until I understood exactly how each piece worked. I used this first version to understand the code and make a solid base for my future versions to work off of.

After finishing this manual build, I wanted to get experimental with AI-assisted development, to see what frontend I could rebuild by prompting an AI instead of writing it myself. I used Claude Fable 5 to rebuild the frontend twice, and each of those rebuilds is stored on its own separate branch in this same repository — this branch is not one of those experiments.

This branch (original-design) is the foundation the other two are built from: a simple design, but one I fully understand from the ground up, which makes it easy to compare how the approach and results differ across the AI-assisted versions.

  1.**Original manual build (this branch) ** — the base version I built file by file.
  2.First AI design (see more explaination on the first-AI-design branch) — the frontend rebuilt by prompting Claude Fable 5, no plugins/add-ons.
  3.Second AI design (see more explaination on the main branch) — the second frontend rebuild with Claude Fable 5.


# KC Intern Map

An interactive map for interns in Kansas City to share and discover their favorite spots around the city — restaurants, parks, hangouts, whatever's worth visiting. The idea is simple: interns often only have a summer (or a semester) to explore a new city, and the best recommendations usually come from other interns, not a generic guide. This app is meant to help interns pin the places they love so others — especially those coming from out of town — can find good spots faster, while also giving KC locals a fun way to see the city through other interns' eyes.

## Features

- Interactive map of Kansas City you can zoom and pan around
- Red pin markers showing places interns have submitted
- Multiple interns can pin the same place — each submission gets its own marker, even at the same location
- Click a pin to see a quick preview (name, rating, short description), then jump to a full detail page
- Detail page includes a photo carousel, star rating, description, tips, a mini-map, and an "Open in Google Maps" button
- Add-a-pin form for submitting a new place — name, rating, description, optional tips, a required photo, and an optional name (or post anonymously)
- No login or account required

## Tech Stack

| Tool | Role |
|---|---|
| Vue.js 3 | UI framework — organizes the app into components |
| Vite | Build tool — runs the dev server and bundles for production |
| Vue Router | Manages navigation between the map, detail, and form screens |
| Leaflet.js | Interactive map library |
| @vue-leaflet/vue-leaflet | Integrates Leaflet cleanly into Vue components |
| OpenStreetMap | Free map tiles — no API key needed |
| Cloudinary | Free-tier cloud photo storage for user-submitted photos |
| Node.js 22 LTS | JavaScript runtime |
| npm | Package manager |

## Project Setup

Requires Node 22 (this project was built and tested on v22.22.3).

```bash
# install dependencies
npm install

# start the local dev server
npm run dev
```

Then open the local URL shown in the terminal (usually `http://localhost:5173`) in your browser.
