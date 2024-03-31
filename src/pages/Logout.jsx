import { useNavigate } from "react-router-dom";
import { useAuth } from "../provider/AuthProvider";
import { useEffect } from "react";

const Logout = () => {
  const { clearToken } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    handleLogout();
  });

  return <>Logout Page</>;
};

export default Logout;
