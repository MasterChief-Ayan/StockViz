import React from 'react'
import "./Navbar.css"
import {useSelector,useDispatch} from "react-redux"
import {themeActions} from "../../store/Store"

import { CiLight } from "react-icons/ci";
import { CiDark } from "react-icons/ci";

function Navbar() {
  const dispatch = useDispatch();
  const currentTheme = useSelector((state) => state.theme.themeType);

  const changeThemeHandler = () => {
    const newTheme = currentTheme === "LIGHT" ? "DARK" : "LIGHT";
    dispatch(themeActions.changeTheme({ type: newTheme }));
  };

  return (
    <>
        <nav className="navbar">
            <div>
                <h1>StockViz</h1>   
            </div>
            <div>
                {currentTheme === "LIGHT" ? 
                <CiLight onClick={changeThemeHandler} className="theme-icon"/> :
                <CiDark onClick={changeThemeHandler} className="theme-icon"/>
                }
            </div>
        </nav>
    </>
  )
}

export default Navbar