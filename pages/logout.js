import { useEffect } from "react";
import { useUser } from "../context/user";

const Logout = () => {
  const { logout } = useUser();
  useEffect(logout, []);

  return <p>Logging Out</p>;
};

export default Logout;
