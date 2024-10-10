import type { VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from '../../utils/corsMiddleware';
import { GuestyConverter } from '../../utils/clientConverter';
import { guesty_listings, lodgify_listings } from '../../utils/types';

const LODGIFY_API_KEY = process.env.LODGIFY_API_KEY || 'Rm1RqotAajREi+Nyj+KD9A88huz7Is7pc3u/MNiP6Dd3AQMJL6SgDR5LOhhbvCjQ';
const APP_KEY = process.env.APP_KEY || 'YOUR_APP_KEY'; // Set your APP_KEY here or use environment variables

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Call the CORS middleware
  const isPreflight = corsMiddleware(req, res);
  if (isPreflight) return; // If preflight was handled, exit early

  // Extract parameters from the query
  const { arrival, departure } = req.query;

  // Define fetch options
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json; charset=utf-8',
      authorization: 'Bearer eyJraWQiOiI2bkN1aXV0WnI1NmRwTGZ3aldIODUwZWdGNC1SN0pNQ09OeTlNcE13OWZzIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULjFvU3VnMmM5MVlXcWtTRGtBZ3pBRmVURkRDWHRrbTc3dV81ckNsaHpmd0kiLCJpc3MiOiJodHRwczovL2xvZ2luLmd1ZXN0eS5jb20vb2F1dGgyL2F1c2Y2Y2ZjMmxTN3hCTGpKNWQ2IiwiYXVkIjoiaHR0cHM6Ly9ib29raW5nLmd1ZXN0eS5jb20iLCJpYXQiOjE3Mjg0ODY5NjEsImV4cCI6MTcyODU3MzM2MSwiY2lkIjoiMG9haDZqNWE5bmk4QWNTbU41ZDciLCJzY3AiOlsiYm9va2luZ19lbmdpbmU6YXBpIl0sInJlcXVlc3RlciI6IkJPT0tJTkciLCJzdWIiOiIwb2FoNmo1YTluaThBY1NtTjVkNyIsImFjY291bnRJZCI6IjY1NjYxMzhkYTZhYWExNTA1NGViNDAzYSIsInVzZXJSb2xlcyI6W3sicm9sZUlkIjp7InBlcm1pc3Npb25zIjpbImxpc3Rpbmcudmlld2VyIl19fV0sImNsaWVudFR5cGUiOiJib29raW5nIiwiaWFtIjoidjMiLCJhcHBsaWNhdGlvbklkIjoiMG9haDZqNWE5bmk4QWNTbU41ZDcifQ.3qW22lzp-Om0nBUF_qZ8DNqVL-u6vOdGgSWrFiC7sBtI62p0fr04g6rYKbBgNjdFDc_SkRlElpTxTZl915GChruCnhuOqYdJvGOfDtDweivsmbkeAWyi-aqtjo70YLXH8KKglA-oXyYmkYwfbaaaH3eDvt7tJGnH1SJGYYTrYAUJ6cyxJdl-XV4cWlZA_vrX0kuACJ9Y8JjE_FmzCXQzVhKAMQOnb_ZGpkJsF6ropd9w3kuRJ3ebDoqDvJKopMtAJ79Y_xQf6lvHquMfjaTerJjFnyFcru2Ocw3Dvyqux-jkGeU4hWbRhHXpzHo9s4QHPjyQCamltJ5AXhlsf-9WwA'
    },
  };

  // Construct the API URL with parameters
  const apiUrl = 'https://booking.guesty.com/api/listings?numberOfBedrooms=0&numberOfBathrooms=0&limit=20';

  try {
    const response = await fetch(apiUrl, options);

    // Check if the response is ok (status in the range 200-299)
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData });
    }

    const responseData = await response.json();
    const data = responseData.results;

    // Convert each listing to Client Requirement
    const convertedListings = data.map((listing: guesty_listings) => {
      const converter = new GuestyConverter(listing );
      return converter.convert();
    });
    console.log("Guesty All-Listings Fetched Success", new Date)
    return res.status(200).json(convertedListings);
  } catch (error) {
    console.error('Error fetching from Lodgify API:', error);
    return res.status(500).json({ error: 'Error fetching data from Lodgify API' });
  }
}