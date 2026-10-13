import React, { useState } from "react";
import Signin from "./Signin";
import DriverSuccess from "./DriverSuccess";
import ParentSuccess from "./ParentSuccess";
import Admin from "./Admin";

function App() {
  const [user, setUser] = useState(null); // lưu object user
  const [tenTK, setTenTK] = useState("admin"); // username
  const [matkhau, setMatkhau] = useState("g5bus"); // password

  // Sau khi login thành công
  const handleLogin = (userObj) => {
    setUser(userObj);
  };

  // Sau khi đăng xuất
  const handleLogout = () => {
    setUser(null);
    setTenTK("");
    setMatkhau("");
  };

  return (
    <div className="App">
      {!user ? (
        <Signin
          tenTK={tenTK}
          setTenTK={setTenTK}
          matkhau={matkhau}
          setMatkhau={setMatkhau}
          onLogin={handleLogin}
        />
      ) : user.role === "admin" ? (
        <Admin user={user} onLogout={handleLogout} />
      ) : user.role === "driver" ? (
        <DriverSuccess user={user} onLogout={handleLogout} />
      ) : (
        <ParentSuccess user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
