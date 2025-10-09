
import * as admin from 'firebase-admin';

// This is a singleton to prevent re-initialization
let isInitialized = false;

export function initAdmin() {
  if (isInitialized) {
    return;
  }

  const serviceAccount = {
    "type": "service_account",
    "project_id": "studio-4226976836-a33f4",
    "private_key_id": "5b2e3ffcbb7121440b26134077518b708c9b9239",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC9wn+3D9tNdsUZ\nwDcVKSKfYbzuDcCsyjspIzGRlgIuPMYeD0MiIQEfTGOZaOFCAZ4dfUCDTekGvSZC\nAhxn4KqjTjGR/Ijf2E9FWZYr7fT66Yicajs09DHBh0Sct6WEo0TveoLTS2izAT46\nE+dkX/GhDLrP+7R4Nh572oF7X7ydLqTZaUsoDOHlnh+4AuhwuE87tKw4d6EUxo/R\nf9tJj4xQBqwbGYvnDp/Nd4j/iRAq8et/r0TcKcd75V/dQqlfINTRODQ/FK8LJ8iU\neNnd1Nx60nRhxHbS9A+KfnTgs720x9jxaACNMaWF4729ddBKPFJNkjjBT5D4o8Yg\nI9es7iVpAgMBAAECggEAF40auG0q4i/coZK2I2sHZYbwtw4/khJytOstx+xkGTn+\nEBVZLH9dJMsgd2tJaHL2nUwCJD8YrfdELCAX8hqJAxtS0qloPCPxdAwniQyPrE6C\nCoEIF807macrWv9TTHrOX6HcYn4IS2MwRm6u+B8M8wM3R6tCiELrQKLrZr+zPeyp\nHobclnqVT+UvBxvbfbE6K4kezuiiODCPnf5X3rJf6xM+vz609OIElwVhKgnU1MLp\nj2YhbJ6/Fil6UGmCVBhSPw/3dl7xI9nw1mx1t7sp0hZqK1ghDFWdFyhbumYrzg9D\nflIiTjmmTqLpBhYoeTyOjzEhoaDaSOj3rYFpj872AwKBgQDpO8yE1DT/s1WyIXDm\nBts+Sa1eEcUXNEfGmFCLtbZBYCyqGXOkPDAAbZqOI6nFymfBxpQXTt0d6mAfHd4h\n3obpNjz0uOsOVmqs1ZjSBh47gJSeo6e0+RNCL9jI6rbSvyhJ9jybypALiVipgiGA\nvE4El4CFEFaLDdXFRj/H/yVKiwKBgQDQSFia1LjHVEjvH7ArGhenNQ7SZYPaqL81\nM7BNzvrRn73AEIf+Wg1BsUPbCrHErMQbJBwnaB+45Ma9Tq++S11JU5p3Z7RczEnv\njPWV5GP09OI2eouNcDt5b/DJaXZJ8cP/dZzwz6mlr4VV1/OMhZg9kr6iHEWFqj6i\nNhQ+uYiyWwKBgFvp0ABsrHI0V0o6uYY9H3udh2/x6szpMnwGHH/iXW/IGfHy08re\nWUBh8S2gylADIv6PZl8FGkimy7iXiampS1tun3kFwsREtAdmqbHi7Vkfo/IcpoPA\nQKGtv232aZQF9zemjV4L5tZVCxbKDK/yBYDzv5cwyBpGmn8C3zHO0ABfAoGBAK71\n1thZEM8AUjPsnoPWa0AeJdE/TT+EuPnr7ZGu6KrmUPLh8BsNck1YpvN9TE82AZX7\nA1tm8B7Urs2fJ6nmjPpnrD3Zc3zwbrs34aSEMiM3Aj9ZOZkaSht8mPvYB3GeEVKq\nbacsCgoQIyU1PnUwU+6FMnXi4dOiavLAEsmN+PI5AoGADPdVRMImF99KGFntxQ8U\nQBqBfrOihjnpOTeeeH0WtdlTHgBCgN+gVu1GStxIlSgQniJqKED1Hfe3VG3KoG2y\nSRHxXC1Gij/bbEss5wZ1RTfv7t1k6q6YUSycI+Mkedgw4HjovFY7lfj0HC+/wCKn\npo2QPLpACp2zwLz/zl5oxZQ=\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
    "client_email": "firebase-adminsdk-fbsvc@studio-4226976836-a33f4.iam.gserviceaccount.com",
    "client_id": "102037605715317319751",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40studio-4226976836-a33f4.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  };

  try {
    if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
    }
    isInitialized = true;
  } catch (e: any) {
    console.error(
      '❌ Firebase Admin initialization failed:',
      e.message
    );
    throw e;
  }
}

export default admin;
