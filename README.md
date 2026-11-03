# Portfolio

My portfolio site: about me, skills, projects, and one game. Hosted on AWS Amplify Hosting.

Live: https://main.d19m42yv0uwefa.amplifyapp.com

## The creative feature: Catch the AI

The portfolio has a small game, and three visible hints lead to it: a teaser card at the top of the
page, a "Can you catch the AI?" button, and a floating "Catch the AI" button that stays in the
corner. Visitors see a maths question and the answer Claude Haiku 4.5 actually gave in my
benchmark, with no tools. They guess whether it's right, then run the code that checks it, which
runs right in the browser. Six of the ten questions have a wrong AI answer, four a right one, and
each game picks five at random.

It's the idea behind all my projects as a 30-second game: a language model sounds sure, and
running the code shows whether it's right.

- The questions and AI answers come from the
  [Escalator benchmark](https://github.com/Swayam-Ch/escalator/tree/run-python-tool) (`bench/calc_questions.jsonl`).
- The game is a `<dialog>`: Esc or a click outside closes it, focus returns to the button that
  opened it, and the rest of the page stays usable.

## AWS

- **AWS Amplify Hosting** serves the site from this repository. Every push to `main` is built and
  deployed automatically ([`amplify.yml`](amplify.yml) serves the `site/` folder; there is no build
  step).
- Amplify Hosting puts the site on Amazon CloudFront, so it loads quickly worldwide over HTTPS.

## Run it locally

```bash
python3 -m http.server 8000 --directory site
```

Then open http://localhost:8000.

## Layout

```
site/index.html    the page: about, superpowers, projects, achievements, contact
site/styles.css    styles, including the mobile layout
site/game.js       Catch the AI: the questions, the code that checks them, the game
site/assets/       images from my projects, the Inter font (OFL), the favicon
amplify.yml        Amplify Hosting build settings
```

## Licence

Code: MIT. The Inter font is under the SIL Open Font License (`site/assets/Inter-LICENSE.txt`).
