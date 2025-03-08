import { Navbar, Container, Button, Nav, Dropdown } from "react-bootstrap";
import { Home, CookingPot, Bookmark, Plus } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "./NavBar.css";
import SearchBar from "./SearchBar";
import TabButton from "./TabButton";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/authSlice";

export default function NavigationBar({ user }) {
  const location = useLocation(); // Get current route
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log("Đang đăng xuất...");
      await dispatch(logoutUser());
      navigate("/");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  return (
    <Navbar bg="white" expand="lg" className="navbar shadow-sm px-3">
      <Container fluid>
        {/* Logo & Search Bar */}
        <Nav className="d-flex align-items-center gap-3">
          <Navbar.Brand href="/" className="logo-text fw-bold fs-4">
            Savory Bliss
          </Navbar.Brand>
          <SearchBar />
        </Nav>

        {/* Navigation Tabs */}
        <Nav className="d-flex align-items-center gap-3">
          <TabButton icon={Home} href="/" active={location.pathname === "/"} />
          {user && (
            <>
              <TabButton
                icon={CookingPot}
                href="/recipes"
                active={location.pathname === "/recipes"}
              />
              <TabButton
                icon={Bookmark}
                href="/bookmarks"
                active={location.pathname === "/bookmarks"}
              />
            </>
          )}
        </Nav>

        {/* User Controls */}
        <Nav className="d-flex align-items-center gap-4">
          <Button
            className="normal-button rounded-pill px-3"
            href="/addrecipe"
          >
            <Plus className="fs-3 fw-bold cursor-pointer" /> Add a recipe
          </Button>

          {/* Show avatar if logged in, otherwise show Login */}
          {user ? (
            <Dropdown align="end">
              <Dropdown.Toggle as="div" className="user-avatar">
                <img
                  src={user.avatar}
                  alt="User Avatar"
                  className="rounded-circle cursor-pointer"
                  style={{
                    width: "40px",
                    height: "40px",
                    objectFit: "cover",
                    aspectRatio: "1 / 1",
                    borderRadius: "50%",
                    backgroundColor: "black",
                    display: "block",
                  }}
                />
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu-custom">
                <Dropdown.Item href="/profile">User Center</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  Log Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Nav.Link
              as={Link}
              to="/login"
              className="text-secondary text-decoration-underline"
            >
              LOGIN
            </Nav.Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}