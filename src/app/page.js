'use client';

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTheme } from "@/components/ThemeContext";

export default function Home() {
  const { resolvedTheme } = useTheme();

  return (
    <main>

      {/* hero section */}
      <section className="mt-32 md:mt-50 px-4 sm:px-7 md:px-10">
        <div className="container mx-auto flex justify-between items-center gap-20 flex-col lg:flex-row">
          <div className="hero-left space-y-4 flex-1/2 w-full">
            <h1 className="f-geist-mono text-5xl sm:text-7xl font-bold capitalize ">The ultimate AI automation</h1>
            <p className="text-xl opacity-80">Transform your website with AI. Build intelligent chatbots in minutes, not months.</p>
            <p className="opacity-60">Tired of missed leads due to slow responses? ItsBot Chat
              Agent is your 24/7 assistant trained to convert, support, and
              qualify, all while sounding like part of your team.
            </p>
            <div className="hero-buttons space-x-3">
              <Link href={'/bot/new'} className='w-fit btn-primary-gradient-hover flex items-center justify-center gap-5 hover:text-white  px-10 py-3.5 bg-primary text-primary-foreground hover:scale-105 rounded-lg custom-transition duration-300 font-semibold text-sm'>
                Get Started
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="hero-right flex-1/2 w-full">
            <div className="hero-right-wrapper w-full relative flex justify-end">
              <Image src={'/pngs/hero-bg.png'} alt="hero-image" width={500} height={500} className="hero-right-img" />
              <div className="chatbot absolute w-[380px] h-[425px] bg-background border border-border rounded-xl overflow-hidden shadow-lg flex flex-col top-[50px] right-[100px]">
                <div className="chatbox-header p-4 bg-background border-b border-border flex items-center gap-3">
                  <div className="flex items-center">
                    <Image src={'/pngs/robot.png'} alt="logo" width={30} height={30} className="bg-white rounded-full p-1" />
                  </div>
                  <span className="text-foreground font-medium">AI Chat Agent</span>
                </div>
                <div className="chatbox-body flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                  <div className="max-w-[80%] p-3 rounded-xl bg-muted text-foreground self-start">
                    <p className="text-sm leading-relaxed">Hello, I'm Chatrio bot! I'm your personal sport assistant. How can I help you?</p>
                    <div className="text-xs opacity-60 mt-1">8:21 AM</div>
                  </div>
                  <div className="max-w-[80%] p-3 rounded-xl bg-primary text-primary-foreground self-end">
                    <p className="text-sm leading-relaxed">Hello I am James</p>
                    <div className="text-xs opacity-60 mt-1">8:21 AM</div>
                  </div>
                  <div className="max-w-[80%] p-3 rounded-xl bg-muted text-foreground self-start">
                    <p className="text-sm leading-relaxed">Hello! I'm here to assist you with your tech queries. What issue are you facing with your laptop?</p>
                    <div className="text-xs opacity-60 mt-1">8:22 AM</div>
                  </div>
                  <div className="max-w-[80%] p-3 rounded-xl bg-primary text-primary-foreground self-end">
                    <p className="text-sm leading-relaxed">Hi, I need help with my laptop.</p>
                    <div className="text-xs opacity-60 mt-1">8:22 AM</div>
                  </div>
                </div>
                <div className="chatbox-footer">
                  <div className="field+btn shadow-2xl flex justify-between items-center bg-muted">
                    <span className="input-field bg-muted w-full py-3 pl-3">Type a message...</span>
                    <Image src={'/svgs/chatbox-send-btn.svg'} width={20} height={20} alt="chatbox-send-btn" className="invert-100 me-4" />
                  </div>
                </div>
              </div>
              <div className="chatbot-icon absolute bottom-5 right-10 hidden md:block">
                <Image
                  src={'/svgs/logo.svg'}
                  width={50}
                  height={50}
                  alt="chatbox-logo"
                  className={`bg-black p-3 rounded-full shadow-lg cursor-pointer ${resolvedTheme === 'light' ? 'filter invert' : ''}`}
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* features-box */}
      <div className="wrapper mx-auto flex items-center justify-center mt-14  md:mt-20 w-full px-4 sm:px-7 md:px-10">
        <div className="feature-wrapper container bg-primary rounded-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="feature-item text-background p-4 sm:p-6 flex items-center gap-3">
              <div className="feature-icon flex-shrink-0">
                <Image src={'/svgs/tick_icon.svg'} alt="feature-icon-1" width={20} height={20} />
              </div>
              <div className="feature-content">
                <h3 className="text-lg sm:text-xl font-semibold whitespace-nowrap">24/7 Availability</h3>
              </div>
            </div>

            <div className="feature-item text-background p-4 sm:p-6 flex items-center gap-3">
              <div className="feature-icon flex-shrink-0">
                <Image src={'/svgs/tick_icon.svg'} alt="feature-icon-2" width={20} height={20} />
              </div>
              <div className="feature-content">
                <h3 className="text-lg sm:text-xl font-semibold">Smart Lead Qualification</h3>
              </div>
            </div>

            <div className="feature-item text-background p-4 sm:p-6 flex items-center gap-3">
              <div className="feature-icon flex-shrink-0">
                <Image src={'/svgs/tick_icon.svg'} alt="feature-icon-3" width={20} height={20} />
              </div>
              <div className="feature-content">
                <h3 className="text-lg sm:text-xl font-semibold">Human-like Conversations</h3>
              </div>
            </div>

            <div className="feature-item text-background p-4 sm:p-6 flex items-center gap-3">
              <div className="feature-icon flex-shrink-0">
                <Image src={'/svgs/tick_icon.svg'} alt="feature-icon-4" width={20} height={20} />
              </div>
              <div className="feature-content">
                <h3 className="text-lg sm:text-xl font-semibold">Multi-language Support</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* steps section */}
      <section className="steps-sec mt-32 md:mt-50 px-4 sm:px-7 md:px-10 pb-20">
        <div className="container mx-auto">
          <div className="step-sec-headings text-center space-y-3 md:space-y-5 mb-10 md:mb-16">
            <h2 className="f-geist-mono text-3xl sm:text-4xl md:text-5xl font-bold ">Go Live in 3 Simple Steps</h2>
            <p className="text-base sm:text-lg opacity-80 max-w-3xl mx-auto">From your website URL to a fully functional AI chatbot in minutes. No coding required.</p>
          </div>
          <div className="step-sec-cards-wrap grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Step 1 */}
            <div className="card bg-white/90 dark:bg-white/5 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 p-5 sm:p-7 rounded-xl flex flex-col">
              <div className="card-heading space-y-2 sm:space-y-3">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-foreground">1. Provide Your Website URL</h3>
                <p className="text-sm sm:text-base text-card-foreground">Simply enter your website's URL, and our AI will crawl and learn from your content to build your chatbot.</p>
              </div>
              <div className="card-body mt-6 sm:mt-8 flex-grow flex items-center">
                <div className="flex flex-col gap-2 p-2 bg-background rounded-lg border border-border w-full">
                  <input
                    type="text"
                    placeholder="https://yourwebsite.com"
                    className="w-full bg-transparent p-2 outline-none text-sm border-b border-border/30"
                    disabled
                  />
                  <Link href={'/bot/new'} className='hover:text-white btn-primary-gradient-hover  w-full px-4 py-2 bg-primary text-primary-foreground rounded-md custom-transition duration-300 font-semibold text-xs'>
                    Generate AI Chatbot
                  </Link>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="card bg-white/90 dark:bg-white/5 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 p-5 sm:p-7 rounded-xl flex flex-col">
              <div className="card-heading space-y-2 sm:space-y-3">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-foreground">2. Add to Your Website</h3>
                <p className="text-sm sm:text-base text-card-foreground">Copy the one-line code snippet and paste it into your website's HTML before the closing &lt;/body&gt; tag.</p>
              </div>
              <div className="card-body mt-6 sm:mt-8 flex-grow flex flex-col justify-center">
                <div className="bg-background rounded-lg p-3 border border-border overflow-hidden">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all overflow-hidden">
                    <code>
                      &lt;script src="https://chatrio.ai/asdnj23e82nksadbj112921chatbot.js"&gt;&lt;/script&gt;
                    </code>
                  </pre>
                </div>
                <p className="text-xs text-center mt-3 text-muted-foreground">
                  Works with Shopify, Webflow, Framer, and more.
                  <a href="#" className="text-primary underline ml-1">View guides</a>.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="card bg-white/90 dark:bg-white/5 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 p-5 sm:p-7 rounded-xl flex flex-col">
              <div className="card-heading space-y-2 sm:space-y-3">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-foreground">3. Go Live & Customize</h3>
                <p className="text-sm sm:text-base text-card-foreground">Your AI chatbot is now live! Customize its name, icon, color, tone, and more from your dashboard.</p>
              </div>
              <div className="card-body mt-6 sm:mt-8 flex-grow flex items-center justify-center">
                <div className="relative w-full bg-gradient-to-br from-muted/50 to-muted rounded-lg border border-border overflow-hidden">
                  {/* Mock website preview */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <div className="flex-1 h-4 bg-foreground/5 rounded ml-2"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-3/4 h-3 bg-foreground/10 rounded"></div>
                      <div className="w-1/2 h-3 bg-foreground/10 rounded"></div>
                      <div className="w-5/6 h-3 bg-foreground/10 rounded"></div>
                    </div>
                  </div>

                  {/* Chatbot icon positioned */}
                  <div className="absolute bottom-4 right-4">
                    <div className="relative">
                      <Image
                        src={'/svgs/logo.svg'}
                        width={40}
                        height={40}
                        alt="chatbox-logo"
                        className={`bg-black p-2.5 rounded-full shadow-lg cursor-pointer ${resolvedTheme === 'light' ? 'filter invert' : ''}`}
                      />

                    </div>

                  </div>

                  {/* Dashboard preview tooltip */}
                  <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-border text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>Live & Customizable</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 md:py-28 px-4 sm:px-7 md:px-10 bg-primary">
        <div className="container mx-auto text-background">
          <div className="text-center space-y-3 md:space-y-5 mb-10 md:mb-16">
            <h2 className="f-geist-mono text-3xl sm:text-4xl md:text-5xl font-bold">Drive Growth with AI Automation</h2>
            <p className="text-base sm:text-lg opacity-80 max-w-3xl mx-auto">Our platform isn't just a tool; it's a growth engine. See the tangible impact on your business metrics.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 sm:gap-8 text-center">
            <div>
              <h3 className="f-geist-mono text-5xl md:text-6xl font-bold text-background">30+</h3>
              <p className="mt-2 text-lg font-semibold">Hours Saved Weekly</p>
              <p className="mt-1 text-sm text-muted-foreground">Let AI handle queries so your team can focus.</p>
            </div>
            <div>
              <h3 className="f-geist-mono text-5xl md:text-6xl font-bold text-background">80%</h3>
              <p className="mt-2 text-lg font-semibold">Support Cost Reduction</p>
              <p className="mt-1 text-sm text-muted-foreground">Dramatically cut costs by automating support.</p>
            </div>
            <div>
              <h3 className="f-geist-mono text-5xl md:text-6xl font-bold text-background">40%</h3>
              <p className="mt-2 text-lg font-semibold">More Qualified Leads</p>
              <p className="mt-1 text-sm text-muted-foreground">Engage and qualify visitors 24/7.</p>
            </div>
            <div>
              <h3 className="f-geist-mono text-5xl md:text-6xl font-bold text-background">10x</h3>
              <p className="mt-2 text-lg font-semibold">Faster Responses</p>
              <p className="mt-1 text-sm text-muted-foreground">Deliver instant answers and boost satisfaction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 24/7 feature sec */}
      <section className="feature-sec p-14 md:pt-32 px-4 sm:px-7 md:px-10">
        <div className="container mx-auto">
          <div className="feature-sec-headings text-center space-y-3 md:space-y-5 mb-10 md:mb-16">
            <h2 className="f-geist-mono text-3xl sm:text-4xl md:text-5xl font-bold">Smart Chatbots, Styled by Your Way</h2>
            <p className="text-base sm:text-lg opacity-80 max-w-3xl mx-auto">From voice and colors to chatbox templates and tone, customize every detail to fit your brand. Sleek, fun, or professional, it's your call.</p>
          </div>
          <div className="feature-sec-cards-wrap grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="card bg-white/90 dark:bg-white/5 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 p-5 sm:p-7 rounded-xl">
              <div className="card-heading space-y-2 sm:space-y-3">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-foreground">Cut Support Costs Instantly</h3>
                <p className="text-sm sm:text-base text-card-foreground">Deploy smart AI bots to answer repetitive queries, reduce manual workload and support tickets by up to 40%.</p>
              </div>
              <div className="card-body mt-6 sm:mt-8">
                <div className="relative aspect-[4/3] w-full bg-white rounded-lg p-4 shadow-sm">
                  <Image
                    src={'/svgs/feature-1.svg'}
                    alt="Support cost reduction illustration"
                    fill
                    className="object-contain p-4"
                  />
                </div>
              </div>
            </div>

            <div className="card bg-white/90 dark:bg-white/5 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 p-5 sm:p-7 rounded-xl">
              <div className="card-heading space-y-2 sm:space-y-3">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-foreground">24/7 Customer Support</h3>
                <p className="text-sm sm:text-base text-card-foreground">Provide instant responses to customer queries around the clock, ensuring no inquiry goes unanswered.</p>
              </div>
              <div className="card-body mt-6 sm:mt-8">
                <div className="relative aspect-[4/3] w-full bg-white rounded-lg p-4 shadow-sm">
                  <Image
                    src={'/svgs/feature-2.svg'}
                    alt="24/7 support illustration"
                    fill
                    className="object-contain p-4"
                  />
                </div>
              </div>
            </div>

            <div className="card bg-white/90 dark:bg-white/5 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 p-5 sm:p-7 rounded-xl">
              <div className="card-heading space-y-2 sm:space-y-3">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-foreground">Smart Lead Generation</h3>
                <p className="text-sm sm:text-base text-card-foreground">Convert visitors into qualified leads with intelligent conversation flows and personalized interactions.</p>
              </div>
              <div className="card-body mt-6 sm:mt-8">
                <div className="relative aspect-[4/3] w-full bg-white rounded-lg p-4 shadow-sm">
                  <Image
                    src={'/svgs/feature-3.svg'}
                    alt="Lead generation illustration"
                    fill
                    className="object-contain p-4"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Speech Bot */}
      <section className="ai-speech-bot py-14 md:py-20 px-4 sm:px-7 md:px-10 bg-primary">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
            <div className="ai-speech-bot-texts max-w-xl lg:max-w-2xl space-y-6 text-center lg:text-left">
              <h2 className="f-geist-mono text-3xl sm:text-4xl md:text-5xl font-bold text-background">AI Speech Bot</h2>
              <p className="text-base sm:text-lg text-muted-foreground">Add a voice touch to your digital experience with our Speech Bot - an interactive avatar that listens, understands, and responds in multiple languages.</p>
              <Link href={'/bot/new'} className="group btn-primary-gradient-hover try-it-out-btn  px-4 lg:px-7 py-2 lg:py-3 hover:scale-105 rounded-lg custom-transition duration-300 font-medium text-xs lg:text-sm
              bg-background text-foreground flex items-center justify-center gap-4 hover:text-white
              ">
                Try it out
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="ai-speech-bot-img relative w-full max-w-md lg:max-w-lg">
              <div className="relative aspect-square w-full">
                <Image
                  src={'/pngs/ai-bot-img.png'}
                  alt="ai-speech-bot"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              {/* Animated gradient ring */}
              <div className="absolute inset-0 -z-10 animate-pulse">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-purple-500/30 blur-2xl"></div>
              </div>
            </div>

            <div className="ai-speech-interaction w-full max-w-sm space-y-4">
              <div className="relative bg-card/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                {/* Voice wave animation */}
                <div className="flex items-center gap-1 mb-3">
                  <div className="w-1 h-4 bg-primary rounded-full animate-[soundwave_0.5s_ease-in-out_infinite]"></div>
                  <div className="w-1 h-6 bg-primary rounded-full animate-[soundwave_0.5s_ease-in-out_infinite_0.1s]"></div>
                  <div className="w-1 h-8 bg-primary rounded-full animate-[soundwave_0.5s_ease-in-out_infinite_0.2s]"></div>
                  <div className="w-1 h-4 bg-primary rounded-full animate-[soundwave_0.5s_ease-in-out_infinite_0.3s]"></div>
                  <div className="w-1 h-2 bg-primary rounded-full animate-[soundwave_0.5s_ease-in-out_infinite_0.4s]"></div>
                </div>
                <p className="text-sm text-card-foreground">AI is listening...</p>
              </div>

              <div className="bg-card/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" x2="12" y1="19" y2="22" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-card-foreground">How can I assist you today?</p>
                    <p className="text-xs text-muted-foreground">AI Assistant is ready to help</p>
                  </div>
                </div>
              </div>

              <div className="bg-card/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-card-foreground">Multiple languages supported</span>
                  </div>
                  <div className="flex -space-x-1">
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">EN</span>
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">ES</span>
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">FR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main >

  );
}



