import { useEffect } from "react";
import { useUser } from "../context/user";

const Login = () => {
  const { login } = useUser();
  useEffect(login, []);
  return <p>Logging In</p>;
};

export default Login;
