# Beta QA checklist

Run on **iPhone Safari** and as an **Add to Home Screen** PWA. Repeat once per bus mode (`singleDeck`, `endless`) and player count (2, 4, 8).

## Setup

- [ ] Add and remove players; reset names
- [ ] Switch bus deck mode
- [ ] Start a new game

## Deal

- [ ] Complete all four subphases for every player
- [ ] Wrong and correct guesses; continue gate between guesses
- [ ] Suit round awards 4 drinks on correct guess

## Table

- [ ] Flip all 11 cards in order
- [ ] Multiple hand matches on one table card
- [ ] Correct riders selected for the bus

## Bus intro

- [ ] Zero-rider edge case (if possible with house rules)
- [ ] Start bus with riders

## Bus

- [ ] Wrong guess resets progress and adds drinks
- [ ] Correct Same on card 2 or 3 escapes immediately
- [ ] Four correct guesses in a row escapes
- [ ] Single-deck mode stops when the bus deck runs out

## Persistence

- [ ] Refresh mid-deal: returns to the same deal screen and progress
- [ ] Refresh mid-bus: returns to the bus screen and progress
- [ ] Quit to setup, then refresh: stays on setup with no ghost resume

## PWA

- [ ] Offline play after first load
- [ ] Portrait lock overlay in landscape
- [ ] Safe area on a notched device

## History

- [ ] Drink totals look correct
- [ ] Bus rider aggregate entries are readable

## Notes

Record mismatches against [README](../README.md) rules and in-app rules content.
