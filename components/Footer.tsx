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
        <footer className="relative border-t border-[#19FF00]/60 bg-[#050505] selection:bg-gaming-green selection:text-black">

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
                            <h2 className="text-xl font-black font-orbitron tracking-wider text-[#19FF00]" translate="no">
                                GamingWithMe
                            </h2>
                        </div>

                        <p className="text-white text-sm md:text-base max-w-sm leading-relaxed font-medium">
                            The ultimate community platform for gamers. Connect, compete, and level up your gaming experience together.
                        </p>


                    </div>

                    {/* Links Section */}
                    <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
                        {links.map((column) => (
                            <div key={column.title} className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-xs font-black font-orbitron text-[#19FF00] uppercase tracking-[0.3em]">
                                        {column.title}
                                    </h3>
                                    <div className="h-[1px] w-full bg-[#19FF00]/40"></div>
                                </div>
                                <ul className="space-y-3">
                                    {column.links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                href={link.href}
                                                className="text-white hover:text-[#19FF00] text-sm font-medium transition-colors duration-300 block"
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


                    <p className="text-white text-xs font-bold uppercase tracking-widest">
                        © {new Date().getFullYear()} <span className="text-gaming-green italic" translate="no">GamingWithMe</span>. All rights reserved.
                    </p>


                </div>

            </div>
        </footer>
    );
};

export default Footer;