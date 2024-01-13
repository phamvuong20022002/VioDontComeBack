export const getCDNUrls = (htmlContent) => {
    // Regular expression to match common CDN URL patterns
    const cdnRegex = /https?:\/\/(?:cdn|code|ajax|maxcdn|cdn.jsdelivr|unpkg|cloudflare)\.[^'"\s)]+/gi;

    // Extract all matches using the regex
    const matches = htmlContent.match(cdnRegex);

    if (matches) {
        console.log('All CDN URLs:', matches);
        return matches; // Return the array of CDN URLs
    } else {
        console.log('No CDN URLs found.');
        return []; // Return an empty array if no CDN URLs are found
    }
}

export const generateNpmInstallCommands = (cdnUrls) =>{
    const commands = cdnUrls.map(url => {
        // Extract package name from the URL
        const packageName = url.split('/').pop().split('@')[0];
        return `npm install ${packageName}`;
    });

    return commands.join('\n');
}

export const generateNotesInstallPackages = (htmlContent) =>{
    // Call the function with the HTML content
    const cdnUrls = getCDNUrls(htmlContent);
    if (cdnUrls.length > 0) {
        const npmInstallCommands = generateNpmInstallCommands(cdnUrls);
        console.log(npmInstallCommands);
    }
    else{
        return null;
    }
}