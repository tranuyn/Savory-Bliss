import React from "react";
import { useSelector } from "react-redux";

function Home() {
  const { user } = useSelector((state) => state.auths);
  return <div>Chào {user?.username}</div>;
}

export default Home;
