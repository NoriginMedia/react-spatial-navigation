# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Added more docs regarding preemptive `setFocus` on non-existent components
- Added `preferredChildFocusKey` property to set focus on a specific component during focus propagation

### Changed
- Save parent `lastFocusedChildKey` when a new component is focused

## [2.0.6]
This release has few versions combined from v2.0.2.

### Removed
- Implicit logic for setting focus to own focus key if target focus key component doesn't exist

### Changed
- Optimized `onUpdateHasFocusChild` callback for `withFocusable` HOC. It is called only on components with `trackChildren` prop or config setting now
- Updated docs to reflect the publishing to NPM

### Added
- Published NPM package

## [2.0.2]
### Fixed
- Orphan DOM nodes problem

## [2.0.1]
### Added
- Added Debug and Visual debug modes

### Changed
- Changed the way of how the sibling components are filtered in `smartNavigate` method.

## [2.0.0]
### Added
- Added Documentation
- Added this Changelog

### Changed
- Refactored the way how the system stores the current focus key and updates changed components. Before it was stored in Context which caused performance bottleneck when each component got updated to compare Context current focus key with the each component's focus key. Now it is stored only in Spatial Navigation service and only 2 components are updated by directly calling state handlers on them.

### Removed
- Removed Context

## [Older versions]
Changelog not maintained.
