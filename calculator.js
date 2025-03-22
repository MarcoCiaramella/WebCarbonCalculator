/**
 * Sustainable Web Design Calculator
 * 
 * This script calculates the approximate carbon footprint of a website
 * based on page size, visitor count, and server characteristics.
 */

document.addEventListener('DOMContentLoaded', function() {
    const calculatorForm = document.getElementById('calculator-form');
    const resultsSection = document.getElementById('results');
    const websiteUrlInput = document.getElementById('website-url');
    const analyzeButton = document.getElementById('analyze-button');
    const analysisStatus = document.getElementById('analysis-status');
    
    // Energy consumption factors (kWh per GB)
    const ENERGY_FACTORS = {
        'north-america': 0.81,
        'europe': 0.65,
        'asia': 0.79,
        'oceania': 0.94,
        'south-america': 0.74,
        'africa': 0.68
    };
    
    // Carbon intensity factors (kg CO2 per kWh)
    const CARBON_INTENSITY = {
        'standard': {
            'north-america': 0.42,
            'europe': 0.28,
            'asia': 0.62,
            'oceania': 0.60,
            'south-america': 0.21,
            'africa': 0.47
        },
        'green': {
            'north-america': 0.05,
            'europe': 0.04,
            'asia': 0.06,
            'oceania': 0.05,
            'south-america': 0.03,
            'africa': 0.05
        }
    };
    
    // Add event listener for the analyze button
    analyzeButton.addEventListener('click', function() {
        const url = websiteUrlInput.value.trim();
        if (url) {
            analyzeWebsite(url);
        } else {
            analysisStatus.textContent = 'Please enter a valid URL';
            analysisStatus.className = 'status-message error';
        }
    });
    
    calculatorForm.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateFootprint();
    });
    
    async function analyzeWebsite(url) {
        // Update status
        analysisStatus.textContent = 'Analyzing website...';
        analysisStatus.className = 'status-message loading';
        
        try {
            // Use a CORS proxy to avoid cross-origin issues
            const corsProxy = 'https://api.allorigins.win/raw?url=';
            const response = await fetch(corsProxy + encodeURIComponent(url));
            
            if (!response.ok) {
                throw new Error('Failed to fetch website data');
            }
            
            // Get response text
            const htmlContent = await response.text();
            
            // Calculate page size (html content length in KB)
            const baseHtmlSize = htmlContent.length / 1024;
            
            // Parse HTML to find and count external resources
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            
            // Get all resources (CSS, JS, images, etc.)
            const cssLinks = Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).length;
            const scripts = Array.from(doc.querySelectorAll('script[src]')).length;
            const images = Array.from(doc.querySelectorAll('img')).length;
            
            // Estimate total size based on typical resource sizes
            // These are rough estimates as we can't directly measure the file sizes
            const estimatedCssSize = cssLinks * 50; // ~50KB per CSS file
            const estimatedJsSize = scripts * 120; // ~120KB per JS file
            const estimatedImgSize = images * 200; // ~200KB per image
            
            // Calculate total estimated size
            const totalEstimatedSize = baseHtmlSize + estimatedCssSize + estimatedJsSize + estimatedImgSize;
            
            // Update the page size input
            document.getElementById('page-size').value = Math.round(totalEstimatedSize);
            
            // Try to detect server location based on response headers or domain TLD
            // This is a simplified approach and not always accurate
            let serverLocation = 'north-america'; // Default
            const domain = new URL(url).hostname;
            
            if (domain.endsWith('.eu') || domain.endsWith('.de') || domain.endsWith('.fr') || 
                domain.endsWith('.uk') || domain.endsWith('.it') || domain.endsWith('.es')) {
                serverLocation = 'europe';
            } else if (domain.endsWith('.cn') || domain.endsWith('.jp') || domain.endsWith('.kr') || 
                      domain.endsWith('.in') || domain.endsWith('.sg') || domain.endsWith('.th')) {
                serverLocation = 'asia';
            } else if (domain.endsWith('.au') || domain.endsWith('.nz')) {
                serverLocation = 'oceania';
            } else if (domain.endsWith('.br') || domain.endsWith('.ar') || domain.endsWith('.mx')) {
                serverLocation = 'south-america';
            } else if (domain.endsWith('.za') || domain.endsWith('.ng') || domain.endsWith('.eg')) {
                serverLocation = 'africa';
            }
            
            // Set the server location dropdown
            document.getElementById('server-location').value = serverLocation;
            
            // Set a reasonable default for monthly visitors if the field is empty
            if (document.getElementById('monthly-visitors').value === "0") {
                document.getElementById('monthly-visitors').value = "10000";
            }
            
            // Update status
            analysisStatus.textContent = 'Analysis complete! Estimated page size: ' + 
                                         Math.round(totalEstimatedSize) + ' KB';
            analysisStatus.className = 'status-message success';
            
            // Calculate footprint with the new values
            calculateFootprint();
            
        } catch (error) {
            console.error('Error analyzing website:', error);
            analysisStatus.textContent = 'Error analyzing website. Some sites may block access due to CORS restrictions.';
            analysisStatus.className = 'status-message error';
        }
    }
    
    function calculateFootprint() {
        // Get form values
        const pageSize = parseFloat(document.getElementById('page-size').value) / 1000; // Convert to MB
        const monthlyVisitors = parseInt(document.getElementById('monthly-visitors').value);
        const pagesPerVisit = parseFloat(document.getElementById('pages-per-visit').value);
        const hostingType = document.getElementById('hosting-type').value;
        const serverLocation = document.getElementById('server-location').value;
        
        // Calculate data transfer per month in GB
        const monthlyDataTransferGB = (pageSize * monthlyVisitors * pagesPerVisit) / 1000;
        
        // Calculate energy consumption (kWh)
        const energyConsumption = monthlyDataTransferGB * ENERGY_FACTORS[serverLocation];
        
        // Calculate CO2 emissions (kg)
        const monthlyCO2 = energyConsumption * CARBON_INTENSITY[hostingType][serverLocation];
        const annualCO2 = monthlyCO2 * 12;
        
        // Calculate equivalents
        const treesNeeded = Math.ceil(annualCO2 / 21); // Average tree absorbs ~21kg CO2 per year
        
        // Determine performance rating
        let rating;
        if (pageSize < 0.5) { // Less than 500KB per page
            rating = 'A+ (Excellent)';
        } else if (pageSize < 1) { // Less than 1MB per page
            rating = 'A (Very Good)';
        } else if (pageSize < 2) { // Less than 2MB per page
            rating = 'B (Good)';
        } else if (pageSize < 3) { // Less than 3MB per page
            rating = 'C (Average)';
        } else if (pageSize < 5) { // Less than 5MB per page
            rating = 'D (Below Average)';
        } else {
            rating = 'F (Poor)';
        }
        
        // Display results
        document.getElementById('monthly-co2').textContent = monthlyCO2.toFixed(2) + ' kg';
        document.getElementById('annual-co2').textContent = annualCO2.toFixed(2) + ' kg';
        document.getElementById('co2-equivalent').textContent = `${treesNeeded} trees needed to offset`;
        document.getElementById('performance-rating').textContent = rating;
        
        // Generate recommendations
        generateRecommendations(pageSize, hostingType, rating);
        
        // Show results
        resultsSection.classList.remove('hidden');
        
        // Smooth scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    function generateRecommendations(pageSize, hostingType, rating) {
        const recommendationList = document.getElementById('recommendation-list');
        recommendationList.innerHTML = ''; // Clear previous recommendations
        
        const recommendations = [];
        
        // Page size recommendations
        if (pageSize >= 2) {
            recommendations.push('Optimize images using WebP format and efficient compression');
            recommendations.push('Minify CSS, JavaScript, and HTML files to reduce file sizes');
            recommendations.push('Implement lazy loading for images and videos below the fold');
        }
        
        if (pageSize >= 1) {
            recommendations.push('Consider reducing third-party scripts and external resources');
            recommendations.push('Use system fonts instead of custom web fonts where possible');
        }
        
        // Hosting recommendations
        if (hostingType === 'standard') {
            recommendations.push('Switch to a green hosting provider powered by renewable energy');
            recommendations.push('Or purchase carbon offsets for your current hosting emissions');
        }
        
        // Add general recommendations
        recommendations.push('Implement efficient browser caching strategies to reduce repeat downloads');
        recommendations.push('Consider implementing a Content Delivery Network (CDN) to reduce data travel distance');
        
        // Add recommendations to the list
        recommendations.forEach(recommendation => {
            const li = document.createElement('li');
            li.textContent = recommendation;
            recommendationList.appendChild(li);
        });
    }
    
    // Initialize with default values
    calculateFootprint();
});