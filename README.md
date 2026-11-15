# AutoHunt API

Express + MongoDB API for [AutoHunt](https://github.com/Ashikur540/AutoHunt-Resell-MarketPlace-Client-),
a used-car marketplace with buyer, seller and admin roles.

- **Auth**: `GET /jwt` issues a token; `verifyJWT` guards private routes,
  `verifyAdmin` and `verifySeller` check the user's role in the database.
- **Payments**: Stripe Payment Intents (`/create-payment-intent`, `/payments`).
- **Data**: users, cars, purchases, reports and reviews in MongoDB Atlas.

| Area      | Routes |
| --------- | ------ |
| Cars      | `GET /category`, `GET /cars`, `GET /allCars`, `POST /cars/add`, `POST /cars/seller/add`, `DELETE /allCars/:id` |
| Purchases | `POST /purchase`, `GET /myPurchaseList`, `DELETE /myPurchaseList/:id` |
| Users     | `POST /user`, `GET /users`, `GET /users/buyers`, `GET /users/sellers`, `PUT /users/admin/:id`, `PUT /users/seller/:id`, `DELETE /users/:id` |
| Reports   | `POST /report`, `GET /reports`, `GET /reports/:email` |
| Reviews   | `POST /review/add`, `GET /reviews`, `GET /reviews/all`, `DELETE /reviews/:id` |

## Run it locally

```bash
npm install
node index.js
```

Create `.env` first:

```
DB_USER=your-atlas-user
DB_USER_PASS=your-atlas-password
ACCESS_TOKEN_SECRET=any-long-random-string
STRIPE_SECRET=sk_test_...
```

The API listens on <http://localhost:5000>. See the
[client README](https://github.com/Ashikur540/AutoHunt-Resell-MarketPlace-Client-#run-it-locally)
for the full setup.
