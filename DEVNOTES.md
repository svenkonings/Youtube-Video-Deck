# Potential improvements
- Apply transitions where applicable
- Check screen reader support
- Improve editor loading animation on save
    - Also include loading new subscription groups
- Add ripple effect to buttons
    - https://css-tricks.com/how-to-recreate-the-ripple-effect-of-material-design-buttons/
- Limit refresh time of cached requests
- Use new google sign-in library
    - Find a way to preserve auth states through reloads
- Performance optimization with https://github.com/Skayo/svelte-tiny-virtual-list
- Scroll per horizontal item (on small screens)
- Editor button controls
    - Allow selecting element in right-side of editor
    - Add plus button to left-side of editor that adds the subscriptions to or below the selected element
    - Add up/down buttons to right-side of editor
    - Create add all buttons that adds all filtered subscriptions
- Show add all button on empty subscriptions screen
- Bring Your Own API-Key (BYOAK)

# On hold due to API quotas
- Requires additional request for every 50 playlistitems
    - Add view counter
    - Add video length
    - Fix upload date for livestreams
- Requires loading entire watched videos playlist
    - Mark (previously) watched videos

# Future feature ideas
- Small player + manage queue
- Add playlists to deck
- Manage watched videos
- Hide/skip watched videos
- Change video sorting
- Show description/comments
- Like/dislike/comment on videos
- Search Deck for subscriptions/videos
- Search YouTube
- Manage subscriptions
- Manage playlists
- Manage watch later