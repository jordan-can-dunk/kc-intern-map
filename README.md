## Project History

This project started as a version of the KC Intern Map that I built manually by hand. After getting familiar with that base code, I wanted to experiment with AI-assisted development to see how much of the frontend I could redo by prompting an AI instead of writing it myself.

This repository/branch represents that experiment: I cloned my original, manually-built version and used **Claude Fable 5** — prompted directly, with no external tools, plugins, or add-ons — to rebuild the frontend. Because it was a single well-crafted prompt with no extra tooling, this isn't a showcase of everything Fable 5 is capable of; it's a snapshot of what's was achieveable for me with only prompting it.

This branch (`first-AI-design`) exists specifically so the progression is visible over time:

1. **Original manual build (original-design branch) ** — the base version I built file by file.
2. **First AI design (this branch)** — the frontend rebuilt by prompting Claude Fable 5, no plugins/add-ons.
3. **Second AI design (main branch)** — the second frontend rebuild with Claude Fable 5.

The goal is to keep each stage as its own visible step, so the change in approach and results is easy to compare over time.

# KC Intern Map Repo

An interactive map for interns in Kansas City to share and discover their favorite spots around the city — restaurants, parks, hangouts, whatever's worth visiting. The idea is simple: interns often only have a summer (or a semester) to explore a new city, and the best recommendations usually come from other interns, not a generic guide. This app is meant to help interns pin the places they love so others — especially those coming from out of town — can find good spots faster, while also giving KC locals a fun way to see the city through other interns' eyes.

## Tech Stack

- [Vue 3](https://vuejs.org/) + [Vite](https://vite.dev/)
- [Leaflet](https://leafletjs.com/) via [@vue-leaflet/vue-leaflet](https://github.com/vue-leaflet/vue-leaflet) for the interactive map
- [Vue Router](https://router.vuejs.org/)

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

