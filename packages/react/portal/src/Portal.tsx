import * as React from 'react';
import ReactDOM from 'react-dom';
import { useDebugContext } from '@interop-ui/react-debug-context';

type PortalProps = {
  children: React.ReactNode;
  containerRef?: React.RefObject<HTMLElement>;
};

const Portal: React.FC<PortalProps> = ({ children, containerRef }) => {
  const debugContext = useDebugContext();

  // Lazy initialization of the host element
  // This is to make sure we don't recreate a new DOM element on each render
  const [hostElement] = React.useState(getHostElement);

  function getHostElement() {
    if (typeof document !== 'undefined') {
      return document.createElement('radix-portal');
    }

    // bail out of ssr
    return null;
  }

  // We append the host element and remove it when necessary
  React.useEffect(() => {
    if (!hostElement) {
      return;
    }

    // prioritize a custom container set via our `DebugContextProvider`
    if (debugContext.portalContainerRef !== undefined) {
      debugContext.portalContainerRef.current?.appendChild(hostElement);
    }
    // then prioritize a custom container via `containerRef` prop
    else if (containerRef && containerRef.current) {
      containerRef.current.appendChild(hostElement);
    }
    // default to `document.body`
    else {
      document.body.appendChild(hostElement);
    }

    return () => {
      hostElement.remove();
    };
  }, [hostElement, containerRef, debugContext.portalContainerRef]);

  if (hostElement) {
    // Render the children of `Portal` inside the host element
    return ReactDOM.createPortal(children, hostElement);
  }

  // bail out of ssr
  return null;
};

export { Portal };
export type { PortalProps };