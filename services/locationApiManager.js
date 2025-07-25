// services/locationApiManager.js
const axios = require('axios');

class LocationBasedAPIManager {
  constructor() {
    this.apiProviders = this.setupProviders();
    this.geocodingCache = new Map();
    this.rateLimitCache = new Map();
  }

  setupProviders() {
    return {
      Cyprus: {
        services: [
          {
            name: 'Cyprus_Social_Services',
            endpoint: 'https://api.cyprus.gov.cy/social-services',
            apiKey: process.env.CYPRUS_API_KEY,
            active: false
          },
          {
            name: 'EU_Social_API',
            endpoint: 'https://api.ec.europa.eu/social-services',
            apiKey: process.env.EU_API_KEY,
            active: false
          }
        ],
        jobs: [
          {
            name: 'Indeed_Cyprus',
            endpoint: 'https://api.indeed.com/ads/apisearch',
            apiKey: process.env.INDEED_API_KEY,
            active: true,
            params: {
              publisher: process.env.INDEED_PUBLISHER_ID,
              v: '2',
              format: 'json',
              co: 'cy'
            }
          },
          {
            name: 'Adzuna_Cyprus',
            endpoint: 'https://api.adzuna.com/v1/api/jobs',
            apiKey: process.env.ADZUNA_API_KEY,
            active: true,
            params: {
              app_id: process.env.ADZUNA_APP_ID,
              app_key: process.env.ADZUNA_API_KEY
            }
          }
        ]
      },
      Turkey: {
        services: [
          {
            name: 'ASPB_API',
            endpoint: 'https://api.aile.gov.tr/sosyal-hizmetler',
            apiKey: process.env.TURKEY_ASPB_KEY,
            active: false
          }
        ],
        jobs: [
          {
            name: 'Indeed_Turkey',
            endpoint: 'https://api.indeed.com/ads/apisearch',
            apiKey: process.env.INDEED_API_KEY,
            active: true,
            params: {
              publisher: process.env.INDEED_PUBLISHER_ID,
              v: '2',
              format: 'json',
              co: 'tr'
            }
          },
          {
            name: 'Adzuna_Turkey',
            endpoint: 'https://api.adzuna.com/v1/api/jobs',
            apiKey: process.env.ADZUNA_API_KEY,
            active: true,
            params: {
              app_id: process.env.ADZUNA_APP_ID,
              app_key: process.env.ADZUNA_API_KEY
            }
          },
          {
            name: 'Kariyer_Net',
            endpoint: 'https://www.kariyer.net/api/jobs',
            apiKey: process.env.KARIYER_NET_KEY,
            active: true
          }
        ]
      },
      'United States': {
        services: [
          {
            name: '211_API',
            endpoint: 'https://api.211.org/search',
            apiKey: process.env.TWO_ONE_ONE_API_KEY,
            active: true,
            params: {
              format: 'json'
            }
          }
        ],
        jobs: [
          {
            name: 'Indeed_US',
            endpoint: 'https://api.indeed.com/ads/apisearch',
            apiKey: process.env.INDEED_API_KEY,
            active: false,
            params: {
              publisher: process.env.INDEED_PUBLISHER_ID,
              v: '2',
              format: 'json',
              co: 'us'
            }
          },
          {
            name: 'ZipRecruiter_US',
            endpoint: 'https://api.ziprecruiter.com/jobs/v1',
            apiKey: process.env.ZIPRECRUITER_API_KEY,
            active: false
          }
        ]
      },
      'United Kingdom': {
        services: [
          {
            name: 'Gov_UK_API',
            endpoint: 'https://www.gov.uk/api/content/homeless-help',
            apiKey: process.env.GOV_UK_API_KEY,
            active: false
          }
        ],
        jobs: [
          {
            name: 'Indeed_UK',
            endpoint: 'https://api.indeed.com/ads/apisearch',
            apiKey: process.env.INDEED_API_KEY,
            active: false,
            params: {
              publisher: process.env.INDEED_PUBLISHER_ID,
              v: '2',
              format: 'json',
              co: 'gb'
            }
          },
          {
            name: 'Reed_UK',
            endpoint: 'https://www.reed.co.uk/api/1.0/search',
            apiKey: process.env.REED_UK_KEY,
            active: true
          }
        ]
      },
      Germany: {
 services: [
   {
     name: 'Sozialamt_API',
     endpoint: 'https://api.sozialamt.de/dienste',
     apiKey: process.env.GERMANY_SOCIAL_KEY,
     active: false
   }
 ],
 jobs: [
   {
     name: 'Indeed_Germany',
     endpoint: 'https://api.indeed.com/ads/apisearch',
     apiKey: process.env.INDEED_API_KEY,
     active: false,
     params: {
       publisher: process.env.INDEED_PUBLISHER_ID,
       v: '2',
       format: 'json',
       co: 'de'
     }
   },
   {
     name: 'Adzuna_Germany',
     endpoint: 'https://api.adzuna.com/v1/api/jobs',
     apiKey: process.env.ADZUNA_API_KEY,
     active: true,
     params: {
       app_id: process.env.ADZUNA_APP_ID,
       app_key: process.env.ADZUNA_API_KEY
     }
   }
        ]
      },
      Greece: {
        services: [
          {
            name: 'Ministry_Social_GR',
            endpoint: 'https://api.moh.gov.gr/social-services',
            apiKey: process.env.GREECE_SOCIAL_KEY,
            active: false
          }
        ],
        jobs: [
          {
            name: 'Indeed_Greece',
            endpoint: 'https://api.indeed.com/ads/apisearch',
            apiKey: process.env.INDEED_API_KEY,
            active: false,
            params: {
              publisher: process.env.INDEED_PUBLISHER_ID,
              v: '2',
              format: 'json',
              co: 'gr'
            }
          }
        ]
      },
      Global: {
        services: [
          {
            name: 'OpenStreetMap_Amenities',
            endpoint: 'https://overpass-api.de/api/interpreter',
            active: true,
            free: true
          },
          {
            name: 'Google_Places_API',
            endpoint: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
            apiKey: process.env.GOOGLE_PLACES_KEY,
            active: true,
            params: {
              key: process.env.GOOGLE_PLACES_KEY
            }
          }
        ],
        jobs: [
          {
            name: 'Adzuna_Global',
            endpoint: 'https://api.adzuna.com/v1/api/jobs',
            apiKey: process.env.ADZUNA_API_KEY,
            active: true,
            params: {
              app_id: process.env.ADZUNA_APP_ID,
              app_key: process.env.ADZUNA_API_KEY
            }
          }
        ]
      }
    };
  }

  async reverseGeocode(lat, lng) {
    const cacheKey = `${lat},${lng}`;
    if (this.geocodingCache.has(cacheKey)) {
      return this.geocodingCache.get(cacheKey);
    }

    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat,
          lon: lng,
          format: 'json',
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'DignityServices/1.0 (homeless-services-app)'
        }
      });

      const location = {
        country: response.data.address?.country || 'Global',
        city: response.data.address?.city || 
              response.data.address?.town || 
              response.data.address?.village || 
              'Unknown',
        state: response.data.address?.state || response.data.address?.region,
        postcode: response.data.address?.postcode
      };

      this.geocodingCache.set(cacheKey, location);
      return location;
    } catch (error) {
      console.error('Reverse geocoding error:', error.message);
      return {
        country: 'Global',
        city: 'Unknown',
        state: null,
        postcode: null
      };
    }
  }

  checkRateLimit(providerName) {
    const key = `rate_limit_${providerName}`;
    const lastCall = this.rateLimitCache.get(key);
    const now = Date.now();

    if (lastCall && (now - lastCall) < 1000) {
      return false;
    }

    this.rateLimitCache.set(key, now);
    return true;
  }

  getProvidersForLocation(country) {
    return this.apiProviders[country] || this.apiProviders.Global;
  }

  async fetchExternalJobs(lat, lng, radius = 25) {
    const location = await this.reverseGeocode(lat, lng);
    const providers = this.getProvidersForLocation(location.country);
    let allJobs = [];

    for (const provider of providers.jobs) {
      if (!provider.active) continue;
      if (!this.checkRateLimit(provider.name)) continue;

      try {
        const jobs = await this.callJobAPI(provider, lat, lng, radius, location);
        allJobs = [...allJobs, ...jobs];
      } catch (error) {
        console.log(`${provider.name} API failed:`, error.message);
      }
    }

    if (allJobs.length < 0) {
      const mockJobs = this.generateExtendedMockJobs(location, 0);
      allJobs = [...allJobs, ...mockJobs];
    }

    return {
      jobs: allJobs,
      location,
      source: 'external_apis'
    };
  }

  async callJobAPI(provider, lat, lng, radius, location) {
    switch (provider.name) {
      case 'Indeed_US':
      case 'Indeed_Turkey':
      case 'Indeed_Cyprus':
      case 'Indeed_UK':
      case 'Indeed_Germany':
      case 'Indeed_Greece':
        return await this.callIndeedAPI(provider, location, radius);
      case 'Adzuna_Cyprus':
      case 'Adzuna_Turkey':
      case 'Adzuna_Greece':
      case 'Adzuna_Germany':
      case 'Adzuna_Global':
        return await this.callAdzunaAPI(provider, location, radius);
      case 'Reed_UK':
        return await this.callReedAPI(provider, location, radius);
      case 'ZipRecruiter_US':
        return await this.callZipRecruiterAPI(provider, location, radius);
      case 'Kariyer_Net':
        return await this.callKariyerNetAPI(provider, location, radius);
      default:
        console.log(`${provider.name} implementation coming soon...`);
        return this.generateMockJobs(location, provider.name);
    }
  }

  async callIndeedAPI(provider, location, radius) {
    if (!provider.apiKey) {
      console.log(`Indeed API key not configured for ${provider.name}`);
      return this.generateMockJobs(location, provider.name);
    }

    try {
      const response = await axios.get(provider.endpoint, {
        params: {
          ...provider.params,
          q: 'entry level OR no experience OR homeless friendly OR işçi OR garson OR temizlik',
          l: `${location.city}, ${location.country}`,
          radius: radius,
          limit: 50,
          start: 0
        }
      });

      if (response.data.results) {
        console.log(`✅ ${provider.name}: ${response.data.results.length} jobs found from Indeed`);
        return response.data.results.map(job => ({
          title: job.jobtitle,
          company: job.company,
          type: this.mapJobType(job.formattedRelativeTime),
          salary: job.salary || 'Competitive',
          location: `${job.city}, ${job.state || job.country}`,
          description: job.snippet,
          requirements: this.extractRequirements(job.snippet),
          benefits: this.extractBenefits(job.snippet),
          contactEmail: '',
          contactPhone: '',
          applicationUrl: job.url,
          isHomelessFriendly: this.isHomelessFriendlyJob(job.snippet),
          isActive: true,
          postedDate: new Date(),
          provider: provider.name,
          external: true,
          urgency: this.isHomelessFriendlyJob(job.snippet) ? 'high' : 'medium'
        }));
      } else {
        console.log(`⚠️ ${provider.name}: No results from Indeed API`);
        return this.generateMockJobs(location, provider.name);
      }
    } catch (error) {
      console.error(`❌ ${provider.name} API Error:`, error.message);
      return this.generateMockJobs(location, provider.name);
    }
  }

  async callAdzunaAPI(provider, location, radius) {
    if (!provider.apiKey) {
      console.log(`Adzuna API key not configured for ${provider.name}`);
      return this.generateMockJobs(location, provider.name);
    }

    try {
      const countryCode = this.getAdzunaCountryCode(location.country);
      const searchTerms = this.getLocalizedSearchTerms(location.country);
      const response = await axios.get(`${provider.endpoint}/${countryCode}/search/1`, {
        params: {
          ...provider.params,
          what: searchTerms,
          where: location.city,
          distance: radius,
          results_per_page: 50
        }
      });

      if (response.data.results) {
        console.log(`✅ ${provider.name}: ${response.data.results.length} jobs found from Adzuna`);
        return response.data.results.map(job => ({
          title: job.title,
          company: job.company?.display_name || 'Company',
          type: this.mapJobType(job.contract_type),
          salary: this.formatSalary(job, location.country),
          location: job.location?.display_name || `${location.city}, ${location.country}`,
          description: job.description || 'Job description not available',
          requirements: this.extractRequirements(job.description),
          benefits: this.extractBenefits(job.description),
          contactEmail: '',
          contactPhone: '',
          applicationUrl: job.redirect_url,
          isHomelessFriendly: this.isHomelessFriendlyJob(job.description),
          isActive: true,
          postedDate: job.created ? new Date(job.created) : new Date(),
          provider: provider.name,
          external: true,
          urgency: this.isHomelessFriendlyJob(job.description) ? 'high' : 'medium'
        }));
      } else {
        console.log(`⚠️ ${provider.name}: No results from Adzuna API`);
        return this.generateMockJobs(location, provider.name);
      }
    } catch (error) {
      console.error(`❌ ${provider.name} API Error:`, error.message);
      return this.generateMockJobs(location, provider.name);
    }
  }

  async callReedAPI(provider, location, radius) {
    if (!provider.apiKey) {
      return this.generateMockJobs(location, 'Reed_UK');
    }

    try {
      const response = await axios.get(provider.endpoint, {
        headers: {
          'Authorization': `Basic ${Buffer.from(provider.apiKey + ':').toString('base64')}`
        },
        params: {
          keywords: 'entry level',
          locationName: location.city,
          distanceFromLocation: radius,
          resultsToTake: 50
        }
      });

      return response.data.results?.map(job => ({
        title: job.jobTitle,
        company: job.employerName,
        type: this.mapJobType(job.jobType),
        salary: job.minimumSalary ? `£${job.minimumSalary}-${job.maximumSalary}` : 'Competitive',
        location: job.locationName,
        description: job.jobDescription,
        requirements: [],
        benefits: [],
        contactEmail: '',
        contactPhone: '',
        applicationUrl: job.jobUrl,
        isHomelessFriendly: this.isHomelessFriendlyJob(job.jobDescription),
        isActive: true,
        postedDate: new Date(job.date),
        provider: 'Reed_UK',
        external: true
      })) || [];
    } catch (error) {
      console.error('Reed API Error:', error.message);
      return this.generateMockJobs(location, 'Reed_UK');
    }
  }

  async callZipRecruiterAPI(provider, location, radius) {
    if (!provider.apiKey) {
      return this.generateMockJobs(location, 'ZipRecruiter');
    }

    try {
      const response = await axios.get(provider.endpoint, {
        params: {
          search: 'entry level',
          location: location.city,
          radius_miles: Math.round(radius * 0.621371),
          jobs_per_page: 50,
          api_key: provider.apiKey
        }
      });

      return response.data.jobs?.map(job => ({
        title: job.name,
        company: job.hiring_company?.name || 'Company',
        type: this.mapJobType(job.employment_type),
        salary: job.salary_min_annual ? `$${job.salary_min_annual}-${job.salary_max_annual}` : 'Competitive',
        location: `${job.city}, ${job.state}`,
        description: job.snippet,
        requirements: [],
        benefits: [],
        contactEmail: '',
        contactPhone: '',
        applicationUrl: job.url,
        isHomelessFriendly: this.isHomelessFriendlyJob(job.snippet),
        isActive: true,
        postedDate: new Date(job.posted_time_friendly),
        provider: 'ZipRecruiter',
        external: true
      })) || [];
    } catch (error) {
      console.error('ZipRecruiter API Error:', error.message);
      return this.generateMockJobs(location, 'ZipRecruiter');
    }
  }

  async callKariyerNetAPI(provider, location, radius) {
    try {
      return this.generateTurkishJobs(location);
    } catch (error) {
      console.error('Kariyer.net API Error:', error.message);
      return this.generateMockJobs(location, 'Kariyer_Net');
    }
  }

  generateExtendedMockJobs(location, count = 20) {
    const jobTemplates = [
      { title: 'Restaurant Server', company: 'Mediterranean Bistro', type: 'part-time', industry: 'hospitality' },
      { title: 'Kitchen Assistant', company: 'Café Roma', type: 'part-time', industry: 'hospitality' },
      { title: 'Hotel Cleaner', company: 'Budget Inn', type: 'full-time', industry: 'hospitality' },
      { title: 'Bartender', company: 'Sports Bar', type: 'part-time', industry: 'hospitality' },
      { title: 'Food Prep Worker', company: 'Fast Food Chain', type: 'full-time', industry: 'hospitality' },
      { title: 'Sales Assistant', company: 'Fashion Store', type: 'part-time', industry: 'retail' },
      { title: 'Stock Clerk', company: 'Supermarket Chain', type: 'full-time', industry: 'retail' },
      { title: 'Cashier', company: 'Convenience Store', type: 'part-time', industry: 'retail' },
      { title: 'Warehouse Worker', company: 'Logistics Express', type: 'full-time', industry: 'logistics' },
      { title: 'Package Handler', company: 'Shipping Company', type: 'part-time', industry: 'logistics' },
      { title: 'Office Cleaner', company: 'Cleaning Pro', type: 'part-time', industry: 'services' },
      { title: 'Janitor', company: 'Building Services', type: 'full-time', industry: 'services' },
      { title: 'Security Guard', company: 'SecureTech', type: 'full-time', industry: 'security' },
      { title: 'Data Entry Clerk', company: 'Office Solutions', type: 'full-time', industry: 'admin' },
      { title: 'Receptionist', company: 'Medical Center', type: 'part-time', industry: 'admin' },
      { title: 'Care Assistant', company: 'Senior Care Home', type: 'full-time', industry: 'healthcare' }
    ];

    return Array.from({ length: count }, (_, index) => {
      const template = jobTemplates[index % jobTemplates.length];
      const companyVariations = [
        template.company,
        `${template.company} Ltd.`,
        `${template.company} Inc.`,
        `${template.company} Co.`,
        `${template.company} Group`
      ];

      return {
        id: `mock_ext_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        title: template.title,
        company: companyVariations[index % companyVariations.length],
        type: template.type,
        salary: this.generateSalaryByLocation(location.country, template.type),
        location: `${location.city}, ${location.country}`,
        description: `${this.getJobDescription(template.industry)} Entry-level ${template.title.toLowerCase()} position in ${location.city}. ${this.getExperienceText()}`,
        requirements: this.getRequirementsByIndustry(template.industry),
        benefits: this.getBenefitsByType(template.type),
        contactEmail: this.generateEmail(template.company),
        contactPhone: this.generatePhone(location.country),
        applicationUrl: '',
        isHomelessFriendly: this.getHomelessFriendlyChance(template.industry),
        isActive: true,
        postedDate: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
        provider: 'Enhanced_Mock',
        external: true,
        urgency: this.getUrgencyLevel()
      };
    });
  }

  generateSalaryByLocation(country, type) {
    const salaryRanges = {
      Turkey: {
        'part-time': '₺12,000-18,000',
        'full-time': '₺17,000-25,000',
        'contract': '₺15,000-22,000'
      },
      Cyprus: {
        'part-time': '€800-1,200',
        'full-time': '€1,200-1,800',
        'contract': '€1,000-1,500'
      },
      'United States': {
        'part-time': '$15-25/hour',
        'full-time': '$30,000-45,000',
        'contract': '$20-35/hour'
      },
      'United Kingdom': {
        'part-time': '£8-12/hour',
        'full-time': '£18,000-28,000',
        'contract': '£12-20/hour'
      },
      Germany: {
        'part-time': '€10-15/hour',
        'full-time': '€25,000-35,000',
        'contract': '€15-25/hour'
      },
      Global: {
        'part-time': '$10-15/hour',
        'full-time': '$25,000-35,000',
        'contract': '$15-25/hour'
      }
    };

    return salaryRanges[country]?.[type] || salaryRanges.Global[type];
  }

  getJobDescription(industry) {
    const descriptions = {
      hospitality: 'Join our dynamic hospitality team and provide excellent customer service.',
      retail: 'Opportunity to work in fast-paced retail environment with growth potential.',
      logistics: 'Be part of our efficient logistics operations ensuring timely deliveries.',
      services: 'Contribute to maintaining clean and safe environments for our clients.',
      security: 'Help maintain safety and security in various locations.',
      admin: 'Support daily office operations with administrative tasks.',
      healthcare: 'Make a difference in healthcare by supporting patient care.',
      construction: 'Join construction projects and learn valuable trade skills.'
    };
    return descriptions[industry] || 'Great opportunity to start your career.';
  }

  getExperienceText() {
    const texts = [
      'No previous experience required.',
      'Training provided for suitable candidates.',
      'Entry-level position with growth opportunities.',
      'Ideal for career starters.',
      'We welcome first-time job seekers.'
    ];
    return texts[Math.floor(Math.random() * texts.length)];
  }

  getRequirementsByIndustry(industry) {
    const requirements = {
      hospitality: ['Friendly personality', 'Customer service skills', 'Flexibility with hours'],
      retail: ['Good communication', 'Basic math skills', 'Reliability'],
      logistics: ['Physical stamina', 'Attention to detail', 'Team player'],
      services: ['Physical ability', 'Attention to detail', 'Reliability'],
      security: ['Security license preferred', 'Alert and responsible', 'Good communication'],
      admin: ['Basic computer skills', 'Organization skills', 'Professional attitude'],
      healthcare: ['Compassionate nature', 'Reliable', 'Willingness to learn'],
      construction: ['Physical fitness', 'Safety conscious', 'Team worker']
    };
    return requirements[industry] || ['Positive attitude', 'Willingness to learn'];
  }

  getBenefitsByType(type) {
    const benefits = {
      'full-time': ['Health insurance', 'Paid time off', 'Career development'],
      'part-time': ['Flexible schedule', 'Training provided', 'Friendly environment'],
      'contract': ['Competitive pay', 'Flexible terms', 'Experience building']
    };
    return benefits[type] || ['Competitive compensation'];
  }

  generateEmail(company) {
    const cleanCompany = company.toLowerCase().replace(/[^a-z]/g, '');
    return `hr@${cleanCompany}.com`;
  }

  generatePhone(country) {
    const phoneFormats = {
      Turkey: '+90 532 XXX XX XX',
      Cyprus: '+357 99 XXX XXX',
      'United States': '+1 (555) XXX-XXXX',
      'United Kingdom': '+44 20 XXXX XXXX',
      Germany: '+49 30 XXXX XXXX',
      Global: '+1 (555) XXX-XXXX'
    };
    return phoneFormats[country] || phoneFormats.Global;
  }

  getHomelessFriendlyChance(industry) {
    const friendlyIndustries = ['hospitality', 'services', 'construction', 'logistics'];
    return friendlyIndustries.includes(industry) && Math.random() > 0.7;
  }

  getUrgencyLevel() {
    const levels = ['low', 'medium', 'high'];
    return levels[Math.floor(Math.random() * levels.length)];
  }

  getAdzunaCountryCode(country) {
    const countryCodes = {
      Turkey: 'tr',
      Cyprus: 'gb',
      'United States': 'us',
      'United Kingdom': 'gb',
      Germany: 'de',
      Greece: 'gr'
    };
    return countryCodes[country] || 'us';
  }

  getLocalizedSearchTerms(country) {
    const searchTerms = {
      Turkey: 'işçi OR garson OR temizlik OR satış OR güvenlik',
      Cyprus: 'entry level OR no experience OR waiter OR cleaner',
      'United States': 'entry level OR no experience OR helper OR assistant',
      'United Kingdom': 'entry level OR no experience OR trainee OR assistant',
      Germany: 'einsteiger OR keine erfahrung OR helfer OR assistent',
      Greece: 'entry level OR βοηθός OR εργάτης'
    };
    return searchTerms[country] || 'entry level OR no experience';
  }

  formatSalary(job, country) {
    if (!job.salary_min || !job.salary_max) return 'Competitive';
    
    const currencies = {
      Turkey: '₺',
      Cyprus: '€',
      'United States': '$',
      'United Kingdom': '£',
      Germany: '€',
      Greece: '€'
    };
    
    const currency = currencies[country] || '$';
    return `${currency}${job.salary_min}-${job.salary_max}`;
  }

  mapJobType(type) {
    if (!type) return 'full-time';
    
    const typeMapping = {
      permanent: 'full-time',
      contract: 'contract',
      part_time: 'part-time',
      full_time: 'full-time',
      temporary: 'contract'
    };
    
    return typeMapping[type.toLowerCase()] || 'full-time';
  }

  extractRequirements(description) {
    if (!description) return [];
    
    const requirements = [];
    if (description.includes('experience')) requirements.push('Some experience preferred');
    if (description.includes('license')) requirements.push('Valid license required');
    if (description.includes('English')) requirements.push('English language skills');
    if (description.includes('team')) requirements.push('Team player');
    
    return requirements.length > 0 ? requirements : ['Positive attitude', 'Willingness to learn'];
  }

  extractBenefits(description) {
    if (!description) return [];
    
    const benefits = [];
    if (description.includes('insurance')) benefits.push('Health insurance');
    if (description.includes('training')) benefits.push('Training provided');
    if (description.includes('flexible')) benefits.push('Flexible schedule');
    
    return benefits.length > 0 ? benefits : ['Competitive package'];
  }

  isHomelessFriendlyJob(description) {
    if (!description) return false;
    
    const friendlyKeywords = [
      'no experience', 'entry level', 'training provided',
      'immediate start', 'cash daily', 'flexible hours',
      'homeless friendly', 'second chance'
    ];
    
    return friendlyKeywords.some(keyword => 
      description.toLowerCase().includes(keyword)
    );
  }

  generateTurkishJobs(location) {
    const turkishJobs = [
      { title: 'Garson', company: 'Restoran Akdeniz', type: 'part-time' },
      { title: 'Temizlik Görevlisi', company: 'Temizlik A.Ş.', type: 'full-time' },
      { title: 'Satış Danışmanı', company: 'Teknoloji Mağazası', type: 'full-time' },
      { title: 'Kurye', company: 'Hızlı Teslimat', type: 'contract' },
      { title: 'Güvenlik Görevlisi', company: 'Güvenlik Ltd.', type: 'full-time' }
    ];

    return turkishJobs.map((job, index) => ({
      id: `turkish_${index}_${Date.now()}`,
      title: job.title,
      company: job.company,
      type: job.type,
      salary: this.generateSalaryByLocation('Turkey', job.type),
      location: `${location.city}, Türkiye`,
      description: `${job.title} pozisyonu için deneyimli veya deneyimsiz adaylar aranıyor.`,
      requirements: ['Türkçe bilgisi', 'Güler yüzlü olmak'],
      benefits: ['SGK', 'Yemek kartı', 'Esnek çalışma saatleri'],
      contactEmail: this.generateEmail(job.company),
      contactPhone: this.generatePhone('Turkey'),
      applicationUrl: '',
      isHomelessFriendly: Math.random() > 0.6,
      isActive: true,
      postedDate: new Date(),
      provider: 'Kariyer_Net_Mock',
      external: true
    }));
  }

  generateMockJobs(location, providerName) {
    return Array.from({ length: 10 }, (_, index) => ({
      id: `mock_${providerName}_${index}_${Date.now()}`,
      title: `Entry Level Position ${index + 1}`,
      company: `Company ${index + 1}`,
      type: ['full-time', 'part-time', 'contract'][index % 3],
      salary: 'Competitive',
      location: `${location.city}, ${location.country}`,
      description: `Entry level position available in ${location.city}. No experience required.`,
      requirements: ['Positive attitude', 'Willingness to learn'],
      benefits: ['Training provided', 'Growth opportunities'],
      contactEmail: `hr@company${index + 1}.com`,
      contactPhone: this.generatePhone(location.country),
      applicationUrl: '',
      isHomelessFriendly: Math.random() > 0.7,
      isActive: true,
      postedDate: new Date(),
      provider: providerName,
      external: true
    }));
  }

  async fetchSocialServices(lat, lng, radius = 25) {
    const location = await this.reverseGeocode(lat, lng);
    const providers = this.getProvidersForLocation(location.country);
    let allServices = [];

    for (const provider of providers.services) {
      if (!provider.active) continue;
      if (!this.checkRateLimit(provider.name)) continue;

      try {
        const services = await this.callServiceAPI(provider, lat, lng, radius, location);
        allServices = [...allServices, ...services];
      } catch (error) {
        console.log(`${provider.name} API failed:`, error.message);
      }
    }

    if (allServices.length < 10) {
      const mockServices = this.generateMockServices(location, 15);
      allServices = [...allServices, ...mockServices];
    }

    return {
      services: allServices,
      location,
      source: 'external_apis'
    };
  }

  async callServiceAPI(provider, lat, lng, radius, location) {
    return this.generateMockServices(location, provider.name);
  }

  generateMockServices(location, count = 15) {
    const serviceTypes = [
      { name: 'Emergency Shelter', type: 'shelter' },
      { name: 'Food Bank', type: 'food' },
      { name: 'Job Training Center', type: 'employment' },
      { name: 'Health Clinic', type: 'healthcare' },
      { name: 'Legal Aid Office', type: 'legal' }
    ];

    return Array.from({ length: count }, (_, index) => {
      const service = serviceTypes[index % serviceTypes.length];
      return {
        id: `service_${index}_${Date.now()}`,
        name: `${service.name} ${index + 1}`,
        type: service.type,
        address: `${index + 100} Main Street, ${location.city}`,
        phone: this.generatePhone(location.country),
        hours: '9:00 AM - 5:00 PM',
        description: `${service.name} providing assistance to those in need.`,
        services: ['Emergency assistance', 'Case management'],
        eligibility: 'Open to all individuals in need',
        location: location,
        isActive: true
      };
    });
  }
}

module.exports = LocationBasedAPIManager;