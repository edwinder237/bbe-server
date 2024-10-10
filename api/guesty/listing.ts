import type { VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from '../../utils/corsMiddleware';
import { client_listing_detail_Converter } from '../../utils/clientConverter';
import { guesty_listings } from '../../utils/types';

const listing  = {
  "id": "656e8fb3792dcf000f9fc55f",
  "authorId": 10,
  "date": "10/5/2024",
  "href": "/listing-stay-detail",
  "listingCategoryId": 17,
  "title": "The Seminole • Beach • Tropical Pool•Tiki Bar",
  "featuredImage": "https://guesty-listing-images.s3.amazonaws.com/production/thumbnail_916200599972624949_1677645610.jpg",
  "galleryImgs": [
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645610.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645571.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645576.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645591.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645580.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645586.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645584.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645583.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645550.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645605.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645603.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645602.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645601.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645572.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645609.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645577.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645393.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645573.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645548.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645448.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645547.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645575.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645570.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645553.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645447.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645582.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645578.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645579.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645585.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645551.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645587.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645588.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645589.jpg",
      "https://guesty-listing-images.s3.amazonaws.com/production/original_916200599972624949_1677645600.jpg",
      "https://assets.guesty.com/image/upload/v1705027071/production/6566138da6aaa15054eb403a/arq0l2wxwbunxn5xiik1.jpg",
      "https://assets.guesty.com/image/upload/v1705027068/production/6566138da6aaa15054eb403a/ysuoo61r4prikz8qyuj0.jpg",
      "https://assets.guesty.com/image/upload/v1705028348/production/6566138da6aaa15054eb403a/d6ycbdsvzgqlxh9eyo81.jpg",
      "https://assets.guesty.com/image/upload/v1705027073/production/6566138da6aaa15054eb403a/nhw5ktkdrexqptle4szc.jpg",
      "https://assets.guesty.com/image/upload/v1705027068/production/6566138da6aaa15054eb403a/wiwhji7zzhfo4rnu1pwp.jpg",
      "https://assets.guesty.com/image/upload/v1705027068/production/6566138da6aaa15054eb403a/nk6yppghb8fs3ryx5pjy.jpg",
      "https://assets.guesty.com/image/upload/v1705027069/production/6566138da6aaa15054eb403a/e0qezfjlgz7t4wpvijxb.jpg",
      "https://assets.guesty.com/image/upload/v1705027075/production/6566138da6aaa15054eb403a/tbgoqw0aavbjl4nwcfs6.jpg",
      "https://assets.guesty.com/image/upload/v1705027075/production/6566138da6aaa15054eb403a/ai6ah6obt0g2zaj1crd8.jpg",
      "https://assets.guesty.com/image/upload/v1705027068/production/6566138da6aaa15054eb403a/qhxkvmpz3tel9wl4bwi4.jpg",
      "https://assets.guesty.com/image/upload/v1705027070/production/6566138da6aaa15054eb403a/cnbyutz0vtlk9oesv0fn.jpg",
      "https://assets.guesty.com/image/upload/v1705027070/production/6566138da6aaa15054eb403a/vfepu5ypnnb4h3jokchi.jpg",
      "https://assets.guesty.com/image/upload/v1705028842/production/6566138da6aaa15054eb403a/mkvmi0kphyddkplas6ro.jpg",
      "https://assets.guesty.com/image/upload/v1705027070/production/6566138da6aaa15054eb403a/kwhmjxprim6rdhgl8jpg.jpg",
      "https://assets.guesty.com/image/upload/v1705027070/production/6566138da6aaa15054eb403a/zhmrv034wy89sgzs9oov.jpg",
      "https://assets.guesty.com/image/upload/v1705027073/production/6566138da6aaa15054eb403a/mxl1korefp4dyavlkzuf.jpg",
      "https://assets.guesty.com/image/upload/v1705028348/production/6566138da6aaa15054eb403a/ql6uinxjiwyvlgzqaxv3.jpg",
      "https://assets.guesty.com/image/upload/v1705027072/production/6566138da6aaa15054eb403a/dmacot1ecymqmiqes1xr.jpg",
      "https://assets.guesty.com/image/upload/v1705027071/production/6566138da6aaa15054eb403a/ga5qgef5ihy7uvg5l1li.jpg",
      "https://assets.guesty.com/image/upload/v1705027071/production/6566138da6aaa15054eb403a/dn9gohqpyemgwjgm4rlq.jpg",
      "https://assets.guesty.com/image/upload/v1705027072/production/6566138da6aaa15054eb403a/ylyet04hph0bdpdqc4wq.jpg",
      "https://assets.guesty.com/image/upload/v1705027072/production/6566138da6aaa15054eb403a/koufuwpofjtt2zvd8r1r.jpg",
      "https://assets.guesty.com/image/upload/v1705027073/production/6566138da6aaa15054eb403a/dfblfmylo3tmm22vl9qq.jpg",
      "https://assets.guesty.com/image/upload/v1705027073/production/6566138da6aaa15054eb403a/g6vqida106g9gdumvl8z.jpg"
  ],
  "commentCount": 0,
  "viewCount": 0,
  "like": false,
  "address": "10050 84th Way, Seminole, Florida 33777, United States of America",
  "reviewStart": 9.9,
  "reviewCount": 29,
  "price": "350.00 USD",
  "maxGuests": 8,
  "bedrooms": 3,
  "bathrooms": 2,
  "saleOff": "",
  "isAds": false,
  "map": {
      "lat": 27.8637311,
      "lng": -82.7564791
  },
  "author": {
      "id": 10,
      "firstName": "",
      "lastName": "",
      "displayName": "",
      "email": "",
      "gender": "",
      "avatar": "",
      "count": 111,
      "href": "/author",
      "desc": "",
      "jobName": "",
      "bgImage": "https://images.pexels.com/photos/5966631/pexels-photo-5966631.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
  },
  "listingCategory": {
      "id": 17,
      "name": "Entire cabin",
      "href": "archive-stay/the-demo-archive-slug",
      "thumbnail": "http://dummyimage.com/300x300.png/5fa2dd/ffffff",
      "count": 2855,
      "taxonomy": "category",
      "listingType": "stay"
  }
}

const LODGIFY_API_KEY = process.env.LODGIFY_API_KEY || 'Rm1RqotAajREi+Nyj+KD9A88huz7Is7pc3u/MNiP6Dd3AQMJL6SgDR5LOhhbvCjQ';
const APP_KEY = process.env.APP_KEY || 'YOUR_APP_KEY'; // Set your APP_KEY here or use environment variables

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Call the CORS middleware
  const isPreflight = corsMiddleware(req, res);
  if (isPreflight) return; 

  // Extract parameters from the query
  const { arrival, departure } = req.query;


  const listingId = req.body?.listing_id;


  // Define fetch options
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json; charset=utf-8',
      authorization: 'Bearer eyJraWQiOiI2bkN1aXV0WnI1NmRwTGZ3aldIODUwZWdGNC1SN0pNQ09OeTlNcE13OWZzIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULjFvU3VnMmM5MVlXcWtTRGtBZ3pBRmVURkRDWHRrbTc3dV81ckNsaHpmd0kiLCJpc3MiOiJodHRwczovL2xvZ2luLmd1ZXN0eS5jb20vb2F1dGgyL2F1c2Y2Y2ZjMmxTN3hCTGpKNWQ2IiwiYXVkIjoiaHR0cHM6Ly9ib29raW5nLmd1ZXN0eS5jb20iLCJpYXQiOjE3Mjg0ODY5NjEsImV4cCI6MTcyODU3MzM2MSwiY2lkIjoiMG9haDZqNWE5bmk4QWNTbU41ZDciLCJzY3AiOlsiYm9va2luZ19lbmdpbmU6YXBpIl0sInJlcXVlc3RlciI6IkJPT0tJTkciLCJzdWIiOiIwb2FoNmo1YTluaThBY1NtTjVkNyIsImFjY291bnRJZCI6IjY1NjYxMzhkYTZhYWExNTA1NGViNDAzYSIsInVzZXJSb2xlcyI6W3sicm9sZUlkIjp7InBlcm1pc3Npb25zIjpbImxpc3Rpbmcudmlld2VyIl19fV0sImNsaWVudFR5cGUiOiJib29raW5nIiwiaWFtIjoidjMiLCJhcHBsaWNhdGlvbklkIjoiMG9haDZqNWE5bmk4QWNTbU41ZDcifQ.3qW22lzp-Om0nBUF_qZ8DNqVL-u6vOdGgSWrFiC7sBtI62p0fr04g6rYKbBgNjdFDc_SkRlElpTxTZl915GChruCnhuOqYdJvGOfDtDweivsmbkeAWyi-aqtjo70YLXH8KKglA-oXyYmkYwfbaaaH3eDvt7tJGnH1SJGYYTrYAUJ6cyxJdl-XV4cWlZA_vrX0kuACJ9Y8JjE_FmzCXQzVhKAMQOnb_ZGpkJsF6ropd9w3kuRJ3ebDoqDvJKopMtAJ79Y_xQf6lvHquMfjaTerJjFnyFcru2Ocw3Dvyqux-jkGeU4hWbRhHXpzHo9s4QHPjyQCamltJ5AXhlsf-9WwA'
    },
  };

  // Construct the API URL with parameters
  const apiUrl = `https://booking.guesty.com/api/listings/${listingId}`;

  try {
    const response = await fetch(apiUrl, options);

    // Check if the response is ok (status in the range 200-299)
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData });
    }

    const responseData = await response.json();
    
    const data = responseData;

    // Convert listing to Client Requirement
    const listing =  new client_listing_detail_Converter(data);
    const singleListing = listing.convert();
     console.log("Guesty Listing Fetched Success", new Date)
    return res.status(200).json(singleListing);
  } catch (error) {
    console.error('Error fetching from Lodgify API:', error);
    return res.status(500).json({ error: 'Error fetching data from Lodgify API' });
  }
}