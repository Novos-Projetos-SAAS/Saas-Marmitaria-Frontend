"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

import styles from "./index.module.css";

export default function ReportActionMenu({
    children,
    isLast = false
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState({});

    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isOpen || !buttonRef.current) {
            setMenuStyle({});
            return;
        }

        const rect = buttonRef.current.getBoundingClientRect();

        const estimatedHeight =
            dropdownRef.current?.offsetHeight || 180;

        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        const openUp =
            isLast ||
            (spaceBelow < estimatedHeight + 12 &&
                spaceAbove > estimatedHeight + 12);

        const MENU_WIDTH = 180;
        const H_MARGIN = 8;

        const left = Math.min(
            Math.max(H_MARGIN, rect.left),
            window.innerWidth - MENU_WIDTH - H_MARGIN
        );

        const style = {
            position: "fixed",
            left,
            minWidth: MENU_WIDTH,
            zIndex: 99999
        };

        if (openUp) {
            style.top = Math.max(
                H_MARGIN,
                rect.top - estimatedHeight - 6
            );
        } else {
            style.top = rect.bottom + 6;
        }

        setMenuStyle(style);
    }, [isOpen, isLast]);

    return (
        <div className={styles.wrapper} ref={menuRef}>
            <button
                ref={buttonRef}
                className={styles.menuButton}
                onClick={() => setIsOpen(v => !v)}
            >
                <MoreVertical size={18} />
            </button>

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className={styles.dropdown}
                    style={menuStyle}
                >
                    {children}
                </div>
            )}
        </div>
    );
}