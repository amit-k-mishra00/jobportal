# TalentBridge AI — Customizable Job Seeker Dashboard + Jerry

This is a front-end demo of the TalentBridge AI job seeker dashboard. It includes a guided walkthrough and Jerry, the simple pixel-art robot assistant.

## Project files

- `pages/dashboard/jdashboard.html` — dashboard structure, profile editor, public/private workspace, theme builder and guide markup.
- `css/dashboard/jdashboard.css` — responsive UI, transitions, animation controls and custom-theme styling.
- `js/dashboard/jdashboard.js` — profile editing, profile visibility, dynamic custom fields, theme editing/import/export, job/application demo interactions, Smart Card and the 23-step guided tour.
- `css/dashboard/jerry-guide/jerry-guide.css` — separate styling for Jerry's assistant panel and mascot.
- `js/dashboard/jerry-guide/jerry-guide.js` — Jerry's context-aware, offline help answers and quick questions.
- `images/jerry-mascot.png` — approved blue-and-white pixel-art Jerry mascot.

## Run locally

Open `pages/dashboard/jdashboard.html` using VS Code Live Server. The page loads its styles, scripts, and Jerry mascot from the project CSS, JavaScript, and images folders.

## Profile customization

The profile editor covers identity, contact details, career direction, employment status, work preferences, experience, education, projects, credentials, achievements, publications, volunteering, languages, interests, social links, resume link, portfolio, and more. The **Your own profile fields** area lets a user create, edit, mark public/private, and remove additional custom fields.

## Public profile and private workspace

- **Public Profile** is a preview of the professional information the user chooses to show. Visibility controls allow individual categories to be enabled or hidden. Custom fields only appear when they are marked public and custom-field visibility is enabled.
- **Private Workspace** provides personal career notes, target role, salary expectations, goals, interview preparation, and search preferences. These values are not included in the public profile preview or copied public-profile text.

## Custom theme builder

Users can set their own theme name, accent, page background, panel, text, sidebar and secondary accent colors; select a font; set corner roundness; preview changes; enable/save/reset the theme; export it to JSON; and import a previously exported theme. The Smart Card can also use the saved custom palette. Dashboard profile/settings data is stored in this browser for the demo.

## Jerry

Jerry introduces himself before starting the 23-step tour. He explains the dashboard tabs and important controls, with Back/Next navigation, a progress bar, keyboard controls, target highlighting, and replay options. His floating help panel answers common website questions offline and offers shortcuts to relevant sections. Jerry gently bobs while idle, shows a typing indicator and speaking animation while answering, and goes to sleep after 60 seconds without page activity. Clicking Jerry wakes him and opens the help panel.

## Jerry idle behavior and safety boundaries

Jerry uses a local, predefined FAQ answer bank; he is not a connected AI service. He cannot call an API, run user-provided code, or retrieve server data. Questions requesting secrets, credentials, private records, internal service details, or exploitation instructions are refused, and such prompts are not echoed into the chat. The guide uses text-only DOM rendering rather than inserting answers as HTML.

These are product-level guardrails, not a security boundary: browser JavaScript is visible to site visitors. Never ship secrets or private user data to the front end. Production authorization and data protection must be enforced on the server.

## Important limitations

This is a client-side design/demo, not a production privacy or account system. Browser `localStorage` is not a secure vault; a user of the same browser profile may inspect it. The Public/Private separation controls the demo UI and preview only. For real public profiles, user accounts, and private data, connect this UI to a backend with authentication, authorization, per-user storage, and server-side public-field allowlists. Job search, apply, share, and other sample interactions are demo behavior unless connected to real services.
