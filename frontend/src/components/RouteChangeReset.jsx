import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const RouteChangeReset = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }, [location.pathname]);

  return null;
};

export default RouteChangeReset;
