import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';
import fetch from 'node-fetch';
import { XMLParser } from 'fast-xml-parser';

class WebsiteScraper {
  constructor(targetUrl) {
    this.targetUrl = targetUrl;
    this.baseUrl = new URL(targetUrl).origin;
    this.visited = new Set();
    this.queue = [];
    this.websiteType = null;
    this.maxPages = 15;

    this.scrapedData = {
      url: targetUrl,
      title: '',
      description: '',
      websiteType: '',
      pages: [],
      totalPages: 0,
      totalWords: 0,
      scrapingTime: 0,
      errors: [],
      sitemapUrls: [],
      skippedUrls: []
    };

    // Website type configurations
    this.typeConfigs = {
      college: {
        maxPages: 30,
        highPriorityKeywords: ['admission', 'fees', 'course', 'program', 'placement', 'eligibility'],
        mediumPriorityKeywords: ['about', 'facilities', 'hostel', 'scholarship', 'department', 'academic'],
        lowPriorityKeywords: ['campus', 'faculty', 'infrastructure', 'library', 'research'],
        ignoreKeywords: ['calendar', 'event', 'news', 'archive', 'gallery', 'profile', 'notification']
      },
      government: {
        maxPages: 20,
        highPriorityKeywords: ['services', 'citizen', 'application', 'procedure', 'policy', 'scheme'],
        mediumPriorityKeywords: ['about', 'department', 'contact', 'office', 'information'],
        lowPriorityKeywords: ['tender', 'recruitment', 'circular', 'order'],
        ignoreKeywords: ['archive', 'old', 'past', 'history', 'gallery', 'event']
      },
      company: {
        maxPages: 15,
        highPriorityKeywords: ['about', 'services', 'products', 'contact', 'pricing'],
        mediumPriorityKeywords: ['team', 'careers', 'portfolio', 'case-studies', 'testimonials'],
        lowPriorityKeywords: ['blog', 'news', 'resources', 'support'],
        ignoreKeywords: ['archive', 'old', 'category', 'tag', 'author']
      },
      tech: {
        maxPages: 18,
        highPriorityKeywords: ['about', 'products', 'services', 'api', 'pricing', 'docs'],
        mediumPriorityKeywords: ['features', 'solutions', 'integrations', 'support'],
        lowPriorityKeywords: ['blog', 'resources', 'community', 'changelog'],
        ignoreKeywords: ['archive', 'old', 'category', 'tag', 'author']
      },
      default: {
        maxPages: 15,
        highPriorityKeywords: ['about', 'services', 'products', 'contact'],
        mediumPriorityKeywords: ['team', 'portfolio', 'work'],
        lowPriorityKeywords: ['blog', 'news', 'resources'],
        ignoreKeywords: ['archive', 'old', 'tag']
      }
    };
  }

  detectWebsiteType(domain, title = '', description = '') {
    const url = domain.toLowerCase();
    const content = (title + ' ' + description).toLowerCase();

    // Educational institutions
    if (url.includes('.edu') || url.includes('.ac.') || 
        content.includes('university') || content.includes('college') || 
        content.includes('institute') || content.includes('school')) {
      return 'college';
    }

    // Government websites
    if (url.includes('.gov') || url.includes('.nic.in') ||
        content.includes('government') || content.includes('ministry') ||
        content.includes('department') || content.includes('municipal')) {
      return 'government';
    }

    // Tech/AI companies
    if (url.includes('.ai') || url.includes('.io') || url.includes('.dev') ||
        content.includes('artificial intelligence') || content.includes('software') ||
        content.includes('technology') || content.includes('startup')) {
      return 'tech';
    }

    // Business/Company (default for .com, .co.in, .org)
    if (url.includes('.com') || url.includes('.co.') || url.includes('.org')) {
      return 'company';
    }

    return 'default';
  }

  scoreUrl(url, websiteType) {
    const config = this.typeConfigs[websiteType] || this.typeConfigs.default;
    const urlLower = url.toLowerCase();

    // Immediate rejection patterns
    const rejectPatterns = [
      /year=|month=|date=|calendar/i,
      /page=|offset=|limit=|p\d+/i,
      /\.(pdf|jpg|jpeg|png|gif|zip|docx?|xlsx?|pptx?)$/i,
      /mailto:|tel:|javascript:/i,
      /#/,
      /\/(login|register|cart|checkout|admin|wp-admin)/i,
      /\/(privacy|terms|cookie)/i,
      /index\.php\?.*task=calendar/i, // Specific to your college issue
      /\/\d{4}\/\d{2}\//, // Date-based URLs like /2024/01/
      /\?.*year.*month/i // Any URL with year and month parameters
    ];

    if (rejectPatterns.some(pattern => pattern.test(url))) {
      return -1; // Reject completely
    }

    // URL too long (likely dynamic/generated)
    if (url.length > 150) {
      return -1;
    }

    // Score based on keywords
    let score = 10; // Base score

    // High priority keywords
    if (config.highPriorityKeywords.some(keyword => urlLower.includes(keyword))) {
      score += 100;
    }

    // Medium priority keywords
    if (config.mediumPriorityKeywords.some(keyword => urlLower.includes(keyword))) {
      score += 60;
    }

    // Low priority keywords
    if (config.lowPriorityKeywords.some(keyword => urlLower.includes(keyword))) {
      score += 30;
    }

    // Ignore keywords (but don't completely reject, just low score)
    if (config.ignoreKeywords.some(keyword => urlLower.includes(keyword))) {
      score = Math.min(score, 5);
    }

    // Bonus for clean URLs
    const segments = url.replace(this.baseUrl, '').split('/').filter(Boolean);
    if (segments.length <= 3) {
      score += 20; // Prefer shallower URLs
    }

    // Bonus for FAQ, contact, about patterns
    if (/faq|contact|about|help|support/i.test(url)) {
      score += 40;
    }

    return score;
  }

  filterAndPrioritizeLinks(links) {
    const scoredLinks = links
      .map(url => ({
        url,
        score: this.scoreUrl(url, this.websiteType)
      }))
      .filter(item => item.score > 0) // Remove rejected URLs
      .sort((a, b) => b.score - a.score); // Sort by score (highest first)

    // Log rejected URLs for debugging
    const rejectedUrls = links.filter(url => this.scoreUrl(url, this.websiteType) <= 0);
    this.scrapedData.skippedUrls.push(...rejectedUrls.slice(0, 10)); // Log first 10 for debugging

    return scoredLinks.map(item => item.url);
  }

  async scrape() {
    console.log('🚀 Starting Smart Website Scraper...');
    console.log(`📍 Target URL: ${this.targetUrl}`);
    const startTime = Date.now();
    let browser;

    try {
      console.log('🌐 Launching browser...');
      const isVercel = process.env.AWS_REGION || process.env.VERCEL;

      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: isVercel ? await chromium.executablePath() : undefined,
        headless: isVercel ? chromium.headless : true,
      });

      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(60000);
      page.setDefaultTimeout(60000);

      await this.applyStealth(page);
      await this.blockAssets(page);

      // Step 1: Scrape homepage first to detect website type
      console.log('🏠 Scraping homepage to detect website type...');
      const homepageData = await this.scrapePage(page, this.targetUrl);
      
      // Detect website type
      this.websiteType = this.detectWebsiteType(this.baseUrl, homepageData.title, homepageData.description);
      this.maxPages = this.typeConfigs[this.websiteType].maxPages;
      
      console.log(`🎯 Website type detected: ${this.websiteType.toUpperCase()}`);
      console.log(`📊 Max pages to scrape: ${this.maxPages}`);

      // Set site-level metadata
      this.scrapedData.title = homepageData.title;
      this.scrapedData.description = homepageData.description;
      this.scrapedData.websiteType = this.websiteType;
      this.scrapedData.pages.push(homepageData);
      this.visited.add(this.targetUrl);

      // Step 2: Try sitemap for additional URLs
      const sitemapUrls = await this.fetchSitemap();
      if (sitemapUrls.length) {
        console.log(`🗺️ Sitemap found: ${sitemapUrls.length} URLs`);
        this.scrapedData.sitemapUrls = sitemapUrls.slice(0, 100); // Limit sitemap URLs
      }

      // Step 3: Discover links from homepage
      console.log('🔍 Discovering and prioritizing links...');
      const homepageLinks = await this.discoverLinks(page);
      
      // Combine sitemap and discovered links
      const allLinks = [...new Set([...homepageLinks, ...sitemapUrls])];
      
      // Filter and prioritize all links
      const prioritizedLinks = this.filterAndPrioritizeLinks(allLinks);
      this.queue = prioritizedLinks.slice(0, this.maxPages - 1); // -1 because homepage is already scraped

      console.log(`📋 Queued ${this.queue.length} high-priority URLs for scraping`);
      console.log(`🚫 Skipped ${this.scrapedData.skippedUrls.length} low-value URLs`);

      // Step 4: Smart crawling with priority queue
      let pageCount = 1; // Homepage already scraped
      while (this.queue.length > 0 && pageCount < this.maxPages) {
        const url = this.queue.shift();
        if (this.visited.has(url)) continue;
        this.visited.add(url);

        try {
          console.log(`📄 Scraping (${pageCount + 1}/${this.maxPages}): ${url}`);
          const pageData = await this.scrapePage(page, url);
          this.scrapedData.pages.push(pageData);
          pageCount++;

          // Add a small delay to be polite
          await this.delay(1500);
        } catch (error) {
          console.log(`❌ Error scraping ${url}: ${error.message}`);
          this.scrapedData.errors.push(`Error scraping ${url}: ${error.message}`);
        }
      }

      this.scrapedData.totalPages = this.scrapedData.pages.length;
      this.scrapedData.totalWords = this.scrapedData.pages.reduce(
        (total, page) => total + page.wordCount, 0
      );
      this.scrapedData.scrapingTime = Date.now() - startTime;

      console.log(`✅ Scraping completed: ${this.scrapedData.totalPages} pages, ${this.scrapedData.totalWords} words`);
      return this.scrapedData;

    } catch (error) {
      console.error('💥 Fatal error during scraping:', error);
      this.scrapedData.errors.push(`Fatal error: ${error.message}`);
      return { ...this.scrapedData, error: `Scraping failed: ${error.message}` };
    } finally {
      if (browser) {
        await browser.close();
        console.log('Browser closed successfully.');
      }
    }
  }

  async scrapePage(page, pageUrl) {
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('body', { timeout: 10000 });
    await this.delay(500);

    const pageData = await page.evaluate(() => {
      const unwantedSelectors = [
        'script', 'style', 'nav', 'footer', 'header',
        '.cookie', '.popup', '.modal', '.advertisement',
        '.sidebar', '.widget', '.social-share',
        '[class*="nav"]', '[class*="menu"]', '[class*="footer"]',
        '[class*="header"]', '[id*="nav"]', '[id*="menu"]'
      ];
      unwantedSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
      });

      const title = document.title || '';
      const description = document.querySelector('meta[name="description"]')?.content || '';
      const h1 = document.querySelector('h1')?.textContent || '';
      const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim()).filter(Boolean);
      const h3s = Array.from(document.querySelectorAll('h3')).map(h => h.textContent.trim()).filter(Boolean);

      const mainContent = document.querySelector('main') || 
                         document.querySelector('.main-content') || 
                         document.querySelector('#content') || 
                         document.body;
      
      const textContent = mainContent ? mainContent.innerText : '';
      const cleanContent = textContent.replace(/\s+/g, ' ').trim();

      // Extract structured data (tables, lists)
      const tables = Array.from(document.querySelectorAll('table')).length;
      const lists = Array.from(document.querySelectorAll('ul, ol')).length;

      // Look for important patterns (fees, dates, etc.)
      const hasImportantData = /₹|fees|admission|deadline|eligibility|requirement/i.test(cleanContent);

      return {
        title,
        description,
        h1,
        h2s,
        h3s,
        content: cleanContent,
        wordCount: cleanContent.split(/\s+/).filter(Boolean).length,
        hasStructuredData: tables > 0 || lists > 2,
        hasImportantData,
        structureScore: tables * 10 + lists * 5
      };
    });

    return {
      url: pageUrl,
      ...pageData,
      scrapedAt: new Date().toISOString()
    };
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
            // Basic filtering before scoring
            const basicRejectPatterns = [
              /\.(pdf|jpg|jpeg|png|gif|zip|docx?)$/i,
              /mailto:|tel:|javascript:/i,
              /\/(wp-admin|admin|login|register)/i
            ];
            return !basicRejectPatterns.some(pattern => pattern.test(href));
          });

        return [...new Set(internalLinks)];
      }, this.baseUrl);

      return links;
    } catch (error) {
      console.log(`❌ Error discovering links: ${error.message}`);
      return [];
    }
  }

  async fetchSitemap() {
    const sitemapUrls = [];
    try {
      const res = await fetch(`${this.baseUrl}/sitemap.xml`, { timeout: 10000 });
      if (!res.ok) return sitemapUrls;

      const xml = await res.text();
      const parser = new XMLParser();
      const parsed = parser.parse(xml);

      if (parsed.urlset && parsed.urlset.url) {
        const urls = Array.isArray(parsed.urlset.url) ? parsed.urlset.url : [parsed.urlset.url];
        urls.forEach(u => {
          if (u.loc && typeof u.loc === 'string') {
            sitemapUrls.push(u.loc);
          }
        });
      }
    } catch (error) {
      console.log('No sitemap found or error parsing sitemap');
    }
    return [...new Set(sitemapUrls)];
  }

  async applyStealth(page) {
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    });
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
    });
  }

  async blockAssets(page) {
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'media', 'font', 'stylesheet'].includes(req.resourceType())) {
        return req.abort();
      }
      req.continue();
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const scrapeWebsite = async (url) => {
  if (!url) throw new Error('Please provide a URL to scrape.');
  const scraper = new WebsiteScraper(url);
  return await scraper.scrape();
};