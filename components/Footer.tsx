import { DribbbleIcon, GithubIcon, InstagramIcon, TwitterIcon } from "lucide-react";
import Link from "next/link";

const socials = [
    {
        icon: <TwitterIcon />,
        href: "#",
    },
    {
        icon: <InstagramIcon />,
        href: "#",
    },
    {
        icon: <DribbbleIcon />,
        href: "#",
    },
    {
        icon: <GithubIcon />,
        href: "#",
    },
];

const links = [
    {
        title: "Support",
        links: [
            {
                label: "FAQ",
                href: "#",
            },
            {
                label: "Contact Us",
                href: "#",
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
                        <h2 className="text-2xl font-bold">GamingWithYou</h2>
                        <div className="max-w-xs">
                            <p className="text-gray-300 text-justify">
                                GamingWithYou is a platform for gamers to connect and play together.
                            </p>
                        </div>
                        <div className="flex gap-4 mt-2 justify-center md:justify-start">
                            {socials.map((social, index) => (
                                <Link key={index} href={social.href} className="text-gray-300 hover:text-white">
                                    {social.icon}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right side: Links */}
                    <div className="grid grid-cols-2 md:w-2/3 md:border-l border-green-700 divide-x divide-green-700">
                        {links.map((column) => (
                            <div key={column.title} className="flex flex-col gap-4 px-6">
                                <h3 className="font-bold text-lg text-white">{column.title}</h3>
                                <ul className="flex flex-col gap-2">
                                    {column.links.map((link) => (
                                        <li key={link.label}>
                                            <Link href={link.href} className="text-gray-300 hover:text-white text-sm">
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
                <div className="container mx-auto py-8 text-center text-gray-400">
                    <p>© 2025 GamingWithYou. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;