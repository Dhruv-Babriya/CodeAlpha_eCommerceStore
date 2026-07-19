# TODO - Improve Mini Social Media App

## Phase 1: UI/UX polish (frontend-first)
- [x] Add sort mode controls (For You / Latest) to feed.
- [ ] Add skeleton/loading placeholders for feed, suggestions, comments.
- [ ] Add ARIA labels to interactive buttons (theme, like, bookmark, delete, comment submit).
- [ ] Improve empty-state messaging to match current filter (Home/Bookmarks/Tag).



## Phase 2: Feed realism
- [ ] Add sort modes in feed: For You (default) + Latest (client-side).
- [ ] Add “Copy link” post action.
- [ ] Persist hashtag filter in URL query (e.g. ?tag=tech).

## Phase 3: Performance/reliability
- [ ] Cache `currentUserFollowing` per session; refresh only after follow/unfollow.
- [ ] Reduce unnecessary reloads when bookmarks feed is active.

## Phase 4: Images & posting
- [ ] Improve image precedence rules when both file and URL exist.
- [ ] Add client-side warning for large images/base64 payload.

## Phase 5: Social graph depth
- [ ] Suggestions widget: show mutual-ish hint based on hashtag overlap (computed from current feed) if backend doesn’t provide mutuals.
- [ ] Refine profile stats display cards.

## Verification checklist
- [ ] Create text-only post.
- [ ] Create image post (gallery upload).
- [ ] Like/unlike updates without full reload.
- [ ] Comment add + load works.
- [ ] Bookmark/unbookmark works.
- [ ] Hashtag filter works and persists on refresh.
- [ ] Follow/unfollow works and updates suggestions.
- [ ] Profile bio + cover + avatar selection saves correctly.

