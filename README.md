> ⚠️ This is the codebase for ScrollyTeller. To learn how to **use** ScrollyTeller head to: [https://digitalprojects.davidson.edu/scrollytellerdh/](https://digitalprojects.davidson.edu/scrollytellerdh/)

## About

This is a tool for generating scroll-driven webpages from Google Docs.

It is build with svelte and and [sveltekit](https://kit.svelte.dev/docs/introduction) and compiles down to a statically deployable html site. It manages this by `fetching` [published](https://support.google.com/a/users/answer/9308870?hl=en) google doc data clientside and passing it to a client-rendered svelte component (see lib/index.svelte).

## Local Development

First, make sure you have NodeJS 18+ installed on your machine. (This is easily accomplished with [nvm](https://github.com/nvm-sh/nvm).) Then, in the root of the project run `npm i` to install project dependencies, and `npm run dev` to start the app locally.

## Deployment

Everytime a change is pushed to the project's `main` git branch, it triggers a [github action](./.github/workflows/main.yml), which deploys the site's static build output to an FTP server maintained by Davidson College and @jacobheil. Those files are then exposed at [https://digitallearning.davidson.edu/john-michael-murphy/ScrollyTeller/](https://digitalprojects.davidson.edu/scrollytellerdh/).


## Local Dev Examples

http://localhost:5173/v1/embed?id=https://docs.google.com/document/d/e/2PACX-1vRqniFiiapp4jF7Xp69sF5E3nsKqFC-rT0GDIjvTNIDWYJVpsRBCLQjc7vsj-_EHHNGGUx09uBqIorR/pub

http://localhost:5173/v1/embed?id=https://docs.google.com/document/d/1TavVvjGEsgbP22xQ0elc_6_fxHIxjqyLXZhzEE3UA2k

http://localhost:5173/v1/embed?id=https://docs.google.com/document/d/e/2PACX-1vSko0RPSchuL7b3NhZZ9PrEeht0ySxYD23zoXw_gAf4thBDQ1DoTZ1q_tZ4hloXrAOp0X3H--QVVyUn/pub
