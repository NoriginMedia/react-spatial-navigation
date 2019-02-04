import React from 'react';
import {setDisplayName, wrapDisplayName} from 'recompose';

const SpatialNavigationContext = React.createContext();

export const withSpatialNavigationContext = (BaseComponent) => {
  const WithSpatialNavigationContext = (ownerProps) => {
    const {
      setFocus,
      currentFocusKey,
      parentsHavingFocusedChild,
      ...restProps
    } = ownerProps;

    const contextData = {
      setFocus,
      currentFocusKey,
      parentsHavingFocusedChild
    };

    return (<SpatialNavigationContext.Provider value={contextData}>
      <BaseComponent
        {...contextData}
        {...restProps}
      />
    </SpatialNavigationContext.Provider>);
  };

  if (process.env.NODE_ENV !== 'production') {
    return setDisplayName(wrapDisplayName(BaseComponent, 'withSpatialNavigationContext'))(WithSpatialNavigationContext);
  }

  return WithSpatialNavigationContext;
};

export const getSpatialNavigationContext = (BaseComponent) => {
  const GetSpatialNavigationContext = (ownerProps) => (<SpatialNavigationContext.Consumer>
    {(context) => (<BaseComponent
      {...context}
      {...ownerProps}
    />)}
  </SpatialNavigationContext.Consumer>);

  if (process.env.NODE_ENV !== 'production') {
    return setDisplayName(wrapDisplayName(BaseComponent, 'withSpatialNavigationContext'))(GetSpatialNavigationContext);
  }

  return GetSpatialNavigationContext;
};
