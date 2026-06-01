"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconMail, IconMenu2, IconX } from "@tabler/icons-react";
import { ThemeToggle } from "./ThemeToggle";

const SECTIONS = ["about", "exp", "proj", "skills", "testimonials", "contact"];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const pathname = usePathname();
  const isBlog = pathname.startsWith("/blog");

  const close = () => setOpen(false);

  useEffect(() => {
    if (pathname !== "/") {
      setActive("");
      return;
    }
    function onScroll() {
      const navH = 70;
      let current = "";
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= navH) {
          current = id;
        }
      }
      setActive(current);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return (
    <div className="nav-wrap">
      <nav>
        <Link href="/" className="logo">
          KS<span>.</span>
        </Link>
        <div className="nav-r">
          <ul className="nav-links">
            <li>
              <Link href="/#about" className={active === "about" ? "active" : ""}>
                About
              </Link>
            </li>
            <li>
              <Link href="/#exp" className={active === "exp" ? "active" : ""}>
                Experience
              </Link>
            </li>
            <li>
              <Link href="/#proj" className={active === "proj" ? "active" : ""}>
                Projects
              </Link>
            </li>
            <li>
              <Link href="/#skills" className={active === "skills" ? "active" : ""}>
                Skills
              </Link>
            </li>
            <li>
              <Link
                href="/#contact"
                className={active === "contact" ? "active" : ""}
              >
                Contact
              </Link>
            </li>
            <li>
              <Link href="/blog" className={isBlog ? "active" : ""}>
                Writing
              </Link>
            </li>
          </ul>
          <ThemeToggle />
          <a href="mailto:Kunalshelke123@gmail.com" className="nav-btn">
            <IconMail size={14} aria-hidden />
            Hire me
          </a>
          <button
            className="hbtn"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <IconX size={18} /> : <IconMenu2 size={18} />}
          </button>
        </div>
      </nav>

      <div
        className={`mob-menu${open ? " open" : ""}`}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <Link href="/#about" onClick={close}>
          About
        </Link>
        <Link href="/#exp" onClick={close}>
          Experience
        </Link>
        <Link href="/#proj" onClick={close}>
          Projects
        </Link>
        <Link href="/#skills" onClick={close}>
          Skills
        </Link>
        <Link href="/#contact" onClick={close}>
          Contact
        </Link>
        <Link href="/blog" onClick={close}>
          Writing
        </Link>
        <a href="mailto:Kunalshelke123@gmail.com" onClick={close}>
          Hire me
        </a>
      </div>
    </div>
  );
}
