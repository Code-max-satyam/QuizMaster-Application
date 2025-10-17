import React, { useEffect, useState } from 'react'
import { navbarStyles } from '../assets/dummyStyles'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Award, LogIn, LogOut, Menu, X } from 'lucide-react';

const Navbar = ({ logoSrc }) => {

    const navigate = useNavigate();
    const [loggedIn, setLoggedIn] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    // useEffect to check login status on change
    useEffect(() => {
    try {
      const u = localStorage.getItem("authToken");
      setLoggedIn(!!u);
    } catch (e) {
      setLoggedIn(false);
    }

    const handler = (ev) => {
      const detailUser = ev?.detail?.user ?? null;
      setLoggedIn(!!detailUser);
    };
    window.addEventListener("authChanged", handler);

    return () => window.removeEventListener("authChanged", handler);
  }, []);

    // LOGOUT FUNCTION
    const handleLogout = () => {
        try {
            localStorage.removeItem('autoToken');
            localStorage.clear();
        } catch (e) {
            // ignore all the error
        }
        window.dispatchEvent(
            new CustomEvent('autoChanged', { detail: { User: null } })
        );
        setMenuOpen(false);
        try {
            navigate('/login');
        } catch (e) {
            window.location.href = '/login';
        }
    };

    return (
        <nav className={navbarStyles.nav}>
            <div
                style={{
                    backgroundImage: navbarStyles.decorativePatternBackground,
                }}
                className={navbarStyles.decorativePattern}
            ></div>

            <div className={navbarStyles.bubble1}></div>
            <div className={navbarStyles.bubble2}></div>
            <div className={navbarStyles.bubble3}></div>

            <div className={navbarStyles.container}>
                <div className={navbarStyles.logoContainer}>
                    <Link to="/" className={navbarStyles.logoButton}>
                        <div className={navbarStyles.logoInner}>
                            <img
                                src={
                                    logoSrc ||
                                    "https://yt3.googleusercontent.com/eD5QJD-9uS--ekQcA-kDTCu1ZO4d7d7BTKLIVH-EySZtDVw3JZcc-bHHDOMvxys92F7rD8Kgfg=s900-c-k-c0x00ffffff-no-rj"
                                }
                                alt="QuizMaster logo"
                                className={navbarStyles.logoImage}
                            />
                        </div>
                    </Link>
                </div>

                <div className={navbarStyles.titleContainer}>
                    <div className={navbarStyles.titleBackground}>
                        <h1 className={navbarStyles.titleText}>QuizMaster Application</h1>
                    </div>
                </div>

                <div className={navbarStyles.desktopButtonsContainer}>
                    <div className={navbarStyles.spacer}></div>

                    <NavLink to="/result" className={navbarStyles.resultsButton}>
                        <Award className={navbarStyles.buttonIcon} />
                        My Result
                    </NavLink>

                    {loggedIn ? (
                        <button onClick={handleLogout} className={navbarStyles.logoutButton}>
                            <LogOut className={navbarStyles.buttonIcon} />
                            Logout
                        </button>
                    ) : (
                        <NavLink to="/login" className={navbarStyles.loginButton}>
                            <LogIn className={navbarStyles.buttonIcon} />
                            Login
                        </NavLink>
                    )}
                </div>

                <div className={navbarStyles.mobileMenuContainer}>
                    <button onClick={() => setMenuOpen((s) => !s)} className={navbarStyles.menuToggleButton}>
                        {menuOpen ? (
                            <X className={navbarStyles.menuIcon} />
                        ) : (
                            <Menu className={navbarStyles.menuIcon} />
                        )}
                    </button>

                    {menuOpen && (
                        <div className={navbarStyles.mobileMenuPanel}>
                            <ul className={navbarStyles.mobileMenuList}>
                                <li>
                                    <NavLink to="/result" className={navbarStyles.mobileMenuItem} onClick={() => setMenuOpen(false)}>
                                        <Award className={navbarStyles.mobileMenuIcon} />
                                        My Result
                                    </NavLink>
                                </li>

                                {loggedIn ? (
                                    <button type='button' onClick={handleLogout} className={navbarStyles.mobileMenuItem}>
                                        <LogOut className={navbarStyles.mobileMenuIcon} />
                                        Logout
                                    </button>
                                ) :(
                                    <li>
                                        <NavLink to="/login" className={navbarStyles.mobileMenuItem} onClick={() => setMenuOpen(false)}>
                                        <LogIn className={navbarStyles.mobileMenuIcon} />
                                        Login
                                        </NavLink>
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <style>{navbarStyles.animations}</style>
        </nav >
    )
}

export default Navbar