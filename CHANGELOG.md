# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.12.5]
### Added
- Added `blockNavigationOut` to avoid focus out from the selected component.

## [2.12.4]
### Fixed
- Fixed issue where this library didn't work in SSR environments due to references to DOM-only variables
- Fixed few issues with referencing non-existing APIs in React Native environments

## [2.12.3]
### Added
- added `throttleKeypresses` to prevent canceling of throttled events for individual key presses

## [2.12.2]
### Changed
- update layouts at the beginning of smartNavigate instead of after setFocus

## [2.12.1]
### Fixed
- Fixed regression with using `autoRestoreFocus` on components that are focused + getting unmounted and don't have parent

## [2.12.0]
### Added
- added `autoRestoreFocus` prop to control whether parent component should restore focus on any available child when a currently focused child component is unmounted.

## [2.11.0]
### Changed
- `onBecameBlurred` and `onBecameFocused` are always invoked synchonously with focus change and not on componentDidUpdate
### Added
- `setFocus` and `navigateByDirection` accept an details object, this object is passed back on `onBecameBlurred` and `onBecameFocused` callbacks

## [2.10.0]
### Changed
- Changed behaviour of `onBecameFocused`, now it's invoked also in case of stealFocus
### Added
- Added `onBecameBlurred` with the same behaviour of `onBecameFocused` but invoked on component losing focus

## [2.9.3]
### Added
- Added `KeyDetails` param on callback functions `onEnterPress` and `onArrowPress`

## [2.9.2]
### Fixed
- Fixed issue #46 Focus jumps on wrong component: Removed `setTimeout` in `measureLayout` to avoid coordinates mismatches with DOM nodes.

## [2.9.1]
### Added
- Added a testing library (`Jest`).
- Added a private function `getNearestChild` that helps to find the nearest child by coordinates.
- Added a unit test of `getNearestChild`.
### Removed
- Removed old logic of finding the nearest child by coordinates of `getNextFocusKey` method (We use the `getNearestChild` function instead).

## [2.9.0]
### Added
- Added smart focusing by direction (left, right, top, down), if you can't use buttons or focusing by key. Use `navigateByDirection` method for it.


## [2.8.4]
### Fixed
- Fixed useless `logIndex` update.

## [2.8.3]
### Fixed
- Fixed missing reference to a component in native mode

## [2.8.2]
### Added
- Added guard checks for Enter press and Arrow press to check whether component exists

## [2.8.1]
### Added
- Added a copy of "node" ref to "layout" to also have it onBecameFocused callback

## [2.8.0]
### Removed
- `dist` folder is removed from source. It is generated only when publishing to NPM now.

## [2.7.2]
### Changed
- Allowed components to be focused with `setFocus` even if they have `focusable={false}`

## [2.7.1]
### Added
- `focusable` prop that enables component as a focusable target. Default is true. Usable when you need to temporarily disable focusable behaviour on the component. E.g. disabled button state.
### Changed
- Moved `react` and `react-dom` to peer dependencies

## [2.6.0]
### Fixed
- Key up triggers `.cancel()` instead of `.flush()`
### Added
- Throttling now applies options to disable trailing functions

## [2.5.0]
### Fixed
- Throttling is now only applied if the throttle option supplied was greater than 0
### Added
- Key up now flushes any throttled input

## [2.4.0]
### Added
- added support for `onArrowPress` property, it enables to add a custom behavior when arrows are pressed and can prevent the default navigation.

## [2.3.2]
### Fixed
- Fixed an issue where the `lastFocusedChildKey` were not saved for all focusable parents when focus is jumping to another tree branch with `setFocus`.

## [2.3.1]
### Added
- Added [throttle](https://github.com/NoriginMedia/react-spatial-navigation#initialization-config) property to throttle the function fired by the event listener.

## [2.3.0]
### Added
- Added support for Native environment. Now if the service is initialized with `nativeMode` flag, it will skip creating window event listeners, measuring coordinates and other web-only features. It will still continue to register all focusable components and update `focused` flag on them.
- Added new method `stealFocus` to `withFocusable` hoc. It works exactly the same as `setFocus` apart from that it doesn't care about arguments passed to this method. This is useful when binding it to a callback that passed some params back that you don't care about.

## [2.2.1]
### Changed
- Improved the main navigation algorithm. Instead of calculating distance between center of the borders between 2 items in the direction of navigation, the new algorithm now prioritises the distance by the main coordinate and then takes into account the distance by the secondary coordinate. Inspired by this [algorithm](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox_OS_for_TV/TV_remote_control_navigation#Algorithm_design)

### Removed
- Removed `propagateFocus` config option and prop for `withFocusable` HOC because it was always used for items with children items anyway

## [2.1.0]
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
