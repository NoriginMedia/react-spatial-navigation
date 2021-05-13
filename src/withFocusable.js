/* eslint-disable react/prop-types */
import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import useFocusable, {FocusContext} from './useFocusable';

const withFocusable = ({
  forgetLastFocusedChild: configForgetLastFocusedChild = false,
  trackChildren: configTrackChildren = false,
  autoRestoreFocus: configAutoRestoreFocus,
  blockNavigationOut: configBlockNavigationOut = false
} = {}) => (WrappedComponent) => {
  const FocusableComponent = React.memo(React.forwardRef(({
    forgetLastFocusedChild = false,
    trackChildren = false,
    autoRestoreFocus = true,
    blockNavigationOut = false,
    ...props
  }, ref) => {
    const focusState = useFocusable({
      ...props,
      forgetLastFocusedChild: (configForgetLastFocusedChild || forgetLastFocusedChild),
      trackChildren: (configTrackChildren || trackChildren),
      blockNavigationOut: (configBlockNavigationOut || blockNavigationOut),
      autoRestoreFocus: configAutoRestoreFocus !== undefined ? configAutoRestoreFocus : autoRestoreFocus
    });

    // Propagate own 'realFocusKey' as a 'parentFocusKey' to it's children
    return (
      <FocusContext.Provider value={focusState.realFocusKey}>
        <BackwardCompatWithFinDOMNode
          nodeRef={focusState.register}
          register={focusState.register}
        >
          <WrappedComponent
            {...props}
            {...focusState}
            register={(element) => {
              focusState.register.current = element;
              if (ref) {
                typeof ref === 'function' ? ref(element) : (ref.current = element);
              }
            }}
          />
        </BackwardCompatWithFinDOMNode>
      </FocusContext.Provider>
    );
  }));

  hoistNonReactStatics(FocusableComponent, WrappedComponent);
  WrappedComponent.displayName = `Focusable(${WrappedComponent.displayName})`;

  return FocusableComponent;
};

/**
 * Once it is required to assign the `register` callback to the focusable child
 * element ref this wrapper will not be necessary, but until there is a major
 * version change this provides backward compatibility and make components
 * focusable by just wrapping in `withFocusable`.
 */
class BackwardCompatWithFinDOMNode extends React.Component {
  componentDidMount() {
    this.setNodeRef();
  }

  componentDidUpdate() {
    this.setNodeRef();
  }

  setNodeRef() {
    if (!this.props.nodeRef.current) {
      this.props.nodeRef.current = this;
    }
  }

  render() {
    return this.props.children;
  }
}

export default withFocusable;
