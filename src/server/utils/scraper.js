import puppeteer from 'puppeteer';

class WebsiteScraper {
  constructor(targetUrl) {
    this.targetUrl = targetUrl;
    this.baseUrl = new URL(targetUrl).origin;
    this.scrapedData = {
      url: targetUrl,
      title: '',
      description: '',
      pages: [],
      totalPages: 0,
      totalWords: 0,
      scrapingTime: 0,
      errors: []
    };
  }

  async scrape() {
    console.log('🚀 Starting Website Scraper...');
    console.log(`📍 Target URL: ${this.targetUrl}`);
    
    const startTime = Date.now();
    let browser;
    
    try {
      console.log('🌐 Launching browser...');
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080',
        ],
        defaultViewport: {
          width: 1920,
          height: 1080
        }
      });

      const page = await browser.newPage();
      // Broaden default timeouts to reduce flaky navigations
      try {
        page.setDefaultNavigationTimeout(60000);
        page.setDefaultTimeout(60000);
      } catch {}
      
      // Add stealth configurations
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br'
      });
      
      // Modify the navigator object
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      });

      // Block heavy assets to improve load reliability and speed
      try {
        await page.setRequestInterception(true);
        page.on('request', (req) => {
          const resourceType = req.resourceType();
          if (['image', 'media', 'font'].includes(resourceType)) {
            return req.abort();
          }
          req.continue();
        });
      } catch {}

      console.log('📄 Scraping homepage...');
      const homepageData = await this.scrapePage(page, this.targetUrl);
      this.scrapedData.title = homepageData.title;
      this.scrapedData.description = homepageData.description;
      this.scrapedData.pages.push(homepageData);

      console.log('🔍 Discovering internal links...');
      const internalLinks = await this.discoverLinks(page);
      console.log(`📊 Found ${internalLinks.length} internal links`);

      let pageCount = 1;
      // For MVP, only scrape homepage and 2 additional pages max
      for (const link of internalLinks.slice(0, 2)) {
        try {
          console.log(`📄 Scraping page ${pageCount}/3: ${link}`);
          const pageData = await this.scrapePage(page, link);
          this.scrapedData.pages.push(pageData);
          pageCount++;
          await this.delay(2000); // Increased delay between pages
        } catch (error) {
          console.log(`❌ Error scraping ${link}: ${error.message}`);
          this.scrapedData.errors.push(`Error scraping ${link}: ${error.message}`);
        }
      }

      this.scrapedData.totalPages = this.scrapedData.pages.length;
      this.scrapedData.totalWords = this.scrapedData.pages.reduce((total, page) => total + page.wordCount, 0);
      this.scrapedData.scrapingTime = Date.now() - startTime;

      return this.scrapedData;

    } catch (error) {
      console.error('💥 Fatal error during scraping:', error);
      this.scrapedData.errors.push(`Fatal error: ${error.message}`);
      return { ...this.scrapedData, error: `Scraping failed: ${error.message}` };
    } finally {
      if (browser) {
        try {
          await browser.close();
          console.log('Browser closed successfully.');
        } catch (error) {
          console.error('Error closing browser:', error);
        }
      }
    }
  }

  async scrapePage(page, pageUrl) {
    const maxAttempts = 3;
    const baseTimeout = 30000;
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Attempt stricter wait first
        await page.goto(pageUrl, {
          waitUntil: 'networkidle2',
          timeout: baseTimeout * (attempt === 1 ? 1 : 2)
        });
      } catch (errStrict) {
        // Fallback to a looser wait to avoid hard timeouts
        try {
          await page.goto(pageUrl, {
            waitUntil: 'domcontentloaded',
            timeout: baseTimeout * (attempt === 1 ? 1 : 2)
          });
        } catch (errLoose) {
          lastError = errLoose;
          if (attempt < maxAttempts) {
            await this.delay(1000 * attempt); // backoff
            continue;
          }
          throw new Error(`Navigation failed after ${maxAttempts} attempts: ${errLoose.message}`);
        }
      }

      try {
        await page.waitForSelector('body', { timeout: 10000 });
      } catch {}

      await this.delay(800);

      const pageData = await page.evaluate(() => {
        const unwantedSelectors = [
          'script', 'style', 'nav', 'footer', 'header',
          '.nav', '.footer', '.header', '.menu', '.sidebar',
          '.cookie', '.popup', '.modal', '.advertisement',
          '[class*="nav"]', '[class*="menu"]', '[class*="footer"]',
          '[class*="header"]', '[id*="nav"]', '[id*="menu"]'
        ];

        unwantedSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => el.remove());
        });

        const title = document.title || '';
        const description = document.querySelector('meta[name="description"]')?.content || '';
        const h1 = document.querySelector('h1')?.textContent || '';
        const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim());
        const h3s = Array.from(document.querySelectorAll('h3')).map(h => h.textContent.trim());
        
        const mainContent = document.querySelector('main') || document.body;
        const textContent = mainContent ? mainContent.innerText : '';
        
        const cleanContent = textContent.replace(/\s+/g, ' ').trim();
        
        return {
          title,
          description,
          h1,
          h2s,
          h3s,
          content: cleanContent,
          wordCount: cleanContent.split(/\s+/).length,
        };
      });

      return {
        url: pageUrl,
        ...pageData,
        scrapedAt: new Date().toISOString()
      };
    }
    throw new Error(`Failed to scrape ${pageUrl}: ${lastError ? lastError.message : 'Unknown error'}`);
  }

  async discoverLinks(page) {
    try {
      const links = await page.evaluate((baseUrl) => {
        const allLinks = Array.from(document.querySelectorAll('a[href]'));
        const internalLinks = allLinks
          .map(a => a.href)
          .filter(href => {
            try {
              const linkUrl = new URL(href);
              const baseUrlObj = new URL(baseUrl);
              return linkUrl.hostname === baseUrlObj.hostname;
            } catch {
              return false;
            }
          })
          .filter(href => {
            const unwantedPatterns = [
              /\.(pdf|jpg|jpeg|png|gif|zip|doc|docx)$/i,
              /mailto:|tel:|javascript:/,
              /#/,
              /\?(.*&)?utm_/,
              /\/admin|\/wp-admin|\/login|\/register/,
              /\/privacy|\/terms|\/cookie/
            ];
            
            return !unwantedPatterns.some(pattern => pattern.test(href));
          });

        return [...new Set(internalLinks)];
      }, this.baseUrl);

      return this.prioritizeLinks(links);
    } catch (error) {
      console.log(`❌ Error discovering links: ${error.message}`);
      return [this.targetUrl];
    }
  }

  prioritizeLinks(links) {
    const highPriority = [];
    const mediumPriority = [];
    const lowPriority = [];

    const highPriorityPatterns = [
      /\/(about|services|products|contact|faq)[\/$]/i,
      /\/(about-us|our-services|what-we-do)[\/$]/i
    ];

    const mediumPriorityPatterns = [
      /\/(blog|news|case-studies|testimonials|pricing)[\/$]/i,
      /\/(portfolio|work|projects)[\/$]/i
    ];

    links.forEach(link => {
      if (highPriorityPatterns.some(pattern => pattern.test(link))) {
        highPriority.push(link);
      } else if (mediumPriorityPatterns.some(pattern => pattern.test(link))) {
        mediumPriority.push(link);
      } else {
        lowPriority.push(link);
      }
    });

    return [...highPriority, ...mediumPriority, ...lowPriority];
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const scrapeWebsite = async (url) => {
  if (!url) {
    throw new Error('Please provide a URL to scrape.');
  }
  const scraper = new WebsiteScraper(url);
  const report = await scraper.scrape();
  return report;
}; 