/**
 * Sustainable Web Design Calculator
 * 
 * This script calculates the approximate carbon footprint of a website
 * based on page size, visitor count, and server characteristics.
 */

document.addEventListener('DOMContentLoaded', function() {
    const calculatorForm = document.getElementById('calculator-form');
    const resultsSection = document.getElementById('results');
    
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
    
    calculatorForm.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateFootprint();
    });
    
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