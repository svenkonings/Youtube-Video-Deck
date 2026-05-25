# TODO

- Add loading of videos again
- Add cache for subscription and playlists
- Add editorVisible context?
- Add cache for videos

# Notes

- PlaylistCache can be a global map
- Subscriptions can be a global map
- A channel is an id, and we retrieve a title + thumbnail
  - We can avoid retrieving the subscriptions from YouTube and just store them in the database
- A playlist can be:
  - A channel with multiple playlists for uploaded videos
  - A custom playlist
- A group is a collection of playlists
  - Should a subscription just have a single playlist and a group of the same
- Description does not need to be loaded separately?
- Comments can be cached on Video resource
- What is the distinction between types and model?

- Choice 1: Do we want subscriptions (synced with currently subscribed list) or channels (will not be removed after
  unsub)
  - Subscriptions
    - Automatically updates if channel changes name or thumbnail
    - Autmatically removed on unsubscribe
    - Requires additional API calls on load
  - Channels
    - Loads faster
    - Does not require subscribing to be added
    - We could still update channel titles or thumbnails based on the ID if we wanted
  - Result: We will use channels
- Choice 2: Should a group be a collection of channels (and channels have playlists) or a collection of playlists (and
  if they are all from the same channel the group is displayed as a channel)
  - Collection of channels
    - Easier to enable/disable different playlists
    - Easier to disinguish between groups
    - Custom playlists require adding a channel first (though every playlist has a channel)
  - Collection of playlists
    - Can add playlist without adding channel
  - Result: A group is a collection of channels, and a channel has a collection of playlists
- Choice 3: How will we model the playlist belonging to a channel
  - Playlist can be a prefix based on the channel filters
  - Playlist can be a custom playlistId
  - Should we store the prefix or the booleans selected?
    - Prefixes might be easier to optimize?

# TODO

- DONE: Models for new playlist structure with filters
- DONE: Settings for filters
- DONE: Migrate old mongoDB structure
- DONE: Create settings based on subscription playlists
- DONE: Create subscription playlists based on settings
- DONE: Split up model
- Edit filters
  - UI
  - API
  - database

# Future feature ideas

- Filter videos/livestreams/shorts/membersonly
- Custom playlists
- Custom channels
- Change video sorting
- Manage queue
- Add playlists to deck
- Manage watched videos
- Hide/skip watched videos
- Like/dislike/comment on videos
- Search Deck for subscriptions/videos
- Search YouTube
- Manage subscriptions
- Manage playlists
- Manage watch later

# Potential improvements

- Reuse animation after loading from old version
- Add support for Youtube Lounge API
- Apply transitions where applicable
- Check screen reader support
- Improve editor loading animation on save
  - Also include loading new subscription groups
- Add ripple effect to buttons
  - https://css-tricks.com/how-to-recreate-the-ripple-effect-of-material-design-buttons/
- Limit refresh time of cached requests
- Performance optimization with https://github.com/Skayo/svelte-tiny-virtual-list
- Scroll per horizontal item (on small screens)
- Editor button controls
  - Allow selecting element in right-side of editor
  - Add plus button to left-side of editor that adds the subscriptions to or below the selected element
  - Add up/down buttons to right-side of editor
  - Create add all buttons that adds all filtered subscriptions
- Show add all button on empty subscriptions screen
- Fix video order for livestreams
- Bring Your Own API-Key (BYOAK)

# On hold due to API quotas

- Requires loading entire watched videos playlist
  - Mark (previously) watched videos
