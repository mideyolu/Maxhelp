import React, { useEffect } from "react";
import {
  Navbar,
  MobileNav,
  Typography,
  Button,
  IconButton,
} from "@material-tailwind/react";
import { FiMenu } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { TbHomeDown } from "react-icons/tb";
import { IoPeopleSharp } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";

const NavbarList = () => {
  const navigate = useNavigate();

  const [openNav, setOpenNav] = React.useState(false);

  useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false)
    );
  }, []);

  const redirect = () => {
    navigate("/onboarding");
  };

  const navList = (
    <ul className="mt-2 mb-4 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="flex items-center gap-x-2 p-1 text-[1.05rem]"
      >
        <TbHomeDown className=" text-[#90A4AE]" />

        <Link to={"/"} className="flex items-center" aria-label="Home">
          Home
        </Link>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="flex items-center gap-x-2 p-1 text-[1.05rem]"
      >
        <IoPeopleSharp className=" text-[#90A4AE]" />

        <Link to={"/about"} className="flex items-center" aria-label="About Us">
          About Us
        </Link>
      </Typography>
    </ul>
  );

  return (
      <Navbar className="mx-auto w-screen-xl px-4 py-2 lg:px-8 lg:py-4">
          <div className="container mx-auto flex items-center justify-between text-blue-gray-900">
              <Typography
                  as="a"
                  href="#"
                  className="mr-4 cursor-pointer py-1.5 text-[1.05rem]"
              >
                  MaxHelp Enterprises
              </Typography>
              <div className="hidden lg:block">{navList}</div>
              <div className="flex items-center gap-x-1">
                  <Button
                      fullWidth
                      variant="gradient"
                      size="sm"
                      color="blue-gray"
                      className="hidden lg:inline-block py-2 text-[1.05rem]"
                      onClick={redirect}
                  >
                      <span>Try it Now</span>
                  </Button>
              </div>
              <IconButton
                  variant="text"
                  className="ml-auto h-6 w-6 hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
                  ripple={false}
                  onClick={() => setOpenNav(!openNav)}
              >
                  {openNav ? (
                      <RxCross2 className="h-6 w-6" />
                  ) : (
                      <FiMenu className="h-6 w-6" />
                  )}
              </IconButton>
          </div>
          <MobileNav open={openNav}>
              <div className="container mx-auto">
                  {navList}
                  <div className="flex items-center gap-x-1">
                      <Button
                          //   fullWidth
                          variant="gradient"
                          color="blue-gray"
                          size="text-[1.05rem]"
                          className="w-6/2"
                          onClick={redirect}
                      >
                          <span>Try it Now</span>
                      </Button>
                  </div>
              </div>
          </MobileNav>
      </Navbar>
  );
};
export default NavbarList;
