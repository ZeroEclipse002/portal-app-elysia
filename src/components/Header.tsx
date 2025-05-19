import { cn } from "@/lib/utils"
import { ModalAuth } from "./ModalAuth"
import { Signout } from "./Signout"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "./ui/navigation-menu"
import React, { useState } from "react"




export const MainHeader = ({ role, pathname, approved, hasSession }: { role: string | null, pathname: string, approved: boolean, hasSession: boolean }) => {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const closeTimeout = React.useRef<NodeJS.Timeout | null>(null);

    const toggleDropdown = (name: string) => setOpenDropdown(openDropdown === name ? null : name);
    const handleMouseEnter = (name: string) => {
        if (closeTimeout.current) clearTimeout(closeTimeout.current);
        setOpenDropdown(name);
    };
    const handleMouseLeave = () => {
        closeTimeout.current = setTimeout(() => setOpenDropdown(null), 120);
    };
    const handleDropdownMouseEnter = () => {
        if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
    const handleDropdownMouseLeave = () => {
        closeTimeout.current = setTimeout(() => setOpenDropdown(null), 120);
    };
    return (
        <section className="w-full px-8 text-gray-700 bg-white">
            <div className="container flex flex-col flex-wrap items-center justify-between py-5 mx-auto md:flex-row max-w-7xl">
                {/* Logo and Navigation Section */}
                <div className="relative flex flex-col md:flex-row w-full md:w-auto">
                    {/* Logo */}
                    <a href="/" className="flex items-center mb-5 font-medium text-gray-900 md:mb-0">
                        <img src="/marawoy-logo.png" alt="Marawoy Logo" className="h-12 w-auto" />
                    </a>

                    {/* Hamburger Button */}
                    <button
                        className="md:hidden absolute right-0 top-0 mt-2 mr-2 z-20 p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                        aria-label="Toggle navigation"
                        onClick={() => setMobileNavOpen((open) => !open)}
                    >
                        <span className="block w-6 h-0.5 bg-gray-800 mb-1 transition-all" style={{ transform: mobileNavOpen ? 'rotate(45deg) translateY(7px)' : 'none' }}></span>
                        <span className={`block w-6 h-0.5 bg-gray-800 mb-1 transition-all ${mobileNavOpen ? 'opacity-0' : ''}`}></span>
                        <span className="block w-6 h-0.5 bg-gray-800 transition-all" style={{ transform: mobileNavOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }}></span>
                    </button>

                    {/* Main Navigation */}
                    <nav
                        className={
                            `mb-5 text-base md:mb-0 md:pl-8 md:ml-8 md:border-l md:border-gray-200 ` +
                            `w-full md:w-auto ` +
                            (mobileNavOpen ? 'block' : 'hidden') +
                            ' md:flex'
                        }
                    >
                        <div className="bg-white shadow-md rounded-b-md md:shadow-none md:bg-transparent md:rounded-none">
                            <ul className="flex flex-col md:flex-row gap-2 md:gap-4">
                                <li>
                                    <a href="/" className="block px-4 py-2 rounded hover:bg-gray-100">Home</a>
                                </li>
                                {approved && (
                                    <li className="relative"
                                        onMouseLeave={handleMouseLeave}
                                        onMouseEnter={() => handleMouseEnter('services')}
                                    >
                                        <button
                                            className="flex items-center px-4 py-2 rounded hover:bg-gray-100 w-full md:w-auto"
                                            onClick={() => toggleDropdown('services')}
                                            aria-haspopup="true"
                                            aria-expanded={openDropdown === 'services'}
                                        >
                                            Services
                                            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                        </button>
                                        {openDropdown === 'services' && (
                                            <div
                                                className="absolute left-0 top-full w-48 bg-white border rounded shadow-md z-30 mt-0"
                                                onMouseEnter={handleDropdownMouseEnter}
                                                onMouseLeave={handleDropdownMouseLeave}
                                            >
                                                <a href="/tickets" className="block px-4 py-2 hover:bg-gray-100">Tickets</a>
                                                <a href="/concern" className="block px-4 py-2 hover:bg-gray-100">Concern Board</a>
                                            </div>
                                        )}
                                    </li>
                                )}
                                <li className="relative"
                                    onMouseLeave={handleMouseLeave}
                                    onMouseEnter={() => handleMouseEnter('feed')}
                                >
                                    <button
                                        className="flex items-center px-4 py-2 rounded hover:bg-gray-100 w-full md:w-auto"
                                        onClick={() => toggleDropdown('feed')}
                                        aria-haspopup="true"
                                    aria-expanded={openDropdown === 'feed'}
                                    >
                                        Feed
                                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                    {openDropdown === 'feed' && (
                                        <div
                                            className="absolute left-0 top-full w-48 bg-white border rounded shadow-md z-30 mt-0"
                                            onMouseEnter={handleDropdownMouseEnter}
                                            onMouseLeave={handleDropdownMouseLeave}
                                        >
                                            <a href="/news" className="block px-4 py-2 hover:bg-gray-100">News</a>
                                            <a href="/announcements" className="block px-4 py-2 hover:bg-gray-100">Announcements</a>
                                        </div>
                                    )}
                                </li>
                                {role === 'admin' && (
                                    <li className="relative"
                                        onMouseLeave={handleMouseLeave}
                                        onMouseEnter={() => handleMouseEnter('admin')}
                                    >
                                        <button
                                            className="flex items-center px-4 py-2 rounded hover:bg-gray-100 w-full md:w-auto"
                                            onClick={() => toggleDropdown('admin')}
                                            aria-haspopup="true"
                                            aria-expanded={openDropdown === 'admin'}
                                        >
                                            Admin
                                            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                        </button>
                                        {openDropdown === 'admin' && (
                                            <div
                                                className="absolute left-0 top-full w-48 bg-white border rounded shadow-md z-30 mt-0"
                                                onMouseEnter={handleDropdownMouseEnter}
                                                onMouseLeave={handleDropdownMouseLeave}
                                            >
                                                <a href="/admin" className="block px-4 py-2 hover:bg-gray-100">Dashboard</a>
                                                <a href="/grid" className="block px-4 py-2 hover:bg-gray-100">Grid</a>
                                            </div>
                                        )}
                                    </li>
                                )}
                                <li>
                                    <a href="/contact" className="block px-4 py-2 rounded hover:bg-gray-100">Contact Us</a>
                                </li>
                            </ul>
                        </div>
                    </nav>
                </div>

                {/* Auth Section */}
                <div className="inline-flex items-center ml-5 space-x-6 lg:justify-end">
                    {(!approved && hasSession) && (<div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                        <p>Please wait for approval - you have limited access to the portal</p>
                    </div>)}
                    {role !== null ? <Signout /> : <ModalAuth />}
                </div>
            </div>

            {/* Breadcrumb Section */}
            {pathname !== '/' && (
                <div className="container mx-auto max-w-7xl pb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <a href="/" className="hover:text-gray-900">Home</a>
                        {pathname.split('/').filter(Boolean).map((segment, index, array) => {
                            const path = '/' + array.slice(0, index + 1).join('/')
                            return (
                                <div key={path} className="flex items-center gap-2">
                                    <span>/</span>
                                    <a href={path} style={{
                                        viewTransitionName: segment + index
                                    }} className="hover:text-gray-900 capitalize">
                                        {segment}
                                    </a>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </section>
    )
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
})
ListItem.displayName = "ListItem"

