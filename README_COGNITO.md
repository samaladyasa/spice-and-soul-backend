# AWS Cognito Authentication Setup Instructions

## 1. Create Cognito User Pool
- Go to AWS Console → Cognito → Create User Pool
- Enable email-based sign-up and sign-in
- Set password policy (min length, complexity)
- Enable email verification (choose SES or Cognito default)

## 2. Create App Client
- In User Pool → App Clients → Add App Client
- Uncheck 'Generate client secret' for frontend-only clients
- For backend, keep client secret enabled
- Save Client ID and (if backend) Client Secret

## 3. Configure Environment Variables
- Copy `.env.example` to `.env` and fill in:
  - COGNITO_REGION
  - COGNITO_USER_POOL_ID
  - COGNITO_CLIENT_ID
  - COGNITO_CLIENT_SECRET

## 4. Email Verification Flow
- On signup, Cognito sends a verification code to user's email
- User enters code to confirm account
- After confirmation, user can log in

## 5. Secure Token Handling
- Always use HTTPS for API endpoints
- Never expose client secret or tokens to frontend
- Validate JWT tokens on protected routes
- Store tokens securely (HTTP-only cookies or secure storage)

## 6. Integrate with Frontend
- Use modular API endpoints for signup, confirm, and login
- UI: Add forms for signup, code verification, and login
- On successful login, store JWT token securely

## 7. Best Practices
- Enforce strong password policy in Cognito
- Enable logging and monitoring for auth endpoints
- Add rate limiting to prevent abuse

---

**See `src/auth/cognito.js` and `src/lambda/auth/cognitoHandlers.js` for implementation details.**
