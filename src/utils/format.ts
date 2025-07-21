export const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date)
}

/**
 * Parse business request details from a combined string
 * @param requestDetails - The combined string from the database
 * @returns Object with businessName and businessAddress
 */
export function parseBusinessDetails(requestDetails: string): { businessName: string; businessAddress: string } {
    const lines = requestDetails.split('\n')
    let businessName = ''
    let businessAddress = ''

    for (const line of lines) {
        if (line.startsWith('Business Name:')) {
            businessName = line.replace('Business Name:', '').trim()
        } else if (line.startsWith('Business Address:')) {
            businessAddress = line.replace('Business Address:', '').trim()
        }
    }

    return { businessName, businessAddress }
}

/**
 * Check if request details contain business information
 * @param requestDetails - The request details string
 * @returns boolean indicating if it's a business request
 */
export function isBusinessRequest(requestDetails: string): boolean {
    return requestDetails.includes('Business Name:') && requestDetails.includes('Business Address:')
} 