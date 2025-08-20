"use client"

import React, { useState } from 'react';
import { Search, X, ExternalLink, Copy, Check } from 'lucide-react';
import Image from 'next/image';

const EmbedGuide = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState(null);


  const platforms = [
    {
      id: 'webflow',
      name: 'Webflow',
      icon: 'svgs/logos/webflow.svg',
      iconFallback: 'WF',
      color: 'bg-blue-600',
      steps: [
        {
          title: 'Open your Webflow project',
          description: 'Navigate to your Webflow Designer and select the project where you want to add the chatbot.',
          code: null
        },
        {
          title: 'Go to Project Settings',
          description: 'Click on the project name in the top-left corner, then select "Project Settings" from the dropdown.',
          code: null
        },
        {
          title: 'Navigate to Custom Code',
          description: 'In the Project Settings, click on the "Custom Code" tab in the left sidebar.',
          code: null
        },
        {
          title: 'Add the script to Footer Code',
          description: 'Scroll down to the "Footer Code" section and paste your Chatrio embed code before the closing </body> tag.',
          code: '<script src="https://chatrio.ai/api/bot/YOUR_BOT_ID.js"/script></script>'
        },
        {
          title: 'Save and Publish',
          description: 'Click "Save Changes" and then publish your site. Your AI chatbot will now appear on all pages.',
          code: null
        }
      ]
    },
    {
      id: 'framer',
      name: 'Framer',
      icon: 'svgs/logos/framer.svg',
      iconFallback: 'FR',
      color: 'bg-black',
      steps: [
        {
          title: 'Open your Framer project',
          description: 'Go to your Framer project dashboard and open the site you want to add the chatbot to.',
          code: null
        },
        {
          title: 'Access Site Settings',
          description: 'Click on the site name at the top, then select "Site Settings" from the dropdown menu.',
          code: null
        },
        {
          title: 'Navigate to Custom Code',
          description: 'In the Site Settings, find and click on "Custom Code" in the left sidebar.',
          code: null
        },
        {
          title: 'Add to End of <body> tag',
          description: 'Scroll to the "End of <body> tag" section and paste your Chatrio embed script.',
          code: '<script src="https://chatrio.ai/api/bot/YOUR_BOT_ID.js/script"></script>'
        },
        {
          title: 'Save and Publish',
          description: 'Click "Save" and then publish your changes. The chatbot will be live on your site.',
          code: null
        }
      ]
    },
    {
      id: 'wordpress',
      name: 'WordPress',
      icon: 'svgs/logos/wordpress.svg',
      iconFallback: 'WP',
      color: 'bg-white',
      steps: [
        {
          title: 'Access WordPress Admin',
          description: 'Log into your WordPress dashboard by going to yoursite.com/wp-admin',
          code: null
        },
        {
          title: 'Navigate to Theme Editor',
          description: 'Go to Appearance → Theme Editor or use a plugin like "Insert Headers and Footers".',
          code: null
        },
        {
          title: 'Edit footer.php or use plugin',
          description: 'If editing directly, open footer.php and add the script before </body>. If using a plugin, paste in the footer scripts section.',
          code: '<script src="https://chatrio.ai/api/bot/YOUR_BOT_ID.js/script"></script>'
        },
        {
          title: 'Save Changes',
          description: 'Click "Update File" if editing directly, or "Save" if using a plugin. Your chatbot is now live.',
          code: null
        }
      ]
    },
    {
      id: 'shopify',
      name: 'Shopify',
      icon: 'svgs/logos/shopify.svg',
      iconFallback: 'SH',
      // color: 'bg-green-600',
      steps: [
        {
          title: 'Access Shopify Admin',
          description: 'Log into your Shopify admin panel and navigate to your store dashboard.',
          code: null
        },
        {
          title: 'Go to Online Store',
          description: 'Click on "Online Store" in the left sidebar, then select "Themes".',
          code: null
        },
        {
          title: 'Edit Theme Code',
          description: 'Find your active theme, click "Actions" → "Edit code".',
          code: null
        },
        {
          title: 'Open theme.liquid',
          description: 'In the Layout folder, click on "theme.liquid" to open the main template file.',
          code: null
        },
        {
          title: 'Add script before </body>',
          description: 'Scroll to the bottom and paste your Chatrio script just before the closing </body> tag.',
          code: '<script src="https://chatrio.ai/api/bot/YOUR_BOT_ID.js/script"></script>'
        },
        {
          title: 'Save Changes',
          description: 'Click "Save" and your chatbot will be live on your Shopify store.',
          code: null
        }
      ]
    },
    {
      id: 'wix',
      name: 'Wix',
      icon: 'svgs/logos/wix.svg',
      iconFallback: 'WX',
      color: 'bg-white',
      steps: [
        {
          title: 'Open Wix Editor',
          description: 'Log into your Wix account and open the website editor for your site.',
          code: null
        },
        {
          title: 'Access Settings',
          description: 'Click on "Settings" in the top menu of the editor.',
          code: null
        },
        {
          title: 'Go to Custom Code',
          description: 'In Settings, click on "Custom Code" from the advanced section.',
          code: null
        },
        {
          title: 'Add New Custom Code',
          description: 'Click "+ Add Custom Code" and paste your Chatrio script. Set it to load on "All Pages" and "Body - End".',
          code: '<script src="https://chatrio.ai/api/bot/YOUR_BOT_ID.js/script"></script>'
        },
        {
          title: 'Apply and Publish',
          description: 'Click "Apply" and then publish your site. Your chatbot will appear on all pages.',
          code: null
        }
      ]
    },
    {
      id: 'squarespace',
      name: 'Squarespace',
      icon: 'svgs/logos/squarespace.svg',
      iconFallback: 'SQ',
      color: 'bg-white',
      steps: [
        {
          title: 'Access Site Settings',
          description: 'In your Squarespace dashboard, go to Settings → Advanced → Code Injection.',
          code: null
        },
        {
          title: 'Open Code Injection',
          description: 'Click on "Code Injection" in the Advanced settings section.',
          code: null
        },
        {
          title: 'Add to Footer',
          description: 'Paste your Chatrio embed code in the "Footer" section.',
          code: '<script src="https://chatrio.ai/api/bot/YOUR_BOT_ID.js/script"></script>'
        },
        {
          title: 'Save Changes',
          description: 'Click "Save" and your chatbot will be live across your entire Squarespace site.',
          code: null
        }
      ]
    },
    {
      id: 'html',
      name: 'HTML/Custom',
      icon: 'svgs/logos/html.svg',
      iconFallback: 'HTML',
      color: 'bg-orange-600',
      steps: [
        {
          title: 'Open your HTML file',
          description: 'Open the HTML file where you want to add the chatbot using your preferred code editor.',
          code: null
        },
        {
          title: 'Find the closing </body> tag',
          description: 'Locate the closing </body> tag at the bottom of your HTML document.',
          code: null
        },
        {
          title: 'Add the script',
          description: 'Paste the Chatrio embed script just before the closing </body> tag.',
          code: '<script src="https://chatrio.ai/api/bot/YOUR_BOT_ID.js/script"></script>'
        },
        {
          title: 'Save and upload',
          description: 'Save your HTML file and upload it to your web server. Your chatbot is now live!',
          code: null
        }
      ]
    },
    {
      id: 'react',
      name: 'api/bot/Next.js/script',
      icon: 'svgs/logos/react.svg',
      iconFallback: 'RE',
      color: 'bg-white',
      steps: [
        {
          title: 'Create a component',
          description: 'Create a new component file or use an existing layout component.',
          code: null
        },
        {
          title: 'Add useEffect hook',
          description: 'Use useEffect to dynamically load the Chatrio script when the component mounts.',
          code: `useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://chatrio.ai/api/bot/YOUR_BOT_ID.js/script';
  script.async = true;
  document.body.appendChild(script);
  
  return () => {
    document.body.removeChild(script);
  };
}, []);`
        },
        {
          title: 'Add to your layout',
          description: 'Include this component in your main api/botor _app.js/script file to make it available site-wide.',
          code: null
        }
      ]
    },
    {
      id: 'joomla',
      name: 'Joomla',
      icon: 'svgs/logos/joomla.svg',
      iconFallback: 'JO',
      color: 'bg-white',
      steps: [
        {
          title: 'Allow Script Embedding',
          description: 'Go to System > Manage > Plugins, open Editor - TinyMCE, and remove script from the Prohibited Elements list. Save your changes.',
          code: null
        },
        {
          title: 'Adjust Text Filters',
          description: 'Go to System > Global Configuration > Text Filters. Set your user group (e.g., Super Users) to No Filtering and save.',
          code: null
        },
        {
          title: 'Edit the Article',
          description: 'Edit the article where you want the chatbot. Switch to HTML/source view in the editor.',
          code: null
        },
        {
          title: 'Paste the Chatrio Script',
          description: 'Paste your Chatrio embed script at the desired location in the article (usually before </body> or at the end of the content).',
          code: '<script src="https://chatrio.ai/api/bot/YOUR_BOT_ID.js/script"></script>'
        },
        {
          title: 'Save and Publish',
          description: 'Save the article and view your site to confirm the chatbot appears.',
          code: null
        }
      ]
    }
  ];

  const filteredPlatforms = platforms.filter(platform =>
    platform.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCloseModal = () => {
    setSelectedPlatform(null);
  };

  return (
    <div className=" bg-background mt-32 md:mt-40 px-4 sm:px-7 md:px-10 pb-15">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Embed Guide
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your platform and follow our step-by-step guide to add your AI chatbot to your website in minutes.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Search for your platform..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPlatforms.map((platform) => (
            <div
              key={platform.id}
              onClick={() => setSelectedPlatform(platform)}
              className="group cursor-pointer bg-card hover:bg-muted/50 border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`w-16 h-16 ${platform.color} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                  {platform.icon ? (
                    <Image 
                      src={platform.icon}
                      alt={platform.name} 
                      width={40} 
                      height={40} 
                      className="object-contain"
                    />
                  ) : (
                    platform.iconFallback
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                    {platform.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {platform.steps.length} steps
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPlatforms.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No platforms found for "{searchQuery}"</p>
              <p className="text-sm">Try a different search term or browse all available platforms.</p>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Show All Platforms
            </button>
          </div>
        )}

        {/* Modal */}
        {selectedPlatform && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${selectedPlatform.color} rounded-lg flex items-center justify-center text-white font-bold shadow-lg`}>
                    {selectedPlatform.icon ? (
                      <Image
                        src={selectedPlatform.icon}
                        alt={selectedPlatform.name}
                        width={30}
                        height={30}
                        className="object-contain"
                      />
                    ) : (
                      selectedPlatform.iconFallback
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {selectedPlatform.name} Integration
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Follow these {selectedPlatform.steps.length} simple steps
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-6">
                  {selectedPlatform.steps.map((step, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {step.title}
                          </h3>
                          <p className="text-muted-foreground mb-3">
                            {step.description}
                          </p>
                          {step.code && (
                            <div className="relative">
                              <pre className="bg-muted/50 border border-border rounded-lg p-4 text-sm overflow-x-auto">
                                <code className="text-foreground">{step.code}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                      {index < selectedPlatform.steps.length - 1 && (
                        <div className="absolute left-4 top-10 bottom-0 w-px bg-border"></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-border">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">i</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Need Help?</h4>
                        <p className="text-sm text-muted-foreground">
                          If you're having trouble with the integration, contact our support team or check the platform's documentation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-6 border-t border-border bg-muted/20">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Close
                </button>
                <div className="flex items-center space-x-3">
                  <a
                    href={`https://docs.${selectedPlatform.id}.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>Platform Docs</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={handleCloseModal}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EmbedGuide;