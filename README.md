# Youtube Video Deck
[svenkonings.github.io/Youtube-Video-Deck](https://svenkonings.github.io/Youtube-Video-Deck/)

## Tasks for MVP
- Editor
  - Style group/sub delete button
  - Make editor smaller for mobile
  - Add drag handle
  - Fix scroll up when dragging subscription
  - Fix scroll when moving groups up/down
  - Allow selecting element in right-side of editor
  - Add plus button to left-side of editor that adds the subscriptions to or below the selected element
  - Add upp/down buttons to groups
  - Create add all buttons that adds all filtered subscriptions
  - Add loading animation on save (Also load added subscriptions?)
- Handle unsubscribe (remove from subscriptions and group)
- Add channel image to subscriptions (in deck and editor)
- Expand / collapse groups (both in deck and editor)
  - Collapse group when dragging
- Truncate subscription overview title

## Other tasks
- Add ripple effect to buttons
  - https://css-tricks.com/how-to-recreate-the-ripple-effect-of-material-design-buttons/
- Limit refresh time of cached requests
- Scroll per horizontal item (on small screens)
- Show add all button on empty subscriptions screen

## On hold due to API quotas
- Requires additional request for every 50 playlistitems
  - Add view counter
  - Add video length
  - Fix upload date for livestreams
- Requires loading entire watched videos playlist
  - Mark (previously) watched videos

## Future feature ideas
- Small player + manage queue
- Add playlists to deck
- Manage watched videos
- Hide/skip watched videos
- Change video sorting
- Show description/comments
- Like/dislike/comment on videos
- Manage subscriptions
- Manage playlists
- Manage watch later
