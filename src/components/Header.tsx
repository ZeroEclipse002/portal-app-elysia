import { ModalAuth } from "./ModalAuth"
import { Signout } from "./Signout"



export const MainHeader = ({ role, pathname }: { role: string | null, pathname: string }) => {
    return (
        <section className="w-full px-8 text-gray-700 bg-white">
            <div className="container flex flex-col flex-wrap items-center justify-between py-5 mx-auto md:flex-row max-w-7xl">
                {/* Logo and Navigation Section */}
                <div className="relative flex flex-col md:flex-row">
                    {/* Logo */}
                    <a href="/" className="flex items-center mb-5 font-medium text-gray-900 md:mb-0">
                        <span className="text-xl font-black leading-none text-gray-900 select-none">
                            Logo<span className="text-indigo-600">.</span>
                        </span>
                    </a>

                    {/* Main Navigation */}
                    <nav className="flex flex-wrap items-center mb-5 text-base md:mb-0 md:pl-8 md:ml-8 md:border-l md:border-gray-200">
                        <a href="/" className={`mr-5 font-medium leading-6 text-gray-600 hover:text-gray-900 ${pathname === '/' ? 'text-gray-900' : ''}`}>
                            Home
                        </a>
                        <a href="/tickets" className={`mr-5 font-medium leading-6 text-gray-600 hover:text-gray-900 ${pathname === '/tickets' ? 'text-gray-900' : ''}`}>
                            Tickets
                        </a>
                        <a href="/news" className={`mr-5 font-medium leading-6 text-gray-600 hover:text-gray-900 ${pathname === '/news' ? 'text-gray-900' : ''}`}>
                            News
                        </a>
                        {role === 'admin' && (
                            <>
                                <a href="/admin" className={`mr-5 font-medium leading-6 text-gray-600 hover:text-gray-900 ${pathname === '/admin' ? 'text-gray-900' : ''}`}>
                                    Admin
                                </a>
                                <a href="/grid" className={`mr-5 font-medium leading-6 text-gray-600 hover:text-gray-900 ${pathname === '/grid' ? 'text-gray-900' : ''}`}>
                                    Grid
                                </a>
                            </>
                        )}
                    </nav>
                </div>

                {/* Auth Section */}
                <div className="inline-flex items-center ml-5 space-x-6 lg:justify-end">
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