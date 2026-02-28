import Link from "next/link";
import Image from "next/image";

const links = [
    {
        title: "Platform",
        links: [
            { label: "Gamers", href: "/gamers" },
            { label: "Games", href: "/games" },
            { label: "Leaderboard", href: "/leaderboard" },
        ],
    },
    {
        title: "Support",
        links: [
            { label: "FAQ", href: "/support/faq" },
            { label: "Contact Us", href: "/support/contactus" },
        ],
    },
    {
        title: "Legal",
        links: [
            { label: "Privacy Policy", href: "#" },
            { label: "Terms of Service", href: "#" },
        ],
    },
];

const Footer = () => {
    return (
        <footer className="relative mt-20 border-t border-white/[0.05] bg-[#050505] selection:bg-gaming-green selection:text-black">

            <div className="container mx-auto py-16 px-6 md:px-10 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-white/[0.01] border border-white/[0.05]">
                                <Image
                                    src="/logo/logo.png"
                                    alt="GamingWithMe Logo"
                                    width={48}
                                    height={48}
                                    className="h-10 w-auto"
                                />
                            </div>
                            <h2 className="text-2xl font-black font-orbitron tracking-tighter text-gaming-green uppercase italic">
                                GamingWithMe
                            </h2>
                        </div>

                        <p className="text-gray-500 text-sm md:text-base max-w-sm leading-relaxed font-medium">
                            The ultimate community platform for gamers. Connect, compete, and level up your gaming experience together.
                        </p>


                    </div>

                    {/* Links Section */}
                    <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
                        {links.map((column) => (
                            <div key={column.title} className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-[1px] w-4 bg-white/[0.1]"></div>
                                    <h3 className="text-[10px] font-black font-orbitron text-gray-600 uppercase tracking-[0.3em]">
                                        {column.title}
                                    </h3>
                                </div>
                                <ul className="space-y-3">
                                    {column.links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                href={link.href}
                                                className="text-gray-500 hover:text-white text-sm font-medium transition-all duration-300 hover:translate-x-1 block"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-white/[0.05] relative py-10">
                <div className="container mx-auto px-6 md:px-10 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">


                    <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                        © {new Date().getFullYear()} <span className="text-gaming-green italic">GamingWithMe</span>. All rights reserved.
                    </p>

                    <div className="flex items-center gap-6">
                        <div className="h-[1px] w-12 bg-white/[0.05] hidden md:block"></div>
                        <p className="text-gray-600 text-[9px] font-medium uppercase tracking-[0.2em]">
                            Stealth v2.0.42
                        </p>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;