# YouTube Video Deck
[svenkonings.github.io/Youtube-Video-Deck](https://svenkonings.github.io/Youtube-Video-Deck/)

## Tasks for MVP
- Editor
  - Make style slightly more touch-friendly
  - Add tutorial for dragging subscriptions
  - Add loading animation on save (Also load added subscriptions?)
  - Allow searching subscriptions
  - Fix expand/collapse buttons
  - Improve dnd styles
  - Make filter initially enabled
  - Fix scroll up when dragging subscription after scrolling to bottom of list (dnd library bug?)
- Handle unsubscribe (remove from subscriptions and group)
- Performance optimization with https://github.com/Skayo/svelte-tiny-virtual-list

## Other task ideas
- Add ripple effect to buttons
  - https://css-tricks.com/how-to-recreate-the-ripple-effect-of-material-design-buttons/
- Limit refresh time of cached requests
- Scroll per horizontal item (on small screens)
- Use view width as max deck column width
- Editor button controls
  - Allow selecting element in right-side of editor
  - Add plus button to left-side of editor that adds the subscriptions to or below the selected element
  - Add up/down buttons to right-side of editor
  - Create add all buttons that adds all filtered subscriptions
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
