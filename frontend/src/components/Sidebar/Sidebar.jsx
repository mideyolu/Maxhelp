import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemPrefix,
  Typography,
  Button,
} from "@material-tailwind/react";
import { FaHome, FaBox, FaUsers, FaBell, FaBackward } from "react-icons/fa";
import { CiLogout } from "react-icons/ci";
import { FiMenu } from "react-icons/fi"; // Hamburger icon
import { IoMdLogOut } from "react-icons/io";

const Sidebar = ({ username, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role , setRole] = useState('')

  useEffect(()=>{
    const storedRole = localStorage.getItem("role");

    if (storedRole){
      setRole(storedRole)
    }

  },[])

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("employee_email");
    navigate("/");
  };

  return (
      <div
          className={`${
              sidebarOpen ? "w-[250px]" : "w-[100px]"
          } fixed top-0 left-0 h-full bg-blue-gray-700 p-4 justify-center space-y-6 flex items-start flex-col transition-width z-10 duration-300 md:w-[190px] lg:w-[250px]`}
      >
          <div className="flex flex-col justify-between items-center w-full">
              {/* Hamburger Menu for small screens */}
              <Button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden border-none text-white"
                  variant="outlined"
              >
                  {sidebarOpen ? (
                      <IoMdLogOut size={24} />
                  ) : (
                      <FiMenu size={24} />
                  )}
              </Button>
              <img
                  src="/admin.svg"
                  alt="Logo.png"
                  className="mb-6 w-2/4 md:w-[60%] flex items-center justify-start  md:block"
              />
          </div>

          {!sidebarOpen && (
              <Typography
                  variant="h5"
                  color="white"
                  className="mb-8 hidden md:block text-center text-[1.03rem]"
              >
                  Welcome Back{" "}
                  {username.charAt(0).toUpperCase() + username.slice(1)}
              </Typography>
          )}
          {sidebarOpen && (
              <Typography
                  variant="h6"
                  color="white"
                  className="mb-8 text-center"
              >
                  Welcome Back{" "}
                  {username.charAt(0).toUpperCase() + username.slice(1)}
              </Typography>
          )}

          {/* Sidebar Navigation */}
          <List className="w-full space-y-4 text-white">
              {/* Sidebar items go here */}

              <div
                  className="cursor-pointer hover:bg-white hover:bg-opacity-30 transition-colors duration-300 px-4 py-2 rounded-md flex"
                  onClick={() => handleNavigate("/dashboard")}
              >
                  <ListItemPrefix>
                      <FaHome className="text-white" />
                  </ListItemPrefix>
                  <span
                      className={`${sidebarOpen ? "block" : "hidden"} md:block`}
                  >
                      Dashboard
                  </span>
              </div>

              <div
                  className="cursor-pointer hover:bg-white hover:bg-opacity-30 transition-colors duration-300 px-4 py-2 rounded-md flex"
                  onClick={() => handleNavigate("/inventory")}
              >
                  <ListItemPrefix>
                      <FaBox className="text-white" />
                  </ListItemPrefix>
                  <span
                      className={`${sidebarOpen ? "block" : "hidden"} md:block`}
                  >
                      Inventory
                  </span>
              </div>

              {role !== "employee" && (
                  <div
                      className="cursor-pointer hover:bg-white hover:bg-opacity-30 transition-colors duration-300 px-4 py-2 rounded-md flex"
                      onClick={() => handleNavigate("/admin-employees")}
                  >
                      <ListItemPrefix>
                          <FaUsers className="text-white" />
                      </ListItemPrefix>
                      <span
                          className={`${
                              sidebarOpen ? "block" : "hidden"
                          } md:block`}
                      >
                          Employee
                      </span>
                  </div>
              )}

              <div
                  className="cursor-pointer hover:bg-white hover:bg-opacity-30 transition-colors duration-300 px-4 py-2 rounded-md flex"
                  onClick={() => handleNavigate("/feedbacks")}
              >
                  <ListItemPrefix>
                      <FaBackward className="text-white" />
                  </ListItemPrefix>
                  <span
                      className={`${sidebarOpen ? "block" : "hidden"} md:block`}
                  >
                      Feedback
                  </span>
              </div>

              {role !== "employee" && (
                  <div
                      className="cursor-pointer hover:bg-white hover:bg-opacity-30 transition-colors duration-300 px-4 py-2 rounded-md flex"
                      onClick={() => handleNavigate("/notifications")}
                  >
                      <ListItemPrefix>
                          <FaBell className="text-white" />
                      </ListItemPrefix>
                      <span
                          className={`${
                              sidebarOpen ? "block" : "hidden"
                          } md:block`}
                      >
                          Notifications
                      </span>
                  </div>
              )}

              <ListItem
                  className="cursor-pointer hover:bg-white hover:bg-opacity-30 transition-colors duration-300 px-4 py-2 rounded-md"
                  onClick={handleLogout}
              >
                  <ListItemPrefix>
                      <CiLogout className="text-white" />
                  </ListItemPrefix>
                  <span
                      className={`${sidebarOpen ? "block" : "hidden"} md:block`}
                  >
                      Logout
                  </span>
              </ListItem>
          </List>
      </div>
  );
};

export default Sidebar;
