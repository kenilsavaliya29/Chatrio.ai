'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeContext';

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.398.1 2.65.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zm-11 5H5v10h3V8zm-1.5-2.25a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM19 8h-3a3.99 3.99 0 0 0-4 4v6h3v-5.5c0-1.38.62-2.5 2.25-2.5S19 13.62 19 15v5h3V12a4 4 0 0 0-4-4z" />
  </svg>
);


const Footer = () => {
    const { resolvedTheme } = useTheme();

    return (
        <footer className="border-t border-border md:pt-5">
            <div className="container mx-auto px-4 sm:px-7 md:px-10 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        <Link href={'/'} className="inline-block">
                            <div className="flex items-center justify-start space-x-3">
                                <Image
                                    src={'/svgs/logo.svg'}
                                    width={30}
                                    height={30}
                                    alt='company-logo'
                                    className={resolvedTheme === 'light' ? 'filter invert' : ''}
                                />
                                <span className="text-xl font-bold font-geist-mono text-foreground">
                                    Chatrio
                                </span>
                            </div>
                        </Link>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            The ultimate AI automation platform to transform your website engagement.
                        </p>
                    </div>

                    <div className="md:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-8">
                        <div>
                            <h4 className="font-semibold text-foreground mb-4">Product</h4>
                            <ul className="space-y-3">
                                <li><Link href="#" className="text-sm text-muted-foreground hover-text-gradient">Features</Link></li>
                                <li><Link href="/pricing" className="text-sm text-muted-foreground hover-text-gradient">Pricing</Link></li>
                                <li><Link href="#" className="text-sm text-muted-foreground hover-text-gradient">Integrations</Link></li>
                                <li><Link href="#" className="text-sm text-muted-foreground hover-text-gradient">Updates</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-4">Company</h4>
                            <ul className="space-y-3">
                                <li><Link href="#" className="text-sm text-muted-foreground hover-text-gradient">About</Link></li>
                                <li><Link href="#" className="text-sm text-muted-foreground hover-text-gradient">Blog</Link></li>
                                <li><Link href="#" className="text-sm text-muted-foreground hover-text-gradient">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
                            <ul className="space-y-3">
                                <li><Link href="/embed-guide" className="text-sm text-muted-foreground hover-text-gradient">Documentation</Link></li>
                                {/* <li><Link href="/embed-guide" className="text-sm text-muted-foreground hover-text-gradient">Guides</Link></li> */}
                                <li><Link href="#" className="text-sm text-muted-foreground hover-text-gradient">Support</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
                            <ul className="space-y-3">
                                <li><Link href="#" className="text-sm text-muted-foreground hover-text-gradient">Privacy Policy</Link></li>
                                <li><Link href="#" className="text-sm text-muted-foreground hover-text-gradient">Terms of Service</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-border pt-8 flex flex-col-reverse sm:flex-row justify-between items-center gap-6">
                    <p className="text-sm text-muted-foreground text-center sm:text-left">
                        © {new Date().getFullYear()} Chatrio. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-4">
                        <Link href="#" aria-label="Twitter" className="text-muted-foreground hover:text-foreground transition-colors">
                            <TwitterIcon className="w-5 h-5" />
                        </Link>
                        <Link href="#" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors">
                            <GithubIcon className="w-5 h-5" />
                        </Link>
                        <Link href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors">
                            <LinkedinIcon className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
