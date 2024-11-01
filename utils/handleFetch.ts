import tokenValidator from './tokenValidation';

interface props{
    apiUrl: string;
    accessToken: string;
    internal_ID: string;
    method: string;
    body?:any
}

async function handleFetch({apiUrl, accessToken, internal_ID, method, body}: props) {

   
  const options1 = {
    method: method,
    headers: {
      accept: 'application/json; charset=utf-8',
      authorization: `Bearer ${accessToken}`,
    },
  };

  const options2 = {
    method: method,
    headers: {
      accept: 'application/json; charset=utf-8',
      'content-type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
        guestsCount: body.guestsCount,
        listingId: body.listingId,
        checkInDateLocalized: body.checkInDateLocalized,
        checkOutDateLocalized: body.checkOutDateLocalized
      })
  };




  const options = body? options2:options1;


  try {
  
    let response = await fetch(apiUrl, options);
    
    let refreshAttempts = 2; // Counter for refresh attempts

    // Attempt to refresh token only if unauthorized
    while (response.status === 401 && refreshAttempts < 1) {
      console.warn('Access token expired. Attempting to refresh...');
      const refreshedResult = await tokenValidator(internal_ID, true);

      if (!refreshedResult.success || !refreshedResult.newToken) {
        throw new Error(`Failed to refresh token: ${refreshedResult.message}`);
      }

      accessToken = refreshedResult.newToken;
      options.headers.authorization = `Bearer ${accessToken}`;
      response = await fetch(apiUrl, options); // Retry with new token
      refreshAttempts++; // Increment refresh attempt counter
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Guesty API error from call:${apiUrl}`, errorData);
      throw new Error(errorData);
    }

    return response; // Return the final response if everything is okay
  } catch (error) {
    console.error('Error during fetch:', error);
    throw new Error('Failed to fetch from Guesty API');
  }
}

export default handleFetch;