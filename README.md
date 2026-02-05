# github-light 

My own take on a github ui, no fluff, fast route to find the right repo you're looking for.

## WHAT
- A simple TanStack Start app with two pages: login with GitHub and a projects page.
- The projects page lists all your projects, grouped by org/user.
- A search bar at the top filters repo names and user/org names.
- Login with GitHub via an OAuth app. The app requests permissions, and only orgs the token has access to will appear.
- Hint for missing repos: `Can't find your repo? Check permissions here and activate the missing user/org`.

## WHY
Navigating GitHub sucks. It takes too many clicks to find the right repo. The dashboard search only searches your own org repos by default, which makes cross-org discovery harder than it should be.
