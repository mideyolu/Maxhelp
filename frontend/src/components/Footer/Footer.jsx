import React from "react";
import { Typography, Button } from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { TbHomeDown } from "react-icons/tb";
import { IoPeopleSharp } from "react-icons/io5";

const Footer = () => {
  return (
    <footer className="bg-blue-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Column 1: Brand */}
          <div>
            <Typography
              as="h2"
              variant="h6"
              className="mb-4 font-bold text-lg text-white"
            >
              MaxHelp Enterprises
            </Typography>
            <Typography className="text-sm text-blue-gray-300">
              Empowering businesses with reliable solutions and innovative
              ideas. Your success is our priority.
            </Typography>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <Typography
              as="h2"
              variant="h6"
              className="mb-4 font-bold text-lg text-white"
            >
              Quick Links
            </Typography>
            <ul className="space-y-2">
              <li className="flex space-x-3 items-center">
                <TbHomeDown />
                <Link to="/" className="hover:underline text-blue-gray-300">
                  Home
                </Link>
              </li>
              <li className="flex space-x-3 items-center">
                <IoPeopleSharp />
                <Link
                  to="/about"
                  className="hover:underline text-blue-gray-300"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Social Links */}
          <div>
            <Typography
              as="h2"
              variant="h6"
              className="mb-4 font-bold text-lg text-white"
            >
              Follow Us
            </Typography>
            <div className="flex items-center gap-4">
              <Link
                to="#"
                className="text-blue-gray-300 hover:text-white"
                aria-label="Github"
              >
                <FaGithub size={20} />
              </Link>
              <Link
                to="#"
                className="text-blue-gray-300 hover:text-white"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 border-t border-blue-gray-700 pt-4 text-center">
          <Typography className="text-sm text-blue-gray-300">
            &copy; 2024 MaxHelp Enterprises. All rights reserved.
          </Typography>
          <Button
            variant="text"
            size="sm"
            className="mt-2 text-blue-400 hover:underline"
          >
            Privacy Policy
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
