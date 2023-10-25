
import { OAuth2Client } from "google-auth-library";

// Function for verifying and decoding a JWT (ID token)
const verifyIdToken = async (client_id, jwtToken) => {
  // Create a new OAuth2Client instance with your client ID
  const client = new OAuth2Client(client_id);

  try {
    // Call the verifyIdToken method to verify and decode the ID token
    const ticket = await client.verifyIdToken({
      idToken: jwtToken, // The JWT (ID token) to verify
      audience: client_id, // The expected audience (your client ID)
    });

    // Extract user information from the verified token
    const payload = ticket.getPayload();

    return payload; // Return the user information as a JSON object
  } catch (error) {
    // Handle errors that may occur during token verification
    console.error("Error verifying ID token:", error);
    throw new Error("Invalid ID token"); // Customize the error message as needed
  }
};

export default verifyIdToken;
