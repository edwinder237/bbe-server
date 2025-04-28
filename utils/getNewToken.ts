

export async function fetchNewTokenFromGuesty(authKeys:any): Promise<any> {

  try {
    const formData = new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'booking_engine:api',
      client_secret: authKeys.clientSecret,
      client_id: authKeys.clientID,
    }).toString();
    console.log("Fetching new token from Guesty API");
    const response = await fetch('https://booking.guesty.com/oauth2/token', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'cache-control': 'no-cache,no-store',
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.warn('Failed to fetch new token:', errorData);

      if (response.status === 429) {
        console.error(`Rate limit exceeded. Retry after ${response.headers.get('retry-after')} seconds.`);
      }

      throw new Error(`Token fetch error: ${JSON.stringify(errorData)}`);
    }

   // console.log('New token fetched successfully from Guesty API.');
    return response.json();
  } catch (error) {
    console.error('Error fetching new token:', error);
    throw new Error('Failed to fetch new token from Guesty');
  }
}

export async function fetchNewTokenFromHostaway(authKeys:any): Promise<any> {

  try {
    const formData = new URLSearchParams({
      grant_type: 'client_credentials',
      client_secret: authKeys.clientSecret,
      client_id: authKeys.clientID,
    }).toString();
console.log("Fetching new token from Hostaway API");
    const response = await fetch('https://api.hostaway.com/v1/accessTokens', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'cache-control': 'no-cache,no-store',
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.warn('Failed to fetch new Hostaway token:', errorData);

      if (response.status === 429) {
        console.error(`Rate limit exceeded. Retry after ${response.headers.get('retry-after')} seconds.`);
      }

      throw new Error(`Token fetch error: ${JSON.stringify(errorData)}`);
    }

   // console.log('New token fetched successfully from Hostaway API.');
    return response.json();
  } catch (error) {
    console.error('Error fetching new Hostaway token:', error);
    throw new Error('Failed to fetch new token from Hostaway');
  }
}