import Link from "next/link";
import Image from "next/image";

const links = [
    {
        title: "Support",
        links: [
            {
                label: "FAQ",
                href: "/support/faq",
            },
            {
                label: "Contact Us",
                href: "/support/contactus",
            },
        ],
    },
    {
        title: "Legal",
        links: [
            {
                label: "Privacy Policy",
                href: "#",
            },
            {
                label: "Cookie Policy",
                href: "#",
            },
        ],
    },
];

const Footer = () => {
    return (
        <footer className="bg-black text-white border-t border-green-700">
            <div className="container mx-auto py-8 px-4 md:px-6">
                {/* Upper section with brand info and links */}
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 text-center md:text-left">
                    {/* Left side: Brand and social */}
                    <div className="flex flex-col items-center md:items-start gap-4 md:w-1/3">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/logo/logo.png"
                                alt="GamingWithMe Logo"
                                width={48}
                                height={48}
                                className="h-12 w-auto"
                            />
                            <h2 className="text-2xl font-bold font-orbitron tracking-wider text-gaming-green">GamingWithMe</h2>
                        </div>
                        <div className="max-w-xs">
                            <p className="text-gray-300 text-justify">
                                GamingWithMe is a platform for gamers to connect and play together.
                            </p>
                        </div>
                    </div>

                    {/* Right side: Links */}
                    <div className="grid grid-cols-2 md:w-2/3 md:border-l border-green-700 divide-x divide-green-700">
                        {links.map((column) => (
                            <div key={column.title} className="flex flex-col gap-4 px-6 md:px-12">
                                <h3 className="font-bold text-lg text-white font-orbitron uppercase tracking-widest text-sm">{column.title}</h3>
                                <ul className="flex flex-col gap-2">
                                    {column.links.map((link) => (
                                        <li key={link.label}>
                                            <Link href={link.href} className="text-gray-300 hover:text-gaming-green text-sm transition-colors">
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

            {/* Bottom section with copyright */}
            <div className="border-t border-green-700">
                <div className="container mx-auto py-8 text-center text-gray-400 text-xs tracking-widest uppercase">
                    <p>© {new Date().getFullYear()} GamingWithMe. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;