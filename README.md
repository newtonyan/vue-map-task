# Vue 3 + TypeScript + Vite

This repo is created for the Pre-Interview Task for the Web Developer position at Accuenergy Canada Inc.

## Requirement
1. A button to allow users to acquire their current location from their browser.
2. A search module that lets users input the name of a location. The search feature is triggered by both button clicks and pressing the enter key on the keyboard.
3. Display the location on a map and add a marker to each searched location every time the location changes.
4. A table with pagination to show all searched places:
   1. Display a maximum of 10 records on each page.
   2. A checkbox at the beginning of each row to let users select multiple records at the same time.
   3. A delete button on the top to remove all selected records as well as their markers on the map.
5. Display the time zone and local time of the latest searched location.

## Developing
You should duplicate `.env.example` and rename the duplicate to `.env`. Then fill in the required variables.

Once you've filled in the environment varialbes and installed dependencies with `pnpm install`, start a development server:

```bash
pnpm run dev
```

## Stack
1. Vue
2. Tailwind Css
3. Heroicons

## Features
1. Responsive UI
2. Saved location will be store in local storage of the browser

## Future Improvements
I am aware that there are some missing pieces, but unfortunately, it will not be completed within this short timeframe.
1. Use toast to display error message
2. Add confirm dialog before deleting location
3. Autocomplete when searching for location
